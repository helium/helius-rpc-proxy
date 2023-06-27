import { Env } from './types';
import { heliusHandler } from './rpcProviderHandlers/heliusHandler';
import { tritonHandler } from './rpcProviderHandlers/tritonHandler';
import { errorHandler } from './utils/errorHandler';
import { pegRpcProviderByModulus } from './utils/pegRpcProviderByModulus';

export default {
	async fetch(request: Request, env: Env) {
		const { RPC_PROVIDER_OVERRIDE } = env;

		const peggedRpcProvider = pegRpcProviderByModulus(request.clone());

		if (RPC_PROVIDER_OVERRIDE === 'triton' || peggedRpcProvider === 'triton') {
			return tritonHandler({
				request,
				env,
				tritonErrorHandler: errorHandler('triton'),
			});
		}

		return heliusHandler({
			request,
			env,
			heliusErrorHandler: errorHandler('helius'),
		});
	},
};
