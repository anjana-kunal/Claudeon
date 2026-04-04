import OpenAI from "openai";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { Agent } from "undici";

const authPath = path.join(os.homedir(), ".claudecode", "qwen-auth.json");
const authData = JSON.parse(fs.readFileSync(authPath, "utf8"));
const token = authData.tokens.accessToken;

console.log("Testing with undici Agent like qwen-code...");

const dispatcher = new Agent({
  headersTimeout: 0,
  bodyTimeout: 0
});

const client = new OpenAI({
  apiKey: token,
  baseURL: "https://portal.qwen.ai/v1",
  fetchOptions: { dispatcher }
});

async function test() {
  try {
    const response = await client.chat.completions.create({
      model: "coder-model",
      messages: [{ role: "user", content: "hi" }],
    });
    console.log("SUCCESS:", response.choices[0].message.content);
  } catch (error) {
    console.error("FAILED:", error.message);
    if (error.error) {
      console.error("Details:", JSON.stringify(error.error));
    }
  }
}

test();
