import * as readline from "node:readline/promises";

import { CoreMessage, streamText } from "ai";

import { HttpsProxyAgent } from "https-proxy-agent";
import { createXai } from "@ai-sdk/xai";
import dotenv from "dotenv";
import fetch from "node-fetch";

const proxyUrl = "http://127.0.0.1:7890";
const agent = new HttpsProxyAgent(proxyUrl);

const fetchWithProxy = (input, init) => {
  return fetch(input, { ...init, agent });
};

const xai = createXai({
  apiKey: process.env.XAI_API_KEY,
  fetch: fetchWithProxy as any,
});

dotenv.config();

const terminal = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const messages: CoreMessage[] = [];

async function main() {
  while (true) {
    const userInput = await terminal.question("You: ");

    messages.push({ role: "user", content: userInput });

    const result = streamText({
      model: xai("grok-2-1212"),
      messages,
    });

    let fullResponse = "";
    process.stdout.write("\nAssistant: ");
    for await (const delta of result.textStream) {
      fullResponse += delta;
      process.stdout.write(delta);
    }
    process.stdout.write("\n\n");

    messages.push({ role: "assistant", content: fullResponse });
  }
}

main().catch(console.error);
