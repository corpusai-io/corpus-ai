import OpenAI from 'openai';
import { generateEmbedding } from './embeddings';
import { cohereRerank } from './reranker';
import { queryVectors, hybridQuery, reciprocalRankFusion, ScoredMatch } from '../pinecone';

/**
 * RAG Retrieval System
 * Retrieves relevant context passages for query augmentation.
 * Supports hybrid dense+sparse search, Cohere reranking, multi-query, and HyDE.
 */

export interface RetrievalOptions {
  topK?: number;                // Number of results to return
  minScore?: number;            // Minimum similarity score (0-1)
  filter?: Record<string, any>; // Metadata filters
  namespace?: string;           // Pinecone namespace (chatbotId)
  useHybridSearch?: boolean;    // Enable dense+sparse search
  sparseIndexName?: string;     // Sparse index name for hybrid search
  useReranking?: boolean;       // Enable Cohere reranking
  rerankTopN?: number;          // How many to keep after reranking
}

export interface RetrievedPassage {
  id: string;
  text: string;
  score: number; // Similarity score (0-1)
  metadata: Record<string, any>;
}

/**
 * Retrieve relevant passages for a query (basic dense search with namespace support)
 */
export async function retrievePassages(
  indexName: string,
  query: string,
  options: RetrievalOptions = {}
): Promise<RetrievedPassage[]> {
  const { topK = 5, minScore = 0.3, filter, namespace } = options;

  try {
    console.log('Generating query embedding...');
    const queryEmbedding = await generateEmbedding(query);

    console.log(`Querying Pinecone for top ${topK} results...`);
    const results = await queryVectors(indexName, queryEmbedding, topK, filter, namespace);

    if (results.length > 0) {
      console.log(`Raw Pinecone results: ${results.length}, scores: ${results.map((m: any) => m.score?.toFixed(4)).join(', ')}, minScore threshold: ${minScore}`);
    }

    const passages: RetrievedPassage[] = results
      .filter((match: any) => (match.score || 0) >= minScore)
      .map((match: any) => ({
        id: match.id || '',
        text: String(match.metadata?.text || ''),
        score: match.score || 0,
        metadata: match.metadata || {},
      }));

    console.log(`Retrieved ${passages.length} relevant passages (after minScore=${minScore} filter)`);
    return passages;
  } catch (error: any) {
    console.error('Error retrieving passages:', error.message);
    throw new Error(`Failed to retrieve passages: ${error.message}`);
  }
}

/**
 * Advanced retrieval: hybrid dense+sparse search with Cohere reranking.
 * This is the main retrieval function for the enhanced RAG pipeline.
 */
export async function hybridRetrievePassages(
  indexName: string,
  query: string,
  options: RetrievalOptions = {}
): Promise<RetrievedPassage[]> {
  const {
    topK = 5,
    minScore = 0.3,
    namespace,
    useHybridSearch = false,
    sparseIndexName,
    useReranking = true,
    rerankTopN = 5,
    filter,
  } = options;

  // Step 1: Generate query embedding
  const queryEmbedding = await generateEmbedding(query);

  // Step 2: Retrieve candidates (hybrid or dense-only)
  let candidates: RetrievedPassage[];
  const retrievalTopK = useReranking ? topK * 4 : topK * 2;

  if (useHybridSearch && sparseIndexName) {
    // Hybrid: dense + sparse with RRF
    const results = await hybridQuery(
      indexName,
      queryEmbedding,
      retrievalTopK,
      namespace,
      { sparseIndexName, filter }
    );
    candidates = results
      .filter(m => (m.score || 0) >= minScore * 0.5)
      .map(m => ({
        id: m.id,
        text: String(m.metadata?.text || ''),
        score: m.score,
        metadata: m.metadata || {},
      }));
  } else {
    // Dense-only with namespace
    const results = await queryVectors(indexName, queryEmbedding, retrievalTopK, filter, namespace);
    candidates = results
      .filter((m: any) => (m.score || 0) >= minScore * 0.5)
      .map((m: any) => ({
        id: m.id || '',
        text: String(m.metadata?.text || ''),
        score: m.score || 0,
        metadata: m.metadata || {},
      }));
  }

  if (candidates.length === 0) return [];

  // Step 3: Rerank with Cohere (or fallback)
  if (useReranking && candidates.length > 1) {
    const { passages: reranked } = await cohereRerank(query, candidates, rerankTopN);
    return reranked.filter(p => p.score >= minScore);
  }

  // No reranking - apply minScore filter and return
  return candidates
    .filter(p => p.score >= minScore)
    .slice(0, topK);
}

/**
 * Multi-query retrieval: generates 3 query variations, retrieves for each, merges with RRF.
 * Reduces retrieval-related hallucinations by covering different phrasings of the same question.
 */
export async function multiQueryRetrieve(
  indexName: string,
  query: string,
  options: RetrievalOptions = {}
): Promise<RetrievedPassage[]> {
  const { topK = 5, namespace, filter } = options;

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  // Generate query variations using GPT-4o-mini
  let variations: string[];
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{
        role: 'system',
        content: 'Generate 3 alternative phrasings of this search query. Return ONLY a JSON array of strings, no other text.'
      }, {
        role: 'user',
        content: query
      }],
      max_tokens: 200,
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content || '[]';
    variations = JSON.parse(content);
    if (!Array.isArray(variations)) variations = [];
  } catch (error: any) {
    console.warn('Multi-query generation failed:', error.message);
    variations = [];
  }

  // Retrieve for original + variations in parallel
  const allQueries = [query, ...variations.slice(0, 3)];
  const queryEmbeddings = await Promise.all(
    allQueries.map(q => generateEmbedding(q))
  );

  const results = await Promise.all(
    queryEmbeddings.map(emb => queryVectors(indexName, emb, topK * 2, filter, namespace))
  );

  // Convert to ScoredMatch format for RRF
  const rankedLists: ScoredMatch[][] = results.map(matches =>
    matches.map((m: any) => ({
      id: m.id || '',
      score: m.score || 0,
      metadata: m.metadata,
    }))
  );

  // Fuse with RRF
  const fused = reciprocalRankFusion(...rankedLists);

  return fused.slice(0, topK).map(m => ({
    id: m.id,
    text: String(m.metadata?.text || ''),
    score: m.score,
    metadata: m.metadata || {},
  }));
}

/**
 * HyDE (Hypothetical Document Embeddings) retrieval.
 * Generates a hypothetical answer, embeds that instead of the raw query.
 * Best for vague or short queries. Use as fallback when normal retrieval is low-confidence.
 */
export async function hydeRetrieve(
  indexName: string,
  query: string,
  options: RetrievalOptions = {}
): Promise<RetrievedPassage[]> {
  const { topK = 5, namespace, filter, minScore = 0.3 } = options;

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  // Generate hypothetical document
  let hypotheticalDoc: string;
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{
        role: 'system',
        content: 'Write a short passage (2-3 sentences) that would directly answer this question. Write as if you are the source document.'
      }, {
        role: 'user',
        content: query
      }],
      max_tokens: 200,
      temperature: 0.7,
    });
    hypotheticalDoc = response.choices[0]?.message?.content || query;
  } catch {
    hypotheticalDoc = query; // Fallback to original query
  }

  // Embed the hypothetical document
  const embedding = await generateEmbedding(hypotheticalDoc);

  // Search with hypothetical embedding
  const results = await queryVectors(indexName, embedding, topK, filter, namespace);

  if (results.length > 0) {
    console.log(`[HyDE] Raw results: ${results.length}, scores: ${results.map((m: any) => m.score?.toFixed(4)).join(', ')}, minScore: ${minScore}`);
  } else {
    console.log(`[HyDE] 0 raw results from Pinecone`);
  }

  return results
    .filter((m: any) => (m.score || 0) >= minScore)
    .map((m: any) => ({
      id: m.id || '',
      text: String(m.metadata?.text || ''),
      score: m.score || 0,
      metadata: m.metadata || {},
    }));
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

  return passages.map((passage, index) => {
    const source = passage.metadata.source || 'Unknown';
    const page = passage.metadata.pageNumber !== undefined ? `, Page ${passage.metadata.pageNumber + 1}` : '';
    const section = passage.metadata.sectionTitle ? `, Section: ${passage.metadata.sectionTitle}` : '';
    const scoreInfo = includeScores ? ` (Relevance: ${(passage.score * 100).toFixed(1)}%)` : '';

    return `[${index + 1}] Source: ${source}${page}${section}${scoreInfo}\n${passage.text}`;
  }).join('\n\n---\n\n');
}

/**
 * Build RAG-augmented user message with context and citation instructions.
 * NOTE: Do NOT pass systemPrompt here — it belongs in the system message,
 * not duplicated inside the user message.
 */
export function buildRAGPrompt(
  query: string,
  passages: RetrievedPassage[],
): string {
  const context = formatPassagesForContext(passages, false);

  return `Use the following context to answer the question.
When answering:
- Cite sources using [1], [2], etc. corresponding to the context numbers below.
- If the context doesn't contain relevant information, say so clearly.
- Be specific and accurate.

Context:
${context}

---

Question: ${query}`;
}

/**
 * Extract citations from passages with annotation and page support
 */
export function extractCitations(passages: RetrievedPassage[]): Array<{
  source: string;
  text: string;
  score: number;
  url?: string;
  pageNumber?: number;
}> {
  return passages.map(passage => {
    // Use childText (short) for citation display, fall back to full text
    const displayText = passage.metadata.childText || passage.text;
    return {
      source: passage.metadata.source || 'Unknown',
      text: displayText.substring(0, 200) + (displayText.length > 200 ? '...' : ''),
      score: passage.score,
      url: passage.metadata.url,
      pageNumber: passage.metadata.pageNumber,
    };
  });
}

/**
 * Rerank passages using a simple heuristic (kept for backward compatibility)
 */
export function rerankPassages(
  query: string,
  passages: RetrievedPassage[]
): RetrievedPassage[] {
  const queryWords = query.toLowerCase().split(/\s+/);

  const scored = passages.map(passage => {
    const passageText = passage.text.toLowerCase();
    const keywordMatches = queryWords.filter(word =>
      passageText.includes(word)
    ).length;

    const rerankScore = passage.score * 0.7 + (keywordMatches / queryWords.length) * 0.3;

    return {
      ...passage,
      score: rerankScore,
    };
  });

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
