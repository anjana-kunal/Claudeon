import OpenAI from "openai";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

const qwenCredsPath = path.join(os.homedir(), ".qwen", "oauth_creds.json");
const qwenCreds = JSON.parse(fs.readFileSync(qwenCredsPath, "utf8"));
const token = qwenCreds.access_token;

console.log("Testing with QwenCode User-Agent...");

const client = new OpenAI({
  apiKey: token,
  baseURL: "https://portal.qwen.ai/v1",
  defaultHeaders: {
    "User-Agent": "QwenCode/0.14.0 (win32; x64)"
  }
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
  }
}

test();
