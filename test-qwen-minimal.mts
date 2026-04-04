import OpenAI from "openai";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

const authPath = path.join(os.homedir(), ".claudecode", "qwen-auth.json");
const authData = JSON.parse(fs.readFileSync(authPath, "utf8"));
const token = authData.tokens.accessToken;

console.log("Testing with MINIMAL request (no tools, simple message)");

// Try both native fetch and undici  
const client = new OpenAI({
  apiKey: token,
  baseURL: "https://portal.qwen.ai/v1",
  defaultHeaders: {
    "User-Agent": "qwen-code/0.14.0"  // Use qwen-code user agent
  }
});

async function test() {
  try {
    const response = await client.chat.completions.create({
      model: "coder-model",
      messages: [{ role: "user", content: "hi" }],
      // No tools, no extra params
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
