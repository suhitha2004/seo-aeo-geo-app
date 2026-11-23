import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { generateObject } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { z } from 'zod';

const google = createGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY,
});

const MODELS = ['gemini-2.5-flash-lite', 'gemini-2.5-flash'];

const BROWSER_HEADERS = {
    'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
};

const fixSchema = z.object({
    llmsTxt: z
        .string()
        .describe(
            'A complete, valid llms.txt file formatted in clean Markdown following the llmstxt.org specification (# Brand Name, > Summary, ## Core Services/Pages with links and descriptions).'
        ),
    jsonLdSchema: z
        .string()
        .describe(
            'Valid JSON-LD structured data (without <script> wrapper tags) combining Organization and FAQPage schema tailored to the website content.'
        ),
    suggestedFaqHeadings: z
        .array(z.string())
        .describe('3 to 5 question-based H2/H3 headings the site should add for AEO Featured Snippets.'),
    citabilitySnippets: z
        .array(
            z.object({
                questionHeading: z.string().describe('Target H2 question heading.'),
                answerFirstParagraph: z
                    .string()
                    .describe(
                        'A standalone 45-60 word answer-first summary paragraph written in clear, factual third-person prose optimized for direct LLM citation and Featured Snippets.'
                    ),
            })
        )
        .describe('2 to 3 ready-to-publish Answer-First content blocks tailored to the brand.'),
});

export async function POST(request) {
    try {
        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.includes('your_gemini')) {
            return NextResponse.json(
                { error: 'Please add a valid GEMINI_API_KEY to your .env file and restart the server.' },
                { status: 400 }
            );
        }

        const { url, brandName } = await request.json();
        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        const parsedUrl = new URL(url.startsWith('http') ? url : `https://${url}`);
        const pageRes = await fetch(parsedUrl.href, {
            headers: BROWSER_HEADERS,
        });

        if (!pageRes.ok) {
            return NextResponse.json({ error: `Could not fetch ${parsedUrl.href}` }, { status: 422 });
        }

        const html = await pageRes.text();
        const $ = cheerio.load(html);

        // Extract clean page context for Gemini
        const title = $('title').text().trim();
        const description = $('meta[name="description"]').attr('content')?.trim() || '';
        const headings = $('h1, h2, h3')
            .map((_, el) => $(el).text().trim())
            .get()
            .slice(0, 15)
            .join(' | ');
        const links = $('a[href]')
            .map((_, el) => `${$(el).text().trim()} (${$(el).attr('href')})`)
            .get()
            .filter((txt) => txt.length > 5 && txt.length < 80)
            .slice(0, 15)
            .join(', ');
        const bodySnippet = $('body').text().replace(/\s+/g, ' ').trim().slice(0, 2500);

        const promptText = `You are an expert AEO (Answer Engine Optimization) and GEO (Generative Engine Optimization) engineer.
Analyze this website and generate ready-to-deploy optimization assets:

URL: ${parsedUrl.href}
Brand Name: ${brandName || title}
Title: ${title}
Meta Description: ${description}
Key Headings: ${headings}
Navigation/Internal Links: ${links}
Page Content Excerpt: ${bodySnippet}

Generate:
1. A clean, accurate /llms.txt file following the official Markdown format (# Title, > Blockquote summary, ## Sections with bulleted links and concise descriptions).
2. A valid JSON-LD schema object (with "@context": "https://schema.org") including Organization and relevant FAQPage questions/answers derived from the site's actual services.
3. 4 question-based H2 headings to improve Answer Engine visibility.
4. 3 "Answer-First" citability blocks (a question heading paired with a 45-60 word standalone, factual third-person paragraph that directly answers the query without marketing fluff so LLMs and Featured Snippets quote it verbatim).`;

        let generatedObject = null;
        let usedModel = MODELS[0];
        let lastError = null;

        for (const modelId of MODELS) {
            try {
                const { object } = await generateObject({
                    model: google(modelId),
                    schema: fixSchema,
                    prompt: promptText,
                });
                generatedObject = object;
                usedModel = modelId;
                break;
            } catch (err) {
                lastError = err;
                console.warn(`Model ${modelId} failed in generate-fixes, trying fallback...`, err?.message);
            }
        }

        if (!generatedObject) {
            throw lastError;
        }

        return NextResponse.json({ fixes: generatedObject, modelUsed: usedModel });
    } catch (error) {
        console.error('Fix Generator Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to generate AI fixes' },
            { status: 500 }
        );
    }
}