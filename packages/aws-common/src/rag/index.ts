/**
 * RAG (Retrieval-Augmented Generation) System
 * Complete package for document processing, embedding, and retrieval
 */

// Export all embedding functions
export {
  generateEmbedding,
  generateEmbeddings,
  getEmbeddingDimension,
  isValidEmbeddingModel,
} from './embeddings';

// Export all chunking functions
export {
  chunkText,
  chunkBySentences,
  chunkBySize,
  mergeSmallChunks,
  createParentChildChunks,
  sanitizeForId,
  contextualizeChunks,
  attachAnnotationsToChunks,
  type ChunkOptions,
  type TextChunk,
  type ParentChildResult,
} from './chunking';

// Export all retrieval functions
export {
  retrievePassages,
  hybridRetrievePassages,
  multiQueryRetrieve,
  hydeRetrieve,
  formatPassagesForContext,
  buildRAGPrompt,
  extractCitations,
  rerankPassages,
  getDiversePassages,
  type RetrievalOptions,
  type RetrievedPassage,
} from './retrieval';

// Export reranker
export {
  cohereRerank,
  keywordRerank,
  type RerankablePassage,
  type RerankResult,
} from './reranker';

// Export unified query processor
export {
  processQuery,
  flushPendingWrites,
  type QueryOptions,
  type QueryResult,
  type ConversationMessage,
} from './query-processor';

// Export response cache
export {
  getCachedResponse,
  setCachedResponse,
  clearChatbotCache,
  type CachedResponse,
} from './response-cache';

// Export all document processing functions
export {
  processPDF,
  processDOCX,
  processCSV,
  processXLSX,
  processURL,
  crawlWebsite,
  processTextFile,
  processPlainText,
  processAndChunkDocument,
  detectFileType,
  isValidURL,
  extractHTMLMetadata,
  type ProcessedDocument,
  type PageExtraction,
  type TextAnnotation,
} from './document-processor';
