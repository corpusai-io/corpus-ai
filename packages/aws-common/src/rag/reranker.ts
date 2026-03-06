/**
 * Cohere Reranking Service
 * Uses Cohere's rerank-v3.5 API for ML-based cross-encoder reranking.
 * Replaces the naive keyword-overlap heuristic in retrieval.ts.
 *
 * Cost: ~$2 per 1,000 searches
 * Latency: ~600ms average
 */

export interface RerankablePassage {
  id: string;
  text: string;
  score: number;
  metadata: Record<string, any>;
}

export interface RerankResult {
  passages: RerankablePassage[];
  reranked: boolean; // false if fallback was used
}

/**
 * Rerank passages using Cohere's rerank-v3.5 API.
 * Falls back to original order if API key is not set or API call fails.
 *
 * @param query - The search query
 * @param passages - Passages to rerank
 * @param topN - Number of top results to return (default: 5)
 * @returns Reranked passages with updated scores
 */
export async function cohereRerank(
  query: string,
  passages: RerankablePassage[],
  topN: number = 5
): Promise<RerankResult> {
  const apiKey = process.env.COHERE_API_KEY;

  // Graceful fallback if API key not configured
  if (!apiKey) {
    console.warn('COHERE_API_KEY not set, skipping reranking');
    return {
      passages: passages.slice(0, topN),
      reranked: false,
    };
  }

  // Don't bother reranking if we have fewer passages than requested
  if (passages.length <= 1) {
    return {
      passages: passages.slice(0, topN),
      reranked: false,
    };
  }

  try {
    const response = await fetch('https://api.cohere.com/v2/rerank', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'rerank-v3.5',
        query,
        documents: passages.map(p => p.text),
        top_n: Math.min(topN, passages.length),
        return_documents: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Cohere rerank API error (${response.status}):`, errorText);
      return {
        passages: passages.slice(0, topN),
        reranked: false,
      };
    }

    const data: any = await response.json();

    if (!data.results || !Array.isArray(data.results)) {
      console.error('Unexpected Cohere response format:', data);
      return {
        passages: passages.slice(0, topN),
        reranked: false,
      };
    }

    // Map Cohere results back to passages with updated scores
    const rerankedPassages: RerankablePassage[] = data.results.map((result: any) => ({
      ...passages[result.index],
      score: result.relevance_score,
    }));

    console.log(`Cohere reranked ${passages.length} passages → top ${rerankedPassages.length}`);

    return {
      passages: rerankedPassages,
      reranked: true,
    };
  } catch (error: any) {
    console.error('Cohere rerank failed:', error.message);
    return {
      passages: passages.slice(0, topN),
      reranked: false,
    };
  }
}

/**
 * Simple keyword-based reranking fallback.
 * Used when Cohere API is unavailable.
 */
export function keywordRerank(
  query: string,
  passages: RerankablePassage[],
  topN: number = 5
): RerankablePassage[] {
  const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);

  const scored = passages.map(passage => {
    const passageText = passage.text.toLowerCase();
    const keywordMatches = queryWords.filter(word => passageText.includes(word)).length;
    const keywordScore = queryWords.length > 0 ? keywordMatches / queryWords.length : 0;

    // Combine original score (70%) with keyword match (30%)
    const combinedScore = passage.score * 0.7 + keywordScore * 0.3;

    return { ...passage, score: combinedScore };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);
}
