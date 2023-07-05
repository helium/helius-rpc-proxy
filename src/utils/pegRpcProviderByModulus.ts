export const pegRpcProviderByModulus = (request: Request): string | undefined => {
	let peggedRpcProvider;

	try {
		const RPC_PROVIDERS_ARR = ['helius', 'triton'];

		const { headers } = request;
		const clientIdentifier = headers.get('Client-Identifier'); // The header key will need to align with what client applications provide

		// TODO: func to transform clientIdentifier to number type based on clientIdentifier format (e.g., uuid)

		// Only peg to RPC provider if Client-Identifer:
		// - is provided by client application
		// - is of number type (so modulus operation won't throw)
    // CURRRENTLY THIS BLOCK WILL NEVER BE ENTERED 
		if (clientIdentifier && typeof clientIdentifier === 'number') {
			const peggedRpcProviderIndex =
				clientIdentifier && clientIdentifier % RPC_PROVIDERS_ARR.length;
			peggedRpcProvider = RPC_PROVIDERS_ARR[peggedRpcProviderIndex];
		}
	} catch (err) {
		// Log the error but otherwise proceed with using the "default" path
		console.log(`pegRpcProviderByModulus error: ${err}`);
	}

	return peggedRpcProvider;
};
