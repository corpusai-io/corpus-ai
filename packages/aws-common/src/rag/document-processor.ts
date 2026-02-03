import axios from 'axios';
import * as cheerio from 'cheerio';
import pdf from 'pdf-parse';
import { TextChunk, chunkText } from './chunking';

/**
 * Document Processing Utilities
 * Extracts text from various sources (PDFs, URLs, files)
 */

export interface ProcessedDocument {
  text: string;
  source: string;
  metadata: {
    type: 'pdf' | 'url' | 'text' | 'file';
    title?: string;
    author?: string;
    pages?: number;
    wordCount: number;
    characterCount: number;
    [key: string]: any;
  };
}

/**
 * Process PDF buffer and extract text
 */
export async function processPDF(
  buffer: Buffer,
  source: string
): Promise<ProcessedDocument> {
  try {
    const data = await pdf(buffer);

    return {
      text: data.text,
      source,
      metadata: {
        type: 'pdf',
        title: data.info?.Title || source,
        author: data.info?.Author,
        pages: data.numpages,
        wordCount: data.text.split(/\s+/).length,
        characterCount: data.text.length,
      },
    };
  } catch (error: any) {
    console.error('Error processing PDF:', error.message);
    throw new Error(`Failed to process PDF: ${error.message}`);
  }
}

/**
 * Fetch and process URL content
 */
export async function processURL(url: string): Promise<ProcessedDocument> {
  try {
    console.log(`Fetching URL: ${url}`);
    const response = await axios.get(url, {
      timeout: 30000,
      headers: {
        'User-Agent': 'CorpusAI-Bot/1.0',
      },
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // Remove script and style tags
    $('script').remove();
    $('style').remove();
    $('nav').remove();
    $('footer').remove();

    // Extract title
    const title = $('title').text() || $('h1').first().text() || url;

    // Extract main content (prioritize article/main tags)
    let text = '';
    const mainContent = $('article, main, .content, #content').first();

    if (mainContent.length > 0) {
      text = mainContent.text();
    } else {
      text = $('body').text();
    }

    // Clean up whitespace
    text = text
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n\n')
      .trim();

    return {
      text,
      source: url,
      metadata: {
        type: 'url',
        title,
        url,
        wordCount: text.split(/\s+/).length,
        characterCount: text.length,
        fetchedAt: new Date().toISOString(),
      },
    };
  } catch (error: any) {
    console.error('Error processing URL:', error.message);
    throw new Error(`Failed to process URL ${url}: ${error.message}`);
  }
}

/**
 * Process text file content
 */
export async function processTextFile(
  content: string,
  source: string
): Promise<ProcessedDocument> {
  const cleanedText = content.trim();

  return {
    text: cleanedText,
    source,
    metadata: {
      type: 'text',
      wordCount: cleanedText.split(/\s+/).length,
      characterCount: cleanedText.length,
    },
  };
}

/**
 * Process plain text
 */
export function processPlainText(
  text: string,
  source: string
): ProcessedDocument {
  const cleanedText = text.trim();

  return {
    text: cleanedText,
    source,
    metadata: {
      type: 'text',
      wordCount: cleanedText.split(/\s+/).length,
      characterCount: cleanedText.length,
    },
  };
}

/**
 * Detect file type from filename or buffer
 */
export function detectFileType(filename: string): 'pdf' | 'text' | 'unknown' {
  const ext = filename.toLowerCase().split('.').pop();

  switch (ext) {
    case 'pdf':
      return 'pdf';
    case 'txt':
    case 'md':
    case 'markdown':
      return 'text';
    default:
      return 'unknown';
  }
}

/**
 * Process any document type and return chunks
 */
export async function processAndChunkDocument(
  input: string | Buffer,
  source: string,
  type: 'pdf' | 'url' | 'text' | 'auto' = 'auto'
): Promise<{ document: ProcessedDocument; chunks: TextChunk[] }> {
  let document: ProcessedDocument;

  // Auto-detect type
  if (type === 'auto') {
    if (Buffer.isBuffer(input)) {
      type = 'pdf';
    } else if (input.startsWith('http://') || input.startsWith('https://')) {
      type = 'url';
    } else {
      type = 'text';
    }
  }

  // Process based on type
  switch (type) {
    case 'pdf':
      if (!Buffer.isBuffer(input)) {
        throw new Error('PDF processing requires a Buffer');
      }
      document = await processPDF(input, source);
      break;

    case 'url':
      if (Buffer.isBuffer(input)) {
        throw new Error('URL processing requires a string URL');
      }
      document = await processURL(input);
      break;

    case 'text':
      if (Buffer.isBuffer(input)) {
        document = await processTextFile(input.toString('utf-8'), source);
      } else {
        document = processPlainText(input, source);
      }
      break;

    default:
      throw new Error(`Unsupported document type: ${type}`);
  }

  // Chunk the document
  const chunks = chunkText(document.text, source, {
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  console.log(`Processed ${source}: ${chunks.length} chunks created`);

  return { document, chunks };
}

/**
 * Validate URL
 */
export function isValidURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Extract metadata from HTML
 */
export function extractHTMLMetadata(html: string): Record<string, string> {
  const $ = cheerio.load(html);

  return {
    title: $('title').text() || '',
    description: $('meta[name="description"]').attr('content') || '',
    author: $('meta[name="author"]').attr('content') || '',
    keywords: $('meta[name="keywords"]').attr('content') || '',
    ogTitle: $('meta[property="og:title"]').attr('content') || '',
    ogDescription: $('meta[property="og:description"]').attr('content') || '',
  };
}
