"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

interface ToolTest {
  name: string;
  description: string;
  endpoint: string;
  method: "POST" | "GET";
  testData: Record<string, unknown>;
}

const TOOL_TESTS: Record<string, ToolTest[]> = {
  "Medical Research": [
    {
      name: "searchPubMed",
      description: "Search PubMed for medical research papers",
      endpoint: "/api/health-chat",
      method: "POST",
      testData: {
        messages: [
          {
            id: "1",
            role: "user",
            content: [
              {
                type: "text",
                text: "Search PubMed for 'diabetes management 2024'",
              },
            ],
          },
        ],
        modelId: "gpt-4o-mini",
      },
    },
    {
      name: "searchClinicalTrials",
      description: "Search for clinical trials",
      endpoint: "/api/health-chat",
      method: "POST",
      testData: {
        messages: [
          {
            id: "1",
            role: "user",
            content: [
              {
                type: "text",
                text: "Find clinical trials for cancer treatments",
              },
            ],
          },
        ],
        modelId: "gpt-4o-mini",
      },
    },
    {
      name: "getMedicationInfo",
      description: "Get medication information from FDA/RxNorm",
      endpoint: "/api/health-chat",
      method: "POST",
      testData: {
        messages: [
          {
            id: "1",
            role: "user",
            content: [
              {
                type: "text",
                text: "Get info about Metformin 500mg",
              },
            ],
          },
        ],
        modelId: "gpt-4o-mini",
      },
    },
    {
      name: "searchHealthInformation",
      description: "Search health websites",
      endpoint: "/api/health-chat",
      method: "POST",
      testData: {
        messages: [
          {
            id: "1",
            role: "user",
            content: [
              {
                type: "text",
                text: "Search for information about hypertension management",
              },
            ],
          },
        ],
        modelId: "gpt-4o-mini",
      },
    },
    {
      name: "analyzeMedicalResearch",
      description: "Analyze and summarize medical research",
      endpoint: "/api/health-chat",
      method: "POST",
      testData: {
        messages: [
          {
            id: "1",
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze recent cardiovascular disease research",
              },
            ],
          },
        ],
        modelId: "gpt-4o-mini",
      },
    },
  ],
  "Appointments": [
    {
      name: "scheduleAppointment",
      description: "Schedule a medical appointment",
      endpoint: "/api/health-chat",
      method: "POST",
      testData: {
        messages: [
          {
            id: "1",
            role: "user",
            content: [
              {
                type: "text",
                text: "Schedule an appointment with Dr. Smith for 2024-12-15 at 14:00, it's an annual checkup at his office in downtown",
              },
            ],
          },
        ],
        modelId: "gpt-4o-mini",
      },
    },
    {
      name: "listAppointments",
      description: "View upcoming appointments",
      endpoint: "/api/health-chat",
      method: "POST",
      testData: {
        messages: [
          {
            id: "1",
            role: "user",
            content: [
              {
                type: "text",
                text: "Show me my upcoming appointments",
              },
            ],
          },
        ],
        modelId: "gpt-4o-mini",
      },
    },
    {
      name: "setAppointmentReminder",
      description: "Configure reminder preferences",
      endpoint: "/api/health-chat",
      method: "POST",
      testData: {
        messages: [
          {
            id: "1",
            role: "user",
            content: [
              {
                type: "text",
                text: "Set up email reminders for my appointments 24 hours before",
              },
            ],
          },
        ],
        modelId: "gpt-4o-mini",
      },
    },
  ],
  "Medications": [
    {
      name: "addMedication",
      description: "Add medication to tracking",
      endpoint: "/api/health-chat",
      method: "POST",
      testData: {
        messages: [
          {
            id: "1",
            role: "user",
            content: [
              {
                type: "text",
                text: "Add Metformin 500mg to my medications, I take it twice daily for Type 2 Diabetes, started 2024-01-15",
              },
            ],
          },
        ],
        modelId: "gpt-4o-mini",
      },
    },
    {
      name: "logMedicationTaken",
      description: "Record medication dose",
      endpoint: "/api/health-chat",
      method: "POST",
      testData: {
        messages: [
          {
            id: "1",
            role: "user",
            content: [
              {
                type: "text",
                text: "Log that I took my Metformin this morning",
              },
            ],
          },
        ],
        modelId: "gpt-4o-mini",
      },
    },
    {
      name: "listMedications",
      description: "View active medications",
      endpoint: "/api/health-chat",
      method: "POST",
      testData: {
        messages: [
          {
            id: "1",
            role: "user",
            content: [
              {
                type: "text",
                text: "Show me all my current medications",
              },
            ],
          },
        ],
        modelId: "gpt-4o-mini",
      },
    },
    {
      name: "getMedicationAdherence",
      description: "Check medication adherence rate",
      endpoint: "/api/health-chat",
      method: "POST",
      testData: {
        messages: [
          {
            id: "1",
            role: "user",
            content: [
              {
                type: "text",
                text: "What's my medication adherence rate for the last 30 days?",
              },
            ],
          },
        ],
        modelId: "gpt-4o-mini",
      },
    },
    {
      name: "checkDrugInteractions",
      description: "Check medication interactions",
      endpoint: "/api/health-chat",
      method: "POST",
      testData: {
        messages: [
          {
            id: "1",
            role: "user",
            content: [
              {
                type: "text",
                text: "Check if there are any interactions between my medications",
              },
            ],
          },
        ],
        modelId: "gpt-4o-mini",
      },
    },
  ],
  "Health Monitoring": [
    {
      name: "logVitalSigns",
      description: "Record vital signs",
      endpoint: "/api/health-chat",
      method: "POST",
      testData: {
        messages: [
          {
            id: "1",
            role: "user",
            content: [
              {
                type: "text",
                text: "Log my vital signs: blood pressure 120/80, heart rate 72 bpm, temperature 98.6°F",
              },
            ],
          },
        ],
        modelId: "gpt-4o-mini",
      },
    },
    {
      name: "logActivity",
      description: "Log exercise activity",
      endpoint: "/api/health-chat",
      method: "POST",
      testData: {
        messages: [
          {
            id: "1",
            role: "user",
            content: [
              {
                type: "text",
                text: "I just went for a 30 minute jog at moderate intensity, burned about 300 calories",
              },
            ],
          },
        ],
        modelId: "gpt-4o-mini",
      },
    },
    {
      name: "logNutrition",
      description: "Track nutrition/meals",
      endpoint: "/api/health-chat",
      method: "POST",
      testData: {
        messages: [
          {
            id: "1",
            role: "user",
            content: [
              {
                type: "text",
                text: "Log my breakfast: oatmeal with berries, about 350 calories, 8g protein, 45g carbs, 5g fat",
              },
            ],
          },
        ],
        modelId: "gpt-4o-mini",
      },
    },
    {
      name: "setHealthGoal",
      description: "Set health goals",
      endpoint: "/api/health-chat",
      method: "POST",
      testData: {
        messages: [
          {
            id: "1",
            role: "user",
            content: [
              {
                type: "text",
                text: "Set a goal to lose 10 lbs by the end of 2024",
              },
            ],
          },
        ],
        modelId: "gpt-4o-mini",
      },
    },
    {
      name: "getHealthMetricsReport",
      description: "Get health metrics report",
      endpoint: "/api/health-chat",
      method: "POST",
      testData: {
        messages: [
          {
            id: "1",
            role: "user",
            content: [
              {
                type: "text",
                text: "Generate a health metrics report for the last 30 days",
              },
            ],
          },
        ],
        modelId: "gpt-4o-mini",
      },
    },
    {
      name: "getHealthInsights",
      description: "Get health insights",
      endpoint: "/api/health-chat",
      method: "POST",
      testData: {
        messages: [
          {
            id: "1",
            role: "user",
            content: [
              {
                type: "text",
                text: "Give me personalized health insights",
              },
            ],
          },
        ],
        modelId: "gpt-4o-mini",
      },
    },
  ],
  "Provider & Insurance": [
    {
      name: "addHealthcareProvider",
      description: "Add healthcare provider",
      endpoint: "/api/health-chat",
      method: "POST",
      testData: {
        messages: [
          {
            id: "1",
            role: "user",
            content: [
              {
                type: "text",
                text: "Save Dr. Sarah Johnson, cardiologist, phone 555-0123, office at 123 Main St",
              },
            ],
          },
        ],
        modelId: "gpt-4o-mini",
      },
    },
    {
      name: "listHealthcareProviders",
      description: "View healthcare providers",
      endpoint: "/api/health-chat",
      method: "POST",
      testData: {
        messages: [
          {
            id: "1",
            role: "user",
            content: [
              {
                type: "text",
                text: "Show me all my healthcare providers",
              },
            ],
          },
        ],
        modelId: "gpt-4o-mini",
      },
    },
    {
      name: "addInsurancePlan",
      description: "Add insurance information",
      endpoint: "/api/health-chat",
      method: "POST",
      testData: {
        messages: [
          {
            id: "1",
            role: "user",
            content: [
              {
                type: "text",
                text: "Save my insurance: Blue Cross Blue Shield, policy ABC123, member ID 987654, started 2024-01-01",
              },
            ],
          },
        ],
        modelId: "gpt-4o-mini",
      },
    },
    {
      name: "listInsurancePlans",
      description: "View insurance plans",
      endpoint: "/api/health-chat",
      method: "POST",
      testData: {
        messages: [
          {
            id: "1",
            role: "user",
            content: [
              {
                type: "text",
                text: "Show me my insurance plans",
              },
            ],
          },
        ],
        modelId: "gpt-4o-mini",
      },
    },
    {
      name: "checkProcedureCoverage",
      description: "Check procedure coverage",
      endpoint: "/api/health-chat",
      method: "POST",
      testData: {
        messages: [
          {
            id: "1",
            role: "user",
            content: [
              {
                type: "text",
                text: "Is an MRI covered by my insurance?",
              },
            ],
          },
        ],
        modelId: "gpt-4o-mini",
      },
    },
  ],
  "Email Reminders": [
    {
      name: "sendAppointmentReminder",
      description: "Send appointment reminder email",
      endpoint: "/api/health-chat",
      method: "POST",
      testData: {
        messages: [
          {
            id: "1",
            role: "user",
            content: [
              {
                type: "text",
                text: "Send me an email reminder for my appointment with Dr. Smith on 2024-12-15 at 14:00",
              },
            ],
          },
        ],
        modelId: "gpt-4o-mini",
      },
    },
    {
      name: "sendMedicationReminder",
      description: "Send medication reminder email",
      endpoint: "/api/health-chat",
      method: "POST",
      testData: {
        messages: [
          {
            id: "1",
            role: "user",
            content: [
              {
                type: "text",
                text: "Send me a reminder to take my Metformin 500mg twice daily with food",
              },
            ],
          },
        ],
        modelId: "gpt-4o-mini",
      },
    },
    {
      name: "sendLabResultNotification",
      description: "Send lab result notification",
      endpoint: "/api/health-chat",
      method: "POST",
      testData: {
        messages: [
          {
            id: "1",
            role: "user",
            content: [
              {
                type: "text",
                text: "Notify me about my lab results from Quest Diagnostics, blood work completed today",
              },
            ],
          },
        ],
        modelId: "gpt-4o-mini",
      },
    },
    {
      name: "sendHealthSummary",
      description: "Send health summary email",
      endpoint: "/api/health-chat",
      method: "POST",
      testData: {
        messages: [
          {
            id: "1",
            role: "user",
            content: [
              {
                type: "text",
                text: "Send me a weekly health summary",
              },
            ],
          },
        ],
        modelId: "gpt-4o-mini",
      },
    },
    {
      name: "sendMedicationRefillAlert",
      description: "Send medication refill alert",
      endpoint: "/api/health-chat",
      method: "POST",
      testData: {
        messages: [
          {
            id: "1",
            role: "user",
            content: [
              {
                type: "text",
                text: "Alert me that I'm running low on Metformin, only 5 refills left",
              },
            ],
          },
        ],
        modelId: "gpt-4o-mini",
      },
    },
  ],
};

interface TestResult {
  toolName: string;
  status: "idle" | "loading" | "success" | "error";
  response?: string;
  error?: string;
  timestamp?: number;
}

export default function HealthForDevsPage() {
  const [results, setResults] = useState<Record<string, TestResult>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>("Medical Research");

  const runTest = async (tool: ToolTest) => {
    const testKey = tool.name;
    setResults((prev) => ({
      ...prev,
      [testKey]: { toolName: tool.name, status: "loading" },
    }));

    try {
      const response = await fetch(tool.endpoint, {
        method: tool.method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(tool.testData),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const text = await response.text();
      setResults((prev) => ({
        ...prev,
        [testKey]: {
          toolName: tool.name,
          status: "success",
          response: text.substring(0, 500) + (text.length > 500 ? "..." : ""),
          timestamp: Date.now(),
        },
      }));
    } catch (error) {
      setResults((prev) => ({
        ...prev,
        [testKey]: {
          toolName: tool.name,
          status: "error",
          error: error instanceof Error ? error.message : "Unknown error",
          timestamp: Date.now(),
        },
      }));
    }
  };

  const runAllTests = async () => {
    const tools = TOOL_TESTS[selectedCategory] || [];
    for (const tool of tools) {
      await runTest(tool);
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  };

  const currentTools = TOOL_TESTS[selectedCategory] || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🧪 Health Tools Testing</h1>
          <p className="text-slate-300">
            Developer interface to test all 35 health tools across 6 categories
          </p>
        </div>

        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 gap-2 bg-slate-800">
            {Object.keys(TOOL_TESTS).map((category) => (
              <TabsTrigger key={category} value={category} className="text-xs md:text-sm">
                {category.split(" ")[0]}
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(TOOL_TESTS).map(([category, tools]) => (
            <TabsContent key={category} value={category} className="space-y-6">
              <div className="flex gap-4">
                <Button
                  onClick={runAllTests}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Run All Tests ({tools.length})
                </Button>
                <Button
                  onClick={() =>
                    setResults((prev) => {
                      const newResults = { ...prev };
                      tools.forEach((tool) => {
                        delete newResults[tool.name];
                      });
                      return newResults;
                    })
                  }
                  variant="outline"
                  className="border-slate-600 text-slate-300"
                >
                  Clear Results
                </Button>
              </div>

              <div className="grid gap-4">
                {tools.map((tool) => {
                  const result = results[tool.name];
                  return (
                    <Card
                      key={tool.name}
                      className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors"
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-white flex items-center gap-2">
                              {tool.name}
                              {result && (
                                <>
                                  {result.status === "loading" && (
                                    <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                                  )}
                                  {result.status === "success" && (
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                  )}
                                  {result.status === "error" && (
                                    <AlertCircle className="h-4 w-4 text-red-500" />
                                  )}
                                </>
                              )}
                            </CardTitle>
                            <CardDescription className="text-slate-400">
                              {tool.description}
                            </CardDescription>
                          </div>
                          <Button
                            onClick={() => runTest(tool)}
                            disabled={result?.status === "loading"}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            {result?.status === "loading" ? "Testing..." : "Test"}
                          </Button>
                        </div>
                      </CardHeader>

                      {result && (
                        <CardContent className="space-y-4">
                          {result.status === "success" && (
                            <Alert className="bg-green-950 border-green-700">
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                              <AlertDescription className="text-green-200">
                                <div className="font-semibold mb-2">✅ Test Passed</div>
                                <div className="text-xs bg-slate-900 p-2 rounded font-mono overflow-auto max-h-40">
                                  {result.response}
                                </div>
                              </AlertDescription>
                            </Alert>
                          )}

                          {result.status === "error" && (
                            <Alert className="bg-red-950 border-red-700">
                              <AlertCircle className="h-4 w-4 text-red-500" />
                              <AlertDescription className="text-red-200">
                                <div className="font-semibold mb-2">❌ Test Failed</div>
                                <div className="text-xs">{result.error}</div>
                              </AlertDescription>
                            </Alert>
                          )}
                        </CardContent>
                      )}
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <div className="mt-12 p-6 bg-slate-800 rounded-lg border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">📊 Test Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-900 p-4 rounded">
              <div className="text-slate-400 text-sm">Total Tools</div>
              <div className="text-2xl font-bold text-white">35</div>
            </div>
            <div className="bg-slate-900 p-4 rounded">
              <div className="text-slate-400 text-sm">Categories</div>
              <div className="text-2xl font-bold text-white">{Object.keys(TOOL_TESTS).length}</div>
            </div>
            <div className="bg-slate-900 p-4 rounded">
              <div className="text-slate-400 text-sm">Tests Run</div>
              <div className="text-2xl font-bold text-white">{Object.keys(results).length}</div>
            </div>
            <div className="bg-slate-900 p-4 rounded">
              <div className="text-slate-400 text-sm">Success Rate</div>
              <div className="text-2xl font-bold text-green-500">
                {Object.keys(results).length > 0
                  ? Math.round(
                      (Object.values(results).filter((r) => r.status === "success").length /
                        Object.keys(results).length) *
                        100
                    )
                  : 0}
                %
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
