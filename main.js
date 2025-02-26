import * as readline from "node:readline/promises";

import { HttpsProxyAgent } from "https-proxy-agent";
import { XAI_API } from "./const.js";
import { createOpenAI } from "@ai-sdk/openai";
import { createXai } from "@ai-sdk/xai";
import fetch from "node-fetch";
import { generateText } from "ai";

const proxyUrl = "http://127.0.0.1:7890";
const agent = new HttpsProxyAgent(proxyUrl);

const fetchWithProxy = (input, init) => {
  return fetch(input, { ...init, agent });
};

const terminal = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const openai = createOpenAI({
  // custom settings, e.g.
  compatibility: "strict", // strict mode, enable when using the OpenAI API
  baseURL: "https://api.aiproxy.io/v1",
  apiKey: process.env.OPENAI_API_KEY,
});

const xai = createXai({
  apiKey: XAI_API,
  fetch: fetchWithProxy,
});

async function main() {
  while (true) {
    const userInput = await terminal.question("You: ");
    const { text } = await generateText({
      // model: openai("gpt-4o"),
      model: xai("grok-2-1212"),
      prompt: userInput,
    });

    console.log("Assistant:", text);
  }
}

main().catch(console.error);
