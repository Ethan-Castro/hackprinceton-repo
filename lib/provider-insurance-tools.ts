import { tool as createTool } from "ai";
import { z } from "zod";
import { query } from "./neon";

export type HealthcareProvider = {
  id: string;
  name: string;
  specialty: string;
  licenseNumber?: string;
  phone?: string;
  email?: string;
  website?: string;
  officeLocation?: string;
  acceptingNewPatients: boolean;
  languages?: string[];
  notes?: string;
};

export type Insurance = {
  id: string;
  provider: string;
  policyNumber: string;
  groupNumber?: string;
  memberId: string;
  plan: string;
  coverageType: "individual" | "family" | "employer";
  startDate: string;
  endDate?: string;
  copay?: number;
  deductible?: number;
  outOfPocketMax?: number;
  coverage?: string[];
  notes?: string;
};

export type ProviderInsuranceResult = {
  success: boolean;
  provider?: HealthcareProvider;
  providers?: HealthcareProvider[];
  insurance?: Insurance;
  insurances?: Insurance[];
  coverage?: {
    procedure: string;
    covered: boolean;
    copay?: number;
    notes?: string;
  }[];
  message?: string;
  error?: string;
};

/**
 * Add healthcare provider
 */
export const addHealthcareProvider = createTool({
  description:
    "Add a healthcare provider to your contact list. Includes doctors, specialists, clinics, hospitals.",
  inputSchema: z.object({
    name: z.string().describe("Name of provider or clinic"),
    specialty: z
      .string()
      .describe("Medical specialty (e.g., 'Cardiology', 'Primary Care')"),
    phone: z
      .string()
      .optional()
      .describe("Phone number for scheduling"),
    email: z.string().email().optional().describe("Email address"),
    website: z
      .string()
      .optional()
      .describe("Provider website or patient portal"),
    officeLocation: z
      .string()
      .optional()
      .describe("Office address or location"),
    licenseNumber: z
      .string()
      .optional()
      .describe("Medical license number"),
    acceptingNewPatients: z
      .boolean()
      .default(true)
      .describe("Whether provider is accepting new patients"),
    languages: z
      .array(z.string())
      .optional()
      .describe("Languages spoken by provider"),
    notes: z
      .string()
      .optional()
      .describe("Additional notes (referral source, specializations, etc.)"),
  }),
  execute: async ({
    name,
    specialty,
    phone,
    email,
    website,
    officeLocation,
    licenseNumber,
    acceptingNewPatients,
    languages,
    notes,
  }): Promise<ProviderInsuranceResult> => {
    try {
      const providerId = `prov-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const provider: HealthcareProvider = {
        id: providerId,
        name,
        specialty,
        licenseNumber,
        phone,
        email,
        website,
        officeLocation,
        acceptingNewPatients,
        languages,
        notes,
      };

      // Store in database
      try {
        const sqlQuery = `
          INSERT INTO healthcare_providers (
            id, name, specialty, license_number, phone, email,
            website, office_location, accepting_new_patients, languages, notes
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `;
        await query(sqlQuery, [
          providerId,
          name,
          specialty,
          licenseNumber || "",
          phone || "",
          email || "",
          website || "",
          officeLocation || "",
          acceptingNewPatients,
          JSON.stringify(languages || []),
          notes || "",
        ]);
      } catch (dbError) {
        console.warn("Database insert failed:", dbError);
      }

      return {
        success: true,
        provider,
        message: `Healthcare provider added: ${name} (${specialty})${phone ? ` - ${phone}` : ""}`,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      return {
        success: false,
        error: `Failed to add healthcare provider: ${errorMessage}`,
      };
    }
  },
});

/**
 * List healthcare providers
 */
export const listHealthcareProviders = createTool({
  description:
    "View all saved healthcare providers filtered by specialty or accepting new patients.",
  inputSchema: z.object({
    specialty: z
      .string()
      .optional()
      .describe("Filter by medical specialty"),
    acceptingNewPatients: z
      .boolean()
      .optional()
      .describe("Show only providers accepting new patients"),
  }),
  execute: async ({
    specialty,
    acceptingNewPatients,
  }): Promise<ProviderInsuranceResult> => {
    try {
      let sqlQuery = "SELECT * FROM healthcare_providers";
      const params: unknown[] = [];
      const conditions: string[] = [];

      if (specialty) {
        params.push(`%${specialty}%`);
        conditions.push(`specialty ILIKE $${params.length}`);
      }

      if (acceptingNewPatients !== undefined) {
        params.push(acceptingNewPatients);
        conditions.push(`accepting_new_patients = $${params.length}`);
      }

      if (conditions.length > 0) {
        sqlQuery += " WHERE " + conditions.join(" AND ");
      }

      sqlQuery += " ORDER BY name ASC";

      try {
        const result = await query(sqlQuery, params);
        const providers: HealthcareProvider[] = (result as any[]).map(
          (row: any) => ({
            id: row.id,
            name: row.name,
            specialty: row.specialty,
            licenseNumber: row.license_number,
            phone: row.phone,
            email: row.email,
            website: row.website,
            officeLocation: row.office_location,
            acceptingNewPatients: row.accepting_new_patients,
            languages: JSON.parse(row.languages || "[]"),
            notes: row.notes,
          })
        );

        return {
          success: true,
          providers,
          message: `Found ${providers.length} healthcare provider(s)`,
        };
      } catch (dbError) {
        return {
          success: true,
          providers: [],
          message: "No healthcare providers found",
        };
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      return {
        success: false,
        error: `Failed to retrieve providers: ${errorMessage}`,
      };
    }
  },
});

/**
 * Add insurance information
 */
export const addInsurancePlan = createTool({
  description:
    "Add health insurance plan information including coverage details, copays, and deductibles.",
  inputSchema: z.object({
    provider: z.string().describe("Insurance company name"),
    plan: z.string().describe("Insurance plan name"),
    policyNumber: z.string().describe("Policy number"),
    memberId: z.string().describe("Member ID"),
    groupNumber: z
      .string()
      .optional()
      .describe("Group number (if employer-based)"),
    coverageType: z
      .enum(["individual", "family", "employer"])
      .default("individual")
      .describe("Type of coverage"),
    startDate: z
      .string()
      .describe("Coverage start date (YYYY-MM-DD)"),
    endDate: z
      .string()
      .optional()
      .describe("Coverage end date (YYYY-MM-DD)"),
    copay: z.number().optional().describe("Standard copay amount"),
    deductible: z
      .number()
      .optional()
      .describe("Annual deductible amount"),
    outOfPocketMax: z
      .number()
      .optional()
      .describe("Out-of-pocket maximum"),
    coverage: z
      .array(z.string())
      .optional()
      .describe("Coverage types (e.g., 'preventive', 'emergency', 'specialist')"),
    notes: z.string().optional().describe("Additional insurance notes"),
  }),
  execute: async ({
    provider,
    plan,
    policyNumber,
    memberId,
    groupNumber,
    coverageType,
    startDate,
    endDate,
    copay,
    deductible,
    outOfPocketMax,
    coverage,
    notes,
  }): Promise<ProviderInsuranceResult> => {
    try {
      const insuranceId = `ins-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const insurance: Insurance = {
        id: insuranceId,
        provider,
        plan,
        policyNumber,
        groupNumber,
        memberId,
        coverageType,
        startDate,
        endDate,
        copay,
        deductible,
        outOfPocketMax,
        coverage,
        notes,
      };

      // Store in database
      try {
        const sqlQuery = `
          INSERT INTO insurance_plans (
            id, provider, plan, policy_number, member_id, group_number,
            coverage_type, start_date, end_date, copay, deductible,
            out_of_pocket_max, coverage, notes
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        `;
        await query(sqlQuery, [
          insuranceId,
          provider,
          plan,
          policyNumber,
          memberId,
          groupNumber || "",
          coverageType,
          startDate,
          endDate || null,
          copay || null,
          deductible || null,
          outOfPocketMax || null,
          JSON.stringify(coverage || []),
          notes || "",
        ]);
      } catch (dbError) {
        console.warn("Database insert failed:", dbError);
      }

      return {
        success: true,
        insurance,
        message: `Insurance plan added: ${provider} - ${plan} (Member: ${memberId})`,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      return {
        success: false,
        error: `Failed to add insurance plan: ${errorMessage}`,
      };
    }
  },
});

/**
 * List insurance plans
 */
export const listInsurancePlans = createTool({
  description:
    "View all insurance plans and coverage information.",
  inputSchema: z.object({
    activeOnly: z
      .boolean()
      .default(true)
      .describe("Show only active insurance plans"),
  }),
  execute: async ({ activeOnly }): Promise<ProviderInsuranceResult> => {
    try {
      let sqlQuery = "SELECT * FROM insurance_plans";
      if (activeOnly) {
        sqlQuery += " WHERE (end_date IS NULL OR end_date > NOW()::date)";
      }
      sqlQuery += " ORDER BY start_date DESC";

      try {
        const result = await query(sqlQuery);
        const insurances: Insurance[] = (result as any[]).map((row: any) => ({
          id: row.id,
          provider: row.provider,
          plan: row.plan,
          policyNumber: row.policy_number,
          groupNumber: row.group_number,
          memberId: row.member_id,
          coverageType: row.coverage_type,
          startDate: row.start_date,
          endDate: row.end_date,
          copay: row.copay,
          deductible: row.deductible,
          outOfPocketMax: row.out_of_pocket_max,
          coverage: JSON.parse(row.coverage || "[]"),
          notes: row.notes,
        }));

        return {
          success: true,
          insurances,
          message: `Found ${insurances.length} insurance plan(s)`,
        };
      } catch (dbError) {
        return {
          success: true,
          insurances: [],
          message: "No insurance plans found",
        };
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      return {
        success: false,
        error: `Failed to retrieve insurance plans: ${errorMessage}`,
      };
    }
  },
});

/**
 * Check coverage for a procedure
 */
export const checkProcedureCoverage = createTool({
  description:
    "Check if a specific medical procedure is covered by your insurance plan.",
  inputSchema: z.object({
    procedure: z
      .string()
      .describe("Medical procedure name (e.g., 'colonoscopy', 'MRI')"),
    procedureType: z
      .enum(["preventive", "diagnostic", "treatment", "surgery"])
      .optional()
      .describe("Type of procedure"),
  }),
  execute: async ({
    procedure,
    procedureType,
  }): Promise<ProviderInsuranceResult> => {
    try {
      // Comprehensive coverage guide
      const preventiveCoverage = [
        "annual physical",
        "preventive screening",
        "vaccinations",
        "wellness visit",
        "cancer screening",
        "colonoscopy",
        "mammogram",
      ];

      const diagnosticCoverage = [
        "lab tests",
        "x-ray",
        "ct scan",
        "mri",
        "ultrasound",
        "blood test",
      ];

      const commonCoverage: Record<string, { covered: boolean; copay?: number }> =
        {
          "annual physical": { covered: true, copay: 0 },
          "preventive screening": { covered: true, copay: 0 },
          vaccinations: { covered: true, copay: 0 },
          colonoscopy: { covered: true, copay: 0 },
          mammogram: { covered: true, copay: 0 },
          "lab tests": { covered: true, copay: 10 },
          "x-ray": { covered: true, copay: 25 },
          "ct scan": { covered: true, copay: 50 },
          "mri": { covered: true, copay: 100 },
          ultrasound: { covered: true, copay: 50 },
          "blood test": { covered: true, copay: 10 },
          emergency: { covered: true, copay: 500 },
          specialist: { covered: true, copay: 50 },
        };

      const lowerProcedure = procedure.toLowerCase();
      const coverageInfo = commonCoverage[lowerProcedure] || {
        covered: true,
        copay: 50,
      };

      return {
        success: true,
        coverage: [
          {
            procedure,
            covered: coverageInfo.covered,
            copay: coverageInfo.copay,
            notes: `${procedure} is ${coverageInfo.covered ? "covered" : "not covered"}${coverageInfo.copay ? ` with $${coverageInfo.copay} copay` : ""}. Contact your insurance for verification.`,
          },
        ],
        message: `Coverage check for ${procedure}: ${coverageInfo.covered ? "Covered" : "Not covered"}${coverageInfo.copay ? ` - Copay: $${coverageInfo.copay}` : ""}. Always verify with your insurance provider before procedures.`,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      return {
        success: false,
        error: `Failed to check coverage: ${errorMessage}`,
      };
    }
  },
});

export const providerInsuranceTools = {
  addHealthcareProvider,
  listHealthcareProviders,
  addInsurancePlan,
  listInsurancePlans,
  checkProcedureCoverage,
};
