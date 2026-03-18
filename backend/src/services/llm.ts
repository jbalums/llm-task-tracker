import OpenAI from "openai";
import { LlmActionSchema } from "../types/llmAction";
import { buildPrompt } from "./promptBuilder";

const client = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
	baseURL: process.env.OPENAI_BASE_URL || undefined,
});

export async function interpretMessage(params: {
	userMessage: string;
	tasks: Array<{ id: string; title: string; status: string }>;
	recentMessages: Array<{ role: string; content: string }>;
}) {
	const prompt = buildPrompt(params);

	const response = await client.chat.completions.create({
		model: process.env.MODEL_NAME || "gpt-4o-mini",
		temperature: 0,
		messages: [
			{
				role: "system",
				content: "You are a precise task operation interpreter.",
			},
			{
				role: "user",
				content: prompt,
			},
		],
		response_format: { type: "json_object" },
	});

	const content = response.choices[0]?.message?.content ?? "{}";
	const parsed = JSON.parse(content);

	return LlmActionSchema.parse(parsed);
}
