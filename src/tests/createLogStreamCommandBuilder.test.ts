import 'aws-sdk-client-mock-jest';
import { CreateLogStreamCommand } from '@aws-sdk/client-cloudwatch-logs';
import { createLogStreamCommandBuilder } from '../utils/createLogStreamCommandBuilder';

jest.mock('@aws-sdk/client-cloudwatch-logs', () => {
	return {
		CreateLogStreamCommand: jest.fn().mockImplementation(),
	};
});

describe('createLogStreamCommandBuilder', () => {
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

	it('it creates a command for generating log stream in Helius CloudWatch log group', () => {
		const args = {
			currentDate: 'yyyy-mm-dd',
			cloudWatchLogGroupByRpcProvider: originalEnv.AWS_CLOUDWATCH_LOG_GROUP_HELIUS as string,
		};

		createLogStreamCommandBuilder(args);

		expect(CreateLogStreamCommand).toBeCalledWith({
			logGroupName: args.cloudWatchLogGroupByRpcProvider,
			logStreamName: args.currentDate,
		});
	});

	it('it creates a command for generating log stream in Triton CloudWatch log group', () => {
		const args = {
			currentDate: 'yyyy-mm-dd',
			cloudWatchLogGroupByRpcProvider: originalEnv.AWS_CLOUDWATCH_LOG_GROUP_TRITON as string,
		};

		createLogStreamCommandBuilder(args);

		expect(CreateLogStreamCommand).toBeCalledWith({
			logGroupName: args.cloudWatchLogGroupByRpcProvider,
			logStreamName: args.currentDate,
		});
	});
});
