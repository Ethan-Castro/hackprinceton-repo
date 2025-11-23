/**
 * Test script for structured business data generators
 * This script tests the generateObject-based business generators
 * Run with: pnpm tsx scripts/test-structured-business-generators.ts
 */

import { gateway } from '@/lib/gateway';
import {
  generateBusinessPlanStructured,
  generateFinancialProjectionsStructured,
  generateMarketAnalysisStructured,
  generateCompetitorAnalysisStructured,
} from '@/lib/business-generators';

async function testBusinessPlanGenerator() {
  console.log('\n=== Testing Business Plan Generator ===');
  try {
    const model = gateway('claude-3-5-sonnet-20241022');

    const result = await generateBusinessPlanStructured(model, {
      companyName: 'TechFlow Analytics',
      businessDescription: 'An AI-powered data analytics platform for small to medium businesses',
      targetMarket: 'SMBs in the SaaS industry looking for affordable analytics solutions',
    });

    console.log('✅ Business Plan Generated Successfully');
    console.log('Company Name:', result.object.companyName);
    console.log('Sections:', result.object.sections?.length || 0);
    console.log('Executive Summary (first 100 chars):',
      result.object.executiveSummary?.substring(0, 100) + '...');
  } catch (error: any) {
    console.error('❌ Business Plan Generation Failed:', error.message);
  }
}

async function testFinancialProjectionsGenerator() {
  console.log('\n=== Testing Financial Projections Generator ===');
  try {
    const model = gateway('claude-3-5-sonnet-20241022');

    const result = await generateFinancialProjectionsStructured(model, {
      businessType: 'B2B SaaS',
      timeframe: '5 Years',
      startingCapital: 500000,
      targetRevenue: 5000000,
    });

    console.log('✅ Financial Projections Generated Successfully');
    console.log('Title:', result.object.title);
    console.log('Timeframe:', result.object.timeframe);
    console.log('Revenue Streams:', result.object.revenueStreams?.length || 0);
    console.log('Assumptions:', result.object.assumptions?.length || 0);
  } catch (error: any) {
    console.error('❌ Financial Projections Generation Failed:', error.message);
  }
}

async function testMarketAnalysisGenerator() {
  console.log('\n=== Testing Market Analysis Generator ===');
  try {
    const model = gateway('claude-3-5-sonnet-20241022');

    const result = await generateMarketAnalysisStructured(model, {
      industry: 'Business Intelligence',
      productOrService: 'AI-powered analytics platform',
      targetGeography: 'North America',
    });

    console.log('✅ Market Analysis Generated Successfully');
    console.log('Industry:', result.object.industry);
    console.log('Customer Segments:', result.object.customerSegments?.length || 0);
    console.log('Trends:', result.object.trends?.length || 0);
    console.log('Market Size TAM:', result.object.marketSize?.tam);
  } catch (error: any) {
    console.error('❌ Market Analysis Generation Failed:', error.message);
  }
}

async function testCompetitorAnalysisGenerator() {
  console.log('\n=== Testing Competitor Analysis Generator ===');
  try {
    const model = gateway('claude-3-5-sonnet-20241022');

    const result = await generateCompetitorAnalysisStructured(model, {
      company: 'TechFlow Analytics',
      industry: 'Business Intelligence',
      mainCompetitors: ['Tableau', 'Power BI', 'Google Analytics'],
    });

    console.log('✅ Competitor Analysis Generated Successfully');
    console.log('Title:', result.object.title);
    console.log('Competitors Analyzed:', result.object.competitors?.length || 0);
    console.log('Positioning Strategy:', result.object.positioningStrategy?.substring(0, 100) + '...');
  } catch (error: any) {
    console.error('❌ Competitor Analysis Generation Failed:', error.message);
  }
}

async function runAllTests() {
  console.log('🚀 Starting Structured Business Generators Tests');
  console.log('==============================================');

  try {
    await testBusinessPlanGenerator();
    await testFinancialProjectionsGenerator();
    await testMarketAnalysisGenerator();
    await testCompetitorAnalysisGenerator();

    console.log('\n==============================================');
    console.log('✅ All tests completed!');
  } catch (error: any) {
    console.error('\n❌ Test suite failed:', error.message);
    process.exit(1);
  }
}

// Run the tests
runAllTests().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
