import { Env } from './types';

export const tritonHandler = async ({
	request,
	env,
	tritonErrorHandler,
}: {
	request: Request;
	env: Env;
	tritonErrorHandler: ({
		env,
		req,
		res,
	}: {
		env: Env;
		req: Request;
		res: Response;
	}) => Promise<void>;
}) => {
	// If the request is an OPTIONS request, return a 200 response with permissive CORS headers.
	const corsHeaders = {
		'Access-Control-Allow-Origin': `${env.CORS_ALLOW_ORIGIN || '*'}`,
		'Access-Control-Allow-Methods': 'GET, HEAD, POST, PUT, OPTIONS',
		'Access-Control-Allow-Headers': '*',
	};

	// Helius Solana mainnet subdomains (e.g., rpc.helius.xyz, api.helius.xyz) are the default for all
	// incoming requests to the CF worker, but if the request originates from solana-rpc.web.test-helium.com,
	// use the Helius Solana devnet subdomains (e.g., rpc-devnet.helius.xyz, api-devnet.helius.xyz)
	let network = 'mainnet';
	const headers = request.headers;
	const host = headers.get('Host');
	if (host == 'solana-rpc.web.test-helium.com') {
		network = 'devnet';
	}

	// If the query string session-key value doesn't match the SESSION_KEY env variable, return 404
	// otherwise continue on, but delete the session-key query string param from the list of all
	// other query string params
	const { searchParams } = new URL(request.url);
	const sessionKey = searchParams.get('session-key');
	if (sessionKey != env.SESSION_KEY) {
		return new Response(null, {
			status: 404,
			statusText: 'Unexpected path',
		});
	}
	searchParams.delete('session-key');

	if (request.method === 'OPTIONS') {
		return new Response(null, {
			status: 200,
			headers: corsHeaders,
		});
	}

	const upgradeHeader = request.headers.get('Upgrade');
	if (upgradeHeader || upgradeHeader === 'websocket') {
		const res = await fetch(
			`https://helium-maineb3-376c.${network}.rpcpool.com/${env.TRITON_API_KEY}`,
			request
		);

		if (res.status >= 400) {
			await tritonErrorHandler({ env, res: res.clone(), req: request });
		}

		return res;
	}

	const payload = await request.text();
	const proxyRequest = new Request(
		`https://helium-maineb3-376c.${network}.rpcpool.com/${env.TRITON_API_KEY}
		}${searchParams.toString() ? `&${searchParams.toString()}` : ''}`,
		{
			method: request.method,
			body: payload || null,
			headers: {
				'Content-Type': 'application/json',
				'X-Triton-Cloudflare-Proxy': 'true',
				...corsHeaders,
			},
		}
	);

	const res = await fetch(proxyRequest);

	if (res.status >= 400) {
		await tritonErrorHandler({ env, res: res.clone(), req: request });
	}

	return res;
};
