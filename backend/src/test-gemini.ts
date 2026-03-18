import "dotenv/config";
import OpenAI from "openai";

const client = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
	baseURL: process.env.OPENAI_BASE_URL,
});

async function main() {
	const response = await client.chat.completions.create({
		model: process.env.MODEL_NAME || "gemini-2.5-flash",
		messages: [
			{
				role: "user",
				content: 'Return exactly this JSON: {"ok":true}',
			},
		],
		temperature: 0,
	});

	console.log(response.choices[0]?.message?.content);
}

main().catch(console.error);
