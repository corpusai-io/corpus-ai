import FirecrawlApp from '@mendable/firecrawl-js';

let _firecrawlClient: FirecrawlApp | null = null;

function getFirecrawlClient(): FirecrawlApp | null {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) return null;

  if (!_firecrawlClient) {
    _firecrawlClient = new FirecrawlApp({ apiKey });
  }
  return _firecrawlClient;
}

export interface FirecrawlScrapeResult {
  markdown: string;
  metadata: {
    title?: string;
    description?: string;
    language?: string;
    sourceURL?: string;
    [key: string]: any;
  };
  success: boolean;
}

/**
 * Scrape a single URL using Firecrawl API.
 * Returns LLM-ready markdown content with clean formatting.
 *
 * Uses 60s timeout. On timeout, retries once with 120s before giving up.
 * Max 2 Firecrawl attempts to conserve API credits.
 */
export async function scrapeWithFirecrawl(url: string): Promise<FirecrawlScrapeResult | null> {
  const client = getFirecrawlClient();
  if (!client) return null;

  const attempt = async (timeout: number, waitFor: number): Promise<FirecrawlScrapeResult | null> => {
    const result = await client.scrapeUrl(url, {
      formats: ['markdown'],
      onlyMainContent: true,
      waitFor,
      timeout,
    } as any);

    if (!result.success) {
      return null;
    }

    return {
      markdown: result.markdown || '',
      metadata: result.metadata || {},
      success: true,
    };
  };

  // Attempt 1: 60s timeout
  try {
    const result = await attempt(60000, 2000);
    if (result) return result;
  } catch (error: any) {
    const isTimeout = error.message?.includes('408') || error.message?.includes('timed out');

    if (isTimeout) {
      // Attempt 2 (final): 120s timeout
      console.warn(`[Firecrawl] Timeout on first attempt for ${url}, retrying once with 120s...`);
      try {
        const result = await attempt(120000, 3000);
        if (result) return result;
      } catch (retryError: any) {
        console.warn(`[Firecrawl] Retry also failed for ${url}:`, retryError.message);
        return null;
      }
    }

    console.warn(`[Firecrawl] Error scraping ${url}:`, error.message);
    return null;
  }

  return null;
}

/**
 * Crawl multiple pages starting from a URL.
 * Discovers and scrapes linked pages up to the specified limit.
 * Each page is returned as LLM-ready markdown.
 */
export async function crawlWithFirecrawl(
  url: string,
  options?: { maxPages?: number; limit?: number }
): Promise<FirecrawlScrapeResult[]> {
  const client = getFirecrawlClient();
  if (!client) return [];

  const pageLimit = options?.maxPages || options?.limit || 10;

  try {
    const result = await client.crawlUrl(url, {
      limit: pageLimit,
      scrapeOptions: {
        formats: ['markdown'],
        onlyMainContent: true,
        timeout: 60000,
      },
    } as any);

    if (!result.success) {
      console.warn(`[Firecrawl] Crawl failed for ${url}`);
      return [];
    }

    const pages = (result.data || [])
      .map((page: any) => ({
        markdown: page.markdown || '',
        metadata: page.metadata || {},
        success: true,
      }))
      .filter((page: FirecrawlScrapeResult) => page.markdown.trim().length > 30);

    console.log(`[Firecrawl] Crawled ${pages.length} pages from ${url} (limit: ${pageLimit})`);
    return pages;
  } catch (error: any) {
    console.warn(`[Firecrawl] Error crawling ${url}:`, error.message);
    return [];
  }
}
