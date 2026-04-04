import OpenAI from "openai";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

const authPath = path.join(os.homedir(), ".claudecode", "qwen-auth.json");
const authData = JSON.parse(fs.readFileSync(authPath, "utf8"));
const token = authData.tokens.accessToken;

console.log("Token (first 30):", token.substring(0, 30) + "...");
console.log("Using portal.qwen.ai/v1...");

const client = new OpenAI({
  apiKey: token,
  baseURL: "https://portal.qwen.ai/v1",
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
    if (error.response) {
      console.error("Response:", JSON.stringify(error.response));
    }
  }
}

test();
