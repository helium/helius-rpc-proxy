import worker from '../index';
import { assessRequestForPath } from '../utils/assessRequestForPath';

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

	it('it returns false when a request does not include a path', async () => {
		const request = new Request(`https://solana-rpc.web.helium.io`, {
			method: 'POST',
			headers: {
				Host: 'solana-rpc.web.helium.io',
			},
			body: JSON.stringify([]),
		}) as unknown as Parameters<typeof worker.fetch>[0];

		const doesRequestIncludePath = assessRequestForPath(request);

		expect(doesRequestIncludePath).toBe(false);
	});

	it('it returns false when a request does not include a path but URL includes trailing /', async () => {
		const request = new Request(`https://solana-rpc.web.helium.io/`, {
			method: 'POST',
			headers: {
				Host: 'solana-rpc.web.helium.io',
			},
			body: JSON.stringify([]),
		}) as unknown as Parameters<typeof worker.fetch>[0];

		const doesRequestIncludePath = assessRequestForPath(request);

		expect(doesRequestIncludePath).toBe(false);
	});

	it('it returns false when a request has a query string param and does not include a path', async () => {
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

		const doesRequestIncludePath = assessRequestForPath(request);

		expect(doesRequestIncludePath).toBe(false);
	});

	it('it returns true when a request does include a path', async () => {
		const request = new Request(`https://solana-rpc.web.helium.io/hello`, {
			method: 'POST',
			headers: {
				Host: 'solana-rpc.web.helium.io',
			},
			body: JSON.stringify([]),
		}) as unknown as Parameters<typeof worker.fetch>[0];

		const doesRequestIncludePath = assessRequestForPath(request);

		expect(doesRequestIncludePath).toBe(true);
	});

	it('it returns true when a request has a query string param and does include a path', async () => {
		const request = new Request(
			`https://solana-rpc.web.helium.io/hello?session-key=${originalEnv.SESSION_KEY}`,
			{
				method: 'POST',
				headers: {
					Host: 'solana-rpc.web.helium.io',
				},
				body: JSON.stringify([]),
			}
		) as unknown as Parameters<typeof worker.fetch>[0];

		const doesRequestIncludePath = assessRequestForPath(request);

		expect(doesRequestIncludePath).toBe(true);
	});
});
