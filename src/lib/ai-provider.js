import { generateText, generateObject } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGroq } from '@ai-sdk/groq';

function isNonEmptyString(val) {
    return typeof val === 'string' && val.trim().length > 6 && !val.toLowerCase().includes('your_');
}

/**
 * Returns instantiated SDK provider clients for all configured environment variables.
 */
export function getProviderClients() {
    const clients = {};

    const googleKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;
    if (isNonEmptyString(googleKey)) {
        clients.google = createGoogleGenerativeAI({ apiKey: googleKey.trim() });
    }

    const openaiKey = process.env.OPENAI_API_KEY;
    if (isNonEmptyString(openaiKey)) {
        clients.openai = createOpenAI({ apiKey: openaiKey.trim() });
    }

    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    if (isNonEmptyString(anthropicKey)) {
        clients.anthropic = createAnthropic({ apiKey: anthropicKey.trim() });
    }

    const groqKey = process.env.GROQ_API_KEY;
    if (isNonEmptyString(groqKey)) {
        clients.groq = createGroq({ apiKey: groqKey.trim() });
    }

    const openrouterKey = process.env.OPENROUTER_API_KEY;
    if (isNonEmptyString(openrouterKey)) {
        clients.openrouter = createOpenAI({
            baseURL: 'https://openrouter.ai/api/v1',
            apiKey: openrouterKey.trim(),
        });
    }

    const mistralKey = process.env.MISTRAL_API_KEY;
    if (isNonEmptyString(mistralKey)) {
        clients.mistral = createOpenAI({
            baseURL: 'https://api.mistral.ai/v1',
            apiKey: mistralKey.trim(),
        });
    }

    return clients;
}

/**
 * Returns an array of available provider IDs based on configured API keys in process.env.
 */
export function getConfiguredProviders() {
    const clients = getProviderClients();
    return Object.keys(clients);
}

/**
 * Builds an ordered list of candidate model instances prioritizing the preferred provider.
 * Automatically cascades through fallback models and providers upon 503/429/overload errors.
 */
export function getCandidateModels(preferredProvider = 'auto') {
    const clients = getProviderClients();

    const providerModelSpecs = {
        google: [
            { provider: 'google', modelId: 'gemini-3.8-flash', label: 'Gemini 3.8 Flash' },
            { provider: 'google', modelId: 'gemini-3.5-flash-lite', label: 'Gemini 3.5 Flash Lite' },
            { provider: 'google', modelId: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
            { provider: 'google', modelId: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
        ],
        openai: [
            { provider: 'openai', modelId: 'gpt-4o-mini', label: 'GPT-4o Mini' },
            { provider: 'openai', modelId: 'gpt-4o', label: 'GPT-4o' },
        ],
        anthropic: [
            { provider: 'anthropic', modelId: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6' },
            { provider: 'anthropic', modelId: 'claude-3-5-sonnet-latest', label: 'Claude 3.5 Sonnet' },
            { provider: 'anthropic', modelId: 'claude-3-5-haiku-latest', label: 'Claude 3.5 Haiku' },
        ],
        groq: [
            { provider: 'groq', modelId: 'openai/gpt-oss-120b', label: 'GPT-OSS 120B (Groq)' },
            { provider: 'groq', modelId: 'openai/gpt-oss-20b', label: 'GPT-OSS 20B (Groq)' },
        ],
        openrouter: [
            { provider: 'openrouter', modelId: 'openrouter/free', label: 'OpenRouter Free Router' },
        ],
        mistral: [
            { provider: 'mistral', modelId: 'mistral-small-latest', label: 'Mistral Small (Free)' },
        ],
    };

    // Prioritized provider ordering: google -> groq -> openrouter -> mistral
    let order = ['google', 'groq', 'openrouter', 'mistral', 'openai', 'anthropic'];
    const normPreferred = (preferredProvider || 'auto').toLowerCase();

    if (normPreferred !== 'auto' && providerModelSpecs[normPreferred]) {
        order = [normPreferred, ...order.filter((p) => p !== normPreferred)];
    }

    const candidates = [];
    for (const providerName of order) {
        const client = clients[providerName];
        if (client) {
            const specs = providerModelSpecs[providerName] || [];
            for (const spec of specs) {
                try {
                    candidates.push({
                        provider: spec.provider,
                        modelId: spec.modelId,
                        label: spec.label,
                        modelInstance: client(spec.modelId),
                    });
                } catch { }
            }
        }
    }

    return candidates;
}

/**
 * Resilient generateText wrapper that catches 503/429/overload errors and automatically
 * falls back to the next available model/provider.
 */
export async function generateTextWithFallback(options, preferredProvider = 'auto') {
    const candidates = getCandidateModels(preferredProvider);

    if (candidates.length === 0) {
        throw new Error(
            'No AI providers configured. Please add an API key (GEMINI_API_KEY, GROQ_API_KEY, OPENROUTER_API_KEY, MISTRAL_API_KEY, OPENAI_API_KEY, or ANTHROPIC_API_KEY) in .env.'
        );
    }

    let lastError = null;
    for (const candidate of candidates) {
        try {
            const result = await generateText({
                ...options,
                model: candidate.modelInstance,
            });

            return {
                ...result,
                modelUsed: candidate.modelId,
                providerUsed: candidate.provider,
            };
        } catch (err) {
            lastError = err;
            console.warn(
                `[AI Fallback] ${candidate.provider} (${candidate.modelId}) failed: ${err?.message || err}. Trying next fallback...`
            );
        }
    }

    throw lastError || new Error('All configured AI providers and models failed.');
}

/**
 * Resilient generateObject wrapper that catches 503/429/overload errors and automatically
 * falls back to the next available model/provider.
 */
export async function generateObjectWithFallback(options, preferredProvider = 'auto') {
    const candidates = getCandidateModels(preferredProvider);

    if (candidates.length === 0) {
        throw new Error(
            'No AI providers configured. Please add an API key (GEMINI_API_KEY, GROQ_API_KEY, OPENROUTER_API_KEY, MISTRAL_API_KEY, OPENAI_API_KEY, or ANTHROPIC_API_KEY) in .env.'
        );
    }

    let lastError = null;
    for (const candidate of candidates) {
        try {
            const result = await generateObject({
                ...options,
                model: candidate.modelInstance,
            });

            return {
                ...result,
                modelUsed: candidate.modelId,
                providerUsed: candidate.provider,
            };
        } catch (err) {
            lastError = err;
            console.warn(
                `[AI Fallback] ${candidate.provider} (${candidate.modelId}) failed: ${err?.message || err}. Trying next fallback...`
            );
        }
    }

    throw lastError || new Error('All configured AI providers and models failed.');
}
