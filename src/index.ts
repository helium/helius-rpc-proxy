import { Env } from './types';
import { errorHandler } from './utils/errorHandler';

export default {
	async fetch(request: Request, env: Env) {
		// If the request is an OPTIONS request, return a 200 response with permissive CORS headers
		// This is required for the Helius RPC Proxy to work from the browser and arbitrary origins
		// If you wish to restrict the origins that can access your Helius RPC Proxy, you can do so by
		// changing the `*` in the `Access-Control-Allow-Origin` header to a specific origin.
		// For example, if you wanted to allow requests from `https://example.com`, you would change the
		// header to `https://example.com`.
		const corsHeaders: Record<string, string> = {
			'Access-Control-Allow-Methods': 'GET, HEAD, POST, PUT, OPTIONS',
			'Access-Control-Allow-Headers': '*',
		};

		const origin = request.headers.get('Origin')
		if (env.CORS_ALLOW_ORIGIN) {
			if (origin && env.CORS_ALLOW_ORIGIN.includes(origin)) {
				corsHeaders['Access-Control-Allow-Origin'] = origin
			}
		} else {
			corsHeaders['Access-Control-Allow-Origin'] = '*'
		}

		// Helius Solana mainnet domains (e.g., mainnet.helius-rpc.com, api.helius.xyz) are the default for all
		// incoming requests to the CF worker, but if the request originates from solana-rpc.web.test-helium.com,
		// use the Helius Solana devnet domains (e.g., devnet.helius-rpc.com, api-devnet.helius.xyz)
		let rpcUrl = 'mainnet.helius-rpc.com';
		let apiUrl = 'api.helius.xyz';
		const headers = request.headers;
		const host = headers.get('Host');
		if (host == 'solana-rpc.web.test-helium.com') {
			rpcUrl = 'devnet.helius-rpc.com';
			apiUrl = 'api-devnet.helius.xyz';
		}

		// If the query string session-key value doesn't match the SESSION_KEY env variable, return 404
		// otherwise continue on, but delete the session-key query string param from the list of all
		// other query string params
		const { searchParams, pathname } = new URL(request.url);
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
				`https://${rpcUrl}/?api-key=${env.HELIUS_API_KEY}`,
				request
			);

			if (res.status >= 400) {
				await errorHandler({ env, res: res.clone(), req: request });
			}

			return res;
		}

		const payload = await request.text();

		if (request.method === 'POST') {
			try {	
				const data = JSON.parse(payload);
		
				if (data.length === 0) {
					return new Response(null, {
						status: 400,
						statusText: JSON.stringify({ jsonrpc: 2.0, id: null, error: { code: -32600, message: "empty rpc batch"}}),
					});
				}
			} catch(e) {
				return new Response(null, {
					status: 400,
					statusText: JSON.stringify({ jsonrpc: 2.0, id: null, error: { code: -32700, message: "failed to parse RPC request body"}}),
				});
			}
		}

		const proxyHeaders: Record<string, string> = {
			'Content-Type': 'application/json',
			'X-Helius-Cloudflare-Proxy': 'true',
			...corsHeaders,
		}

		if (origin) {
			proxyHeaders['Origin'] = origin
		}

		const proxyRequest = new Request(
			`https://${pathname === '/' ? rpcUrl : apiUrl}${pathname}?api-key=${
				env.HELIUS_API_KEY
			}${searchParams.toString() ? `&${searchParams.toString()}` : ''}`,
			{
				method: request.method,
				body: payload || null,
				headers: proxyHeaders,
			}
		);

		const res = await fetch(proxyRequest);

		if (res.status >= 400) {
			await errorHandler({ env, res: res.clone(), req: request });
		}

		return res;
	},
};
