import fetch from 'node-fetch';
import worker from '../index';
import { heliusHandler } from '../rpcProviderHandlers/heliusHandler';

jest.mock('../utils/errorHandler');
jest.mock('node-fetch');

const { Response, Request } = jest.requireActual('node-fetch');

describe('heliusHandler', () => {
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

	it('it filters requests with an empty rpc batch', async () => {
		(fetch as jest.MockedFunction<typeof fetch>).mockImplementation();

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

		// Weirdness because errorHandler is curry func
		const errorHandlerInnerFunc = jest.fn();
		const errorHandlerOuterFunc = () => errorHandlerInnerFunc;
		const heliusErrorHandler = errorHandlerOuterFunc();

		const resp = await heliusHandler({ request, env: originalEnv, heliusErrorHandler });
		const json = (await resp.json()) as any;

		expect(resp.status).toBe(400);
		expect(resp.statusText).toBe('Bad Request');
		expect(json.error.message).toBe('empty rpc batch');
		expect(heliusErrorHandler).not.toBeCalled();
		expect(fetch).not.toBeCalled();
	});

	it('it filters requests with an invalid json', async () => {
		(fetch as jest.MockedFunction<typeof fetch>).mockImplementation();

		const request = new Request(
			`https://solana-rpc.web.helium.io/?session-key=${originalEnv.SESSION_KEY}`,
			{
				method: 'POST',
				headers: {
					Host: 'solana-rpc.web.helium.io',
				},
				body: '{"jsonrpc": "2.0", }',
			}
		) as unknown as Parameters<typeof worker.fetch>[0];

		// Weirdness because errorHandler is curry func
		const errorHandlerInnerFunc = jest.fn();
		const errorHandlerOuterFunc = () => errorHandlerInnerFunc;
		const heliusErrorHandler = errorHandlerOuterFunc();

		const resp = await heliusHandler({ request, env: originalEnv, heliusErrorHandler });
		const json = (await resp.json()) as any;

		expect(resp.status).toBe(400);
		expect(resp.statusText).toBe('Bad Request');
		expect(json.error.message).toBe('failed to parse RPC request body');
		expect(heliusErrorHandler).not.toBeCalled();
		expect(fetch).not.toBeCalled();
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
		const heliusErrorHandler = errorHandlerOuterFunc();

		const resp = await heliusHandler({ request, env: originalEnv, heliusErrorHandler });

		expect(heliusErrorHandler).not.toBeCalled();
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
		const heliusErrorHandler = errorHandlerOuterFunc();

		const resp = await heliusHandler({ request, env: originalEnv, heliusErrorHandler });

		expect(heliusErrorHandler).toBeCalled();
		expect(resp.status).toBe(400);
	});
});
