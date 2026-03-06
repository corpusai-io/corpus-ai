import axios from 'axios';
import * as cheerio from 'cheerio';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import mammoth from 'mammoth';
import OpenAI from 'openai';
import { parse as csvParse } from 'csv-parse/sync';
import * as XLSX from 'xlsx';
import { TextChunk, chunkText } from './chunking';
import { pathToFileURL } from 'url';
import path from 'path';

// Resolve the standard fonts directory shipped with pdfjs-dist.
// getDocument() needs this to render PDFs that use standard 14 fonts (Times, Helvetica, etc.)
const pdfDistPath = path.dirname(require.resolve('pdfjs-dist/package.json'));
const standardFontDataUrl = pathToFileURL(path.join(pdfDistPath, 'standard_fonts')) + '/';

// Only show errors from pdfjs-dist, suppress warnings about malformed fonts/glyphs in PDFs.
// These are PDF-file-level issues, not code bugs — text extraction still succeeds via fallbacks.
const PDFJS_ERRORS_ONLY = (pdfjsLib as any).VerbosityLevel?.ERRORS ?? 0;

/**
 * Document Processing Utilities
 * Extracts text from various sources (PDFs, URLs, DOCX files)
 * Supports advanced PDF extraction with position data, GPT-4o Vision for images/charts
 */

export interface TextAnnotation {
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PageExtraction {
  pageNumber: number;
  text: string;
  annotations: TextAnnotation[];
  hasImages: boolean;
  imageDescription?: string;
  tables?: string[];
}

export interface ProcessedDocument {
  text: string;
  source: string;
  metadata: {
    type: 'pdf' | 'url' | 'text' | 'file' | 'docx' | 'csv' | 'xlsx';
    title?: string;
    author?: string;
    pages?: number;
    wordCount: number;
    characterCount: number;
    [key: string]: any;
  };
  pageExtractions?: PageExtraction[];
}

/**
 * Load @napi-rs/canvas for PDF page rendering.
 * pdfjs-dist v4 uses @napi-rs/canvas internally (for DOMMatrix, Path2D, ImageData polyfills
 * and its built-in NodeCanvasFactory). We must use the same package so canvas objects are
 * compatible with pdfjs-dist's internal operations.
 *
 * Resolved via pdfjs-dist's node_modules to ensure we get the exact version it expects.
 */
let canvasModule: any = null;
try {
  const Module = (process as any).getBuiltinModule('module');
  const pdfjsRequire = Module.createRequire(require.resolve('pdfjs-dist/legacy/build/pdf.mjs'));
  const mod = pdfjsRequire('@napi-rs/canvas');
  // Validate it actually works
  const testCanvas = mod.createCanvas(10, 10);
  const testCtx = testCanvas.getContext('2d');
  if (testCtx) {
    canvasModule = mod;
  }
} catch {
  // @napi-rs/canvas not available - Vision rendering will be skipped
}

/**
 * Describe a PDF page using GPT-4o Vision API.
 * Renders the page to PNG via canvas and sends to OpenAI.
 * Returns undefined if canvas is unavailable or API key is missing.
 */
async function describePageWithVision(
  pdfBuffer: Buffer,
  pageNumber: number,
  totalPages: number
): Promise<string | undefined> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return undefined;
  if (!canvasModule) return undefined;

  const openai = new OpenAI({ apiKey });

  let doc: any = null;
  try {
    const data = new Uint8Array(pdfBuffer);
    // Let pdfjs-dist use its built-in NodeCanvasFactory (which uses @napi-rs/canvas)
    doc = await pdfjsLib.getDocument({ data, standardFontDataUrl, verbosity: PDFJS_ERRORS_ONLY }).promise;
    const page = await doc.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 2.0 });

    // Create rendering canvas using the same @napi-rs/canvas package
    const canvas = canvasModule.createCanvas(viewport.width, viewport.height);
    const context = canvas.getContext('2d');

    const renderTask = page.render({ canvasContext: context, viewport });
    await renderTask.promise;

    const pngBuffer = canvas.toBuffer('image/png');
    const base64Image = pngBuffer.toString('base64');

    // Clean up page and document before the async API call
    page.cleanup();
    await doc.destroy();
    doc = null;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Analyze this PDF page (page ${pageNumber} of ${totalPages}). Describe ALL visual content including:\n1. Charts/graphs: data values, trends, axes, labels\n2. Tables: convert to markdown table format\n3. Diagrams: structure, relationships, labels\n4. Images/photos: detailed description of content\nBe thorough as this will be used for search indexing.`
          },
          {
            type: 'image_url',
            image_url: {
              url: `data:image/png;base64,${base64Image}`,
              detail: 'high'
            }
          }
        ]
      }],
      max_tokens: 1000,
      temperature: 0
    });

    return response.choices[0]?.message?.content || undefined;
  } catch (error: any) {
    console.warn(`Vision processing failed for page ${pageNumber}:`, error.message);
    return undefined;
  } finally {
    // Ensure document is always cleaned up to prevent deferred canvas errors
    if (doc) {
      try { await doc.destroy(); } catch { /* ignore cleanup errors */ }
    }
  }
}

/**
 * Detect tabular data in page text and format as markdown tables.
 */
function detectAndFormatTables(pageText: string): string[] {
  const tables: string[] = [];
  const lines = pageText.split('\n').filter(l => l.trim());

  let tableLines: string[] = [];

  for (const line of lines) {
    const columns = line.split(/\t|\s{2,}/).filter(c => c.trim());
    if (columns.length >= 2) {
      tableLines.push(line);
    } else if (tableLines.length >= 2) {
      tables.push(formatAsMarkdownTable(tableLines));
      tableLines = [];
    } else {
      tableLines = [];
    }
  }

  if (tableLines.length >= 2) {
    tables.push(formatAsMarkdownTable(tableLines));
  }

  return tables;
}

/**
 * Format an array of tab/space-separated lines as a markdown table.
 */
function formatAsMarkdownTable(lines: string[]): string {
  const rows = lines.map(line =>
    line.split(/\t|\s{2,}/).filter(c => c.trim())
  );

  if (rows.length === 0) return '';

  const maxCols = Math.max(...rows.map(r => r.length));
  const normalizedRows = rows.map(row => {
    while (row.length < maxCols) row.push('');
    return row;
  });

  let table = '| ' + normalizedRows[0].join(' | ') + ' |\n';
  table += '| ' + normalizedRows[0].map(() => '---').join(' | ') + ' |\n';

  for (let i = 1; i < normalizedRows.length; i++) {
    table += '| ' + normalizedRows[i].join(' | ') + ' |\n';
  }

  return table;
}

/**
 * Process PDF buffer using pdfjs-dist with per-page extraction,
 * position annotations, table detection, and GPT-4o Vision for visual content.
 */
export async function processPDF(
  buffer: Buffer,
  source: string
): Promise<ProcessedDocument> {
  const data = new Uint8Array(buffer);
  const doc = await pdfjsLib.getDocument({ data, useSystemFonts: true, standardFontDataUrl, verbosity: PDFJS_ERRORS_ONLY }).promise;

  const pageExtractions: PageExtraction[] = [];
  let fullText = '';
  let totalImageCount = 0;
  let hasImageAnalysis = false;

  for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
    const page = await doc.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.0 });
    const textContent = await page.getTextContent();

    let pageText = '';
    const annotations: TextAnnotation[] = [];

    for (const item of textContent.items) {
      if ('str' in item && item.str.trim()) {
        const tx = (item as any).transform;
        const x = tx[4];
        const y = viewport.height - tx[5];
        const width = (item as any).width || 0;
        const height = tx[3] || 12;

        pageText += item.str + ((item as any).hasEOL ? '\n' : ' ');
        annotations.push({
          page: pageNum - 1,
          x,
          y,
          width,
          height,
        });
      }
    }

    // Detect actual images via the operator list instead of text-length heuristic
    const ops = await page.getOperatorList();
    const imageOps = [
      pdfjsLib.OPS.paintImageXObject,
      pdfjsLib.OPS.paintXObject,
      pdfjsLib.OPS.paintImageMaskXObject,
    ];
    const imageCount = ops.fnArray.filter((fn: number) => imageOps.includes(fn)).length;
    const hasImages = imageCount > 0;

    // If page has actual images, use GPT-4o Vision to describe them
    let imageDescription: string | undefined;
    if (hasImages) {
      try {
        imageDescription = await describePageWithVision(buffer, pageNum, doc.numPages);
        if (imageDescription) {
          pageText += `\n\n[Image Analysis - Page ${pageNum}]: ${imageDescription}`;
        }
      } catch (err: any) {
        console.warn(`Vision analysis failed for page ${pageNum}:`, err.message);
      }
    }

    // Detect tables (aligned text patterns)
    const tables = detectAndFormatTables(pageText);

    fullText += pageText + '\n\n';
    pageExtractions.push({
      pageNumber: pageNum - 1,
      text: pageText.trim(),
      annotations,
      hasImages,
      imageDescription,
      tables: tables.length > 0 ? tables : undefined,
    });

    // Track image analysis metadata at document level
    if (hasImages) {
      totalImageCount += imageCount;
      if (imageDescription) hasImageAnalysis = true;
    }
  }

  return {
    text: fullText.trim(),
    source,
    metadata: {
      type: 'pdf',
      title: source,
      pages: doc.numPages,
      wordCount: fullText.split(/\s+/).length,
      characterCount: fullText.length,
      hasImageAnalysis,
      imageCount: totalImageCount,
    },
    pageExtractions,
  };
}

/**
 * Process DOCX buffer using mammoth with table extraction.
 */
export async function processDOCX(
  buffer: Buffer,
  source: string
): Promise<ProcessedDocument> {
  try {
    // Collect images from the DOCX via mammoth's image handler
    const images: { base64: string; contentType: string }[] = [];
    const htmlResult = await mammoth.convertToHtml({ buffer }, {
      convertImage: mammoth.images.imgElement(function(image: any) {
        return image.read("base64").then(function(imageBuffer: string) {
          const contentType = image.contentType;
          images.push({ base64: imageBuffer, contentType });
          return { src: `data:${contentType};base64,${imageBuffer}` };
        });
      })
    });
    const $ = cheerio.load(htmlResult.value);

    // Extract tables as markdown
    const tables: string[] = [];
    $('table').each((_, table) => {
      const rows: string[][] = [];
      $(table).find('tr').each((_, tr) => {
        const cells: string[] = [];
        $(tr).find('td, th').each((_, cell) => {
          cells.push($(cell).text().trim());
        });
        rows.push(cells);
      });

      if (rows.length > 0) {
        let mdTable = '| ' + rows[0].join(' | ') + ' |\n';
        mdTable += '| ' + rows[0].map(() => '---').join(' | ') + ' |\n';
        for (let i = 1; i < rows.length; i++) {
          mdTable += '| ' + rows[i].join(' | ') + ' |\n';
        }
        tables.push(mdTable);
      }
    });

    // Extract plain text
    const textResult = await mammoth.extractRawText({ buffer });
    let text = textResult.value;

    // Append markdown tables if found
    if (tables.length > 0) {
      text += '\n\n## Tables\n\n' + tables.join('\n\n');
    }

    // Describe extracted images using GPT-4o Vision
    let imageDescriptionCount = 0;
    if (images.length > 0) {
      const apiKey = process.env.OPENAI_API_KEY;
      if (apiKey) {
        const openai = new OpenAI({ apiKey });
        for (let i = 0; i < images.length; i++) {
          try {
            const img = images[i];
            const response = await openai.chat.completions.create({
              model: 'gpt-4o',
              messages: [{
                role: 'user',
                content: [
                  {
                    type: 'text',
                    text: `Analyze this image from a DOCX document (image ${i + 1} of ${images.length}). Describe ALL visual content including:\n1. Charts/graphs: data values, trends, axes, labels\n2. Tables: convert to markdown table format\n3. Diagrams: structure, relationships, labels\n4. Images/photos: detailed description of content\nBe thorough as this will be used for search indexing.`
                  },
                  {
                    type: 'image_url',
                    image_url: {
                      url: `data:${img.contentType};base64,${img.base64}`,
                      detail: 'high'
                    }
                  }
                ]
              }],
              max_tokens: 1000,
              temperature: 0,
            });

            const description = response.choices[0]?.message?.content;
            if (description) {
              text += `\n\n[Image Analysis - Image ${i + 1}]: ${description}`;
              imageDescriptionCount++;
            }
          } catch (err: any) {
            console.warn(`Vision analysis failed for DOCX image ${i + 1}:`, err.message);
          }
        }
      }
    }

    return {
      text: text.trim(),
      source,
      metadata: {
        type: 'docx',
        title: source,
        wordCount: text.split(/\s+/).length,
        characterCount: text.length,
        warnings: htmlResult.messages.map((m: any) => m.message),
        imageCount: images.length,
        hasImageAnalysis: imageDescriptionCount > 0,
      },
    };
  } catch (error: any) {
    console.error('Error processing DOCX:', error.message);
    throw new Error(`Failed to process DOCX: ${error.message}`);
  }
}

/**
 * Fetch and process URL content.
 * Uses Firecrawl API if FIRECRAWL_API_KEY is set, falls back to basic axios+cheerio scraping.
 */
export async function processURL(url: string): Promise<ProcessedDocument> {
  // Try Firecrawl first (if API key configured)
  try {
    const { scrapeWithFirecrawl } = await import('../firecrawl');
    const firecrawlResult = await scrapeWithFirecrawl(url);

    if (firecrawlResult && firecrawlResult.markdown && firecrawlResult.markdown.length > 50) {
      console.log(`[Firecrawl] Successfully scraped: ${url} (${firecrawlResult.markdown.length} chars)`);

      const text = firecrawlResult.markdown;
      return {
        text,
        source: url,
        metadata: {
          type: 'url',
          title: firecrawlResult.metadata.title || url,
          url,
          wordCount: text.split(/\s+/).length,
          characterCount: text.length,
          fetchedAt: new Date().toISOString(),
          scraper: 'firecrawl',
          ...firecrawlResult.metadata,
        },
      };
    }
  } catch (error: any) {
    console.warn(`[Firecrawl] Failed, falling back to basic scraping:`, error.message);
  }

  // Fallback: existing axios + cheerio logic
  console.log(`[Fallback] Using basic scraping for: ${url}`);
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
        scraper: 'basic',
      },
    };
  } catch (error: any) {
    console.error('Error processing URL:', error.message);
    throw new Error(`Failed to process URL ${url}: ${error.message}`);
  }
}

/**
 * Crawl a website and process multiple pages using Firecrawl.
 * Returns an array of ProcessedDocuments — one per crawled page.
 * Falls back to single-page processURL() if Firecrawl is unavailable.
 *
 * @param url - The root URL to start crawling from
 * @param maxPages - Maximum number of pages to crawl (respects tier quota)
 */
export async function crawlWebsite(
  url: string,
  maxPages: number = 10
): Promise<ProcessedDocument[]> {
  // Try Firecrawl multi-page crawl first
  try {
    const { crawlWithFirecrawl } = await import('../firecrawl');
    const pages = await crawlWithFirecrawl(url, { maxPages });

    if (pages.length > 0) {
      console.log(`[Firecrawl] Crawled ${pages.length} pages from ${url}`);

      const documents: ProcessedDocument[] = [];

      for (const page of pages) {
        if (!page.markdown || page.markdown.trim().length < 30) {
          console.log(`[Firecrawl] Skipping empty page: ${page.metadata.sourceURL || 'unknown'}`);
          continue;
        }

        const pageUrl = page.metadata.sourceURL || url;
        const text = page.markdown;

        documents.push({
          text,
          source: pageUrl,
          metadata: {
            type: 'url',
            title: page.metadata.title || pageUrl,
            url: pageUrl,
            wordCount: text.split(/\s+/).length,
            characterCount: text.length,
            fetchedAt: new Date().toISOString(),
            scraper: 'firecrawl',
            crawledFrom: url,
            ...page.metadata,
          },
        });
      }

      if (documents.length > 0) {
        console.log(`[Firecrawl] Produced ${documents.length} documents from crawl of ${url}`);
        return documents;
      }
    }
  } catch (error: any) {
    console.warn(`[Firecrawl] Crawl failed, falling back to single-page scrape:`, error.message);
  }

  // Fallback: process single URL
  console.log(`[Fallback] Crawl unavailable, processing single URL: ${url}`);
  const singleDoc = await processURL(url);
  return [singleDoc];
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
 * Convert a 2D array of rows into a markdown table string.
 */
function rowsToMarkdownTable(rows: string[][]): string {
  if (rows.length === 0) return '';
  const maxCols = Math.max(...rows.map(r => r.length));
  const normalized = rows.map(row => {
    const r = [...row];
    while (r.length < maxCols) r.push('');
    return r;
  });

  let table = '| ' + normalized[0].join(' | ') + ' |\n';
  table += '| ' + normalized[0].map(() => '---').join(' | ') + ' |\n';
  for (let i = 1; i < normalized.length; i++) {
    table += '| ' + normalized[i].join(' | ') + ' |\n';
  }
  return table;
}

/**
 * Process CSV buffer into a structured document with markdown tables.
 * Large CSVs are split into sections of 50 rows, each with headers repeated.
 */
export async function processCSV(
  buffer: Buffer,
  source: string
): Promise<ProcessedDocument> {
  const content = buffer.toString('utf-8');
  const records: string[][] = csvParse(content, {
    relax_column_count: true,
    skip_empty_lines: true,
  });

  if (records.length === 0) {
    return {
      text: '',
      source,
      metadata: {
        type: 'csv',
        title: source,
        wordCount: 0,
        characterCount: 0,
        rowCount: 0,
        columns: [],
      },
    };
  }

  const headers = records[0];
  const dataRows = records.slice(1);
  const rowsPerSection = 50;
  let text = `# ${source}\n\n`;
  text += `**Columns:** ${headers.join(', ')}\n`;
  text += `**Total rows:** ${dataRows.length}\n\n`;

  if (dataRows.length <= rowsPerSection) {
    text += rowsToMarkdownTable(records);
  } else {
    for (let i = 0; i < dataRows.length; i += rowsPerSection) {
      const section = dataRows.slice(i, i + rowsPerSection);
      const sectionNum = Math.floor(i / rowsPerSection) + 1;
      text += `### Section ${sectionNum} (rows ${i + 1}-${Math.min(i + rowsPerSection, dataRows.length)})\n\n`;
      text += rowsToMarkdownTable([headers, ...section]);
      text += '\n\n';
    }
  }

  return {
    text: text.trim(),
    source,
    metadata: {
      type: 'csv',
      title: source,
      wordCount: text.split(/\s+/).length,
      characterCount: text.length,
      rowCount: dataRows.length,
      columns: headers,
    },
  };
}

/**
 * Process XLSX/XLS buffer into a structured document with markdown tables.
 * Each sheet is processed separately.
 */
export async function processXLSX(
  buffer: Buffer,
  source: string
): Promise<ProcessedDocument> {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetNames = workbook.SheetNames;

  let text = `# ${source}\n\n`;
  text += `**Sheets:** ${sheetNames.join(', ')}\n\n`;

  const sheetRowCounts: Record<string, number> = {};

  for (const sheetName of sheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const rows: string[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

    if (rows.length === 0) continue;

    const dataRowCount = Math.max(0, rows.length - 1);
    sheetRowCounts[sheetName] = dataRowCount;

    text += `## Sheet: ${sheetName}\n\n`;
    text += `**Rows:** ${dataRowCount}\n\n`;

    // Convert all cell values to strings
    const stringRows = rows.map(row => row.map((cell: any) => String(cell ?? '')));

    const rowsPerSection = 50;
    if (stringRows.length <= rowsPerSection + 1) {
      text += rowsToMarkdownTable(stringRows);
    } else {
      const headers = stringRows[0];
      const dataRows = stringRows.slice(1);
      for (let i = 0; i < dataRows.length; i += rowsPerSection) {
        const section = dataRows.slice(i, i + rowsPerSection);
        const sectionNum = Math.floor(i / rowsPerSection) + 1;
        text += `### Section ${sectionNum} (rows ${i + 1}-${Math.min(i + rowsPerSection, dataRows.length)})\n\n`;
        text += rowsToMarkdownTable([headers, ...section]);
        text += '\n\n';
      }
    }

    text += '\n\n';
  }

  return {
    text: text.trim(),
    source,
    metadata: {
      type: 'xlsx',
      title: source,
      wordCount: text.split(/\s+/).length,
      characterCount: text.length,
      sheetNames,
      sheetRowCounts,
    },
  };
}

/**
 * Detect file type from filename
 */
export function detectFileType(filename: string): 'pdf' | 'docx' | 'csv' | 'xlsx' | 'text' | 'unknown' {
  const ext = filename.toLowerCase().split('.').pop();

  switch (ext) {
    case 'pdf':
      return 'pdf';
    case 'docx':
    case 'doc':
      return 'docx';
    case 'csv':
      return 'csv';
    case 'xlsx':
    case 'xls':
      return 'xlsx';
    case 'txt':
    case 'md':
    case 'markdown':
    case 'json':
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
  type: 'pdf' | 'url' | 'text' | 'docx' | 'csv' | 'xlsx' | 'auto' = 'auto'
): Promise<{ document: ProcessedDocument; chunks: TextChunk[] }> {
  let document: ProcessedDocument;

  // Auto-detect type
  if (type === 'auto') {
    if (Buffer.isBuffer(input)) {
      const detectedType = detectFileType(source);
      if (detectedType === 'docx') {
        type = 'docx';
      } else if (detectedType === 'csv') {
        type = 'csv';
      } else if (detectedType === 'xlsx') {
        type = 'xlsx';
      } else if (detectedType === 'pdf') {
        type = 'pdf';
      } else {
        type = 'text';
      }
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

    case 'docx':
      if (!Buffer.isBuffer(input)) {
        throw new Error('DOCX processing requires a Buffer');
      }
      document = await processDOCX(input, source);
      break;

    case 'csv':
      if (!Buffer.isBuffer(input)) {
        throw new Error('CSV processing requires a Buffer');
      }
      document = await processCSV(input, source);
      break;

    case 'xlsx':
      if (!Buffer.isBuffer(input)) {
        throw new Error('XLSX processing requires a Buffer');
      }
      document = await processXLSX(input, source);
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
