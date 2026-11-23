import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

const BROWSER_HEADERS = {
    'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
};

export async function POST(request) {
    try {
        const { url } = await request.json();
        if (!url) {
            return NextResponse.json({ error: 'Website URL is required' }, { status: 400 });
        }

        const parsedUrl = new URL(url.startsWith('http') ? url : `https://${url}`);
        const targetUrl = parsedUrl.href;
        const origin = parsedUrl.origin;

        const [pageRes, llmsRes, llmsFullRes, robotsRes] = await Promise.allSettled([
            fetch(targetUrl, { headers: BROWSER_HEADERS }),
            fetch(`${origin}/llms.txt`, { headers: BROWSER_HEADERS }),
            fetch(`${origin}/llms-full.txt`, { headers: BROWSER_HEADERS }),
            fetch(`${origin}/robots.txt`, { headers: BROWSER_HEADERS }),
        ]);

        if (pageRes.status !== 'fulfilled' || !pageRes.value.ok) {
            return NextResponse.json(
                { error: `Failed to fetch ${targetUrl}` },
                { status: 422 }
            );
        }

        const rawHtml = await pageRes.value.text();
        const rawHtmlBytes = Buffer.byteLength(rawHtml, 'utf8');
        const $ = cheerio.load(rawHtml);

        const scriptCount = $('script').length;
        const title = $('title').text().trim();
        const metaDescription = $('meta[name="description"]').attr('content')?.trim() || '';
        const canonicalUrl = $('link[rel="canonical"]').attr('href')?.trim() || '';

        // Extract structural outline (H1-H3) as seen by non-JS crawlers
        const headingOutline = [];
        $('h1, h2, h3').each((_, el) => {
            const text = $(el).text().replace(/\s+/g, ' ').trim();
            if (text) {
                headingOutline.push({
                    tag: el.tagName.toUpperCase(),
                    text,
                });
            }
        });

        // Strip scripts/styles/nav/footer clutter to simulate pure LLM text extraction
        $('script, style, noscript, svg, iframe').remove();
        const visibleText = $('body').text().replace(/\s+/g, ' ').trim();
        const visibleTextBytes = Buffer.byteLength(visibleText, 'utf8');
        const visibleWords = visibleText ? visibleText.split(' ').length : 0;

        // Calculate text-to-HTML ratio & JS-dependency risk
        const textToHtmlRatio =
            rawHtmlBytes > 0 ? Math.min(100, Math.round((visibleTextBytes / rawHtmlBytes) * 100)) : 0;

        let jsRiskLevel = 'Low';
        let jsRiskSummary = 'Strong server-rendered content. AI crawlers can read your page without executing JavaScript.';
        if (visibleWords < 120 || textToHtmlRatio < 5) {
            jsRiskLevel = 'High';
            jsRiskSummary =
                'Heavy client-side JavaScript shell detected. Non-JS AI crawlers (ChatGPT, Claude, Perplexity) see almost no readable text.';
        } else if (visibleWords < 300 || textToHtmlRatio < 12) {
            jsRiskLevel = 'Moderate';
            jsRiskSummary =
                'Moderate HTML-to-text ratio. Core headings are visible, but deeper content may rely on client-side hydration.';
        }

        // Validate /llms.txt against llmstxt.org specification
        let hasLlmsTxt = false;
        let llmsTxtContent = '';
        const llmsValidation = {
            hasH1Title: false,
            hasBlockquoteSummary: false,
            hasMarkdownLinks: false,
            score: 0,
            status: 'Missing',
        };

        if (llmsRes.status === 'fulfilled' && llmsRes.value.ok) {
            const contentType = llmsRes.value.headers.get('content-type') || '';
            const body = await llmsRes.value.text();
            // Ensure it's not an HTML 404 fallback page
            if (!body.trim().startsWith('<!DOCTYPE') && !contentType.includes('text/html')) {
                hasLlmsTxt = true;
                llmsTxtContent = body;
                llmsValidation.hasH1Title = /^#\s+.+/m.test(body);
                llmsValidation.hasBlockquoteSummary = /^>\s+.+/m.test(body);
                llmsValidation.hasMarkdownLinks = /\[.+?\]\(https?:\/\/.+?\)/m.test(body);

                let pts = 25;
                if (llmsValidation.hasH1Title) pts += 25;
                if (llmsValidation.hasBlockquoteSummary) pts += 25;
                if (llmsValidation.hasMarkdownLinks) pts += 25;
                llmsValidation.score = pts;
                llmsValidation.status = pts === 100 ? 'Valid Spec (100%)' : `Partial Spec (${pts}%)`;
            }
        }

        const hasLlmsFullTxt =
            llmsFullRes.status === 'fulfilled' &&
            llmsFullRes.value.ok &&
            !(llmsFullRes.value.headers.get('content-type') || '').includes('text/html');

        const existingRobotsTxt =
            robotsRes.status === 'fulfilled' && robotsRes.value.ok
                ? await robotsRes.value.text()
                : '';

        // Ready-to-deploy robots.txt AI crawler policies
        const recommendedSearchFirstRobots = `# Allow AI Search & Citation Engines, Block Model Training Scrapers
User-agent: OAI-SearchBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Google-Extended
Disallow: /

User-agent: GPTBot
Disallow: /

User-agent: *
Allow: /
Sitemap: ${origin}/sitemap.xml`;

        const recommendedOpenAiRobots = `# Allow All Search Engines & AI Assistants
User-agent: *
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

Sitemap: ${origin}/sitemap.xml`;

        return NextResponse.json({
            targetUrl,
            origin,
            title,
            metaDescription,
            canonicalUrl,
            visibleWords,
            scriptCount,
            textToHtmlRatio,
            jsRiskLevel,
            jsRiskSummary,
            headingOutline: headingOutline.slice(0, 25),
            rawCrawlerText: visibleText.slice(0, 6000),
            hasLlmsTxt,
            hasLlmsFullTxt,
            llmsTxtContent,
            llmsValidation,
            existingRobotsTxt,
            recommendedSearchFirstRobots,
            recommendedOpenAiRobots,
        });
    } catch (error) {
        console.error('AI Bot X-Ray Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to run AI Bot X-Ray' },
            { status: 500 }
        );
    }
}