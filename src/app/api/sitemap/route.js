import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

const BROWSER_HEADERS = {
    'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 (compatible; TrifectaSitemapCrawler/2.0; +https://seo-aeo-geo-app.vercel.app)',
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
};

const NON_HTML_EXTENSIONS = new Set([
    'png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'avif', 'ico', 'bmp', 'tiff',
    'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
    'zip', 'tar', 'gz', 'rar', '7z',
    'css', 'js', 'mjs', 'cjs', 'json', 'xml', 'txt',
    'woff', 'woff2', 'ttf', 'otf', 'eot',
    'mp4', 'webm', 'ogv', 'avi', 'mov', 'mp3', 'wav', 'ogg', 'flac',
]);

function normalizeUrl(rawUrl, baseUrl) {
    try {
        const parsed = new URL(rawUrl, baseUrl);
        if (!['http:', 'https:'].includes(parsed.protocol)) return null;
        parsed.hash = '';
        if (parsed.pathname !== '/' && parsed.pathname.endsWith('/')) {
            parsed.pathname = parsed.pathname.slice(0, -1);
        }
        return parsed;
    } catch {
        return null;
    }
}

function isHtmlCandidate(pathname) {
    const parts = pathname.split('/');
    const lastSegment = parts[parts.length - 1] || '';
    if (!lastSegment.includes('.')) return true;
    const ext = lastSegment.split('.').pop()?.toLowerCase();
    return !NON_HTML_EXTENSIONS.has(ext);
}

function escapeXml(unsafe) {
    return unsafe.replace(/[<>&'"]/g, (c) => {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
            default: return c;
        }
    });
}

function parseXmlUrls(xmlText) {
    const urls = [];
    const urlBlocks = [...xmlText.matchAll(/<url>([\s\S]*?)<\/url>/gi)];

    if (urlBlocks.length > 0) {
        for (const match of urlBlocks) {
            const block = match[1];
            const loc = block.match(/<loc>(.*?)<\/loc>/i)?.[1]?.trim();
            if (!loc) continue;
            const lastmod = block.match(/<lastmod>(.*?)<\/lastmod>/i)?.[1]?.trim() || null;
            const changefreq = block.match(/<changefreq>(.*?)<\/changefreq>/i)?.[1]?.trim() || null;
            const priority = block.match(/<priority>(.*?)<\/priority>/i)?.[1]?.trim() || null;
            urls.push({ loc, lastmod, changefreq, priority });
        }
        return urls;
    }

    // Fallback for plain <loc> tags
    const locMatches = [...xmlText.matchAll(/<loc>(.*?)<\/loc>/gi)];
    for (const m of locMatches) {
        const loc = m[1].trim();
        if (loc && !loc.endsWith('.xml') && !loc.endsWith('.xml.gz')) {
            urls.push({ loc, lastmod: null, changefreq: null, priority: null });
        }
    }
    return urls;
}

export async function POST(request) {
    try {
        const { url } = await request.json();
        if (!url) {
            return NextResponse.json({ error: 'Website URL is required' }, { status: 400 });
        }

        const normalizedInput = url.startsWith('http') ? url.trim() : `https://${url.trim()}`;
        const parsedInputUrl = new URL(normalizedInput);
        const origin = parsedInputUrl.origin;

        // =========================================================================
        // STEP 1: Discover & Recursively Parse Sitemaps (including Sitemap Indexes)
        // =========================================================================
        const candidateSitemaps = new Set([
            `${origin}/sitemap.xml`,
            `${origin}/sitemap_index.xml`,
            `${origin}/wp-sitemap.xml`,
            `${origin}/page-sitemap.xml`,
        ]);

        try {
            const robotsRes = await fetch(`${origin}/robots.txt`, {
                headers: BROWSER_HEADERS,
                signal: AbortSignal.timeout(6000),
            });
            if (robotsRes.ok) {
                const robotsText = await robotsRes.text();
                const matches = [...robotsText.matchAll(/^Sitemap:\s*(https?:\/\/\S+)/gim)];
                matches.forEach((m) => candidateSitemaps.add(m[1].trim()));
            }
        } catch { }

        let foundSitemapUrl = null;
        let isSitemapIndex = false;
        const allChildSitemaps = new Set();
        const sitemapUrlMap = new Map(); // loc -> { loc, lastmod, changefreq, priority }
        const visitedSitemaps = new Set();
        const sitemapsToFetchQueue = [];

        // Probe candidate sitemaps
        for (const smUrl of candidateSitemaps) {
            try {
                const res = await fetch(smUrl, {
                    headers: BROWSER_HEADERS,
                    signal: AbortSignal.timeout(6000),
                });
                if (!res.ok) continue;
                const text = await res.text();

                if (text.includes('<sitemapindex')) {
                    if (!foundSitemapUrl) {
                        foundSitemapUrl = smUrl;
                        isSitemapIndex = true;
                    }
                    visitedSitemaps.add(smUrl);
                    const childMatches = [...text.matchAll(/<loc>(.*?)<\/loc>/gi)]
                        .map((m) => m[1].trim())
                        .filter(Boolean);
                    for (const child of childMatches) {
                        allChildSitemaps.add(child);
                        if (!visitedSitemaps.has(child)) {
                            sitemapsToFetchQueue.push(child);
                        }
                    }
                } else if (text.includes('<urlset')) {
                    if (!foundSitemapUrl) {
                        foundSitemapUrl = smUrl;
                    }
                    visitedSitemaps.add(smUrl);
                    const parsed = parseXmlUrls(text);
                    for (const item of parsed) {
                        const norm = normalizeUrl(item.loc, origin);
                        if (norm && norm.origin === origin) {
                            sitemapUrlMap.set(norm.href, { ...item, loc: norm.href });
                        }
                    }
                }
            } catch { }
        }

        // Recursively fetch child sitemaps in parallel batches of 10 (up to 50 sitemaps max)
        const MAX_SITEMAPS_TO_FETCH = 50;
        let sitemapsFetchedCount = 0;

        while (sitemapsToFetchQueue.length > 0 && sitemapsFetchedCount < MAX_SITEMAPS_TO_FETCH) {
            const batch = sitemapsToFetchQueue.splice(0, 10);
            sitemapsFetchedCount += batch.length;

            const results = await Promise.allSettled(
                batch.map(async (childUrl) => {
                    visitedSitemaps.add(childUrl);
                    const r = await fetch(childUrl, {
                        headers: BROWSER_HEADERS,
                        signal: AbortSignal.timeout(8000),
                    });
                    if (!r.ok) return { text: '', childUrl };
                    const text = await r.text();
                    return { text, childUrl };
                })
            );

            for (const res of results) {
                if (res.status === 'fulfilled' && res.value?.text) {
                    const { text } = res.value;
                    if (text.includes('<sitemapindex')) {
                        const nested = [...text.matchAll(/<loc>(.*?)<\/loc>/gi)]
                            .map((m) => m[1].trim())
                            .filter(Boolean);
                        for (const child of nested) {
                            allChildSitemaps.add(child);
                            if (!visitedSitemaps.has(child) && !sitemapsToFetchQueue.includes(child)) {
                                sitemapsToFetchQueue.push(child);
                            }
                        }
                    } else if (text.includes('<urlset')) {
                        const parsed = parseXmlUrls(text);
                        for (const item of parsed) {
                            const norm = normalizeUrl(item.loc, origin);
                            if (norm && norm.origin === origin) {
                                sitemapUrlMap.set(norm.href, { ...item, loc: norm.href });
                            }
                        }
                    }
                }
            }
        }

        // =========================================================================
        // STEP 2: Deep Breadth-First Internal Link Spider (Depth 4, Max 250, Batches of 8)
        // =========================================================================
        const MAX_CRAWL_DEPTH = 4;
        const MAX_CRAWL_PAGES = 250;
        const BATCH_SIZE = 8;

        const spiderPagesMap = new Map(); // loc -> { loc, depth, title }
        const visitedSpiderUrls = new Set();
        const queuedUrls = new Set();

        const startUrl = `${origin}/`;
        const initialNormalized = normalizeUrl(startUrl, origin);
        const rootLoc = initialNormalized ? initialNormalized.href : startUrl;

        const spiderQueue = [{ url: rootLoc, depth: 0 }];
        queuedUrls.add(rootLoc);

        while (spiderQueue.length > 0 && visitedSpiderUrls.size < MAX_CRAWL_PAGES) {
            const currentBatch = [];
            while (
                spiderQueue.length > 0 &&
                currentBatch.length < BATCH_SIZE &&
                visitedSpiderUrls.size + currentBatch.length < MAX_CRAWL_PAGES
            ) {
                const item = spiderQueue.shift();
                if (!visitedSpiderUrls.has(item.url)) {
                    visitedSpiderUrls.add(item.url);
                    currentBatch.push(item);
                }
            }

            if (currentBatch.length === 0) break;

            const batchResults = await Promise.allSettled(
                currentBatch.map(async ({ url: pageUrl, depth }) => {
                    const response = await fetch(pageUrl, {
                        headers: BROWSER_HEADERS,
                        signal: AbortSignal.timeout(6000),
                    });

                    if (!response.ok) {
                        return { pageUrl, depth, title: '', links: [] };
                    }

                    const contentType = response.headers.get('content-type') || '';
                    if (!contentType.includes('text/html') && !contentType.includes('application/xhtml')) {
                        return { pageUrl, depth, title: '', links: [] };
                    }

                    const html = await response.text();
                    const $ = cheerio.load(html);
                    const title = $('title').first().text().trim() || '';

                    const extractedLinks = [];
                    if (depth < MAX_CRAWL_DEPTH) {
                        $('a[href]').each((_, el) => {
                            const href = $(el).attr('href')?.trim();
                            if (
                                !href ||
                                href.startsWith('#') ||
                                href.startsWith('mailto:') ||
                                href.startsWith('tel:') ||
                                href.startsWith('javascript:') ||
                                href.startsWith('data:')
                            ) {
                                return;
                            }

                            const resolved = normalizeUrl(href, pageUrl);
                            if (resolved && resolved.origin === origin && isHtmlCandidate(resolved.pathname)) {
                                extractedLinks.push(resolved.href);
                            }
                        });
                    }

                    return { pageUrl, depth, title, links: extractedLinks };
                })
            );

            for (const res of batchResults) {
                if (res.status === 'fulfilled' && res.value) {
                    const { pageUrl, depth, title, links } = res.value;
                    spiderPagesMap.set(pageUrl, { loc: pageUrl, depth, title });

                    if (depth < MAX_CRAWL_DEPTH) {
                        for (const childLink of links) {
                            if (
                                !visitedSpiderUrls.has(childLink) &&
                                !queuedUrls.has(childLink) &&
                                visitedSpiderUrls.size + spiderQueue.length < MAX_CRAWL_PAGES * 2
                            ) {
                                queuedUrls.add(childLink);
                                spiderQueue.push({ url: childLink, depth: depth + 1 });
                            }
                        }
                    }
                }
            }
        }

        // =========================================================================
        // STEP 3: Deduplicate, Classify Sources & Build Complete XML Sitemap
        // =========================================================================
        const today = new Date().toISOString().split('T')[0];
        const allDiscoveredLocs = new Set([
            ...sitemapUrlMap.keys(),
            ...spiderPagesMap.keys(),
        ]);

        const mergedUrls = Array.from(allDiscoveredLocs).map((loc) => {
            const inSitemap = sitemapUrlMap.has(loc);
            const inSpider = spiderPagesMap.has(loc);
            const sitemapMeta = sitemapUrlMap.get(loc);
            const spiderMeta = spiderPagesMap.get(loc);

            let source = 'crawl';
            if (inSitemap && inSpider) source = 'both';
            else if (inSitemap) source = 'sitemap';

            const isRoot = loc === rootLoc || loc === `${origin}/` || loc === origin;

            return {
                loc,
                source,
                title: spiderMeta?.title || '',
                depth: spiderMeta?.depth ?? (isRoot ? 0 : 1),
                lastmod: sitemapMeta?.lastmod || today,
                changefreq: sitemapMeta?.changefreq || (isRoot ? 'daily' : 'weekly'),
                priority: sitemapMeta?.priority || (isRoot ? '1.0' : '0.8'),
            };
        });

        // Sort: root URL first, then alphabetically by URL
        mergedUrls.sort((a, b) => {
            const aIsRoot = a.loc === rootLoc || a.loc === `${origin}/` || a.loc === origin;
            const bIsRoot = b.loc === rootLoc || b.loc === `${origin}/` || b.loc === origin;
            if (aIsRoot && !bIsRoot) return -1;
            if (!aIsRoot && bIsRoot) return 1;
            return a.loc.localeCompare(b.loc);
        });

        // Build valid generated XML sitemap containing all discovered pages
        const xmlEntries = mergedUrls
            .map(
                (item) => `  <url>
    <loc>${escapeXml(item.loc)}</loc>
    <lastmod>${escapeXml(item.lastmod)}</lastmod>
    <changefreq>${escapeXml(item.changefreq)}</changefreq>
    <priority>${escapeXml(item.priority)}</priority>
  </url>`
            )
            .join('\n');

        const generatedXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${xmlEntries}\n</urlset>`;

        return NextResponse.json({
            origin,
            found: Boolean(foundSitemapUrl),
            sitemapUrl: foundSitemapUrl,
            isSitemapIndex,
            childSitemaps: Array.from(allChildSitemaps),
            sitemapUrlCount: sitemapUrlMap.size,
            crawledPagesCount: spiderPagesMap.size,
            totalDiscoveredPages: mergedUrls.length,
            urls: mergedUrls,
            generatedXml,
        });
    } catch (error) {
        console.error('Sitemap & Crawler Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to crawl website and inspect sitemaps.' },
            { status: 500 }
        );
    }
}
