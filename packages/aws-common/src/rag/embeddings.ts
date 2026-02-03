import OpenAI from 'openai';
import { env } from '../utils/env';

/**
 * OpenAI Embeddings Generation
 * Generates vector embeddings for text using OpenAI's embedding models
 */

let openaiClient: OpenAI | null = null;

/**
 * Get OpenAI client
 */
function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = env('OPENAI_API_KEY');
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}

/**
 * Generate embedding for a single text
 */
export async function generateEmbedding(
  text: string,
  model: string = 'text-embedding-3-small'
): Promise<number[]> {
  const client = getOpenAIClient();

  // Clean and truncate text if needed (max tokens for embedding model)
  const cleanedText = text.replace(/\n/g, ' ').trim();

  try {
    const response = await client.embeddings.create({
      model,
      input: cleanedText,
    });

    return response.data[0].embedding;
  } catch (error: any) {
    console.error('Error generating embedding:', error.message);
    throw new Error(`Failed to generate embedding: ${error.message}`);
  }
}

/**
 * Generate embeddings for multiple texts (batch)
 */
export async function generateEmbeddings(
  texts: string[],
  model: string = 'text-embedding-3-small'
): Promise<number[][]> {
  const client = getOpenAIClient();

  // Clean texts
  const cleanedTexts = texts.map(text => text.replace(/\n/g, ' ').trim());

  // Process in batches of 100 (OpenAI limit)
  const batchSize = 100;
  const embeddings: number[][] = [];

  for (let i = 0; i < cleanedTexts.length; i += batchSize) {
    const batch = cleanedTexts.slice(i, i + batchSize);

    try {
      const response = await client.embeddings.create({
        model,
        input: batch,
      });

      const batchEmbeddings = response.data.map(item => item.embedding);
      embeddings.push(...batchEmbeddings);

      console.log(`Generated embeddings for batch ${Math.floor(i / batchSize) + 1}`);
    } catch (error: any) {
      console.error(`Error generating embeddings for batch ${i}:`, error.message);
      throw new Error(`Failed to generate embeddings: ${error.message}`);
    }
  }

  return embeddings;
}

/**
 * Calculate embedding dimensions for a model
 */
export function getEmbeddingDimension(model: string = 'text-embedding-3-small'): number {
  const dimensions: Record<string, number> = {
    'text-embedding-3-small': 1536,
    'text-embedding-3-large': 3072,
    'text-embedding-ada-002': 1536,
  };

  return dimensions[model] || 1536;
}

/**
 * Validate embedding model
 */
export function isValidEmbeddingModel(model: string): boolean {
  const validModels = [
    'text-embedding-3-small',
    'text-embedding-3-large',
    'text-embedding-ada-002',
  ];
  return validModels.includes(model);
}
