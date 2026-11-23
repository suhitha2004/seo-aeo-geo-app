import { NextResponse } from 'next/server';
import { generateText, generateObject } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const google = createGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY,
});

const MODELS = ['gemini-2.5-flash-lite', 'gemini-2.5-flash'];

const evaluationSchema = z.object({
    brandMentioned: z
        .boolean()
        .describe('True if the target brand or domain was explicitly mentioned or recommended.'),
    sentiment: z
        .enum(['positive', 'neutral', 'negative'])
        .describe('Overall framing of the brand in the AI response (use neutral if not mentioned).'),
    rankPosition: z
        .number()
        .nullable()
        .describe('1-based rank order if listed among recommendations, otherwise null.'),
    citedUrls: z
        .array(z.string())
        .describe('Any URLs or domains referenced in the answer.'),
    competitorsMentioned: z
        .array(z.string())
        .describe('Other competing brands or companies mentioned in the response.'),
    visibilityInsight: z
        .string()
        .describe('1–2 sentence actionable takeaway explaining why the brand was or was not cited.'),
});

async function runWithFallback(fn) {
    let lastError = null;
    for (const modelId of MODELS) {
        try {
            const result = await fn(modelId);
            return { result, modelId };
        } catch (err) {
            lastError = err;
            console.warn(`Model ${modelId} failed in geo-check, trying fallback...`, err?.message);
        }
    }
    throw lastError;
}

export async function POST(request) {
    try {
        const { domain, brandName, prompt } = await request.json();

        if (!domain || !brandName || !prompt) {
            return NextResponse.json(
                { error: 'Domain, brandName, and prompt are all required.' },
                { status: 400 }
            );
        }

        const cleanDomain = domain
            .replace(/^https?:\/\//, '')
            .replace(/^www\./, '')
            .split('/')[0];

        // 1. Simulate a real user prompt against the LLM (with automatic model fallback)
        const { result: textResult, modelId: usedModel } = await runWithFallback((modelId) =>
            generateText({
                model: google(modelId),
                prompt: prompt,
            })
        );
        const rawResponse = textResult.text;

        // 2. Grade the LLM response for brand visibility, rank, sentiment, and competitors
        const { result: objectResult } = await runWithFallback((modelId) =>
            generateObject({
                model: google(modelId),
                schema: evaluationSchema,
                prompt: `Evaluate the following AI assistant response for visibility of the brand "${brandName}" (domain: ${cleanDomain}).

User Prompt Asked: "${prompt}"

AI Assistant Response:
"""
${rawResponse}
"""

Determine whether "${brandName}" or "${cleanDomain}" was mentioned, its sentiment, its list position (if ranked), any URLs cited, and what competing brands appeared instead.`,
            })
        );
        const analysis = objectResult.object;

        // 3. Ensure Project exists and save the GeoCheck record in Neon PostgreSQL
        const project = await prisma.project.upsert({
            where: { domain: cleanDomain },
            update: { brandName },
            create: {
                name: brandName,
                domain: cleanDomain,
                brandName,
            },
        });

        const geoCheck = await prisma.geoCheck.create({
            data: {
                projectId: project.id,
                prompt,
                llmProvider: usedModel,
                brandMentioned: analysis.brandMentioned,
                sentiment: analysis.sentiment,
                citedUrls: analysis.citedUrls,
                rawResponse,
            },
        });

        return NextResponse.json({
            geoCheck,
            analysis,
            modelUsed: usedModel,
        });
    } catch (error) {
        console.error('GEO Check Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to run GEO citation check' },
            { status: 500 }
        );
    }
}