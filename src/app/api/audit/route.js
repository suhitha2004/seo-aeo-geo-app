import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { prisma } from '@/lib/prisma';
import { getConfiguredProviders } from '@/lib/ai-provider';

const BROWSER_HEADERS = {
    'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
};

export async function POST(request) {
    try {
        const { url, brandName, skipSave, aiProvider } = await request.json();

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        const parsedUrl = new URL(url.startsWith('http') ? url : `https://${url}`);
        const targetUrl = parsedUrl.href;
        const origin = parsedUrl.origin;
        const domain = parsedUrl.hostname.replace(/^www\./, '');

        // Fetch main HTML, llms.txt, robots.txt, and sitemap.xml in parallel
        const [pageRes, llmsRes, robotsRes, sitemapRes] = await Promise.allSettled([
            fetch(targetUrl, { headers: BROWSER_HEADERS }),
            fetch(`${origin}/llms.txt`, { headers: BROWSER_HEADERS }),
            fetch(`${origin}/robots.txt`, { headers: BROWSER_HEADERS }),
            fetch(`${origin}/sitemap.xml`, { headers: BROWSER_HEADERS }),
        ]);

        if (pageRes.status !== 'fulfilled' || !pageRes.value.ok) {
            return NextResponse.json(
                { error: `Failed to fetch ${targetUrl}` },
                { status: 422 }
            );
        }

        const html = await pageRes.value.text();
        const $ = cheerio.load(html);
        const issues = [];

        const robotsText =
            robotsRes.status === 'fulfilled' && robotsRes.value.ok
                ? await robotsRes.value.text()
                : '';

        // --- SITEMAP.XML & DISCOVERED PAGES CHECK ---
        let hasSitemap = false;
        let sitemapUrlCount = 0;
        let discoveredUrls = [];

        if (sitemapRes.status === 'fulfilled' && sitemapRes.value.ok) {
            const sitemapText = await sitemapRes.value.text();
            if (sitemapText.includes('<urlset') || sitemapText.includes('<sitemapindex')) {
                hasSitemap = true;
                const locMatches = [...sitemapText.matchAll(/<loc>(.*?)<\/loc>/gi)].map((m) =>
                    m[1].trim()
                );
                sitemapUrlCount = locMatches.length;
                discoveredUrls = locMatches
                    .filter((u) => u.startsWith('http') && !u.endsWith('.xml'))
                    .slice(0, 5);
            }
        } else if (/^Sitemap:\s*https?:\/\//im.test(robotsText)) {
            hasSitemap = true;
        }

        // Fallback: extract top 5 internal links from HTML navigation if sitemap has no page URLs
        if (discoveredUrls.length === 0) {
            const internalSet = new Set();
            $('a[href]').each((_, el) => {
                const href = $(el).attr('href');
                if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
                try {
                    const resolved = new URL(href, origin);
                    if (resolved.origin === origin && resolved.pathname !== '/' && resolved.pathname !== parsedUrl.pathname) {
                        internalSet.add(resolved.origin + resolved.pathname);
                    }
                } catch { }
            });
            discoveredUrls = Array.from(internalSet).slice(0, 5);
        }

        // --- 1. SEO AUDIT ---
        let seoScore = 100;
        const title = $('title').text().trim();
        const metaDesc = $('meta[name="description"]').attr('content')?.trim() || '';
        const h1Count = $('h1').length;
        const imagesWithoutAlt = $('img').filter((_, el) => !$(el).attr('alt')).length;

        if (!title || title.length < 15 || title.length > 65) {
            seoScore -= 20;
            issues.push({
                pillar: 'SEO',
                severity: 'high',
                message: `Title tag length is ${title.length} chars (ideal: 15–65 chars).`,
            });
        }
        if (!metaDesc || metaDesc.length < 50) {
            seoScore -= 20;
            issues.push({
                pillar: 'SEO',
                severity: 'medium',
                message: 'Missing or too short meta description (aim for 120–160 chars).',
            });
        }
        if (h1Count !== 1) {
            seoScore -= 20;
            issues.push({
                pillar: 'SEO',
                severity: 'high',
                message: `Found ${h1Count} <h1> tags (expected exactly 1).`,
            });
        }
        if (imagesWithoutAlt > 0) {
            seoScore -= 15;
            issues.push({
                pillar: 'SEO',
                severity: 'low',
                message: `${imagesWithoutAlt} image(s) are missing alt attributes.`,
            });
        }
        if (!hasSitemap) {
            seoScore -= 15;
            issues.push({
                pillar: 'SEO',
                severity: 'medium',
                message: 'No /sitemap.xml found (and no Sitemap directive in robots.txt) for crawler indexing.',
            });
        }

        // --- 2. AEO AUDIT (Answer Engine Optimization) ---
        let aeoScore = 100;
        const schemaTypes = [];
        $('script[type="application/ld+json"]').each((_, el) => {
            try {
                const json = JSON.parse($(el).html() || '{}');
                const items = Array.isArray(json) ? json : json['@graph'] || [json];
                items.forEach((item) => {
                    if (item['@type']) schemaTypes.push(String(item['@type']));
                });
            } catch { }
        });

        if (schemaTypes.length === 0) {
            aeoScore -= 40;
            issues.push({
                pillar: 'AEO',
                severity: 'high',
                message: 'No JSON-LD structured schema found (add FAQPage, HowTo, or Article schema).',
            });
        }

        const headings = $('h2, h3')
            .map((_, el) => $(el).text().trim())
            .get();
        const questionHeadings = headings.filter((h) =>
            /^(who|what|where|when|why|how|can|does|is)\b/i.test(h) || h.endsWith('?')
        );

        if (questionHeadings.length === 0) {
            aeoScore -= 30;
            issues.push({
                pillar: 'AEO',
                severity: 'medium',
                message: 'No question-based H2/H3 headings found to capture Featured Snippets & PAA.',
            });
        }

        // --- 3. GEO AUDIT (Generative Engine Optimization) ---
        let geoScore = 100;
        const hasLlmsTxt =
            llmsRes.status === 'fulfilled' &&
            llmsRes.value.ok &&
            (llmsRes.value.headers.get('content-type') || '').includes('text/plain');

        if (!hasLlmsTxt) {
            geoScore -= 35;
            issues.push({
                pillar: 'GEO',
                severity: 'high',
                message: 'Missing /llms.txt file to guide AI crawlers (ChatGPT, Claude, Perplexity).',
            });
        }

        // Block-accurate AI crawler check in robots.txt
        const aiBots = ['OAI-SearchBot', 'GPTBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended'];
        const botAccess = {};
        aiBots.forEach((bot) => { botAccess[bot] = 'Allowed'; });

        if (robotsText) {
            const blocks = robotsText.split(/\n\s*\n/);
            for (const block of blocks) {
                const lines = block.split('\n').map((l) => l.trim());
                const agents = lines
                    .filter((l) => l.toLowerCase().startsWith('user-agent:'))
                    .map((l) => l.split(':')[1]?.trim().toLowerCase());
                const disallowsRoot = lines.some(
                    (l) => l.toLowerCase().replace(/\s+/g, '') === 'disallow:/'
                );

                if (disallowsRoot) {
                    aiBots.forEach((bot) => {
                        if (agents.includes(bot.toLowerCase()) || agents.includes('*')) {
                            botAccess[bot] = 'Blocked';
                        }
                    });
                }
            }
        }

        const blockedBots = Object.entries(botAccess)
            .filter(([, status]) => status === 'Blocked')
            .map(([bot]) => bot);

        if (blockedBots.length > 0) {
            geoScore -= 35;
            issues.push({
                pillar: 'GEO',
                severity: 'high',
                message: `robots.txt is blocking AI crawlers: ${blockedBots.join(', ')}.`,
            });
        }

        // Remove scripts/styles before measuring visible SSR text for non-JS AI crawlers
        $('script, style, noscript').remove();
        const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
        const wordCount = bodyText ? bodyText.split(' ').length : 0;

        if (wordCount < 120) {
            geoScore -= 15;
            issues.push({
                pillar: 'GEO',
                severity: 'high',
                message: `Low server-rendered text (${wordCount} words). Non-JS AI crawlers (ChatGPT, Claude, Perplexity) may see a blank client-side app.`,
            });
        }

        const statMatches = bodyText.match(/\b\d+(\.\d+)?%|\$\d+|\b\d{4}\b/g) || [];
        if (statMatches.length < 3) {
            geoScore -= 20;
            issues.push({
                pillar: 'GEO',
                severity: 'medium',
                message: 'Low factual/statistic density. LLMs prioritize citing pages with concrete data & numbers.',
            });
        }

        const finalReport = {
            url: targetUrl,
            seoScore: Math.max(0, seoScore),
            aeoScore: Math.max(0, aeoScore),
            geoScore: Math.max(0, geoScore),
            hasLlmsTxt,
            schemaTypes,
            issues,
        };

        if (skipSave) {
            return NextResponse.json({
                report: finalReport,
                wordCount,
                hasSitemap,
            });
        }

        // Save Project & AuditReport to Neon PostgreSQL
        const project = await prisma.project.upsert({
            where: { domain },
            update: { brandName: brandName || domain },
            create: {
                name: brandName || domain,
                domain,
                brandName: brandName || domain,
            },
        });

        const report = await prisma.auditReport.create({
            data: {
                projectId: project.id,
                ...finalReport,
            },
        });

        return NextResponse.json({
            project,
            report,
            botAccess,
            wordCount,
            hasSitemap,
            sitemapUrlCount,
            discoveredUrls,
            configuredProviders: getConfiguredProviders(),
        });
    } catch (error) {
        console.error('Audit Error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}