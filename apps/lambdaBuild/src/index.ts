import { SQSHandler, SQSEvent, SQSRecord } from 'aws-lambda';
import {
  getChatbotById,
  ChatbotModel,
  UserModel,
  downloadFileFromS3,
  listFilesInS3,
  // Document processing
  processPDF,
  processDOCX,
  processCSV,
  processXLSX,
  processURL,
  crawlWebsite,
  processPlainText,
  // Chunking
  createParentChildChunks,
  sanitizeForId,
  contextualizeChunks,
  // Embeddings
  generateEmbeddings,
  // Pinecone
  upsertVectors,
  getOrCreateIndex,
  // Types
  type ProcessedDocument,
  type TextChunk,
  // Cache
  clearChatbotCache,
  // Data store
  dataStore,
  // SQS
  sendRebuildMessage,
} from '@corpusai/aws-common';

/**
 * Lambda Builder Handler
 * Processes SQS messages to build chatbot indexes using the enhanced RAG pipeline:
 * - Parent-child chunking for small-to-big retrieval
 * - PDF bounding box annotations for source highlighting
 * - Contextual enrichment via GPT-4o-mini
 * - Namespace isolation per chatbot in Pinecone
 */

interface BuildMessage {
  chatbotId: string;
  username: string;
  type?: 'files' | 'web' | 'rebuild';
  origin?: string;
  files?: string[]; // S3 keys of uploaded files
  language?: string;
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
  const { chatbotId, username, type, files: fileKeys } = message;

  console.log(`Building chatbot ${chatbotId} for user ${username} (type: ${type || 'unknown'})`);

  // Track which sources are processed in this build (declared outside try for error handler access)
  let processedSources = new Set<string>();

  try {
    // Step 1: Get chatbot record
    await updateChatbotStatus(chatbotId, 'BUILDING', 1, 'Initializing build...');

    // Invalidate response cache for this chatbot since data is changing
    await clearChatbotCache(chatbotId).catch(err =>
      console.warn(`Failed to clear response cache for ${chatbotId}:`, err.message)
    );

    const chatbot = await getChatbotById(chatbotId);
    if (!chatbot) {
      throw new Error(`Chatbot ${chatbotId} not found`);
    }

    console.log('Chatbot found:', chatbot.title);

    // Look up user tier for web page quota limits
    let userTier = 0;
    try {
      const users = await UserModel.query('username').eq(username).exec();
      if (users.length > 0) {
        userTier = users[0].tier || 0;
      }
    } catch (err: any) {
      console.warn('Could not fetch user tier, defaulting to Free:', err.message);
    }

    // Step 2: Download files / crawl website
    await updateChatbotStatus(chatbotId, 'BUILDING', 2, 'Downloading files...');

    const documents = await downloadChatbotFiles(chatbotId, chatbot.origin, fileKeys, userTier, username);
    console.log(`Downloaded ${documents.length} documents`);

    // Track which sources were processed in this build (for incremental builds)
    processedSources = new Set(documents.map(d => d.source));

    // Step 3: Process documents (PDF/DOCX/URL with vision + tables)
    await updateChatbotStatus(chatbotId, 'BUILDING', 3, 'Processing documents...');

    const allChildChunks: TextChunk[] = [];
    const allParentChunks: TextChunk[] = [];

    for (const doc of documents) {
      try {
        let processed: ProcessedDocument;

        // Process based on type
        switch (doc.type) {
          case 'pdf':
            processed = await processPDF(doc.content as Buffer, doc.source);
            break;
          case 'docx':
            processed = await processDOCX(doc.content as Buffer, doc.source);
            break;
          case 'csv':
            processed = await processCSV(doc.content as Buffer, doc.source);
            break;
          case 'xlsx':
            processed = await processXLSX(doc.content as Buffer, doc.source);
            break;
          case 'url':
            processed = await processURL(doc.content as string);
            break;
          default:
            processed = processPlainText(
              Buffer.isBuffer(doc.content) ? doc.content.toString('utf-8') : doc.content,
              doc.source
            );
        }

        // Create parent-child chunks
        const { parentChunks, childChunks } = createParentChildChunks(
          processed.text,
          doc.source,
          {
            parentChunkSize: 2000,
            parentChunkOverlap: 200,
            childChunkSize: 400,
            childChunkOverlap: 50,
            documentId: `${chatbotId}-${sanitizeForId(doc.source)}`,
            documentTitle: processed.metadata.title || doc.source,
          }
        );

        // Build parent lookup so child chunks can carry their parent's text
        const parentMap = new Map(parentChunks.map(p => [p.id, p.text]));

        // Attach parent text to each child chunk for small-to-big retrieval
        for (const child of childChunks) {
          if (child.metadata.parentChunkId && parentMap.has(child.metadata.parentChunkId)) {
            child.metadata.parentText = parentMap.get(child.metadata.parentChunkId);
          }
        }

        allChildChunks.push(...childChunks);
        allParentChunks.push(...parentChunks);

        // Store pageCount on the data store record for file-based documents
        if (doc.type !== 'url' && doc.type !== 'text') {
          try {
            const pages = processed.metadata.pages || parentChunks.length;
            await dataStore.patch({ username, chatbotId, dataSource: doc.source })
              .set({ pageCount: pages })
              .go();
          } catch (e: any) {
            console.warn(`Failed to update pageCount for ${doc.source}:`, e.message);
          }
        }

        console.log(`Processed ${doc.source}: ${parentChunks.length} parent chunks, ${childChunks.length} child chunks`);
      } catch (error: any) {
        console.error(`Error processing ${doc.source}:`, error.message);
        // Continue with other documents
      }
    }

    console.log(`Total chunks created: ${allChildChunks.length} child, ${allParentChunks.length} parent`);

    if (allChildChunks.length === 0) {
      throw new Error('No chunks created from documents');
    }

    // Step 4: Contextual enrichment - add context prefix to child chunks
    await updateChatbotStatus(chatbotId, 'BUILDING', 4, 'Adding contextual enrichment...');

    let enrichedChunks = allChildChunks;
    try {
      enrichedChunks = await contextualizeChunks(
        allChildChunks,
        chatbot.title || 'Document',
      );
      console.log(`Contextualized ${enrichedChunks.length} chunks`);
    } catch (error: any) {
      console.warn('Contextual enrichment failed, using raw chunks:', error.message);
      enrichedChunks = allChildChunks; // Fallback to non-enriched
    }

    // Step 5: Generate embeddings for child chunks (these go to Pinecone for search)
    await updateChatbotStatus(
      chatbotId,
      'BUILDING',
      5,
      `Generating embeddings for ${enrichedChunks.length} chunks...`
    );

    const texts = enrichedChunks.map(chunk => chunk.text);
    const embeddings = await generateEmbeddings(texts);
    console.log(`Generated ${embeddings.length} embeddings`);

    // Step 6: Prepare and store vectors with namespace isolation
    await updateChatbotStatus(chatbotId, 'BUILDING', 6, 'Storing vectors...');

    const vectors = enrichedChunks.map((chunk, index) => ({
      id: chunk.id,
      values: embeddings[index],
      metadata: {
        text: chunk.metadata.parentText || chunk.text, // Use parent text for LLM context (small-to-big)
        childText: chunk.text, // Original child text for display/citations
        chatbotId,
        username,
        source: chunk.metadata.source,
        chunkIndex: chunk.metadata.chunkIndex,
        totalChunks: chunk.metadata.totalChunks,
        chunkType: chunk.metadata.chunkType || 'standard',
        documentId: chunk.metadata.documentId,
        documentTitle: chunk.metadata.documentTitle,
        pageNumber: chunk.metadata.pageNumber,
      },
    }));

    const indexName = process.env.PINECONE_INDEX || 'corpus-dense'; // Centralized index with namespace isolation
    await getOrCreateIndex(indexName, 3072); // text-embedding-3-large dimension

    // Use chatbotId as namespace for tenant isolation
    await upsertVectors(indexName, vectors, chatbotId);
    console.log(`Upserted ${vectors.length} vectors to namespace ${chatbotId}`);

    // Parent chunks are linked via child chunk metadata (parentChunkId).
    // They don't need their own vectors since they're never retrieved via similarity search.
    console.log(`${allParentChunks.length} parent chunks linked via child metadata`);

    // Update only processed data store records to "active"
    try {
      const dsRecords = await dataStore.query.primary({ username, chatbotId }).go();
      const toUpdate = dsRecords.data.filter((r: any) => processedSources.has(r.dataSource));
      if (toUpdate.length > 0) {
        await Promise.all(
          toUpdate.map((r: any) =>
            dataStore.patch({ username, chatbotId, dataSource: r.dataSource })
              .set({ status: 'active' })
              .go()
              .catch((e: any) => console.error(`Failed to update data store status for ${r.dataSource}:`, e))
          )
        );
        console.log(`Updated ${toUpdate.length} of ${dsRecords.data.length} data store records to active`);
      }

      // Auto-retry: check if new data sources were added during this build
      const pendingRecords = dsRecords.data.filter(
        (r: any) => r.status === 'processing' && !processedSources.has(r.dataSource)
      );
      if (pendingRecords.length > 0) {
        console.log(`[Build Lock] Found ${pendingRecords.length} pending data sources — sending new rebuild message`);
        try {
          await sendRebuildMessage(chatbotId);
          console.log(`[Build Lock] Rebuild message sent for ${chatbotId}`);
          return; // Stay BUILDING — the next build will set ACTIVE
        } catch (sqsErr: any) {
          console.error(`[Build Lock] Failed to send rebuild message:`, sqsErr.message);
          // Fall through to set ACTIVE anyway
        }
      }
    } catch (err: any) {
      console.error('Failed to update data store statuses:', err.message);
    }

    // Step 7: All done — no pending sources remain
    await updateChatbotStatus(
      chatbotId,
      'ACTIVE',
      7,
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

    // Update only the data store records that were being processed to "error"
    try {
      const dsRecords = await dataStore.query.primary({ username, chatbotId }).go();
      const toError = dsRecords.data.filter((r: any) => processedSources.has(r.dataSource));
      if (toError.length > 0) {
        await Promise.all(
          toError.map((r: any) =>
            dataStore.patch({ username, chatbotId, dataSource: r.dataSource })
              .set({ status: 'error' })
              .go()
              .catch(() => {})
          )
        );
      }
    } catch (e) {
      // best-effort, don't fail on status update
    }

    throw error;
  }
}

/**
 * Detect file type from filename extension
 */
function detectFileTypeFromName(fileName: string): 'pdf' | 'docx' | 'csv' | 'xlsx' | 'text' | 'url' {
  const lower = fileName.toLowerCase();
  if (lower.endsWith('.pdf')) return 'pdf';
  if (lower.endsWith('.docx') || lower.endsWith('.doc')) return 'docx';
  if (lower.endsWith('.csv')) return 'csv';
  if (lower.endsWith('.xlsx') || lower.endsWith('.xls')) return 'xlsx';
  return 'text';
}

/**
 * Web page quota limits per tier (mirrors TIER_QUOTAS in quota.controller.ts)
 */
const WEB_PAGES_QUOTA: Record<number, number> = {
  0: 10,    // Free
  1: 100,   // Starter
  2: 500,   // Standard
  3: 2000,  // Business
};

/**
 * Download chatbot files from S3 and/or crawl web URLs.
 * Uses data store records to determine what needs processing,
 * regardless of the chatbot's original origin.
 */
async function downloadChatbotFiles(
  chatbotId: string,
  origin: string,
  fileKeys?: string[],
  userTier: number = 0,
  username?: string
): Promise<Array<{
  source: string;
  content: string | Buffer;
  type: 'pdf' | 'url' | 'text' | 'docx' | 'csv' | 'xlsx';
}>> {
  const documents: Array<{
    source: string;
    content: string | Buffer;
    type: 'pdf' | 'url' | 'text' | 'docx' | 'csv' | 'xlsx';
  }> = [];

  // If SQS message included specific file keys, use those (initial build with explicit files)
  if (fileKeys && fileKeys.length > 0) {
    console.log(`Downloading ${fileKeys.length} files from SQS message...`);
    for (const key of fileKeys) {
      try {
        const fileContent = await downloadFileFromS3(key);
        const fileName = key.split('/').pop() || key;
        documents.push({
          source: fileName,
          content: fileContent,
          type: detectFileTypeFromName(fileName),
        });
        console.log(`Downloaded: ${fileName} (${key})`);
      } catch (error: any) {
        console.error(`Failed to download ${key}:`, error.message);
      }
    }
    return documents;
  }

  // Query data store records to determine what needs processing
  let allRecords: Array<any> = [];
  if (username) {
    try {
      const result = await dataStore.query.primary({ username, chatbotId }).go();
      allRecords = result.data || [];
    } catch (e) { /* ignore */ }
  }

  const isRebuild = !fileKeys || fileKeys.length === 0;

  // Process web-type data sources with status='processing'
  const webRecordsToProcess = allRecords.filter((r: any) => r.dataType === 'web' && r.status === 'processing');
  if (webRecordsToProcess.length > 0) {
    const maxPages = WEB_PAGES_QUOTA[userTier] || 10;

    for (const webRecord of webRecordsToProcess) {
      const webUrl = webRecord.dataSource;
      console.log(`Crawling website: ${webUrl} (max ${maxPages} pages, tier ${userTier})`);

      try {
        const crawledDocs = await crawlWebsite(webUrl, maxPages);
        console.log(`Crawled ${crawledDocs.length} pages from ${webUrl}`);

        for (const doc of crawledDocs) {
          documents.push({
            source: doc.source,
            content: doc.text,
            type: 'text',
          });
        }

        // Store crawledPages count on the data store record
        if (username) {
          try {
            await dataStore.patch({ username, chatbotId, dataSource: webUrl })
              .set({ crawledPages: crawledDocs.length })
              .go();
            console.log(`Updated crawledPages to ${crawledDocs.length} for ${webUrl}`);
          } catch (err: any) {
            console.warn('Failed to update crawledPages:', err.message);
          }
        }
      } catch (error: any) {
        console.error(`Crawl failed for ${webUrl}:`, error.message);
        documents.push({ source: webUrl, content: webUrl, type: 'url' });
      }
    }

    // Update the chatbot's webCountUsage
    try {
      const webDocCount = documents.filter(d => d.type === 'text' || d.type === 'url').length;
      await ChatbotModel.update({ chatbotId }, { webCountUsage: webDocCount });
    } catch (err: any) {
      console.warn('Failed to update webCountUsage:', err.message);
    }
  }

  // Process S3 file-type data sources
  try {
    const s3KeyToName = new Map<string, string>();
    const processingS3Keys = new Set<string>();
    for (const r of allRecords) {
      if (r.s3Key) {
        s3KeyToName.set(r.s3Key, r.dataSource);
        const s3Filename = r.s3Key.split('/').pop();
        if (s3Filename) s3KeyToName.set(s3Filename, r.dataSource);
        if (r.status === 'processing') processingS3Keys.add(r.s3Key);
      }
    }

    const s3Prefix = `chatbots/${chatbotId}/files/`;
    const s3Files = await listFilesInS3(s3Prefix);
    console.log(`Found ${s3Files.length} files in S3`);

    for (const file of s3Files) {
      // On rebuild, only process files whose data store record is 'processing'
      if (isRebuild && !processingS3Keys.has(file.key)) {
        continue;
      }
      try {
        const fileContent = await downloadFileFromS3(file.key);
        const fileName = s3KeyToName.get(file.key)
          || s3KeyToName.get(file.key.split('/').pop() || '')
          || file.key.split('/').pop() || file.key;
        documents.push({
          source: fileName,
          content: fileContent,
          type: detectFileTypeFromName(fileName),
        });
        console.log(`Downloaded: ${fileName} (${file.size} bytes)`);
      } catch (error: any) {
        console.error(`Failed to download ${file.key}:`, error.message);
      }
    }
  } catch (error: any) {
    console.error('Error listing/downloading files from S3:', error.message);
  }

  // If no files were found and origin is actual text content (not a label like 'file-upload')
  const reservedOrigins = ['file-upload', 'text-input'];
  if (documents.length === 0 && origin && !reservedOrigins.includes(origin)) {
    console.log('No S3 files found, treating origin as inline text content');
    documents.push({
      source: 'inline-content',
      content: origin,
      type: 'text',
    });
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
