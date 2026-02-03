import { generateEmbedding } from './embeddings';
import { queryVectors } from '../pinecone';

/**
 * RAG Retrieval System
 * Retrieves relevant context passages for query augmentation
 */

export interface RetrievalOptions {
  topK?: number; // Number of results to return
  minScore?: number; // Minimum similarity score (0-1)
  filter?: Record<string, any>; // Metadata filters
}

export interface RetrievedPassage {
  id: string;
  text: string;
  score: number; // Similarity score (0-1)
  metadata: Record<string, any>;
}

/**
 * Retrieve relevant passages for a query
 */
export async function retrievePassages(
  indexName: string,
  query: string,
  options: RetrievalOptions = {}
): Promise<RetrievedPassage[]> {
  const { topK = 5, minScore = 0.7, filter } = options;

  try {
    // Generate embedding for query
    console.log('Generating query embedding...');
    const queryEmbedding = await generateEmbedding(query);

    // Query Pinecone for similar vectors
    console.log(`Querying Pinecone for top ${topK} results...`);
    const results = await queryVectors(indexName, queryEmbedding, topK, filter);

    // Filter by minimum score and format results
    const passages: RetrievedPassage[] = results
      .filter(match => (match.score || 0) >= minScore)
      .map(match => ({
        id: match.id || '',
        text: match.metadata?.text || '',
        score: match.score || 0,
        metadata: match.metadata || {},
      }));

    console.log(`Retrieved ${passages.length} relevant passages`);
    return passages;
  } catch (error: any) {
    console.error('Error retrieving passages:', error.message);
    throw new Error(`Failed to retrieve passages: ${error.message}`);
  }
}

/**
 * Format passages for context injection into LLM prompt
 */
export function formatPassagesForContext(
  passages: RetrievedPassage[],
  includeScores: boolean = false
): string {
  if (passages.length === 0) {
    return 'No relevant context found.';
  }

  const formattedPassages = passages.map((passage, index) => {
    const scoreInfo = includeScores ? ` (Relevance: ${(passage.score * 100).toFixed(1)}%)` : '';
    const source = passage.metadata.source || 'Unknown';

    return `[${index + 1}] Source: ${source}${scoreInfo}\n${passage.text}`;
  });

  return formattedPassages.join('\n\n---\n\n');
}

/**
 * Build RAG-augmented prompt
 */
export function buildRAGPrompt(
  query: string,
  passages: RetrievedPassage[],
  systemPrompt?: string
): string {
  const context = formatPassagesForContext(passages);

  const defaultSystemPrompt = `You are a helpful AI assistant. Use the following context to answer the user's question. If the context doesn't contain relevant information, say so clearly.

Context:
${context}

---

Answer the user's question based on the context above. Include relevant quotes and cite sources when possible.`;

  return systemPrompt
    ? `${systemPrompt}\n\nContext:\n${context}\n\n---\n\nQuestion: ${query}`
    : defaultSystemPrompt;
}

/**
 * Extract citations from passages
 */
export function extractCitations(passages: RetrievedPassage[]): Array<{
  source: string;
  text: string;
  score: number;
  url?: string;
}> {
  return passages.map(passage => ({
    source: passage.metadata.source || 'Unknown',
    text: passage.text.substring(0, 200) + (passage.text.length > 200 ? '...' : ''),
    score: passage.score,
    url: passage.metadata.url,
  }));
}

/**
 * Rerank passages using a simple heuristic (can be replaced with ML model)
 */
export function rerankPassages(
  query: string,
  passages: RetrievedPassage[]
): RetrievedPassage[] {
  // Simple keyword-based reranking
  const queryWords = query.toLowerCase().split(/\s+/);

  const scored = passages.map(passage => {
    const passageText = passage.text.toLowerCase();

    // Count keyword matches
    const keywordMatches = queryWords.filter(word =>
      passageText.includes(word)
    ).length;

    // Combine similarity score with keyword matches
    const rerankScore = passage.score * 0.7 + (keywordMatches / queryWords.length) * 0.3;

    return {
      ...passage,
      score: rerankScore,
    };
  });

  // Sort by new score
  return scored.sort((a, b) => b.score - a.score);
}

/**
 * Get diverse passages (avoid too similar results)
 */
export function getDiversePassages(
  passages: RetrievedPassage[],
  maxSimilarity: number = 0.8
): RetrievedPassage[] {
  if (passages.length === 0) return [];

  const diverse: RetrievedPassage[] = [passages[0]];

  for (let i = 1; i < passages.length; i++) {
    const candidate = passages[i];
    let isDiverse = true;

    // Check similarity with already selected passages
    for (const selected of diverse) {
      const similarity = calculateTextSimilarity(candidate.text, selected.text);
      if (similarity > maxSimilarity) {
        isDiverse = false;
        break;
      }
    }

    if (isDiverse) {
      diverse.push(candidate);
    }
  }

  return diverse;
}

/**
 * Simple text similarity (Jaccard similarity)
 */
function calculateTextSimilarity(text1: string, text2: string): number {
  const words1 = new Set(text1.toLowerCase().split(/\s+/));
  const words2 = new Set(text2.toLowerCase().split(/\s+/));

  const intersection = new Set([...words1].filter(w => words2.has(w)));
  const union = new Set([...words1, ...words2]);

  return intersection.size / union.size;
}
