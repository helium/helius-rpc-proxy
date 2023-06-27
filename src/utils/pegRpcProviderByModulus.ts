export const pegRpcProviderByModulus = (request: Request): string | undefined => {
  let peggedRpcProvider;

  try {
    const RPC_PROVIDERS_ARR = ['helius', 'triton'];

    const { headers } = request;
    const deviceIdentifier = headers.get('Device-Identifier'); // The header key will need to align with what client applications provide

    // TODO: func to transform deviceIdentifier to number type based on deviceIdentifier format (e.g., uuid)

    // Only peg to RPC provider if Device-Identifer:
    // - is provided by client application
    // - is of number type (so modulus operation won't throw)
    if (deviceIdentifier && typeof(deviceIdentifier) === "number") {
      const peggedRpcProviderIndex = deviceIdentifier && deviceIdentifier % RPC_PROVIDERS_ARR.length;
      peggedRpcProvider = RPC_PROVIDERS_ARR[peggedRpcProviderIndex];
    }
  } catch(err) {
    // Error handling here so we can know this is derping
    console.log(err);
  }

  return peggedRpcProvider;
};
