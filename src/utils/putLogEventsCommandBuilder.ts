import { PutLogEventsCommand } from '@aws-sdk/client-cloudwatch-logs';

export const putLogEventsCommandBuilder = (
	{
		currentDate,
		requestMethod,
		statusCode,
		statusMessage,
		responseBody,
	}: {
		currentDate: string;
		requestMethod: string;
		statusCode: number;
		statusMessage: string;
		responseBody: string;
	},
	cloudWatchLogGroupByRpcProvider: string
): PutLogEventsCommand => {
	return new PutLogEventsCommand({
		logGroupName: cloudWatchLogGroupByRpcProvider,
		logStreamName: currentDate,
		logEvents: [
			{
				timestamp: Date.now(),
				message: `Error ${requestMethod} ${statusCode} ${statusMessage} ${responseBody}`,
			},
		],
	});
};
