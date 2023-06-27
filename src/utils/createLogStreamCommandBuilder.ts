import { CreateLogStreamCommand } from '@aws-sdk/client-cloudwatch-logs';

export const createLogStreamCommandBuilder = (
	{
		currentDate,
	}: {
		currentDate: string;
	},
	cloudWatchLogGroupByRpcProvider: string
): CreateLogStreamCommand => {
	return new CreateLogStreamCommand({
		logGroupName: cloudWatchLogGroupByRpcProvider,
		logStreamName: currentDate,
	});
};
