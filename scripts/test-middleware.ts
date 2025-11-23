/**
 * Test script to diagnose middleware issues with AI SDK v5
 * This helps understand where the "prompt is not iterable" error comes from
 */

import { gateway } from '@/lib/gateway';
import { wrapLanguageModel } from 'ai';
import { createLoggingMiddleware } from '@/lib/middleware/logging';

async function testBasicGatewayModel() {
  console.log('\n=== Test 1: Basic Gateway Model (No Middleware) ===');
  try {
    const model = gateway('claude-3-5-sonnet-20241022');
    const result = await model.doGenerate({
      inputFormat: 'messages',
      mode: { type: 'regular' },
      prompt: [
        {
          type: 'text',
          text: 'Say hello',
        },
      ],
      system: 'You are a helpful assistant',
    });

    console.log('✅ Basic model works');
    console.log('Output:', result.text?.substring(0, 50) + '...');
  } catch (error: any) {
    console.error('❌ Basic model failed:', error.message);
  }
}

async function testWrappedGatewayModel() {
  console.log('\n=== Test 2: Wrapped Gateway Model (With Logging Middleware) ===');
  try {
    const baseModel = gateway('claude-3-5-sonnet-20241022');
    const wrappedModel = wrapLanguageModel({
      model: baseModel,
      middleware: createLoggingMiddleware({ debug: true }),
    });

    const result = await wrappedModel.doGenerate({
      inputFormat: 'messages',
      mode: { type: 'regular' },
      prompt: [
        {
          type: 'text',
          text: 'Say hello',
        },
      ],
      system: 'You are a helpful assistant',
    });

    console.log('✅ Wrapped model works');
    console.log('Output:', result.text?.substring(0, 50) + '...');
  } catch (error: any) {
    console.error('❌ Wrapped model failed:', error.message);
    console.error('Error stack:', error.stack?.split('\n').slice(0, 5).join('\n'));
  }
}

async function runTests() {
  console.log('🔍 Middleware Diagnostic Tests');
  console.log('===============================');

  try {
    await testBasicGatewayModel();
    await testWrappedGatewayModel();

    console.log('\n===============================');
    console.log('Tests completed');
  } catch (error: any) {
    console.error('Fatal error:', error.message);
    process.exit(1);
  }
}

runTests().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
