import fetch from 'node-fetch';
import worker from '../index';
import { pegRpcProviderByModulus } from '../utils/pegRpcProviderByModulus';
import { heliusHandler } from '../rpcProviderHandlers/heliusHandler';
import { tritonHandler } from '../rpcProviderHandlers/tritonHandler';

jest.mock('node-fetch');
jest.mock('../utils/pegRpcProviderByModulus');
jest.mock('../rpcProviderHandlers/heliusHandler');
jest.mock('../rpcProviderHandlers/tritonHandler');

const { Request } = jest.requireActual('node-fetch');

describe('index', () => {
	const originalEnv = {
		CORS_ALLOW_ORIGIN: process.env.CORS_ALLOW_ORIGIN as string,
		HELIUS_API_KEY: process.env.HELIUS_API_KEY as string,
		TRITON_API_KEY: process.env.HELIUS_API_KEY as string,
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

	it('it invokes the heliusHandler as default (e.g., when RPC_PROVIDER_OVERRIDE is falsy and pegRpcProviderByModulus returns undefined)', async () => {
		(fetch as jest.MockedFunction<typeof fetch>).mockImplementation();
		(pegRpcProviderByModulus as jest.Mock).mockImplementation(() => undefined);
		(heliusHandler as jest.Mock).mockImplementation();
		(tritonHandler as jest.Mock).mockImplementation();

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

		await worker.fetch(request, originalEnv); // RPC_PROVIDER_OVERRIDE is not in originalEnv (e.g., RPC_PROVIDER_OVERRIDE is undefined)

    expect(pegRpcProviderByModulus).toHaveBeenCalled();
		expect(heliusHandler).toHaveBeenCalled();
		expect(tritonHandler).not.toHaveBeenCalled();
	});

	it('it invokes the heliusHandler when request includes a path', async () => {
		(fetch as jest.MockedFunction<typeof fetch>).mockImplementation();
		(pegRpcProviderByModulus as jest.Mock).mockImplementation(() => undefined);
		(heliusHandler as jest.Mock).mockImplementation();
		(tritonHandler as jest.Mock).mockImplementation();

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

		await worker.fetch(request, originalEnv); // RPC_PROVIDER_OVERRIDE is not in originalEnv (e.g., RPC_PROVIDER_OVERRIDE is undefined)

		expect(heliusHandler).toHaveBeenCalled();
		expect(tritonHandler).not.toHaveBeenCalled();
	});

  it('it invokes the heliusHandler when request includes a path and RPC_PROVIDER_OVERRIDE = \'triton\'', async () => {
		(fetch as jest.MockedFunction<typeof fetch>).mockImplementation();
		(pegRpcProviderByModulus as jest.Mock).mockImplementation();
		(heliusHandler as jest.Mock).mockImplementation();
		(tritonHandler as jest.Mock).mockImplementation();

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

		await worker.fetch(request, { ...originalEnv, RPC_PROVIDER_OVERRIDE: 'triton' });

    expect(pegRpcProviderByModulus).not.toHaveBeenCalled();
		expect(heliusHandler).toHaveBeenCalled();
		expect(tritonHandler).not.toHaveBeenCalled();
	});

	it('it invokes the heliusHandler when request includes a path, RPC_PROVIDER_OVERRIDE is falsy, and peggedRpcProvider = \'triton\'', async () => {
		(fetch as jest.MockedFunction<typeof fetch>).mockImplementation();
		(pegRpcProviderByModulus as jest.Mock).mockImplementation(() => 'triton');
		(heliusHandler as jest.Mock).mockImplementation();
		(tritonHandler as jest.Mock).mockImplementation();

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

		await worker.fetch(request, originalEnv); // RPC_PROVIDER_OVERRIDE is not in originalEnv (e.g., RPC_PROVIDER_OVERRIDE is undefined)

		expect(heliusHandler).toHaveBeenCalled();
		expect(tritonHandler).not.toHaveBeenCalled();
	});

  it('it invokes the heliusHandler when RPC_PROVIDER_OVERRIDE is falsy and peggedRpcProvider = \'helius\'', async () => {
		(fetch as jest.MockedFunction<typeof fetch>).mockImplementation();
		(pegRpcProviderByModulus as jest.Mock).mockImplementation(() => 'helius');
		(heliusHandler as jest.Mock).mockImplementation();
		(tritonHandler as jest.Mock).mockImplementation();

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

		await worker.fetch(request, originalEnv); // RPC_PROVIDER_OVERRIDE is not in originalEnv (e.g., RPC_PROVIDER_OVERRIDE is undefined)

		expect(heliusHandler).toHaveBeenCalled();
		expect(tritonHandler).not.toHaveBeenCalled();
	});

  it('it invokes the heliusHandler when RPC_PROVIDER_OVERRIDE = \'helius\'', async () => {
		(fetch as jest.MockedFunction<typeof fetch>).mockImplementation();
		(pegRpcProviderByModulus as jest.Mock).mockImplementation();
		(heliusHandler as jest.Mock).mockImplementation();
		(tritonHandler as jest.Mock).mockImplementation();

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

		await worker.fetch(request, { ...originalEnv, RPC_PROVIDER_OVERRIDE: 'helius' });

    expect(pegRpcProviderByModulus).not.toHaveBeenCalled();
		expect(heliusHandler).toHaveBeenCalled();
		expect(tritonHandler).not.toHaveBeenCalled();
	});

  it('it invokes the tritonHandler when RPC_PROVIDER_OVERRIDE is falsy and peggedRpcProvider = \'triton\'', async () => {
		(fetch as jest.MockedFunction<typeof fetch>).mockImplementation();
		(pegRpcProviderByModulus as jest.Mock).mockImplementation(() => 'triton');
		(heliusHandler as jest.Mock).mockImplementation();
		(tritonHandler as jest.Mock).mockImplementation();

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

		await worker.fetch(request, originalEnv); // RPC_PROVIDER_OVERRIDE is not in originalEnv (e.g., RPC_PROVIDER_OVERRIDE is undefined)

		expect(heliusHandler).not.toHaveBeenCalled();
		expect(tritonHandler).toHaveBeenCalled();
	});

  it('it invokes the tritonHandler when RPC_PROVIDER_OVERRIDE = \'triton\'', async () => {
		(fetch as jest.MockedFunction<typeof fetch>).mockImplementation();
		(pegRpcProviderByModulus as jest.Mock).mockImplementation();
		(heliusHandler as jest.Mock).mockImplementation();
		(tritonHandler as jest.Mock).mockImplementation();

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

		await worker.fetch(request, { ...originalEnv, RPC_PROVIDER_OVERRIDE: 'triton' });

    expect(pegRpcProviderByModulus).not.toHaveBeenCalled();
		expect(heliusHandler).not.toHaveBeenCalled();
		expect(tritonHandler).toHaveBeenCalled();
	});
});
