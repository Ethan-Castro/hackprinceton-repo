// Load environment variables from .env.local (Next.js way)
import { loadEnvConfig } from "@next/env";

const projectDir = process.cwd();
loadEnvConfig(projectDir);

import { resolveModel } from "@/lib/agents/model-factory";
import { generateText } from "ai";
import { SUPPORTED_MODELS } from "@/lib/constants";

type TestResult = {
  modelId: string;
  status: "passed" | "failed" | "skipped";
  error?: string;
  responseTime?: number;
  tokens?: { input: number; output: number };
};

async function testModel(modelId: string): Promise<TestResult> {
  const startTime = Date.now();
  
  try {
    // Check if API keys are configured
    const isCerebrasModel = modelId.startsWith("cerebras/");
    if (isCerebrasModel && !process.env.CEREBRAS_API_KEY) {
      return {
        modelId,
        status: "skipped",
        error: "CEREBRAS_API_KEY not configured",
      };
    }
    
    if (!isCerebrasModel && !process.env.AI_GATEWAY_API_KEY) {
      return {
        modelId,
        status: "skipped",
        error: "AI_GATEWAY_API_KEY not configured",
      };
    }

    // Resolve the model
    const { model } = resolveModel(modelId);

    // Test with a simple prompt
    const result = await generateText({
      model,
      prompt: "Say hello in one sentence.",
      maxOutputTokens: 50,
    });

    const responseTime = Date.now() - startTime;

    return {
      modelId,
      status: "passed",
      responseTime,
      tokens: {
        input: result.usage?.inputTokens ?? 0,
        output: result.usage?.outputTokens ?? 0,
      },
    };
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    return {
      modelId,
      status: "failed",
      error: error.message || String(error),
      responseTime,
    };
  }
}

async function main() {
  console.log("🧪 Testing All Models\n");
  console.log("=".repeat(60));
  console.log(`Total models to test: ${SUPPORTED_MODELS.length}\n`);

  const results: TestResult[] = [];

  // Test each model sequentially to avoid rate limits
  for (let i = 0; i < SUPPORTED_MODELS.length; i++) {
    const modelId = SUPPORTED_MODELS[i];
    console.log(`[${i + 1}/${SUPPORTED_MODELS.length}] Testing ${modelId}...`);
    
    const result = await testModel(modelId);
    results.push(result);

    if (result.status === "passed") {
      console.log(`  ✅ PASSED (${result.responseTime}ms, ${result.tokens?.input || 0}+${result.tokens?.output || 0} tokens)`);
    } else if (result.status === "skipped") {
      console.log(`  ⚪ SKIPPED: ${result.error}`);
    } else {
      console.log(`  ❌ FAILED: ${result.error}`);
    }
    
    // Small delay between tests to avoid rate limiting
    if (i < SUPPORTED_MODELS.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("\n📊 Summary:\n");

  const passed = results.filter((r) => r.status === "passed");
  const failed = results.filter((r) => r.status === "failed");
  const skipped = results.filter((r) => r.status === "skipped");

  console.log(`✅ Passed: ${passed.length}`);
  console.log(`❌ Failed: ${failed.length}`);
  console.log(`⚪ Skipped: ${skipped.length}`);

  if (passed.length > 0) {
    console.log("\n✅ Working Models:");
    passed.forEach((r) => {
      console.log(`   - ${r.modelId} (${r.responseTime}ms)`);
    });
  }

  if (failed.length > 0) {
    console.log("\n❌ Failed Models:");
    failed.forEach((r) => {
      console.log(`   - ${r.modelId}: ${r.error}`);
    });
  }

  if (skipped.length > 0) {
    console.log("\n⚪ Skipped Models (API keys not configured):");
    skipped.forEach((r) => {
      console.log(`   - ${r.modelId}: ${r.error}`);
    });
  }

  // Exit with error code if any tests failed
  if (failed.length > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("Unexpected error running model tests:", error);
  process.exitCode = 1;
});

