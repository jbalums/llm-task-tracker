import { config as loadEnv } from "dotenv";
import { fileURLToPath } from "node:url";

loadEnv({
	path: fileURLToPath(new URL("../.env", import.meta.url)),
});

export function getRequiredEnv(name: string) {
	const value = process.env[name];

	if (!value) {
		throw new Error(
			`Missing ${name}. Add it to backend/.env before starting the API.`,
		);
	}

	return value;
}

export function assertNodeFetchSupport() {
	if (typeof globalThis.fetch !== "function") {
		throw new Error(
			`Chat requires Node 18+ because the OpenAI SDK needs global fetch. Current runtime: ${process.version}.`,
		);
	}
}
