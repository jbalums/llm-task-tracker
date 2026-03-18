"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const openai_1 = __importDefault(require("openai"));
const client = new openai_1.default({
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
