/**
 * Firecrawl Test Script
 * Tests scraping and crawling with different configurations.
 *
 * Usage: node test-firecrawl.js [url]
 * Example: node test-firecrawl.js https://ezadtv.com
 */

require('dotenv').config({ path: '.env.development' });
const FirecrawlApp = require('@mendable/firecrawl-js').default;

const API_KEY = process.env.FIRECRAWL_API_KEY;
if (!API_KEY) {
  console.error('ERROR: FIRECRAWL_API_KEY not set in .env.development');
  process.exit(1);
}

const url = process.argv[2] || 'https://ezadtv.com';
const firecrawl = new FirecrawlApp({ apiKey: API_KEY });
const fs = require('fs');

async function testScrape() {
  console.log('='.repeat(60));
  console.log(`Testing Firecrawl on: ${url}`);
  console.log('='.repeat(60));

  // Test 1: Basic scrape with default settings
  console.log('\n--- Test 1: Basic scrape (timeout: 30s) ---');
  try {
    const start = Date.now();
    const result = await firecrawl.scrapeUrl(url, {
      formats: ['markdown'],
      timeout: 30000,
    });
    const elapsed = Date.now() - start;
    console.log(`Status: ${result.success ? 'SUCCESS' : 'FAILED'} (${elapsed}ms)`);
    if (result.success) {
      console.log(`Title: ${result.metadata?.title}`);
      console.log(`Content length: ${result.markdown?.length} chars`);
      fs.writeFileSync('firecrawl-test1-basic.txt', result.markdown || 'empty');
      console.log('Saved to: firecrawl-test1-basic.txt');
    } else {
      console.log('Error:', JSON.stringify(result, null, 2));
    }
  } catch (err) {
    console.log(`FAILED: ${err.message}`);
  }

  // Test 2: Extended timeout
  console.log('\n--- Test 2: Extended timeout (timeout: 120s, waitFor: 5s) ---');
  try {
    const start = Date.now();
    const result = await firecrawl.scrapeUrl(url, {
      formats: ['markdown'],
      timeout: 120000,
      waitFor: 5000,
      onlyMainContent: true,
    });
    const elapsed = Date.now() - start;
    console.log(`Status: ${result.success ? 'SUCCESS' : 'FAILED'} (${elapsed}ms)`);
    if (result.success) {
      console.log(`Title: ${result.metadata?.title}`);
      console.log(`Content length: ${result.markdown?.length} chars`);
      fs.writeFileSync('firecrawl-test2-extended.txt', result.markdown || 'empty');
      console.log('Saved to: firecrawl-test2-extended.txt');
    } else {
      console.log('Error:', JSON.stringify(result, null, 2));
    }
  } catch (err) {
    console.log(`FAILED: ${err.message}`);
  }

  // Test 3: With actions (wait for page to fully load)
  console.log('\n--- Test 3: With wait action (wait 3s for JS to render) ---');
  try {
    const start = Date.now();
    const result = await firecrawl.scrapeUrl(url, {
      formats: ['markdown'],
      timeout: 120000,
      onlyMainContent: true,
      actions: [
        { type: 'wait', milliseconds: 3000 },
      ],
    });
    const elapsed = Date.now() - start;
    console.log(`Status: ${result.success ? 'SUCCESS' : 'FAILED'} (${elapsed}ms)`);
    if (result.success) {
      console.log(`Title: ${result.metadata?.title}`);
      console.log(`Content length: ${result.markdown?.length} chars`);
      fs.writeFileSync('firecrawl-test3-actions.txt', result.markdown || 'empty');
      console.log('Saved to: firecrawl-test3-actions.txt');
    } else {
      console.log('Error:', JSON.stringify(result, null, 2));
    }
  } catch (err) {
    console.log(`FAILED: ${err.message}`);
  }

  // Test 4: Multiple formats
  console.log('\n--- Test 4: Multiple formats (markdown + links + html) ---');
  try {
    const start = Date.now();
    const result = await firecrawl.scrapeUrl(url, {
      formats: ['markdown', 'links', 'html'],
      timeout: 120000,
      onlyMainContent: true,
    });
    const elapsed = Date.now() - start;
    console.log(`Status: ${result.success ? 'SUCCESS' : 'FAILED'} (${elapsed}ms)`);
    if (result.success) {
      console.log(`Title: ${result.metadata?.title}`);
      console.log(`Markdown length: ${result.markdown?.length} chars`);
      console.log(`HTML length: ${result.html?.length} chars`);
      console.log(`Links found: ${result.links?.length}`);
      const output = [
        '=== METADATA ===',
        JSON.stringify(result.metadata, null, 2),
        '\n=== MARKDOWN ===',
        result.markdown || 'empty',
        '\n=== LINKS ===',
        (result.links || []).join('\n'),
      ].join('\n');
      fs.writeFileSync('firecrawl-test4-multi.txt', output);
      console.log('Saved to: firecrawl-test4-multi.txt');
    } else {
      console.log('Error:', JSON.stringify(result, null, 2));
    }
  } catch (err) {
    console.log(`FAILED: ${err.message}`);
  }

  // Test 5: Crawl (multi-page, limit 3)
  console.log('\n--- Test 5: Crawl (multi-page, limit: 3) ---');
  try {
    const start = Date.now();
    const result = await firecrawl.crawlUrl(url, {
      limit: 3,
      scrapeOptions: {
        formats: ['markdown'],
        onlyMainContent: true,
        timeout: 120000,
      },
    });
    const elapsed = Date.now() - start;
    console.log(`Status: ${result.success ? 'SUCCESS' : 'FAILED'} (${elapsed}ms)`);
    if (result.success) {
      console.log(`Pages crawled: ${result.data?.length}`);
      let output = '';
      for (const page of (result.data || [])) {
        console.log(`  - ${page.metadata?.sourceURL}: ${page.markdown?.length} chars`);
        output += `\n${'='.repeat(60)}\n`;
        output += `URL: ${page.metadata?.sourceURL}\n`;
        output += `Title: ${page.metadata?.title}\n`;
        output += `${'='.repeat(60)}\n`;
        output += page.markdown || 'empty';
        output += '\n';
      }
      fs.writeFileSync('firecrawl-test5-crawl.txt', output);
      console.log('Saved to: firecrawl-test5-crawl.txt');
    } else {
      console.log('Error:', JSON.stringify(result, null, 2));
    }
  } catch (err) {
    console.log(`FAILED: ${err.message}`);
  }

  console.log('\n' + '='.repeat(60));
  console.log('All tests complete!');
  console.log('='.repeat(60));
}

testScrape().catch(console.error);
