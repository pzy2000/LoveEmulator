import OpenAI from 'openai';
import { parse } from 'yaml';

interface AIConfig {
    llm: {
        service: string;
        model1: string;
        model2: string;
        model3: string;
        model4?: string;
        model5?: string;
        openai_api_key: string;
        openai_base_url: string;
    };
}

class LLMService {
    private client: OpenAI | null = null;
    private config: AIConfig | null = null;
    private models: string[] = [];

    async initialize() {
        try {
            const response = await fetch('/ai.yaml');
            const text = await response.text();
            this.config = parse(text) as AIConfig;

            if (this.config.llm) {
                // Use local proxy to avoid CORS
                this.client = new OpenAI({
                    apiKey: this.config.llm.openai_api_key,
                    baseURL: window.location.origin + '/api/proxy/v1',
                    dangerouslyAllowBrowser: true
                });
                this.models = [
                    this.config.llm.model1,
                    this.config.llm.model2,
                    this.config.llm.model3,
                    this.config.llm.model4,
                    this.config.llm.model5
                ].filter(Boolean) as string[];

                // Optional: benchmark on startup (can cause 502 if API is unstable)
                // Uncomment next line to enable speed testing
                await this.benchmarkModels();
                console.log("LLM Service initialized with models:", this.models);
            }
        } catch (error) {
            console.error("Failed to load AI config:", error);
        }
    }

    // @ts-ignore - Optional benchmark method, can be enabled by uncommenting in initialize()
    private async benchmarkModels() {
        if (!this.client || this.models.length === 0) return;

        console.log("Starting LLM speed test...");
        const latencies: Record<string, number> = {};

        // Test each model in parallel
        await Promise.all(this.models.map(async (model) => {
            const start = Date.now();
            try {
                // Determine completion parameter based on model type
                const isClaude = model.toLowerCase().includes('claude');
                const isGemini = model.toLowerCase().includes('gemini');
                const requestParams: any = {
                    model: model,
                    messages: [{ role: 'user', content: 'Hi' }],
                };

                if (isClaude || isGemini) {
                    requestParams.max_tokens = 5;
                } else {
                    requestParams.max_completion_tokens = 5;
                }

                await this.client!.chat.completions.create(requestParams);
                const duration = Date.now() - start;
                latencies[model] = duration;
                console.log(`Model ${model} latency: ${duration}ms`);
            } catch (e) {
                console.warn(`Model ${model} failed benchmark:`, e);
                latencies[model] = 999999; // Penalty for failure
            }
        }));

        // Sort models by latency
        this.models.sort((a, b) => latencies[a] - latencies[b]);
        console.log("Models sorted by speed:", this.models);
    }

    private lastError: string | null = null;

    getLastError(): string | null {
        return this.lastError;
    }

    async generateCompletion(messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[]): Promise<string | null> {
        if (!this.client || this.models.length === 0) {
            this.lastError = "LLM Service not initialized or no models configured.";
            console.warn(this.lastError);
            return null;
        }

        this.lastError = null;

        for (const model of this.models) {
            // Try each model with 1 retry
            for (let attempt = 0; attempt < 2; attempt++) {
                try {
                    console.log(`Attempting generation with model: ${model} (attempt ${attempt + 1}/2)`);

                    // Claude models use max_tokens instead of max_completion_tokens
                    const isClaude = model.toLowerCase().includes('claude');
                    const isGemini = model.toLowerCase().includes('gemini');
                    const requestParams: any = {
                        model: model,
                        messages: messages,
                        temperature: 1.0, // High randomness for diverse outputs
                    };

                    if (isClaude) {
                        requestParams.max_tokens = 1000;
                    } else if (isGemini) {
                        requestParams.max_tokens = 1000;
                    } else {
                        requestParams.max_completion_tokens = 1000;
                    }

                    const completion = await this.withTimeout(
                        this.client.chat.completions.create(requestParams),
                        20000 // 20 seconds timeout
                    );

                    const result = completion.choices[0]?.message?.content || null;
                    if (result) {
                        console.log(`✓ Model ${model} succeeded`);
                        return result;
                    }
                } catch (error: any) {
                    const errorMsg = `Model ${model} attempt ${attempt + 1} failed: ${error.message}`;
                    console.warn(errorMsg);
                    this.lastError = errorMsg;

                    // If this was the first attempt, retry immediately
                    if (attempt === 0) {
                        console.log(`Retrying ${model}...`);
                        await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms before retry
                        continue;
                    }
                    // Otherwise move to next model
                    break;
                }
            }
        }

        if (!this.lastError) this.lastError = "All models failed (unknown error).";
        console.error("All models exhausted. Last error:", this.lastError);
        return null;
    }

    async generateJSON<T>(messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[]): Promise<T | null> {
        const content = await this.generateCompletion([
            { role: 'system', content: 'You must output valid JSON only.' },
            ...messages
        ]);

        if (!content) return null;

        try {
            // Basic cleanup for markdown code blocks if present
            const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
            return JSON.parse(cleanContent) as T;
        } catch (e) {
            console.error("Failed to parse JSON response:", e);
            return null;
        }
    }

    private withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                reject(new Error(`Timeout after ${ms}ms`));
            }, ms);

            promise
                .then(value => {
                    clearTimeout(timer);
                    resolve(value);
                })
                .catch(reason => {
                    clearTimeout(timer);
                    reject(reason);
                });
        });
    }
}

export const llmService = new LLMService();
