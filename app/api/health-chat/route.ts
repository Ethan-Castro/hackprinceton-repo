import { convertToModelMessages, streamText, type UIMessage, stepCountIs } from "ai";
import {
  CEREBRAS_MODELS,
  DEFAULT_MODEL,
  SUPPORTED_MODELS,
} from "@/lib/constants";
import { createCerebras } from "@ai-sdk/cerebras";
import { gateway } from "@/lib/gateway";
import { tools } from "@/lib/tools";
import { getHealthMCPTools } from "@/lib/mcp-client";

export const maxDuration = 60;

export async function POST(req: Request) {
  const {
    messages,
    modelId = DEFAULT_MODEL,
  }: { messages: UIMessage[]; modelId: string } = await req.json();

  if (!SUPPORTED_MODELS.includes(modelId)) {
    return new Response(
      JSON.stringify({ error: `Model ${modelId} is not supported` }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const isCerebrasModel = CEREBRAS_MODELS.includes(modelId);
  const cleanedModelId = isCerebrasModel
    ? modelId.replace(/^cerebras\//, "")
    : modelId;
  const model = isCerebrasModel
    ? createCerebras({
        apiKey: process.env.CEREBRAS_API_KEY,
      })(cleanedModelId)
    : gateway(modelId);
  const useTools = !isCerebrasModel;

  // Get MCP tools if configured (only when tools are enabled)
  const mcpToolsResult = useTools ? await getHealthMCPTools() : null;
  const mcpTools = useTools ? mcpToolsResult?.tools || {} : {};

  // Merge all tools: base tools (which now include all health tools) + MCP tools
  const allTools = useTools
    ? {
        ...tools,
        ...mcpTools,
      }
    : undefined;

  const capabilityLines = [
    "- Explain medical report text with clear lay explanations and definitions",
    "- Create tailored fitness plans and structure them as actionable guidance",
    "- Summarize research findings and provide citations",
    "- Encourage healthy habits, safety, and appropriate follow-up with professionals",
  ];

  if (useTools) {
    capabilityLines.push(
      "- Perform deep research using medical databases, ArXiv papers, and trusted sources",
      "- Schedule and manage medical appointments with reminders",
      "- Track medications and monitor adherence rates",
      "- Log vital signs, activity, and nutrition data",
      "- Set health goals and receive personalized insights",
      "- Send appointment and medication reminders via email and voice",
      "- Check insurance coverage for procedures",
      "- Store provider and insurance information",
      "- Search PubMed, clinical trials, and health information databases",
      "- Generate professional presentations and documents about health topics",
      "- Access medical literature, research papers, and health information through specialized tools",
      "- Search and retrieve academic papers from ArXiv",
      "- Read and reference Google Docs content for research",
      "- Generate Gamma presentations, documents, webpages, or social content"
    );
  } else {
    capabilityLines.push(
      "- Describe how the user can gather reputable resources or set up their own trackers when needed"
    );
  }

  const styleLines = [
    "- Be concise, structured, and actionable",
    "- Include brief disclaimers when interpreting medical content",
    "- Cite sources when providing medical information (include ArXiv links when relevant)",
    "- Encourage healthy habits and safety",
  ];

  if (useTools) {
    styleLines.push(
      "- Use Gamma for creating professional, visually appealing presentations when requested"
    );
  } else {
    styleLines.push(
      "- Suggest external tools or services the user can access manually when rich media would help"
    );
  }

  const systemSections: string[] = [
    `You are a helpful health and fitness coach with access to advanced medical research insights. Provide educational guidance only—do not diagnose or prescribe. If users report concerning symptoms, advise contacting a licensed professional or emergency services as appropriate.${
      useTools
        ? " When appropriate, you can invoke specialized tools to enhance the response."
        : " Automated tooling is not available with this model, so describe clear step-by-step guidance the user can follow manually."
    }`,
    `Capabilities:\n${capabilityLines.join("\n")}`,
  ];

  if (useTools) {
    systemSections.push(
      `Tools Available:

MEDICAL RESEARCH & INFORMATION:
- searchPubMed: Search PubMed database for medical research papers
- searchClinicalTrials: Search ClinicalTrials.gov for clinical trial information
- getMedicationInfo: Get FDA/RxNorm medication information and details
- searchHealthInformation: Search major health websites (Mayo Clinic, WebMD, NHS, CDC)
- analyzeMedicalResearch: Summarize and analyze medical research findings
- searchArXiv: Search for research papers on any topic
- getArXivPaper: Get detailed information about specific ArXiv papers

APPOINTMENT MANAGEMENT:
- scheduleAppointment: Schedule medical appointments with reminders
- listAppointments: View upcoming appointments with filtering
- cancelAppointment: Cancel or reschedule appointments
- setAppointmentReminder: Configure reminder preferences (email, SMS, voice)

MEDICATION TRACKING:
- addMedication: Add medication to tracking system
- logMedicationTaken: Record medication doses taken
- listMedications: View all active medications
- getMedicationAdherence: Calculate medication adherence percentage
- checkDrugInteractions: Check for medication interactions
- removeMedication: Stop tracking a medication

HEALTH MONITORING:
- logVitalSigns: Record blood pressure, heart rate, temperature, oxygen, weight
- logActivity: Log physical activity and exercise
- logNutrition: Track meals and nutrition information
- setHealthGoal: Set health targets (weight loss, exercise, calories, etc.)
- getHealthMetricsReport: Generate health metrics report with trends
- getHealthInsights: Get personalized health insights and recommendations

PROVIDER & INSURANCE:
- addHealthcareProvider: Add healthcare provider contact information
- listHealthcareProviders: View saved healthcare providers
- addInsurancePlan: Add insurance plan information
- listInsurancePlans: View insurance plans and coverage
- checkProcedureCoverage: Check if procedure is covered by insurance

EMAIL REMINDERS (SendGrid):
- sendAppointmentReminder: Send appointment reminder emails
- sendMedicationReminder: Send medication reminder emails
- sendLabResultNotification: Send lab result notification emails
- sendHealthSummary: Send weekly/monthly health summaries
- sendMedicationRefillAlert: Send medication refill alerts

VOICE REMINDERS (ElevenLabs):
- sendVoiceAppointmentReminder: Generate appointment reminder as voice message
- sendVoiceMedicationReminder: Generate medication reminder as voice message
- sendVoiceHealthAlert: Generate urgent health alerts as voice messages
- sendVoiceHealthMetricReminder: Remind to check health metrics via voice

CONTENT & PRESENTATIONS:
- displayArtifact: Display well-structured plans, reports, and ebooks (downloadable-friendly)
- displayWebPreview: Show relevant webpages
- generateHtmlPreview: Create small interactive widgets or dashboards
- readGoogleDoc: Read content from Google Docs (requires authentication)
- getGoogleDocMetadata: Get metadata about Google Docs
- generateGamma: Create presentations, documents, webpages, or social content
- getGammaGeneration: Get details about generated Gamma content
- exportGamma: Export Gamma presentations to PDF or PPTX
- listGammaThemes: View available themes for Gamma generations${
        mcpToolsResult ? "\n\nMCP TOOLS:\n- MCP tools: Access advanced health research and medical information" : ""
      }`
    );
  } else {
    systemSections.push(
      "Tools: Automated tools are not available. Provide thorough textual guidance and note any manual steps or third-party services the user could leverage."
    );
  }

  systemSections.push(`Style:\n${styleLines.join("\n")}`);

  const system = systemSections.join("\n\n");

  const result = streamText({
    model,
    system,
    messages: convertToModelMessages(messages),
    ...(useTools && allTools ? { tools: allTools, stopWhen: stepCountIs(10) } : {}),
    onStepFinish: ({ toolCalls, toolResults }) => {
      if (!useTools) {
        return;
      }
      // Log tool usage for debugging
      if (toolCalls && toolCalls.length > 0) {
        console.log('[Health Chat] Tool calls:', toolCalls.map(tc => ({
          name: tc.toolName,
          input: 'input' in tc ? tc.input : undefined
        })));
      }
      if (toolResults && toolResults.length > 0) {
        console.log('[Health Chat] Tool results:', toolResults.map(tr => ({
          tool: tr.toolName,
          success: 'result' in tr
        })));
      }
    },
    onFinish: async () => {
      // Clean up MCP client connection
      if (mcpToolsResult) {
        await mcpToolsResult.close();
      }
    },
    onError: (e) => {
      console.error("Error while streaming (health chat).", e);
    },
  });

  const supportsReasoning = modelId.includes("thinking") || modelId.includes("deepseek");

  return result.toUIMessageStreamResponse({
    sendReasoning: supportsReasoning,
  });
}

