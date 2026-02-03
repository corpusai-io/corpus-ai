import { SQSHandler, SQSEvent, SQSRecord } from 'aws-lambda';
import {
  getChatbotById,
  ChatbotModel,
  downloadFileFromS3,
  processAndChunkDocument,
  generateEmbeddings,
  upsertVectors,
  getOrCreateIndex,
} from '@corpusai/aws-common';

/**
 * Lambda Builder Handler
 * Processes SQS messages to build chatbot indexes
 */

interface BuildMessage {
  chatbotId: string;
  username: string;
  type: 'files' | 'web' | 'rebuild';
  timestamp: string;
}

export const handler: SQSHandler = async (event: SQSEvent) => {
  console.log('Build handler triggered with', event.Records.length, 'messages');

  for (const record of event.Records) {
    try {
      await processRecord(record);
    } catch (error: any) {
      console.error('Error processing record:', error);
      // Continue processing other records even if one fails
    }
  }
};

/**
 * Process a single SQS record
 */
async function processRecord(record: SQSRecord) {
  console.log('Processing record:', record.messageId);

  const message: BuildMessage = JSON.parse(record.body);
  const { chatbotId, username, type } = message;

  console.log(`Building chatbot ${chatbotId} for user ${username} (type: ${type})`);

  try {
    // Step 1: Get chatbot record
    await updateChatbotStatus(chatbotId, 'BUILDING', 1, 'Initializing build...');

    const chatbot = await getChatbotById(chatbotId);
    if (!chatbot) {
      throw new Error(`Chatbot ${chatbotId} not found`);
    }

    console.log('Chatbot found:', chatbot.title);

    // Step 2: Download and process files
    await updateChatbotStatus(chatbotId, 'BUILDING', 2, 'Downloading files...');

    const documents = await downloadChatbotFiles(chatbotId, chatbot.origin);
    console.log(`Downloaded ${documents.length} documents`);

    // Step 3: Process documents and create chunks
    await updateChatbotStatus(chatbotId, 'BUILDING', 3, 'Processing documents...');

    const allChunks = [];
    for (const doc of documents) {
      try {
        const { chunks } = await processAndChunkDocument(
          doc.content,
          doc.source,
          doc.type
        );
        allChunks.push(...chunks);
        console.log(`Processed ${doc.source}: ${chunks.length} chunks`);
      } catch (error: any) {
        console.error(`Error processing ${doc.source}:`, error.message);
        // Continue with other documents
      }
    }

    console.log(`Total chunks created: ${allChunks.length}`);

    if (allChunks.length === 0) {
      throw new Error('No chunks created from documents');
    }

    // Step 4: Generate embeddings
    await updateChatbotStatus(
      chatbotId,
      'BUILDING',
      4,
      `Generating embeddings for ${allChunks.length} chunks...`
    );

    const texts = allChunks.map(chunk => chunk.text);
    const embeddings = await generateEmbeddings(texts);
    console.log(`Generated ${embeddings.length} embeddings`);

    // Step 5: Prepare vectors for Pinecone
    await updateChatbotStatus(chatbotId, 'BUILDING', 5, 'Storing vectors...');

    const vectors = allChunks.map((chunk, index) => ({
      id: chunk.id,
      values: embeddings[index],
      metadata: {
        text: chunk.text,
        chatbotId,
        username,
        source: chunk.metadata.source,
        chunkIndex: chunk.metadata.chunkIndex,
        totalChunks: chunk.metadata.totalChunks,
      },
    }));

    // Step 6: Create/update Pinecone index
    const indexName = chatbot.indexName || `chatbot-${chatbotId}`;
    await getOrCreateIndex(indexName, 1536); // text-embedding-3-small dimension

    // Step 7: Upsert vectors to Pinecone
    await upsertVectors(indexName, vectors);
    console.log(`Upserted ${vectors.length} vectors to Pinecone`);

    // Step 8: Update chatbot to ACTIVE
    await updateChatbotStatus(
      chatbotId,
      'ACTIVE',
      6,
      'Build completed successfully!',
      indexName
    );

    console.log(`Build completed successfully for chatbot ${chatbotId}`);
  } catch (error: any) {
    console.error('Build failed:', error);

    // Update chatbot to ERROR state
    await updateChatbotStatus(
      chatbotId,
      'ERROR',
      undefined,
      error.message,
      undefined,
      error.step || 0
    );

    throw error;
  }
}

/**
 * Download chatbot files from S3 or fetch URLs
 */
async function downloadChatbotFiles(
  chatbotId: string,
  origin: string
): Promise<Array<{
  source: string;
  content: string | Buffer;
  type: 'pdf' | 'url' | 'text';
}>> {
  const documents: Array<{
    source: string;
    content: string | Buffer;
    type: 'pdf' | 'url' | 'text';
  }> = [];

  // Check if origin is a URL
  if (origin.startsWith('http://') || origin.startsWith('https://')) {
    console.log(`Processing URL: ${origin}`);
    documents.push({
      source: origin,
      content: origin,
      type: 'url',
    });
  } else {
    // Download files from S3
    try {
      const s3Prefix = `chatbots/${chatbotId}/files/`;
      console.log(`Downloading files from S3: ${s3Prefix}`);

      // For now, we'll assume files are stored with known names
      // In production, you'd list all files in the prefix
      const fileNames = ['document.pdf', 'content.txt']; // This should come from metadata

      for (const fileName of fileNames) {
        try {
          const filePath = `${s3Prefix}${fileName}`;
          const fileContent = await downloadFileFromS3(filePath);

          const fileType = fileName.endsWith('.pdf')
            ? 'pdf'
            : fileName.endsWith('.txt')
            ? 'text'
            : 'text';

          documents.push({
            source: fileName,
            content: fileContent,
            type: fileType as 'pdf' | 'text',
          });

          console.log(`Downloaded: ${fileName}`);
        } catch (error: any) {
          console.error(`Failed to download ${fileName}:`, error.message);
          // Continue with other files
        }
      }
    } catch (error: any) {
      console.error('Error downloading files from S3:', error.message);
    }
  }

  return documents;
}

/**
 * Update chatbot status in DynamoDB
 */
async function updateChatbotStatus(
  chatbotId: string,
  status: 'BUILDING' | 'ACTIVE' | 'ERROR',
  step?: number,
  message?: string,
  indexName?: string,
  errorStep?: number
) {
  const updateData: any = {
    status,
    lastRebuildDateTime: new Date().toISOString(),
  };

  if (step !== undefined) {
    updateData.step = step;
  }

  if (message) {
    updateData.errorMessage = message;
  }

  if (indexName) {
    updateData.indexName = indexName;
  }

  if (errorStep !== undefined) {
    updateData.errorStep = errorStep;
  }

  try {
    await ChatbotModel.update({ chatbotId }, updateData);
    console.log(`Updated chatbot ${chatbotId} status to ${status}`);
  } catch (error: any) {
    console.error('Error updating chatbot status:', error.message);
    throw error;
  }
}
