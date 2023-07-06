import { Env } from './types';
import { heliusHandler } from './rpcProviderHandlers/heliusHandler';
import { tritonHandler } from './rpcProviderHandlers/tritonHandler';
import { errorHandler } from './utils/errorHandler';
import { assessRequestForPath } from './utils/assessRequestForPath';
import { pegRpcProviderByModulus } from './utils/pegRpcProviderByModulus';

export default {
  async fetch(request: Request, env: Env) {
    const { RPC_PROVIDER_OVERRIDE } = env;
    const clonedRequest = request.clone();

    // Check the request for the presence of a path as this indicates usage of Helius-specific
    // path-based API (e.g., enhanced tx api - https://docs.helius.xyz/solana-apis/enhanced-transactions-api).
    const doesRequestIncludePath = assessRequestForPath(clonedRequest);

    // If RPC_PROVIDER_OVERRIDE is falsy (e.g., undefined, '', etc), invoke pegRpcProviderByModulus
    // to determine which RPC provider should be pegged to the requesting client.
    //
    // Please note that if the 'Client-Identifier' header isn't found on the request, pegRpcProviderByModulus
    // will return undefined and the default provider (e.g., helius) will be used.
    const peggedRpcProvider = RPC_PROVIDER_OVERRIDE || pegRpcProviderByModulus(clonedRequest);

    // If request includes a path, use Helius RPC.
    if (!doesRequestIncludePath) {
      if (peggedRpcProvider === 'triton') {
        return tritonHandler({
          request,
          env,
          tritonErrorHandler: errorHandler('triton'),
        });
      }
    }

    // Default path if RPC_PROVIDER_OVERRIDE is falsy and pegRpcProviderByModulus returns undefined
    // because there is no 'Client-Identifier' header on a request.
    return heliusHandler({
      request,
      env,
      heliusErrorHandler: errorHandler('helius'),
    });
  },
};
