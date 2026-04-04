import OpenAI from "openai";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

// Read qwen-code's credentials (that we know work)
const qwenCredsPath = path.join(os.homedir(), ".qwen", "oauth_creds.json");
const qwenCreds = JSON.parse(fs.readFileSync(qwenCredsPath, "utf8"));
const token = qwenCreds.access_token;
const resourceUrl = qwenCreds.resource_url;

console.log("Using qwen-code credentials:");
console.log("  Token (first 30):", token.substring(0, 30));
console.log("  Resource URL:", resourceUrl);

const endpoint = `https://${resourceUrl}/v1`;
console.log("  Full endpoint:", endpoint);

// Make request with exact same format qwen-code uses
const client = new OpenAI({
  apiKey: token,
  baseURL: endpoint,
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
    // Log the full request that was sent
    console.error("Request info (if available):", error.request?.options);
  }
}

test();
