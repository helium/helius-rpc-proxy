interface Env {
	CORS_ALLOW_ORIGIN: string;
	HELIUS_API_KEY: string;
	SESSION_KEY: string;
}

export default {
	async fetch(request: Request, env: Env) {

		// If the request is an OPTIONS request, return a 200 response with permissive CORS headers
		// This is required for the Helius RPC Proxy to work from the browser and arbitrary origins
		// If you wish to restrict the origins that can access your Helius RPC Proxy, you can do so by
		// changing the `*` in the `Access-Control-Allow-Origin` header to a specific origin.
		// For example, if you wanted to allow requests from `https://example.com`, you would change the
		// header to `https://example.com`.
		const corsHeaders = {
			"Access-Control-Allow-Origin": `${env.CORS_ALLOW_ORIGIN || "*"}`,
			"Access-Control-Allow-Methods": "GET, HEAD, POST, PUT, OPTIONS",
			"Access-Control-Allow-Headers": "*",
		}

		let rpcNetwork;
		let apiNetwork;
		const headers = request.headers;
    const host = headers.get("Host");
		if (host == "solana-rpc.web.helium.io") {
			rpcNetwork = "rpc-devnet";
			apiNetwork = "api-devnet";
		}
		if (host == 'solana-rpc.web.test-helium.com') {
			rpcNetwork = "rpc-devnet";
			apiNetwork = "api-devnet";
		}

		const { searchParams, pathname } = new URL(request.url);
		const sessionKey = searchParams.get("session-key");
		if (sessionKey != env.SESSION_KEY) {
			return new Response(null, {
				status: 404,
				statusText: "Unexpected path"
			});
		}
		searchParams.delete("session-key");

		if (request.method === "OPTIONS") {
			return new Response(null, {
				status: 200,
				headers: corsHeaders,
			});
		}

		const upgradeHeader = request.headers.get("Upgrade");
    if (upgradeHeader || upgradeHeader === "websocket") {
      return await fetch(`https://${rpcNetwork}.helius.xyz/?api-key=${env.HELIUS_API_KEY}`, request);
    }

		console.log(`https://${pathname === "/" ? rpcNetwork : apiNetwork}.helius.xyz${pathname}?api-key=${env.HELIUS_API_KEY}${searchParams.toString() ? `&${searchParams.toString()}` : ""}`);

		const payload = await request.text();
		const proxyRequest = new Request(`https://${pathname === "/" ? rpcNetwork : apiNetwork}.helius.xyz${pathname}?api-key=${env.HELIUS_API_KEY}${searchParams.toString() ? `&${searchParams.toString()}` : ""}`, {
			method: request.method,
			body: payload || null,
			headers: {
				"Content-Type": "application/json",
				"X-Helius-Cloudflare-Proxy": "true",
				...corsHeaders,
			}
		});

		return await fetch(proxyRequest);
	},
};
