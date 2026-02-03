import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { nanoid } from 'nanoid';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'corpus-ai-uploads';

export interface UploadResult {
  fileId: string;
  url: string;
  key: string;
  size: number;
  contentType: string;
}

/**
 * Upload file to S3
 */
export async function uploadFile(
  buffer: Buffer,
  filename: string,
  contentType: string,
  chatbotId: string
): Promise<UploadResult> {
  const fileId = nanoid();
  const ext = filename.split('.').pop();
  const key = `chatbots/${chatbotId}/files/${fileId}.${ext}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    Metadata: {
      chatbotId,
      originalFilename: filename,
      uploadedAt: new Date().toISOString(),
    },
  });

  await s3Client.send(command);

  return {
    fileId,
    url: `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`,
    key,
    size: buffer.length,
    contentType,
  };
}

/**
 * Generate presigned URL for upload
 */
export async function generateUploadUrl(
  filename: string,
  contentType: string,
  chatbotId: string,
  expiresIn: number = 3600
): Promise<{ uploadUrl: string; fileKey: string; fileId: string }> {
  const fileId = nanoid();
  const ext = filename.split('.').pop();
  const key = `chatbots/${chatbotId}/files/${fileId}.${ext}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
    Metadata: {
      chatbotId,
      originalFilename: filename,
    },
  });

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn });

  return {
    uploadUrl,
    fileKey: key,
    fileId,
  };
}

/**
 * Generate presigned URL for download
 */
export async function generateDownloadUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  return await getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Delete file from S3
 */
export async function deleteFile(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  await s3Client.send(command);
}

/**
 * Validate file type
 */
export function validateFileType(filename: string, allowedTypes: string[]): boolean {
  const ext = filename.split('.').pop()?.toLowerCase();
  return ext ? allowedTypes.includes(ext) : false;
}

/**
 * Validate file size
 */
export function validateFileSize(size: number, maxSizeMB: number): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return size <= maxSizeBytes;
}

/**
 * Extract text from file buffer
 */
export async function extractTextFromFile(
  buffer: Buffer,
  contentType: string
): Promise<string> {
  // For now, only handle plain text files
  if (contentType === 'text/plain') {
    return buffer.toString('utf-8');
  }

  // TODO: Add support for PDF, DOCX, etc.
  // For PDF: use pdf-parse or pdfjs-dist
  // For DOCX: use mammoth or docx

  throw new Error(`Unsupported file type: ${contentType}`);
}
