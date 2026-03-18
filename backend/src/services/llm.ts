// import "../env";
// import OpenAI from "openai";
// import { LlmActionSchema } from "../types/llmAction";
// import { buildPrompt } from "./promptBuilder";
// import { assertNodeFetchSupport, getRequiredEnv } from "../env";

// let client: OpenAI | null = null;

// function getClient() {
// 	assertNodeFetchSupport();
// 	getRequiredEnv("OPENAI_API_KEY");

// 	if (!client) {
// 		client = new OpenAI();
// 	}

// 	return client;
// }

// export async function interpretMessage(params: {
// 	userMessage: string;
// 	tasks: Array<{ id: string; title: string; status: string }>;
// 	recentMessages: Array<{ role: string; content: string }>;
// }) {
// 	const prompt = buildPrompt(params);

// 	const response = await getClient().chat.completions.create({
// 		model: process.env.MODEL_NAME || "gpt-4o-mini",
// 		temperature: 0,
// 		messages: [
// 			{
// 				role: "system",
// 				content: "You are a precise task operation interpreter.",
// 			},
// 			{
// 				role: "user",
// 				content: prompt,
// 			},
// 		],
// 		response_format: { type: "json_object" },
// 	});

// 	const content = response.choices[0]?.message?.content ?? "{}";
// 	const parsed = JSON.parse(content);

// 	return LlmActionSchema.parse(parsed);
// }

import OpenAI from "openai";
import { LlmActionSchema } from "../types/llmAction";
import { buildPrompt } from "./promptBuilder";

const client = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
	baseURL: process.env.OPENAI_BASE_URL,
});

export async function interpretMessage(params: {
	userMessage: string;
	tasks: Array<{ id: string; title: string; status: string }>;
	recentMessages: Array<{ role: string; content: string }>;
}) {
	const prompt = buildPrompt(params);

	const response = await client.chat.completions.create({
		model: process.env.MODEL_NAME || "gemini-2.5-flash",
		messages: [
			{
				role: "system",
				content:
					"You are a precise task operation interpreter. Return valid JSON only.",
			},
			{
				role: "user",
				content: prompt,
			},
		],
		temperature: 0,
	});

	const content = response.choices[0]?.message?.content?.trim() || "{}";
	console.log("Gemini raw output:", content);

	const parsed = JSON.parse(content);
	return LlmActionSchema.parse(parsed);
}
