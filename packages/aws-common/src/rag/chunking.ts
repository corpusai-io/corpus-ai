/**
 * Text Chunking Utilities
 * Splits documents into smaller chunks for embedding and retrieval
 */

import OpenAI from 'openai';

/**
 * Sanitize a string for use in Pinecone vector IDs and other contexts
 * that require ASCII-only characters. Replaces non-ASCII characters and
 * whitespace with underscores, collapses runs, and trims.
 */
export function sanitizeForId(value: string): string {
  return value
    .replace(/[^\x20-\x7E]/g, '_') // Replace non-printable-ASCII with underscore
    .replace(/\s+/g, '_')          // Collapse whitespace to underscore
    .replace(/_+/g, '_')           // Collapse consecutive underscores
    .replace(/^_|_$/g, '');        // Trim leading/trailing underscores
}

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
    annotations?: string;      // JSON-serialized TextAnnotation[] for PDF highlighting
    pageNumber?: number;       // Starting page number (0-indexed)
    documentId?: string;       // Unique document identifier
    documentTitle?: string;    // Human-readable document title
    sectionTitle?: string;     // Section heading above this chunk
    parentChunkId?: string;    // Reference to parent chunk (for child chunks)
    contextPrefix?: string;    // Contextual enrichment prefix
    chunkType?: 'parent' | 'child' | 'standard';  // Chunk type
    [key: string]: any;
  };
}

export interface ParentChildResult {
  parentChunks: TextChunk[];   // Large chunks (1500-2000 chars) for LLM context
  childChunks: TextChunk[];    // Small chunks (300-500 chars) for Pinecone search
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
        id: `${sanitizeForId(source)}-chunk-${chunks.length}`,
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
      id: `${sanitizeForId(source)}-chunk-${chunks.length}`,
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
      id: `${sanitizeForId(source)}-chunk-${chunks.length}`,
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
      id: `${sanitizeForId(source)}-chunk-${chunks.length}`,
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
    chunk.id = `${sanitizeForId(chunk.metadata.source)}-chunk-${index}`;
    chunk.metadata.chunkIndex = index;
    chunk.metadata.totalChunks = merged.length;
  });

  return merged;
}

/**
 * Create parent-child chunks for small-to-big retrieval strategy.
 * Small child chunks are embedded in Pinecone for precise matching.
 * When a child matches, its parent chunk provides richer context for the LLM.
 */
export function createParentChildChunks(
  text: string,
  source: string,
  options?: {
    parentChunkSize?: number;    // default 2000
    parentChunkOverlap?: number; // default 200
    childChunkSize?: number;     // default 400
    childChunkOverlap?: number;  // default 50
    documentId?: string;
    documentTitle?: string;
  }
): ParentChildResult {
  const {
    parentChunkSize = 2000,
    parentChunkOverlap = 200,
    childChunkSize = 400,
    childChunkOverlap = 50,
    documentId,
    documentTitle,
  } = options || {};

  // Create large parent chunks
  const parentChunks = chunkText(text, source, {
    chunkSize: parentChunkSize,
    chunkOverlap: parentChunkOverlap,
  }).map(chunk => ({
    ...chunk,
    id: `${sanitizeForId(source)}-parent-${chunk.metadata.chunkIndex}`,
    metadata: {
      ...chunk.metadata,
      chunkType: 'parent' as const,
      documentId,
      documentTitle,
    },
  }));

  // Create small child chunks from each parent
  const childChunks: TextChunk[] = [];

  for (const parent of parentChunks) {
    const children = chunkText(parent.text, source, {
      chunkSize: childChunkSize,
      chunkOverlap: childChunkOverlap,
    });

    for (const child of children) {
      childChunks.push({
        ...child,
        id: `${sanitizeForId(source)}-child-${childChunks.length}`,
        metadata: {
          ...child.metadata,
          chunkType: 'child' as const,
          parentChunkId: parent.id,
          documentId,
          documentTitle,
          // Adjust startChar relative to full document
          startChar: parent.metadata.startChar + child.metadata.startChar,
          endChar: parent.metadata.startChar + child.metadata.endChar,
        },
      });
    }
  }

  // Update totalChunks
  parentChunks.forEach(c => { c.metadata.totalChunks = parentChunks.length; });
  childChunks.forEach(c => { c.metadata.totalChunks = childChunks.length; });

  return { parentChunks, childChunks };
}

/**
 * Add contextual enrichment to chunks using GPT-4o-mini.
 * Prepends a 1-2 sentence context summary to each chunk before embedding.
 * This reduces failed retrievals by 49% (Anthropic research).
 *
 * Cost: ~$0.02 per 100 chunks (one-time at indexing)
 */
export async function contextualizeChunks(
  chunks: TextChunk[],
  documentTitle: string,
  documentSummary?: string,
): Promise<TextChunk[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.warn('OPENAI_API_KEY not set, skipping contextual enrichment');
    return chunks;
  }

  const openai = new OpenAI({ apiKey });
  const enrichedChunks: TextChunk[] = [];

  // Process in batches of 10 to avoid rate limits
  const batchSize = 10;

  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);

    const promises = batch.map(async (chunk) => {
      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{
            role: 'system',
            content: 'You are a document indexing assistant. Given a document title and a text chunk from that document, write a concise 1-2 sentence context that situates this chunk within the document. Include the document name and what this specific section discusses. Keep it under 100 words.'
          }, {
            role: 'user',
            content: `Document: "${documentTitle}"${documentSummary ? `\nSummary: ${documentSummary}` : ''}\n\nChunk (${chunk.metadata.chunkIndex + 1}/${chunk.metadata.totalChunks}):\n${chunk.text.substring(0, 500)}`
          }],
          max_tokens: 150,
          temperature: 0,
        });

        const contextPrefix = response.choices[0]?.message?.content?.trim() || '';

        return {
          ...chunk,
          text: contextPrefix ? `${contextPrefix}\n\n${chunk.text}` : chunk.text,
          metadata: {
            ...chunk.metadata,
            contextPrefix,
          },
        };
      } catch (error: any) {
        console.warn(`Context enrichment failed for chunk ${chunk.id}:`, error.message);
        return chunk; // Return original chunk on failure
      }
    });

    const results = await Promise.all(promises);
    enrichedChunks.push(...results);

    console.log(`Contextualized chunks ${i + 1}-${Math.min(i + batchSize, chunks.length)}/${chunks.length}`);
  }

  return enrichedChunks;
}

/**
 * Attach PDF bounding box annotations to chunks based on character offsets.
 * Maps each chunk's startChar/endChar range to the corresponding annotations
 * from the page extractions.
 */
export function attachAnnotationsToChunks(
  chunks: TextChunk[],
  pageExtractions: Array<{
    pageNumber: number;
    text: string;
    annotations: Array<{ page: number; x: number; y: number; width: number; height: number }>;
  }>
): TextChunk[] {
  // Build a flat list of all annotations with their character positions
  let charOffset = 0;
  const annotationMap: Array<{
    startChar: number;
    endChar: number;
    annotation: { page: number; x: number; y: number; width: number; height: number };
    pageNumber: number;
  }> = [];

  for (const pageExtraction of pageExtractions) {
    for (const ann of pageExtraction.annotations) {
      annotationMap.push({
        startChar: charOffset,
        endChar: charOffset + 1, // Approximate
        annotation: ann,
        pageNumber: pageExtraction.pageNumber,
      });
    }
    charOffset += pageExtraction.text.length + 2; // +2 for \n\n separator
  }

  // For each chunk, find overlapping annotations
  return chunks.map(chunk => {
    const chunkStart = chunk.metadata.startChar;
    const chunkEnd = chunk.metadata.endChar;

    // Find annotations that fall within this chunk's range
    const relevantAnnotations = annotationMap
      .filter(a => a.startChar >= chunkStart && a.startChar < chunkEnd)
      .map(a => a.annotation);

    // Find the primary page for this chunk
    const pageAnnotations = annotationMap.filter(
      a => a.startChar >= chunkStart && a.startChar < chunkEnd
    );
    const primaryPage = pageAnnotations.length > 0 ? pageAnnotations[0].pageNumber : undefined;

    return {
      ...chunk,
      metadata: {
        ...chunk.metadata,
        annotations: relevantAnnotations.length > 0 ? JSON.stringify(relevantAnnotations) : undefined,
        pageNumber: primaryPage,
      },
    };
  });
}
