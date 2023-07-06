import fetch from 'node-fetch';
import worker from '../index';
import { tritonHandler } from '../rpcProviderHandlers/tritonHandler';

jest.mock('../utils/errorHandler');
jest.mock('node-fetch');

const { Response, Request } = jest.requireActual('node-fetch');

describe('tritonHandler', () => {
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

	it('it does not invoke errorHandler', async () => {
		(fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(
			new Response(undefined, { status: 200 })
		);

		const request = new Request(
			`https://solana-rpc.web.helium.io/?session-key=${originalEnv.SESSION_KEY}`,
			{
				method: 'POST',
				headers: {
					Host: 'solana-rpc.web.helium.io',
				},
				body: JSON.stringify({ jsonrpc: 2.0, id: 'op-1', method: 'getRecentBlockhash' }),
			}
		) as unknown as Parameters<typeof worker.fetch>[0];

		// Weirdness because errorHandler is curry func
		const errorHandlerInnerFunc = jest.fn();
		const errorHandlerOuterFunc = () => errorHandlerInnerFunc;
		const tritonErrorHandler = errorHandlerOuterFunc();

		const resp = await tritonHandler({ request, env: originalEnv, tritonErrorHandler });

		expect(tritonErrorHandler).not.toBeCalled();
		expect(resp.status).toBe(200);
	});

	it('it does invoke errorHandler', async () => {
		(fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(
			new Response(undefined, { status: 400 })
		);

		const request = new Request(
			`https://solana-rpc.web.helium.io/?session-key=${originalEnv.SESSION_KEY}`,
			{
				method: 'POST',
				headers: {
					Host: 'solana-rpc.web.helium.io',
				},
				body: JSON.stringify({ jsonrpc: 2.0, id: 'op-1', method: 'getRecentBlockhash' }),
			}
		) as unknown as Parameters<typeof worker.fetch>[0];

		// Weirdness because errorHandler is curry func
		const errorHandlerInnerFunc = jest.fn();
		const errorHandlerOuterFunc = () => errorHandlerInnerFunc;
		const tritonErrorHandler = errorHandlerOuterFunc();

		const resp = await tritonHandler({ request, env: originalEnv, tritonErrorHandler });

		expect(tritonErrorHandler).toBeCalled();
		expect(resp.status).toBe(400);
	});
});
