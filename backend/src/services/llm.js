"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.interpretMessage = interpretMessage;
const openai_1 = __importDefault(require("openai"));
const llmAction_1 = require("../types/llmAction");
const promptBuilder_1 = require("./promptBuilder");
const client = new openai_1.default();
async function interpretMessage(params) {
    const prompt = (0, promptBuilder_1.buildPrompt)(params);
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
    return llmAction_1.LlmActionSchema.parse(parsed);
}
//# sourceMappingURL=llm.js.map