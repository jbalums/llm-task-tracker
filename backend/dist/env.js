"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRequiredEnv = getRequiredEnv;
exports.assertNodeFetchSupport = assertNodeFetchSupport;
// @ts-nocheck
const dotenv_1 = require("dotenv");
const node_url_1 = require("node:url");
(0, dotenv_1.config)({
    path: (0, node_url_1.fileURLToPath)(new URL("../.env", import.meta.url)),
});
function getRequiredEnv(name) {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing ${name}. Add it to backend/.env before starting the API.`);
    }
    return value;
}
function assertNodeFetchSupport() {
    if (typeof globalThis.fetch !== "function") {
        throw new Error(`Chat requires Node 18+ because the OpenAI SDK needs global fetch. Current runtime: ${process.version}.`);
    }
}
