import 'aws-sdk-client-mock-jest';
import { PutLogEventsCommand } from '@aws-sdk/client-cloudwatch-logs';
import { putLogEventsCommandBuilder } from '../utils/putLogEventsCommandBuilder';

Date.now = jest.fn(() => 1487076708000);

jest.mock('@aws-sdk/client-cloudwatch-logs', () => {
	return {
		PutLogEventsCommand: jest.fn().mockImplementation(),
	};
});

describe('putLogEventsCommandBuilder', () => {
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

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('it creates a command for generating log in Helius CloudWatch log group', () => {
		const args = {
			currentDate: 'yyyy-mm-dd',
			cloudWatchLogGroupByRpcProvider: originalEnv.AWS_CLOUDWATCH_LOG_GROUP_HELIUS as string,
			requestMethod: 'requestMethod',
			statusCode: 200,
			statusMessage: 'statusMessage',
			responseBody: 'responseBody',
		};

		putLogEventsCommandBuilder(args);

		expect(PutLogEventsCommand).toBeCalledWith(
			expect.objectContaining({
				logGroupName: args.cloudWatchLogGroupByRpcProvider,
				logStreamName: args.currentDate,
				logEvents: [
					{
						timestamp: Date.now(),
						message: `Error ${args.requestMethod} ${args.statusCode} ${args.statusMessage} ${args.responseBody}`,
					},
				],
			})
		);
	});

	it('it creates a command for generating log in Triton CloudWatch log group', () => {
		const args = {
			currentDate: 'yyyy-mm-dd',
			cloudWatchLogGroupByRpcProvider: originalEnv.AWS_CLOUDWATCH_LOG_GROUP_TRITON as string,
			requestMethod: 'requestMethod',
			statusCode: 200,
			statusMessage: 'statusMessage',
			responseBody: 'responseBody',
		};

		putLogEventsCommandBuilder(args);

		expect(PutLogEventsCommand).toBeCalledWith(
			expect.objectContaining({
				logGroupName: args.cloudWatchLogGroupByRpcProvider,
				logStreamName: args.currentDate,
				logEvents: [
					{
						timestamp: Date.now(),
						message: `Error ${args.requestMethod} ${args.statusCode} ${args.statusMessage} ${args.responseBody}`,
					},
				],
			})
		);
	});
});
