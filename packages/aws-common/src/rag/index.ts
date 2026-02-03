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
  type ChunkOptions,
  type TextChunk,
} from './chunking';

// Export all retrieval functions
export {
  retrievePassages,
  formatPassagesForContext,
  buildRAGPrompt,
  extractCitations,
  rerankPassages,
  getDiversePassages,
  type RetrievalOptions,
  type RetrievedPassage,
} from './retrieval';

// Export all document processing functions
export {
  processPDF,
  processURL,
  processTextFile,
  processPlainText,
  processAndChunkDocument,
  detectFileType,
  isValidURL,
  extractHTMLMetadata,
  type ProcessedDocument,
} from './document-processor';
