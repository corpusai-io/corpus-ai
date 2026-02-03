import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '../utils/env';

// Initialize S3 Client
const s3Client = new S3Client({
  region: env('S3_REGION'),
  credentials: {
    accessKeyId: env('AWS_ACCESS_KEY_ID'),
    secretAccessKey: env('AWS_SECRET_ACCESS_KEY'),
  },
});

const bucketName = env('S3_BUCKET_NAME');

/**
 * Upload a file to S3
 */
export async function uploadFileToS3(params: {
  key: string;
  body: Buffer | Uint8Array | string;
  contentType?: string;
  metadata?: Record<string, string>;
}): Promise<{ success: boolean; key: string; url: string }> {
  const { key, body, contentType, metadata } = params;

  try {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: body,
      ContentType: contentType,
      Metadata: metadata,
    });

    await s3Client.send(command);

    const url = `https://${bucketName}.s3.${env('S3_REGION')}.amazonaws.com/${key}`;

    return {
      success: true,
      key,
      url,
    };
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Download a file from S3
 */
export async function downloadFileFromS3(key: string): Promise<Buffer> {
  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    const response = await s3Client.send(command);

    if (!response.Body) {
      throw new Error('No file body returned from S3');
    }

    // Convert stream to buffer
    const chunks: Uint8Array[] = [];
    for await (const chunk of response.Body as any) {
      chunks.push(chunk);
    }

    return Buffer.concat(chunks);
  } catch (error) {
    console.error('Error downloading from S3:', error);
    throw new Error(`Failed to download file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Delete a file from S3
 */
export async function deleteFileFromS3(key: string): Promise<{ success: boolean }> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    await s3Client.send(command);

    return { success: true };
  } catch (error) {
    console.error('Error deleting from S3:', error);
    throw new Error(`Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Check if file exists in S3
 */
export async function fileExistsInS3(key: string): Promise<boolean> {
  try {
    const command = new HeadObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    await s3Client.send(command);
    return true;
  } catch (error: any) {
    if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
      return false;
    }
    throw error;
  }
}

/**
 * Generate a presigned URL for temporary file access
 */
export async function getPresignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn });
    return url;
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    throw new Error(`Failed to generate presigned URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate S3 key for chatbot files
 */
export function getChatbotFilePath(chatbotId: string, filename: string): string {
  return `chatbots/${chatbotId}/files/${filename}`;
}

/**
 * Generate S3 key for raw uploaded files
 */
export function getRawFilePath(chatbotId: string, filename: string): string {
  return `chatbots/${chatbotId}/raw/${filename}`;
}

/**
 * Generate S3 key for processed files
 */
export function getProcessedFilePath(chatbotId: string, filename: string): string {
  return `chatbots/${chatbotId}/processed/${filename}`;
}

/**
 * Generate S3 key for chatbot indexes
 */
export function getIndexPath(chatbotId: string): string {
  return `chatbots/${chatbotId}/index/`;
}

export { s3Client, bucketName };
