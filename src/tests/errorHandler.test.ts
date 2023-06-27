import 'aws-sdk-client-mock-jest';
import { mockClient } from 'aws-sdk-client-mock';
import {
	CloudWatchLogsClient,
	PutLogEventsCommand,
	CreateLogStreamCommand,
	CreateLogStreamCommandInput,
	PutLogEventsCommandInput,
} from '@aws-sdk/client-cloudwatch-logs';
import { errorHandler } from '../utils/errorHandler';
import { createLogStreamCommandBuilder } from '../utils/createLogStreamCommandBuilder';
import { putLogEventsCommandBuilder } from '../utils/putLogEventsCommandBuilder';
import { Env } from '../types';

Date.now = jest.fn(() => 1487076708000);
jest.mock('../utils/createLogStreamCommandBuilder');
jest.mock('../utils/putLogEventsCommandBuilder');
const cwMock = mockClient(CloudWatchLogsClient);

describe('errorHandler', () => {
	const originalEnv = {
		CORS_ALLOW_ORIGIN: process.env.CORS_ALLOW_ORIGIN,
		HELIUS_API_KEY: process.env.HELIUS_API_KEY,
		SESSION_KEY: process.env.SESSION_KEY,
		AWS_REGION: process.env.AWS_REGION,
		AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
		AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
		AWS_CLOUDWATCH_LOG_GROUP_HELIUS: process.env.AWS_CLOUDWATCH_LOG_GROUP_HELIUS,
		AWS_CLOUDWATCH_LOG_GROUP_TRITON: process.env.AWS_CLOUDWATCH_LOG_GROUP_TRITON,
	};

	beforeAll(() => {
		jest.useFakeTimers();
		jest.setSystemTime(new Date(2020, 3, 1));
	});

	afterAll(() => {
		jest.useRealTimers();
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	beforeEach(() => {
		cwMock.reset();
	});

	it('it handles an error from Helius properly', async () => {
		(createLogStreamCommandBuilder as jest.Mock).mockImplementation(
			() => new CreateLogStreamCommand({} as CreateLogStreamCommandInput)
		);
		(putLogEventsCommandBuilder as jest.Mock).mockImplementation(
			() => new PutLogEventsCommand({} as PutLogEventsCommandInput)
		);

		cwMock.on(CreateLogStreamCommand).resolves({});
		cwMock.on(PutLogEventsCommand).resolves({});

		const args = {
			env: originalEnv as Env,
			req: {
				method: 'method',
			} as Request,
			res: {
				status: 500,
				statusText: 'error',
				text: async () => new Promise(resolve => resolve('text')),
			} as unknown as Response,
		};

		await errorHandler('helius')(args);

		expect(createLogStreamCommandBuilder).toBeCalledWith(
			expect.objectContaining({
				currentDate: '2020-04-01',
				cloudWatchLogGroupByRpcProvider: originalEnv.AWS_CLOUDWATCH_LOG_GROUP_HELIUS as string,
			})
		);
		expect(putLogEventsCommandBuilder).toBeCalledWith(
			expect.objectContaining({
				currentDate: '2020-04-01',
				cloudWatchLogGroupByRpcProvider: originalEnv.AWS_CLOUDWATCH_LOG_GROUP_HELIUS as string,
				requestMethod: args.req.method,
				statusCode: args.res.status,
				statusMessage: args.res.statusText,
				responseBody: 'text',
			})
		);
		expect(cwMock).toHaveReceivedCommand(CreateLogStreamCommand);
		expect(cwMock).toHaveReceivedCommand(PutLogEventsCommand);
	});

	it('it handles an error from Triton properly', async () => {
		(createLogStreamCommandBuilder as jest.Mock).mockImplementation(
			() => new CreateLogStreamCommand({} as CreateLogStreamCommandInput)
		);
		(putLogEventsCommandBuilder as jest.Mock).mockImplementation(
			() => new PutLogEventsCommand({} as PutLogEventsCommandInput)
		);

		cwMock.on(CreateLogStreamCommand).resolves({});
		cwMock.on(PutLogEventsCommand).resolves({});

		const args = {
			env: originalEnv as Env,
			req: {
				method: 'method',
			} as Request,
			res: {
				status: 500,
				statusText: 'error',
				text: async () => new Promise(resolve => resolve('text')),
			} as unknown as Response,
		};

		await errorHandler('triton')(args);

		expect(createLogStreamCommandBuilder).toBeCalledWith(
			expect.objectContaining({
				currentDate: '2020-04-01',
				cloudWatchLogGroupByRpcProvider: originalEnv.AWS_CLOUDWATCH_LOG_GROUP_TRITON as string,
			})
		);
		expect(putLogEventsCommandBuilder).toBeCalledWith(
			expect.objectContaining({
				currentDate: '2020-04-01',
				cloudWatchLogGroupByRpcProvider: originalEnv.AWS_CLOUDWATCH_LOG_GROUP_TRITON as string,
				requestMethod: args.req.method,
				statusCode: args.res.status,
				statusMessage: args.res.statusText,
				responseBody: 'text',
			})
		);
		expect(cwMock).toHaveReceivedCommand(CreateLogStreamCommand);
		expect(cwMock).toHaveReceivedCommand(PutLogEventsCommand);
	});
});
