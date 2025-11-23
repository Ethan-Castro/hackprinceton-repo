// Load environment variables
import { loadEnvConfig } from "@next/env";
const projectDir = process.cwd();
loadEnvConfig(projectDir);

import { createChatAgent } from "@/lib/agents/chat-agent";
import { CEREBRAS_MODELS } from "@/lib/constants";

async function testCerebrasModels() {
  console.log("🧪 Testing Final Cerebras Models WITH Tools\n");
  console.log("=".repeat(60));
  console.log(`Testing ${CEREBRAS_MODELS.length} models\n`);

  let passed = 0;
  let failed = 0;

  for (const modelId of CEREBRAS_MODELS) {
    console.log(`📍 Testing ${modelId}...`);
    const startTime = Date.now();

    try {
      const { agent, useTools } = createChatAgent(modelId);

      if (!useTools) {
        console.log(`⚠️  SKIPPED: Tools disabled for this model`);
        continue;
      }

      const result = agent.stream({
        messages: [
          {
            role: "user",
            content: "Say hello in one sentence.",
          },
        ],
      });

      const response = await result.response;
      const responseTime = Date.now() - startTime;

      console.log(`✅ SUCCESS (${responseTime}ms)`);
      passed++;
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      const errorMsg = error.message || String(error);
      console.log(`❌ FAILED (${responseTime}ms)`);
      console.log(`   ${errorMsg}`);
      failed++;
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log(`\n✅ Passed: ${passed} / Failed: ${failed}\n`);
}

testCerebrasModels().catch(error => {
  console.error("Unexpected error:", error);
  process.exitCode = 1;
});
