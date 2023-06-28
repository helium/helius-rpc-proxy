import { Env } from './types';
import { heliusHandler } from './rpcProviderHandlers/heliusHandler';
import { tritonHandler } from './rpcProviderHandlers/tritonHandler';
import { errorHandler } from './utils/errorHandler';
import { pegRpcProviderByModulus } from './utils/pegRpcProviderByModulus';

export default {
	async fetch(request: Request, env: Env) {
		const { RPC_PROVIDER_OVERRIDE } = env;

		// If RPC_PROVIDER_OVERRIDE is falsy (e.g., undefined, '', etc), invoke pegRpcProviderByModulus
		// to determine which RPC provider should be pegged to the requesting client. Please note that
		// if the 'Device-Identifier' header isn't found on the request, pegRpcProviderByModulus
		// will return undefined and the default provider (e.g., helius) will be used.
		const peggedRpcProvider = !RPC_PROVIDER_OVERRIDE && pegRpcProviderByModulus(request.clone());

		console.log(RPC_PROVIDER_OVERRIDE, peggedRpcProvider);

		if (RPC_PROVIDER_OVERRIDE === 'triton' || peggedRpcProvider === 'triton') {
			return tritonHandler({
				request,
				env,
				tritonErrorHandler: errorHandler('triton'),
			});
		}

		// Default path if RPC_PROVIDER_OVERRIDE is falsy and pegRpcProviderByModulus returns undefined
		// because there is no 'Device-Identifier' header on a request.
		return heliusHandler({
			request,
			env,
			heliusErrorHandler: errorHandler('helius'),
		});
	},
};
