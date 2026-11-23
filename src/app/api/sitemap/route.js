import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

const BROWSER_HEADERS = {
    'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
};

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
        if (loc && !loc.endsWith('.xml')) {
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

        const parsedUrl = new URL(url.startsWith('http') ? url : `https://${url}`);
        const origin = parsedUrl.origin;

        // 1. Check robots.txt for explicit Sitemap directives
        const candidateSitemaps = new Set([
            `${origin}/sitemap.xml`,
            `${origin}/sitemap_index.xml`,
            `${origin}/wp-sitemap.xml`,
        ]);

        try {
            const robotsRes = await fetch(`${origin}/robots.txt`, { headers: BROWSER_HEADERS });
            if (robotsRes.ok) {
                const robotsText = await robotsRes.text();
                const matches = [...robotsText.matchAll(/^Sitemap:\s*(https?:\/\/\S+)/gim)];
                matches.forEach((m) => candidateSitemaps.add(m[1].trim()));
            }
        } catch { }

        let foundSitemapUrl = null;
        let isSitemapIndex = false;
        let childSitemaps = [];
        let extractedUrls = [];

        // 2. Probe candidate sitemap URLs
        for (const smUrl of candidateSitemaps) {
            try {
                const res = await fetch(smUrl, { headers: BROWSER_HEADERS });
                if (!res.ok) continue;
                const text = await res.text();

                if (text.includes('<sitemapindex')) {
                    foundSitemapUrl = smUrl;
                    isSitemapIndex = true;
                    childSitemaps = [...text.matchAll(/<loc>(.*?)<\/loc>/gi)]
                        .map((m) => m[1].trim())
                        .filter(Boolean);

                    // Fetch up to the first 3 child sitemaps to collect page URLs
                    const childResults = await Promise.allSettled(
                        childSitemaps.slice(0, 3).map((childUrl) =>
                            fetch(childUrl, { headers: BROWSER_HEADERS }).then((r) => (r.ok ? r.text() : ''))
                        )
                    );
                    for (const childRes of childResults) {
                        if (childRes.status === 'fulfilled' && childRes.value) {
                            extractedUrls.push(...parseXmlUrls(childRes.value));
                        }
                    }
                    break;
                } else if (text.includes('<urlset')) {
                    foundSitemapUrl = smUrl;
                    extractedUrls = parseXmlUrls(text);
                    break;
                }
            } catch { }
        }

        // 3. Fallback: If no sitemap exists, discover internal links from homepage & build XML
        let discoveredInternalLinks = [];
        let generatedXml = '';

        if (!foundSitemapUrl || extractedUrls.length === 0) {
            const pageRes = await fetch(origin, { headers: BROWSER_HEADERS });
            if (pageRes.ok) {
                const html = await pageRes.text();
                const $ = cheerio.load(html);
                const linkSet = new Set([`${origin}/`]);

                $('a[href]').each((_, el) => {
                    const href = $(el).attr('href');
                    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
                    try {
                        const resolved = new URL(href, origin);
                        if (resolved.origin === origin) {
                            linkSet.add(resolved.origin + resolved.pathname);
                        }
                    } catch { }
                });

                discoveredInternalLinks = Array.from(linkSet).slice(0, 100);
                const today = new Date().toISOString().split('T')[0];
                const urlEntries = discoveredInternalLinks
                    .map(
                        (loc, i) => `  <url>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${i === 0 ? '1.0' : '0.8'}</priority>
  </url>`
                    )
                    .join('\n');

                generatedXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlEntries}\n</urlset>`;
            }
        }

        return NextResponse.json({
            origin,
            found: Boolean(foundSitemapUrl),
            sitemapUrl: foundSitemapUrl,
            isSitemapIndex,
            childSitemaps,
            totalUrls: extractedUrls.length,
            urls: extractedUrls.slice(0, 250),
            discoveredInternalLinks,
            generatedXml,
        });
    } catch (error) {
        console.error('Sitemap Finder Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to inspect sitemap' },
            { status: 500 }
        );
    }
}