import { NextResponse } from 'next/server';
import { generateTextWithFallback, generateObjectWithFallback } from '@/lib/ai-provider';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

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

export async function POST(request) {
    try {
        const body = await request.json();
        const { domain, brandName, prompt } = body;
        const chosenProvider = (body.aiProvider || body.aiEngine || body.provider || 'auto').toString().trim().toLowerCase();

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

        // 1. Simulate a real user prompt against the LLM with automatic fallback using chosen provider
        const textResult = await generateTextWithFallback(
            { prompt },
            chosenProvider
        );
        const rawText = textResult?.text || textResult?.rawResponse || (typeof textResult === 'string' ? textResult : '');
        const usedModel = textResult?.modelUsed || chosenProvider;
        const providerUsed = textResult?.providerUsed || chosenProvider;

        // 2. Grade the LLM response for brand visibility, rank, sentiment, and competitors
        const { object: analysis } = await generateObjectWithFallback(
            {
                schema: evaluationSchema,
                prompt: `Evaluate the following AI assistant response for visibility of the brand "${brandName}" (domain: ${cleanDomain}).

User Prompt Asked: "${prompt}"

AI Assistant Response:
"""
${rawText}
"""

Determine whether "${brandName}" or "${cleanDomain}" was mentioned, its sentiment, its list position (if ranked), any URLs cited, and what competing brands appeared instead.`,
            },
            chosenProvider
        );

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

        // Always guarantee rawResponse is passed as requested
        const finalRawResponse =
            (typeof rawText === 'string' && rawText.trim().length > 0)
                ? rawText
                : (typeof textResult === 'object' ? JSON.stringify(textResult) : '') ||
                  (typeof analysis === 'object' ? JSON.stringify(analysis) : '') ||
                  '';

        const geoCheck = await prisma.geoCheck.create({
            data: {
                projectId: project.id,
                prompt,
                llmProvider: usedModel || providerUsed || chosenProvider,
                brandMentioned: Boolean(analysis.brandMentioned),
                sentiment: analysis.sentiment || 'neutral',
                citedUrls: Array.isArray(analysis.citedUrls) ? analysis.citedUrls : [],
                rawResponse: finalRawResponse,
            },
        });

        return NextResponse.json({
            geoCheck,
            analysis,
            modelUsed: usedModel,
            providerUsed,
            rawResponse: finalRawResponse,
        });
    } catch (error) {
        console.error('GEO Check Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to run GEO citation check' },
            { status: 500 }
        );
    }
}