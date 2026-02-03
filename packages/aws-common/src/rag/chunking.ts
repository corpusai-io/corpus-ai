/**
 * Text Chunking Utilities
 * Splits documents into smaller chunks for embedding and retrieval
 */

export interface ChunkOptions {
  chunkSize?: number; // Max characters per chunk
  chunkOverlap?: number; // Overlap between chunks
  separator?: string; // Text separator (e.g., '\n\n', '. ')
}

export interface TextChunk {
  id: string;
  text: string;
  metadata: {
    source: string;
    chunkIndex: number;
    totalChunks: number;
    startChar: number;
    endChar: number;
    [key: string]: any;
  };
}

/**
 * Split text into chunks with overlap
 */
export function chunkText(
  text: string,
  source: string,
  options: ChunkOptions = {}
): TextChunk[] {
  const {
    chunkSize = 1000,
    chunkOverlap = 200,
    separator = '\n\n',
  } = options;

  // Clean the text
  const cleanedText = text.trim();

  if (cleanedText.length === 0) {
    return [];
  }

  // Split by separator first
  const segments = cleanedText.split(separator).filter(s => s.trim().length > 0);

  const chunks: TextChunk[] = [];
  let currentChunk = '';
  let startChar = 0;

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i].trim();

    // If adding this segment would exceed chunk size and we have content
    if (currentChunk.length > 0 && currentChunk.length + segment.length > chunkSize) {
      // Save current chunk
      chunks.push({
        id: `${source}-chunk-${chunks.length}`,
        text: currentChunk.trim(),
        metadata: {
          source,
          chunkIndex: chunks.length,
          totalChunks: 0, // Will be updated later
          startChar,
          endChar: startChar + currentChunk.length,
        },
      });

      // Start new chunk with overlap
      const overlapText = currentChunk.slice(-chunkOverlap);
      startChar = startChar + currentChunk.length - overlapText.length;
      currentChunk = overlapText + (overlapText ? separator : '') + segment;
    } else {
      // Add segment to current chunk
      currentChunk += (currentChunk ? separator : '') + segment;
    }
  }

  // Add final chunk
  if (currentChunk.trim().length > 0) {
    chunks.push({
      id: `${source}-chunk-${chunks.length}`,
      text: currentChunk.trim(),
      metadata: {
        source,
        chunkIndex: chunks.length,
        totalChunks: 0,
        startChar,
        endChar: startChar + currentChunk.length,
      },
    });
  }

  // Update total chunks count
  chunks.forEach(chunk => {
    chunk.metadata.totalChunks = chunks.length;
  });

  return chunks;
}

/**
 * Chunk text by sentences (better for semantic coherence)
 */
export function chunkBySentences(
  text: string,
  source: string,
  maxSentencesPerChunk: number = 10
): TextChunk[] {
  // Simple sentence splitter (can be improved with NLP library)
  const sentences = text
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);

  const chunks: TextChunk[] = [];
  let startChar = 0;

  for (let i = 0; i < sentences.length; i += maxSentencesPerChunk) {
    const chunkSentences = sentences.slice(i, i + maxSentencesPerChunk);
    const chunkText = chunkSentences.join('. ') + '.';

    chunks.push({
      id: `${source}-chunk-${chunks.length}`,
      text: chunkText,
      metadata: {
        source,
        chunkIndex: chunks.length,
        totalChunks: 0,
        startChar,
        endChar: startChar + chunkText.length,
        sentences: chunkSentences.length,
      },
    });

    startChar += chunkText.length;
  }

  // Update total chunks count
  chunks.forEach(chunk => {
    chunk.metadata.totalChunks = chunks.length;
  });

  return chunks;
}

/**
 * Chunk text by fixed character size (simple method)
 */
export function chunkBySize(
  text: string,
  source: string,
  chunkSize: number = 1000,
  overlap: number = 200
): TextChunk[] {
  const chunks: TextChunk[] = [];
  let startChar = 0;

  while (startChar < text.length) {
    const endChar = Math.min(startChar + chunkSize, text.length);
    const chunkText = text.slice(startChar, endChar);

    chunks.push({
      id: `${source}-chunk-${chunks.length}`,
      text: chunkText.trim(),
      metadata: {
        source,
        chunkIndex: chunks.length,
        totalChunks: 0,
        startChar,
        endChar,
      },
    });

    startChar = endChar - overlap;
  }

  // Update total chunks count
  chunks.forEach(chunk => {
    chunk.metadata.totalChunks = chunks.length;
  });

  return chunks;
}

/**
 * Merge small chunks if they're below minimum size
 */
export function mergeSmallChunks(
  chunks: TextChunk[],
  minSize: number = 100
): TextChunk[] {
  if (chunks.length === 0) return [];

  const merged: TextChunk[] = [];
  let currentChunk = chunks[0];

  for (let i = 1; i < chunks.length; i++) {
    const nextChunk = chunks[i];

    if (currentChunk.text.length < minSize) {
      // Merge with next chunk
      currentChunk = {
        id: currentChunk.id,
        text: currentChunk.text + '\n\n' + nextChunk.text,
        metadata: {
          ...currentChunk.metadata,
          endChar: nextChunk.metadata.endChar,
        },
      };
    } else {
      merged.push(currentChunk);
      currentChunk = nextChunk;
    }
  }

  // Add final chunk
  merged.push(currentChunk);

  // Update indices and totals
  merged.forEach((chunk, index) => {
    chunk.id = `${chunk.metadata.source}-chunk-${index}`;
    chunk.metadata.chunkIndex = index;
    chunk.metadata.totalChunks = merged.length;
  });

  return merged;
}
