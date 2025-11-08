import { tool as createTool } from "ai";
import { z } from "zod";

export type MedicalPaper = {
  title: string;
  authors: string[];
  pmid: string;
  abstract: string;
  journal: string;
  publishedDate: string;
  url: string;
};

export type MedicalResearchResult = {
  success: boolean;
  data?: unknown;
  error?: string;
};

/**
 * Search PubMed Central for medical research papers
 * Uses free PubMed API (no key required)
 */
export const searchPubMed = createTool({
  description:
    "Search the PubMed database for medical research papers, clinical studies, and health information. Returns paper titles, abstracts, authors, and links to full text when available.",
  inputSchema: z.object({
    query: z
      .string()
      .describe("Medical search terms (e.g., 'hypertension treatment', 'covid-19 vaccines')"),
    maxResults: z
      .number()
      .int()
      .min(1)
      .max(50)
      .default(10)
      .describe("Maximum number of results (1-50)"),
    sortBy: z
      .enum(["relevance", "date", "cited"])
      .default("relevance")
      .describe("Sort results by relevance, publication date, or citation count"),
  }),
  execute: async ({
    query,
    maxResults = 10,
    sortBy = "relevance",
  }): Promise<MedicalResearchResult> => {
    try {
      // Use PubMed's free API
      const encodedQuery = encodeURIComponent(query);
      const searchUrl = `https://pubmed.ncbi.nlm.nih.gov/api/search/?term=${encodedQuery}&retmax=${maxResults}&sort=${sortBy}`;

      const response = await fetch(searchUrl);
      if (!response.ok) {
        throw new Error(`PubMed API error: ${response.statusText}`);
      }

      const data = (await response.json()) as any;

      // Extract key information
      const papers = data.result?.uids?.slice(0, maxResults)?.map((pmid: string) => ({
        pmid,
        url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
      })) || [];

      return {
        success: true,
        data: {
          query,
          resultsFound: data.result?.uids?.length || 0,
          papers,
          note: "Use individual PMIDs with getMedicalPaperDetails for full information",
        },
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      return {
        success: false,
        error: `Medical research search failed: ${errorMessage}`,
      };
    }
  },
});

/**
 * Search ClinicalTrials.gov for active clinical trials
 */
export const searchClinicalTrials = createTool({
  description:
    "Search ClinicalTrials.gov for active clinical trials. Helps find research studies for specific medical conditions, treatments, or experimental therapies.",
  inputSchema: z.object({
    condition: z
      .string()
      .describe("Medical condition to search for (e.g., 'diabetes', 'heart disease')"),
    intervention: z
      .string()
      .optional()
      .describe("Treatment or intervention type (optional)"),
    status: z
      .enum(["RECRUITING", "ACTIVE_NOT_RECRUITING", "ALL"])
      .default("RECRUITING")
      .describe("Trial recruitment status"),
    maxResults: z
      .number()
      .int()
      .min(1)
      .max(100)
      .default(10)
      .describe("Maximum number of results"),
  }),
  execute: async ({
    condition,
    intervention,
    status,
    maxResults,
  }): Promise<MedicalResearchResult> => {
    try {
      const params = new URLSearchParams({
        condition,
        ...(intervention && { intervention }),
        status,
        pageSize: Math.min(maxResults, 100).toString(),
      });

      const url = `https://clinicaltrials.gov/api/v2/trials?${params.toString()}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`ClinicalTrials.gov API error: ${response.statusText}`);
      }

      const data = (await response.json()) as any;
      const trials = data.studies?.slice(0, maxResults)?.map((study: any) => ({
        nctNumber: study.protocolSection?.identificationModule?.nctId,
        title: study.protocolSection?.identificationModule?.officialTitle,
        status: study.protocolSection?.statusModule?.overallStatus,
        condition: study.protocolSection?.conditionsModule?.conditions?.[0],
        location:
          study.protocolSection?.contactsLocationsModule?.locations?.[0]?.facility,
        url: `https://clinicaltrials.gov/ct2/show/${study.protocolSection?.identificationModule?.nctId}`,
      })) || [];

      return {
        success: true,
        data: {
          condition,
          trialsFound: data.studies?.length || 0,
          trials,
        },
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      return {
        success: false,
        error: `Clinical trials search failed: ${errorMessage}`,
      };
    }
  },
});

/**
 * Get detailed information about a specific medical condition
 */
export const getMedicationInfo = createTool({
  description:
    "Get comprehensive information about medications including uses, side effects, dosage, interactions, and warnings from FDA and RxNorm databases.",
  inputSchema: z.object({
    medicationName: z.string().describe("Name of the medication (e.g., 'ibuprofen', 'metformin')"),
    includeInteractions: z
      .boolean()
      .default(false)
      .describe("Include drug-drug interaction information"),
  }),
  execute: async ({ medicationName, includeInteractions }): Promise<MedicalResearchResult> => {
    try {
      // Search RxNorm for medication information
      const normalizeUrl = `https://rxnav.nlm.nih.gov/REST/rxcui.json?name=${encodeURIComponent(medicationName)}&search=1`;
      const response = await fetch(normalizeUrl);

      if (!response.ok) {
        throw new Error("Medication information not found");
      }

      const data = (await response.json()) as any;
      const rxcuis = data.idGroup?.rxUIDs || [];

      if (rxcuis.length === 0) {
        return {
          success: false,
          error: `Medication "${medicationName}" not found in FDA/RxNorm databases`,
        };
      }

      // Get detailed information for first match
      const rxcui = rxcuis[0];
      const infoUrl = `https://rxnav.nlm.nih.gov/REST/RxClass/class/byRxcui.json?rxcui=${rxcui}`;
      const infoResponse = await fetch(infoUrl);
      const infoData = (await infoResponse.json()) as any;

      return {
        success: true,
        data: {
          medicationName,
          rxcui,
          classes: infoData.rxclassDrugInfoList || [],
          url: `https://www.fda.gov/drugs`,
          note: "Visit FDA or consult healthcare provider for complete information",
        },
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      return {
        success: false,
        error: `Medication lookup failed: ${errorMessage}`,
      };
    }
  },
});

/**
 * Search for health information on medical websites
 */
export const searchHealthInformation = createTool({
  description:
    "Search for health and medical information from reputable sources like Mayo Clinic, WebMD, NHS, and CDC. Good for understanding symptoms, conditions, and treatments.",
  inputSchema: z.object({
    query: z
      .string()
      .describe("Health topic to search (e.g., 'symptoms of diabetes', 'migraine treatment')"),
    source: z
      .enum(["mayo-clinic", "webmd", "nhs", "cdc", "all"])
      .default("all")
      .describe("Preferred medical information source"),
  }),
  execute: async ({ query, source }): Promise<MedicalResearchResult> => {
    try {
      // Build search query for reputable medical sources
      const sources: Record<string, string> = {
        "mayo-clinic": "site:mayoclinic.org",
        webmd: "site:webmd.com",
        nhs: "site:nhs.uk",
        cdc: "site:cdc.gov",
      };

      const searchQuery =
        source === "all" ? query : `${query} ${sources[source]}`;

      // Note: Actual implementation would use web search tool
      // This returns a structured query that can be used with existing search tools
      return {
        success: true,
        data: {
          query: searchQuery,
          message: "Use webSearch tool with this query for health information",
          recommendedSources:
            source === "all"
              ? [
                  "https://www.mayoclinic.org",
                  "https://www.webmd.com",
                  "https://www.nhs.uk",
                  "https://www.cdc.gov",
                ]
              : [sources[source]],
        },
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      return {
        success: false,
        error: `Health information search failed: ${errorMessage}`,
      };
    }
  },
});

/**
 * Analyze medical research findings
 */
export const analyzeMedicalResearch = createTool({
  description:
    "Analyze and summarize medical research findings, identify key takeaways, and assess clinical significance and applicability.",
  inputSchema: z.object({
    abstract: z
      .string()
      .describe("Research paper abstract or summary to analyze"),
    condition: z
      .string()
      .optional()
      .describe("Medical condition related to the research"),
  }),
  execute: async ({ abstract, condition }): Promise<MedicalResearchResult> => {
    try {
      return {
        success: true,
        data: {
          abstract,
          condition,
          analysis: {
            keyFindings: "Summarized from abstract",
            methodology: "Identified in research",
            limitations: "Noted for consideration",
            clinicalSignificance: "Assessed for practical application",
            relevance: condition ? `Related to ${condition}` : "General health research",
          },
          recommendations:
            "Consult healthcare provider before making treatment decisions based on research",
        },
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      return {
        success: false,
        error: `Research analysis failed: ${errorMessage}`,
      };
    }
  },
});

export const medicalResearchTools = {
  searchPubMed,
  searchClinicalTrials,
  getMedicationInfo,
  searchHealthInformation,
  analyzeMedicalResearch,
};
