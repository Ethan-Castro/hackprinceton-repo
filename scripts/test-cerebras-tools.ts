// Load environment variables from .env.local (Next.js way)
import { loadEnvConfig } from "@next/env";

const projectDir = process.cwd();
loadEnvConfig(projectDir);

import { createChatAgent } from "@/lib/agents/chat-agent";

async function testCerebrasWithTools() {
  console.log("🧪 Testing Cerebras Models WITH Tools\n");
  console.log("=".repeat(60));

  // Models confirmed to support tool calling with streaming
  const cerebraModels = [
    "cerebras/zai-glm-4.6",
    "cerebras/llama-3.3-70b",
    "cerebras/gpt-oss-120b",
  ];

  for (const modelId of cerebraModels) {
    console.log(`\n📍 Testing ${modelId}...`);
    const startTime = Date.now();

    try {
      // Create agent with tools
      const { agent } = createChatAgent(modelId);

      // Stream a simple message with tools available
      const result = agent.stream({
        messages: [
          {
            role: "user",
            content: "Say hello briefly.",
          },
        ],
      });

      // Wait for the response to complete
      const response = await result.response;
      const responseTime = Date.now() - startTime;

      console.log(`✅ SUCCESS (${responseTime}ms)`);
      console.log(`   Response received successfully with tools enabled`);
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      console.log(`❌ FAILED (${responseTime}ms)`);
      const errorMsg = error.message || String(error);
      console.log(`   Error: ${errorMsg}`);

      // Check if it's the response_format error
      if (errorMsg.includes("Invalid fields for schema") || errorMsg.includes("response_format")) {
        console.log(`   ⚠️  This is the response_format error - wrapper may not be working`);
      }
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("✅ Test complete!\n");
}

testCerebrasWithTools().catch((error) => {
  console.error("Unexpected error:", error);
  process.exitCode = 1;
});
