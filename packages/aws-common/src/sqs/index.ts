import { SQSClient, SendMessageCommand, ReceiveMessageCommand, DeleteMessageCommand, GetQueueAttributesCommand } from '@aws-sdk/client-sqs';
import { env } from '../utils/env';

// Initialize SQS Client
const sqsClient = new SQSClient({
  region: env('SQS_REGION'),
  credentials: {
    accessKeyId: env('AWS_ACCESS_KEY_ID'),
    secretAccessKey: env('AWS_SECRET_ACCESS_KEY'),
  },
});

const buildQueueUrl = env('SQS_BUILD_QUEUE_URL');

/**
 * Send a chatbot build message to SQS
 */
export async function sendBuildMessage(params: {
  chatbotId: string;
  username: string;
  origin: string;
  indexName: string;
  language?: string;
  files?: string[]; // S3 keys of uploaded files
}): Promise<{ success: boolean; messageId: string }> {
  const { chatbotId, username, origin, indexName, language = 'en', files = [] } = params;

  try {
    const message = {
      chatbotId,
      username,
      origin,
      indexName,
      language,
      files,
      timestamp: new Date().toISOString(),
    };

    const command = new SendMessageCommand({
      QueueUrl: buildQueueUrl,
      MessageBody: JSON.stringify(message),
      MessageAttributes: {
        chatbotId: {
          DataType: 'String',
          StringValue: chatbotId,
        },
        username: {
          DataType: 'String',
          StringValue: username,
        },
        type: {
          DataType: 'String',
          StringValue: files.length > 0 ? 'files' : 'web',
        },
      },
    });

    const response = await sqsClient.send(command);

    console.log(`Build message sent to SQS: ${response.MessageId}`);

    return {
      success: true,
      messageId: response.MessageId || '',
    };
  } catch (error) {
    console.error('Error sending message to SQS:', error);
    throw new Error(`Failed to send build message: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Receive messages from the build queue
 */
export async function receiveBuildMessages(maxMessages: number = 1): Promise<any[]> {
  try {
    const command = new ReceiveMessageCommand({
      QueueUrl: buildQueueUrl,
      MaxNumberOfMessages: maxMessages,
      WaitTimeSeconds: 10, // Long polling
      MessageAttributeNames: ['All'],
    });

    const response = await sqsClient.send(command);

    if (!response.Messages || response.Messages.length === 0) {
      return [];
    }

    return response.Messages.map((msg) => ({
      messageId: msg.MessageId,
      receiptHandle: msg.ReceiptHandle,
      body: JSON.parse(msg.Body || '{}'),
      attributes: msg.MessageAttributes,
    }));
  } catch (error) {
    console.error('Error receiving messages from SQS:', error);
    throw new Error(`Failed to receive messages: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Delete a message from the queue after processing
 */
export async function deleteBuildMessage(receiptHandle: string): Promise<{ success: boolean }> {
  try {
    const command = new DeleteMessageCommand({
      QueueUrl: buildQueueUrl,
      ReceiptHandle: receiptHandle,
    });

    await sqsClient.send(command);

    return { success: true };
  } catch (error) {
    console.error('Error deleting message from SQS:', error);
    throw new Error(`Failed to delete message: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get queue statistics
 */
export async function getQueueStats(): Promise<{
  approximateNumberOfMessages: number;
  approximateNumberOfMessagesNotVisible: number;
  approximateNumberOfMessagesDelayed: number;
}> {
  try {
    const command = new GetQueueAttributesCommand({
      QueueUrl: buildQueueUrl,
      AttributeNames: [
        'ApproximateNumberOfMessages',
        'ApproximateNumberOfMessagesNotVisible',
        'ApproximateNumberOfMessagesDelayed',
      ],
    });

    const response = await sqsClient.send(command);
    const attrs = response.Attributes || {};

    return {
      approximateNumberOfMessages: parseInt(attrs.ApproximateNumberOfMessages || '0'),
      approximateNumberOfMessagesNotVisible: parseInt(attrs.ApproximateNumberOfMessagesNotVisible || '0'),
      approximateNumberOfMessagesDelayed: parseInt(attrs.ApproximateNumberOfMessagesDelayed || '0'),
    };
  } catch (error) {
    console.error('Error getting queue stats:', error);
    throw new Error(`Failed to get queue stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Send a rebuild message for an existing chatbot
 */
export async function sendRebuildMessage(chatbotId: string): Promise<{ success: boolean; messageId: string }> {
  try {
    const message = {
      chatbotId,
      type: 'rebuild',
      timestamp: new Date().toISOString(),
    };

    const command = new SendMessageCommand({
      QueueUrl: buildQueueUrl,
      MessageBody: JSON.stringify(message),
      MessageAttributes: {
        chatbotId: {
          DataType: 'String',
          StringValue: chatbotId,
        },
        type: {
          DataType: 'String',
          StringValue: 'rebuild',
        },
      },
    });

    const response = await sqsClient.send(command);

    console.log(`Rebuild message sent to SQS: ${response.MessageId}`);

    return {
      success: true,
      messageId: response.MessageId || '',
    };
  } catch (error) {
    console.error('Error sending rebuild message to SQS:', error);
    throw new Error(`Failed to send rebuild message: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export { sqsClient, buildQueueUrl };
