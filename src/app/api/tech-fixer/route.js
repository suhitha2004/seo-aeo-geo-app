import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';

const google = createGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY,
});

const MODELS = ['gemini-3.8-flash', 'gemini-3.8-flash-lite', 'gemini-2.5-flash', 'gemini-1.5-flash'];

const BROWSER_HEADERS = {
    'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 (compatible; TrifectaTechFixer/2.0; +https://seo-aeo-geo-app.vercel.app)',
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

const FixerOutputSchema = z.object({
    summary: z.string().describe('2-sentence executive summary of the highest-impact technical SEO, AEO, and GEO fixes.'),
    estimatedScoreBoost: z.number().min(5).max(45).describe('Estimated technical score gain (+5 to +45) after applying all patches.'),
    patches: z.array(
        z.object({
            id: z.string(),
            category: z.enum(['Meta & Title', 'Canonical & Indexing', 'Heading Hierarchy', 'Image Alt Attributes', 'Structured Data', 'AI Crawler Manifest']),
            severity: z.enum(['critical', 'warning', 'enhancement']),
            issueTitle: z.string(),
            explanation: z.string(),
            currentSnippet: z.string().describe('Exact current HTML/tag found on the page, or "Missing from DOM"'),
            fixedSnippet: z.string().describe('Production-ready replacement HTML, JSON-LD, or Next.js Metadata API code'),
            targetLocation: z.string().describe('Where to paste the fix, e.g., "<head> section", "src/app/layout.js", or root "/public"'),
        })
    ),
    headPatchBlock: z.string().describe('Complete, consolidated drop-in HTML <head> snippet containing title, meta description, canonical, Open Graph, and JSON-LD.'),
    nextjsMetadataPatch: z.string().describe('Equivalent Next.js App Router `export const metadata = { ... }` object ready to paste.'),
    llmsTxtContent: z.string().describe('Complete llmstxt.org compliant /llms.txt file tailored to this brand and site content.'),
    robotsTxtContent: z.string().describe('Optimized /robots.txt allowing Googlebot, ChatGPT/OAI-SearchBot, PerplexityBot, and Google-Extended while referencing sitemap.xml.'),
    sitemapXmlContent: z.string().describe('Clean, production-ready XML sitemap matching https://www.sitemaps.org/schemas/sitemap/0.9 containing discovered site URLs.'),
    seoSchemaJsonContent: z.string().describe('Valid JSON-LD schema (without <script> tags) combining Organization, WebSite, and FAQPage/Service definitions.'),
});

export async function POST(req) {
    try {
        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.includes('your_gemini')) {
            return NextResponse.json(
                { error: 'Gemini API key is not configured. Please add GEMINI_API_KEY to your .env file.' },
                { status: 500 }
            );
        }

        const { url, brandName, githubRepo, githubToken } = await req.json();
        if (!url) {
            return NextResponse.json({ error: 'Target URL is required.' }, { status: 400 });
        }

        const normalizedUrl = /^https?:\/\//i.test(url.trim()) ? url.trim() : `https://${url.trim()}`;
        const parsedUrl = new URL(normalizedUrl);
        const origin = parsedUrl.origin;
        const brand = brandName?.trim() || parsedUrl.hostname.replace(/^www\./, '');
        const token = githubToken?.trim() || process.env.GITHUB_TOKEN;

        // =========================================================================
        // STEP 1: Deep Site Crawl (Sitemap check + BFS link spider up to 100 pages)
        // =========================================================================
        const candidateSitemaps = [
            `${origin}/sitemap.xml`,
            `${origin}/sitemap_index.xml`,
            `${origin}/wp-sitemap.xml`,
        ];

        let sitemapFound = false;
        let sitemapUrl = null;
        const discoveredSitemapUrls = new Set();

        for (const smUrl of candidateSitemaps) {
            try {
                const res = await fetch(smUrl, { headers: BROWSER_HEADERS, signal: AbortSignal.timeout(4000) });
                if (res.ok) {
                    const text = await res.text();
                    if (text.includes('<urlset') || text.includes('<sitemapindex')) {
                        sitemapFound = true;
                        sitemapUrl = smUrl;
                        const locs = [...text.matchAll(/<loc>(.*?)<\/loc>/gi)].map((m) => m[1].trim());
                        locs.forEach((loc) => {
                            const n = normalizeUrl(loc, origin);
                            if (n && n.origin === origin && isHtmlCandidate(n.pathname)) {
                                discoveredSitemapUrls.add(n.href);
                            }
                        });
                        break;
                    }
                }
            } catch { }
        }

        // Check robots.txt & llms.txt
        let robotsTxtFound = false;
        let robotsTxtContent = '';
        try {
            const rRes = await fetch(`${origin}/robots.txt`, { headers: BROWSER_HEADERS, signal: AbortSignal.timeout(3000) });
            if (rRes.ok) {
                robotsTxtFound = true;
                robotsTxtContent = (await rRes.text()).slice(0, 1000);
            }
        } catch { }

        let llmsTxtFound = false;
        try {
            const lRes = await fetch(`${origin}/llms.txt`, { headers: BROWSER_HEADERS, signal: AbortSignal.timeout(3000) });
            if (lRes.ok) {
                const lText = await lRes.text();
                if (lText.includes('#') || lText.includes('http')) {
                    llmsTxtFound = true;
                }
            }
        } catch { }

        // BFS Internal Link Spider up to 100 pages, depth 4, concurrency 8
        const MAX_CRAWL_PAGES = 100;
        const BATCH_SIZE = 8;
        const crawledPagesMap = new Map();
        const visitedUrls = new Set();
        const queue = [{ url: `${origin}/`, depth: 0 }];
        visitedUrls.add(`${origin}/`);

        let homeHtml = '';
        const missingAltImages = [];
        const missingTitles = [];
        const missingDescriptions = [];
        const missingCanonicals = [];
        const missingH1s = [];
        const existingSchemas = [];

        while (queue.length > 0 && visitedUrls.size <= MAX_CRAWL_PAGES) {
            const batch = [];
            while (queue.length > 0 && batch.length < BATCH_SIZE && visitedUrls.size <= MAX_CRAWL_PAGES) {
                batch.push(queue.shift());
            }

            if (batch.length === 0) break;

            const batchResults = await Promise.allSettled(
                batch.map(async ({ url: pageUrl, depth }) => {
                    const res = await fetch(pageUrl, {
                        headers: BROWSER_HEADERS,
                        signal: AbortSignal.timeout(6000),
                    });
                    if (!res.ok) return { pageUrl, depth, links: [] };

                    const contentType = res.headers.get('content-type') || '';
                    if (!contentType.includes('text/html') && !contentType.includes('application/xhtml')) {
                        return { pageUrl, depth, links: [] };
                    }

                    const html = await res.text();
                    if (pageUrl === `${origin}/` || pageUrl === origin || !homeHtml) {
                        homeHtml = html;
                    }

                    const $ = cheerio.load(html);
                    const title = $('title').first().text().trim();
                    const desc = $('meta[name="description"]').attr('content')?.trim() || '';
                    const canonical = $('link[rel="canonical"]').attr('href')?.trim() || '';
                    const h1Count = $('h1').length;

                    if (!title && missingTitles.length < 5) missingTitles.push(pageUrl);
                    if (!desc && missingDescriptions.length < 5) missingDescriptions.push(pageUrl);
                    if (!canonical && missingCanonicals.length < 5) missingCanonicals.push(pageUrl);
                    if (h1Count === 0 && missingH1s.length < 5) missingH1s.push(pageUrl);

                    $('img').each((_, el) => {
                        const alt = $(el).attr('alt');
                        const src = $(el).attr('src') || $(el).attr('data-src') || '';
                        if ((!alt || alt.trim() === '') && src && missingAltImages.length < 10) {
                            missingAltImages.push({ page: pageUrl, src });
                        }
                    });

                    $('script[type="application/ld+json"]').each((_, el) => {
                        const schemaText = $(el).html()?.trim();
                        if (schemaText && existingSchemas.length < 5) {
                            existingSchemas.push(schemaText.slice(0, 300));
                        }
                    });

                    const links = [];
                    if (depth < 4) {
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
                            const norm = normalizeUrl(href, pageUrl);
                            if (norm && norm.origin === origin && isHtmlCandidate(norm.pathname)) {
                                links.push(norm.href);
                            }
                        });
                    }

                    return { pageUrl, depth, links };
                })
            );

            for (const res of batchResults) {
                if (res.status === 'fulfilled' && res.value) {
                    const { pageUrl, depth, links } = res.value;
                    crawledPagesMap.set(pageUrl, { loc: pageUrl, depth });

                    if (depth < 4) {
                        for (const link of links) {
                            if (!visitedUrls.has(link) && visitedUrls.size < MAX_CRAWL_PAGES) {
                                visitedUrls.add(link);
                                queue.push({ url: link, depth: depth + 1 });
                            }
                        }
                    }
                }
            }
        }

        // Combine all discovered URLs for sitemap.xml generation
        const allDiscoveredUrls = Array.from(
            new Set([...discoveredSitemapUrls, ...crawledPagesMap.keys(), `${origin}/`])
        );

        // Analyze homepage DOM for granular head/meta patches
        const $home = cheerio.load(homeHtml || '<html><head></head><body></body></html>');
        const homeTitle = $home('title').first().text().trim();
        const homeDesc = $home('meta[name="description"]').attr('content')?.trim() || '';
        const homeCanonical = $home('link[rel="canonical"]').attr('href')?.trim() || '';
        const homeRobots = $home('meta[name="robots"]').attr('content')?.trim() || '';
        const homeOgTitle = $home('meta[property="og:title"]').attr('content')?.trim() || '';
        const homeOgDesc = $home('meta[property="og:description"]').attr('content')?.trim() || '';
        const homeH1s = $home('h1').map((_, el) => $home(el).text().trim()).get().filter(Boolean);

        $home('script, style, noscript, svg').remove();
        const homeBodySample = $home('body').text().replace(/\s+/g, ' ').trim().slice(0, 3000);

        const diagnosticSnapshot = {
            url: normalizedUrl,
            origin,
            brandName: brand,
            totalDiscoveredPages: allDiscoveredUrls.length,
            crawledPagesCount: crawledPagesMap.size,
            sitemapFound,
            sitemapUrl,
            robotsTxtFound,
            llmsTxtFound,
            homepageState: {
                title: homeTitle || 'MISSING',
                titleLength: homeTitle.length,
                metaDescription: homeDesc || 'MISSING',
                metaDescLength: homeDesc.length,
                canonical: homeCanonical || 'MISSING',
                metaRobots: homeRobots || 'Not explicitly set',
                openGraph: { ogTitle: homeOgTitle || 'MISSING', ogDesc: homeOgDesc || 'MISSING' },
                h1Tags: homeH1s,
            },
            siteWideDefects: {
                missingTitlesCount: missingTitles.length,
                sampleMissingTitles: missingTitles,
                missingDescriptionsCount: missingDescriptions.length,
                sampleMissingDescriptions: missingDescriptions,
                missingCanonicalsCount: missingCanonicals.length,
                sampleMissingCanonicals: missingCanonicals,
                missingH1sCount: missingH1s.length,
                imagesMissingAltCount: missingAltImages.length,
                sampleImagesMissingAlt: missingAltImages.slice(0, 6),
                existingSchemasCount: existingSchemas.length,
            },
            discoveredUrlsSample: allDiscoveredUrls.slice(0, 35),
            contentSample: homeBodySample,
        };

        // =========================================================================
        // STEP 2: Gemini Generation (gemini-3.8-flash with 503 fallback)
        // =========================================================================
        const promptText = `You are a Principal Technical SEO, AEO & GEO Autonomous Engineer.
Analyze this deep-crawl diagnostic snapshot and generate complete, production-grade files and code patches for the brand "${brand}" (${normalizedUrl}).

Diagnostic Snapshot:
${JSON.stringify(diagnosticSnapshot, null, 2)}

Requirements for Output:
1. Generate specific "patches" addressing every defect:
   - Optimized <title> (50-60 chars) including primary value proposition & brand.
   - Compelling <meta name="description"> (145-160 chars) optimized for SERP click-through and LLM context.
   - Self-referencing canonical URL tag.
   - Open Graph (og:title, og:description, og:url, og:type="website").
   - <h1> hierarchy fixes.
   - Descriptive image alt tags.
   - Missing /llms.txt and /robots.txt.
   - Valid JSON-LD schema combining Organization (with name, url, logo, description), WebSite (with SearchAction if applicable), and Service/FAQPage.
2. "headPatchBlock": Consolidated drop-in HTML <head> snippet with title, meta tags, canonical, Open Graph, and JSON-LD schema ready to paste.
3. "nextjsMetadataPatch": Next.js App Router metadata object code (\`export const metadata = { ... }\`).
4. "llmsTxtContent": Complete, valid Markdown /llms.txt file following https://llmstxt.org specification (# Brand Name, > Summary, ## Core Services, ## Documentation/Pages with markdown links).
5. "robotsTxtContent": Optimized /robots.txt allowing Googlebot, OAI-SearchBot/GPTBot, PerplexityBot, ClaudeBot, and Google-Extended, while declaring Sitemap: ${origin}/sitemap.xml.
6. "sitemapXmlContent": Complete, valid XML sitemap with <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"> containing the discovered pages (up to 30 sample URLs with <loc>, <lastmod>, <changefreq>, <priority>).
7. "seoSchemaJsonContent": Valid standalone JSON string (without <script> tags) containing structured JSON-LD schema for the site.`;

        let generatedObject = null;
        let lastError = null;

        for (const modelId of MODELS) {
            try {
                const { object } = await generateObject({
                    model: google(modelId),
                    schema: FixerOutputSchema,
                    prompt: promptText,
                });
                generatedObject = object;
                break;
            } catch (err) {
                lastError = err;
                console.warn(`Model ${modelId} failed in tech-fixer, trying fallback...`, err?.message);
            }
        }

        if (!generatedObject) {
            throw lastError || new Error('Failed to generate technical SEO fixes with all configured models.');
        }

        // =========================================================================
        // STEP 3: GitHub REST API Integration (Staging Branch + Commits + Pending PR)
        // =========================================================================
        let prUrl = null;
        let prNumber = null;
        let branchName = null;
        const filesChanged = [];

        if (githubRepo && token) {
            try {
                const repoTrimmed = githubRepo.trim();
                const parts = repoTrimmed.split('/');
                if (parts.length === 2 && parts[0] && parts[1]) {
                    const [owner, repo] = parts;
                    const ghHeaders = {
                        Authorization: `Bearer ${token}`,
                        Accept: 'application/vnd.github+json',
                        'X-GitHub-Api-Version': '2022-11-28',
                        'User-Agent': 'TrifectaTechFixer/2.0',
                    };

                    // 1. Get repository details to discover default branch
                    const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
                        headers: ghHeaders,
                    });
                    if (repoRes.ok) {
                        const repoData = await repoRes.json();
                        const defaultBranch = repoData.default_branch || 'main';

                        // 2. Get latest commit SHA on default branch
                        const refRes = await fetch(
                            `https://api.github.com/repos/${owner}/${repo}/git/ref/heads/${defaultBranch}`,
                            { headers: ghHeaders }
                        );
                        if (refRes.ok) {
                            const refData = await refRes.json();
                            const baseCommitSha = refData.object.sha;

                            // 3. Get tree SHA of the base commit
                            const commitRes = await fetch(
                                `https://api.github.com/repos/${owner}/${repo}/git/commits/${baseCommitSha}`,
                                { headers: ghHeaders }
                            );
                            if (commitRes.ok) {
                                const commitData = await commitRes.json();
                                const baseTreeSha = commitData.tree.sha;

                                // Build TRIFECTA_FIX_REPORT.md
                                const fixReportMarkdown = `# Trifecta Technical SEO, AEO & GEO Optimization Report
**Target Site**: ${normalizedUrl}
**Brand**: ${brand}
**Generated Date**: ${new Date().toISOString()}
**Estimated Score Gain**: +${generatedObject.estimatedScoreBoost} pts

## Executive Summary
${generatedObject.summary}

## Diagnostic Findings Prior to Patching
- **Total Discovered Pages**: ${allDiscoveredUrls.length}
- **Pages Deep-Crawled**: ${crawledPagesMap.size}
- **XML Sitemap**: ${sitemapFound ? `Detected (${sitemapUrl})` : 'Missing (Generated new public/sitemap.xml)'}
- **Robots.txt**: ${robotsTxtFound ? 'Found' : 'Missing (Generated new public/robots.txt)'}
- **llms.txt**: ${llmsTxtFound ? 'Found' : 'Missing (Generated new public/llms.txt)'}
- **Missing Meta Descriptions**: ${missingDescriptions.length} pages
- **Missing Canonicals**: ${missingCanonicals.length} pages
- **Missing H1 Headings**: ${missingH1s.length} pages
- **Images Missing Alt Tags**: ${missingAltImages.length} images

## Production Files Included in this PR
1. \`public/llms.txt\` - Official llmstxt.org AI crawler manifest.
2. \`public/robots.txt\` - Optimized crawler permissions allowing AI and search engines.
3. \`public/sitemap.xml\` - XML sitemap indexing all reachable site pages.
4. \`public/seo-schema.json\` - JSON-LD Organization & WebSite structured data schema.
5. \`TRIFECTA_FIX_REPORT.md\` - Full audit report and change log.

## Granular Code Patches
${generatedObject.patches
                                    .map(
                                        (p) => `### [${p.severity.toUpperCase()}] ${p.category} — ${p.issueTitle}
**Target Location**: \`${p.targetLocation}\`
*${p.explanation}*

\`\`\`html
/* BEFORE */
${p.currentSnippet}

/* AFTER */
${p.fixedSnippet}
\`\`\`
`
                                    )
                                    .join('\n\n')}

---
*Generated by Trifecta SEO • AEO • GEO Command Center.*
`;

                                // 4. Create Git Tree with all 5 files
                                const treePayload = {
                                    base_tree: baseTreeSha,
                                    tree: [
                                        {
                                            path: 'public/llms.txt',
                                            mode: '100644',
                                            type: 'blob',
                                            content: generatedObject.llmsTxtContent,
                                        },
                                        {
                                            path: 'public/robots.txt',
                                            mode: '100644',
                                            type: 'blob',
                                            content: generatedObject.robotsTxtContent,
                                        },
                                        {
                                            path: 'public/sitemap.xml',
                                            mode: '100644',
                                            type: 'blob',
                                            content: generatedObject.sitemapXmlContent,
                                        },
                                        {
                                            path: 'public/seo-schema.json',
                                            mode: '100644',
                                            type: 'blob',
                                            content: generatedObject.seoSchemaJsonContent,
                                        },
                                        {
                                            path: 'TRIFECTA_FIX_REPORT.md',
                                            mode: '100644',
                                            type: 'blob',
                                            content: fixReportMarkdown,
                                        },
                                    ],
                                };

                                const createTreeRes = await fetch(
                                    `https://api.github.com/repos/${owner}/${repo}/git/trees`,
                                    {
                                        method: 'POST',
                                        headers: ghHeaders,
                                        body: JSON.stringify(treePayload),
                                    }
                                );

                                if (createTreeRes.ok) {
                                    const treeData = await createTreeRes.json();
                                    const newTreeSha = treeData.sha;

                                    // 5. Create Git Commit
                                    const commitMsg = `fix(seo): auto-patch technical SEO, AEO and GEO defects (+${generatedObject.estimatedScoreBoost} pts)\n\nAutomated patches generated by Trifecta Autonomous Tech Fixer for ${brand}.`;
                                    const createCommitRes = await fetch(
                                        `https://api.github.com/repos/${owner}/${repo}/git/commits`,
                                        {
                                            method: 'POST',
                                            headers: ghHeaders,
                                            body: JSON.stringify({
                                                message: commitMsg,
                                                tree: newTreeSha,
                                                parents: [baseCommitSha],
                                            }),
                                        }
                                    );

                                    if (createCommitRes.ok) {
                                        const newCommitData = await createCommitRes.json();
                                        const newCommitSha = newCommitData.sha;

                                        // 6. Create staging branch pointing to new commit
                                        const newBranch = `trifecta-auto-fix-${Date.now()}`;
                                        const createRefRes = await fetch(
                                            `https://api.github.com/repos/${owner}/${repo}/git/refs`,
                                            {
                                                method: 'POST',
                                                headers: ghHeaders,
                                                body: JSON.stringify({
                                                    ref: `refs/heads/${newBranch}`,
                                                    sha: newCommitSha,
                                                }),
                                            }
                                        );

                                        if (createRefRes.ok) {
                                            branchName = newBranch;
                                            filesChanged.push(
                                                'public/llms.txt',
                                                'public/robots.txt',
                                                'public/sitemap.xml',
                                                'public/seo-schema.json',
                                                'TRIFECTA_FIX_REPORT.md'
                                            );

                                            // 7. Open Pull Request against default branch
                                            const prBody = `## 🚀 Trifecta Autonomous Tech Fixer: Optimization Patches
**Target Website**: [${normalizedUrl}](${normalizedUrl})
**Estimated Score Gain**: **+${generatedObject.estimatedScoreBoost} pts**

### Executive Summary
${generatedObject.summary}

### Files Added / Updated in this PR:
- \`public/llms.txt\` - Machine-readable AI crawler manifest following llmstxt.org specification.
- \`public/robots.txt\` - Optimized crawler permissions allowing Googlebot & AI answer engines.
- \`public/sitemap.xml\` - Comprehensive XML sitemap covering all discovered internal URLs.
- \`public/seo-schema.json\` - Structured JSON-LD schema (Organization, WebSite).
- \`TRIFECTA_FIX_REPORT.md\` - Full audit report & granular Before/After patch diffs.

---
⚠️ **Human-in-the-Loop Approval Required**: Review the changes below. You can merge this PR directly on GitHub or approve deployment directly from the Trifecta Command Center.`;

                                            const prRes = await fetch(
                                                `https://api.github.com/repos/${owner}/${repo}/pulls`,
                                                {
                                                    method: 'POST',
                                                    headers: ghHeaders,
                                                    body: JSON.stringify({
                                                        title: `fix(seo): Trifecta AI Auto-Fix Patches (+${generatedObject.estimatedScoreBoost} pts)`,
                                                        head: newBranch,
                                                        base: defaultBranch,
                                                        body: prBody,
                                                    }),
                                                }
                                            );

                                            if (prRes.ok) {
                                                const prData = await prRes.json();
                                                prUrl = prData.html_url;
                                                prNumber = prData.number;
                                            } else {
                                                console.warn('Failed to open PR:', await prRes.text());
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            } catch (ghErr) {
                console.error('GitHub API PR workflow error:', ghErr);
            }
        }

        return NextResponse.json({
            url: normalizedUrl,
            brandName: brand,
            snapshot: diagnosticSnapshot,
            githubRepo: githubRepo || null,
            prUrl,
            prNumber,
            branchName,
            filesChanged,
            ...generatedObject,
        });
    } catch (err) {
        console.error('Tech Fixer error:', err);
        return NextResponse.json(
            { error: err.message || 'Automated Technical SEO Fixer failed.' },
            { status: 500 }
        );
    }
}
