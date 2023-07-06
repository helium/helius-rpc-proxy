import worker from '../index';
import { pegRpcProviderByModulus } from '../utils/pegRpcProviderByModulus';

const { Request } = jest.requireActual('node-fetch');

describe('pegRpcProviderByModulus', () => {
	const originalEnv = {
		CORS_ALLOW_ORIGIN: process.env.CORS_ALLOW_ORIGIN as string,
		HELIUS_API_KEY: process.env.HELIUS_API_KEY as string,
		TRITON_API_KEY: process.env.TRITON_API_KEY as string,
		SESSION_KEY: process.env.SESSION_KEY as string,
		AWS_REGION: process.env.AWS_REGION as string,
		AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID as string,
		AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY as string,
		AWS_CLOUDWATCH_LOG_GROUP_HELIUS: process.env.AWS_CLOUDWATCH_LOG_GROUP_HELIUS as string,
		AWS_CLOUDWATCH_LOG_GROUP_TRITON: process.env.AWS_CLOUDWATCH_LOG_GROUP_TRITON as string,
	};

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('it returns undefined if Client-Identifier header is not present', async () => {
		const request = new Request(
			`https://solana-rpc.web.helium.io/?session-key=${originalEnv.SESSION_KEY}`,
			{
				method: 'POST',
				headers: {
					Host: 'solana-rpc.web.helium.io',
				},
				body: JSON.stringify([]),
			}
		) as unknown as Parameters<typeof worker.fetch>[0];

		const peggedRpcProvider = pegRpcProviderByModulus(request);

		expect(peggedRpcProvider).toBe(undefined);
	});

	it('it returns undefined if Client-Identifier header is a string', async () => {
		const request = new Request(
			`https://solana-rpc.web.helium.io/?session-key=${originalEnv.SESSION_KEY}`,
			{
				method: 'POST',
				headers: {
					'Host': 'solana-rpc.web.helium.io',
					'Client-Identifier': 'test',
				},
				body: JSON.stringify([]),
			}
		) as unknown as Parameters<typeof worker.fetch>[0];

		const peggedRpcProvider = pegRpcProviderByModulus(request);

		expect(peggedRpcProvider).toBe(undefined);
	});
});
