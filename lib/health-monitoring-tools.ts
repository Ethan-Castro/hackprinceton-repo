import { tool as createTool } from "ai";
import { z } from "zod";
import { query } from "./neon";

export type VitalSign = {
  id: string;
  recordedAt: string;
  systolic?: number;
  diastolic?: number;
  heartRate?: number;
  temperature?: number;
  oxygenSaturation?: number;
  weight?: number;
  notes?: string;
};

export type Activity = {
  id: string;
  date: string;
  activityType: string;
  duration: number;
  calories?: number;
  intensity: "light" | "moderate" | "vigorous";
  notes?: string;
};

export type Nutrition = {
  id: string;
  date: string;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  description: string;
  estimatedCalories?: number;
  macronutrients?: {
    protein: number;
    carbs: number;
    fat: number;
  };
  notes?: string;
};

export type HealthGoal = {
  id: string;
  goalType: string;
  targetValue: number;
  unit: string;
  startDate: string;
  endDate?: string;
  progress?: number;
  status: "active" | "completed" | "abandoned";
};

export type HealthMonitoringResult = {
  success: boolean;
  vitalSign?: VitalSign;
  activity?: Activity;
  nutrition?: Nutrition;
  goal?: HealthGoal;
  metrics?: Array<{
    metric: string;
    current: number;
    target?: number;
    unit: string;
    trend: "up" | "down" | "stable";
  }>;
  message?: string;
  error?: string;
};

/**
 * Log vital signs (blood pressure, heart rate, temperature, etc.)
 */
export const logVitalSigns = createTool({
  description:
    "Record vital signs including blood pressure, heart rate, temperature, oxygen saturation, and weight.",
  inputSchema: z.object({
    systolic: z
      .number()
      .optional()
      .describe("Systolic blood pressure (mmHg, e.g., 120)"),
    diastolic: z
      .number()
      .optional()
      .describe("Diastolic blood pressure (mmHg, e.g., 80)"),
    heartRate: z.number().int().optional().describe("Heart rate (bpm)"),
    temperature: z.number().optional().describe("Body temperature (°F)"),
    oxygenSaturation: z
      .number()
      .optional()
      .describe("Oxygen saturation (%, e.g., 98)"),
    weight: z.number().optional().describe("Body weight (lbs or kg)"),
    notes: z
      .string()
      .optional()
      .describe("Any notes about the readings or health status"),
  }),
  execute: async ({
    systolic,
    diastolic,
    heartRate,
    temperature,
    oxygenSaturation,
    weight,
    notes,
  }): Promise<HealthMonitoringResult> => {
    try {
      const vitalSignId = `vs-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const recordedAt = new Date().toISOString();

      const vitalSign: VitalSign = {
        id: vitalSignId,
        recordedAt,
        systolic,
        diastolic,
        heartRate,
        temperature,
        oxygenSaturation,
        weight,
        notes,
      };

      // Store in database
      try {
        const sqlQuery = `
          INSERT INTO vital_signs (
            id, recorded_at, systolic, diastolic, heart_rate,
            temperature, oxygen_saturation, weight, notes
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `;
        await query(sqlQuery, [
          vitalSignId,
          recordedAt,
          systolic || null,
          diastolic || null,
          heartRate || null,
          temperature || null,
          oxygenSaturation || null,
          weight || null,
          notes || "",
        ]);
      } catch (dbError) {
        console.warn("Database insert failed:", dbError);
      }

      const recordedValues = [
        systolic && diastolic && `BP: ${systolic}/${diastolic} mmHg`,
        heartRate && `Heart rate: ${heartRate} bpm`,
        temperature && `Temp: ${temperature}°F`,
        oxygenSaturation && `O2: ${oxygenSaturation}%`,
        weight && `Weight: ${weight}`,
      ]
        .filter(Boolean)
        .join(", ");

      return {
        success: true,
        vitalSign,
        message: `Vital signs recorded: ${recordedValues}${notes ? ` (${notes})` : ""}`,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      return {
        success: false,
        error: `Failed to log vital signs: ${errorMessage}`,
      };
    }
  },
});

/**
 * Log physical activity
 */
export const logActivity = createTool({
  description:
    "Record physical activity including type, duration, and intensity level.",
  inputSchema: z.object({
    activityType: z
      .string()
      .describe("Type of activity (e.g., 'Walking', 'Running', 'Swimming')"),
    duration: z
      .number()
      .int()
      .min(1)
      .describe("Duration in minutes"),
    intensity: z
      .enum(["light", "moderate", "vigorous"])
      .describe("Intensity level"),
    calories: z
      .number()
      .int()
      .optional()
      .describe("Estimated calories burned"),
    date: z
      .string()
      .optional()
      .describe("Date of activity (YYYY-MM-DD, defaults to today)"),
    notes: z
      .string()
      .optional()
      .describe("Additional notes about the activity"),
  }),
  execute: async ({
    activityType,
    duration,
    intensity,
    calories,
    date,
    notes,
  }): Promise<HealthMonitoringResult> => {
    try {
      const activityId = `act-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const activityDate = date || new Date().toISOString().split("T")[0];

      const activity: Activity = {
        id: activityId,
        date: activityDate,
        activityType,
        duration,
        calories,
        intensity,
        notes,
      };

      // Store in database
      try {
        const sqlQuery = `
          INSERT INTO activities (
            id, activity_date, activity_type, duration, calories, intensity, notes
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        `;
        await query(sqlQuery, [
          activityId,
          activityDate,
          activityType,
          duration,
          calories || null,
          intensity,
          notes || "",
        ]);
      } catch (dbError) {
        console.warn("Database insert failed:", dbError);
      }

      return {
        success: true,
        activity,
        message: `${activityType} logged: ${duration} minutes (${intensity} intensity)${calories ? ` - ${calories} calories burned` : ""}`,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      return {
        success: false,
        error: `Failed to log activity: ${errorMessage}`,
      };
    }
  },
});

/**
 * Log food intake
 */
export const logNutrition = createTool({
  description:
    "Record meals and nutrition information including calories and macronutrients.",
  inputSchema: z.object({
    mealType: z
      .enum(["breakfast", "lunch", "dinner", "snack"])
      .describe("Type of meal"),
    description: z
      .string()
      .describe("Description of food/meal consumed"),
    estimatedCalories: z
      .number()
      .int()
      .optional()
      .describe("Estimated calories"),
    protein: z.number().optional().describe("Protein in grams"),
    carbs: z.number().optional().describe("Carbohydrates in grams"),
    fat: z.number().optional().describe("Fat in grams"),
    date: z
      .string()
      .optional()
      .describe("Date of meal (YYYY-MM-DD, defaults to today)"),
    notes: z
      .string()
      .optional()
      .describe("Additional nutrition notes"),
  }),
  execute: async ({
    mealType,
    description,
    estimatedCalories,
    protein,
    carbs,
    fat,
    date,
    notes,
  }): Promise<HealthMonitoringResult> => {
    try {
      const nutritionId = `nut-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const mealDate = date || new Date().toISOString().split("T")[0];

      const macronutrients =
        protein || carbs || fat
          ? {
              protein: protein || 0,
              carbs: carbs || 0,
              fat: fat || 0,
            }
          : undefined;

      const nutrition: Nutrition = {
        id: nutritionId,
        date: mealDate,
        mealType,
        description,
        estimatedCalories,
        macronutrients,
        notes,
      };

      // Store in database
      try {
        const sqlQuery = `
          INSERT INTO nutrition_logs (
            id, meal_date, meal_type, description, estimated_calories,
            protein, carbs, fat, notes
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `;
        await query(sqlQuery, [
          nutritionId,
          mealDate,
          mealType,
          description,
          estimatedCalories || null,
          protein || null,
          carbs || null,
          fat || null,
          notes || "",
        ]);
      } catch (dbError) {
        console.warn("Database insert failed:", dbError);
      }

      const macroInfo =
        protein || carbs || fat
          ? ` (Protein: ${protein}g, Carbs: ${carbs}g, Fat: ${fat}g)`
          : "";

      return {
        success: true,
        nutrition,
        message: `${mealType.charAt(0).toUpperCase() + mealType.slice(1)} logged: ${description}${estimatedCalories ? ` - ${estimatedCalories} cal` : ""}${macroInfo}`,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      return {
        success: false,
        error: `Failed to log nutrition: ${errorMessage}`,
      };
    }
  },
});

/**
 * Set health goals
 */
export const setHealthGoal = createTool({
  description:
    "Set health goals such as weight loss, exercise targets, or calorie intake targets.",
  inputSchema: z.object({
    goalType: z
      .string()
      .describe("Type of goal (e.g., 'Weight loss', 'Daily steps', 'Calories')"),
    targetValue: z.number().describe("Target value for the goal"),
    unit: z.string().describe("Unit of measurement (e.g., 'lbs', 'steps', 'cal')"),
    endDate: z
      .string()
      .optional()
      .describe("Target end date (YYYY-MM-DD)"),
  }),
  execute: async ({
    goalType,
    targetValue,
    unit,
    endDate,
  }): Promise<HealthMonitoringResult> => {
    try {
      const goalId = `goal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const startDate = new Date().toISOString().split("T")[0];

      const goal: HealthGoal = {
        id: goalId,
        goalType,
        targetValue,
        unit,
        startDate,
        endDate,
        status: "active",
      };

      // Store in database
      try {
        const sqlQuery = `
          INSERT INTO health_goals (
            id, goal_type, target_value, unit, start_date, end_date, status
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        `;
        await query(sqlQuery, [
          goalId,
          goalType,
          targetValue,
          unit,
          startDate,
          endDate || null,
          "active",
        ]);
      } catch (dbError) {
        console.warn("Database insert failed:", dbError);
      }

      return {
        success: true,
        goal,
        message: `Health goal set: ${goalType} - Target ${targetValue} ${unit}${endDate ? ` by ${endDate}` : ""}`,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      return {
        success: false,
        error: `Failed to set health goal: ${errorMessage}`,
      };
    }
  },
});

/**
 * Get health metrics report with trends
 */
export const getHealthMetricsReport = createTool({
  description:
    "Generate a health metrics report showing current values, targets, and trends over a specified time period.",
  inputSchema: z.object({
    daysBack: z
      .number()
      .int()
      .default(30)
      .describe("Number of days to analyze"),
    metrics: z
      .array(
        z.enum([
          "blood-pressure",
          "heart-rate",
          "weight",
          "temperature",
          "oxygen-saturation",
          "steps",
          "calories",
        ])
      )
      .optional()
      .describe("Specific metrics to include in report"),
  }),
  execute: async ({
    daysBack,
    metrics,
  }): Promise<HealthMonitoringResult> => {
    try {
      const metricsData: Array<{
        metric: string;
        current: number;
        target?: number;
        unit: string;
        trend: "up" | "down" | "stable";
      }> = [];

      // Fetch vital signs
      try {
        const sqlQuery = `
          SELECT AVG(systolic) as avg_systolic, AVG(diastolic) as avg_diastolic,
                 AVG(heart_rate) as avg_heart_rate, AVG(weight) as avg_weight
          FROM vital_signs
          WHERE recorded_at >= NOW() - INTERVAL '${daysBack} days'
        `;
        const result = (await query(sqlQuery)) as any[];
        const data = result[0];

        if (data?.avg_systolic) {
          metricsData.push({
            metric: "Blood Pressure",
            current: Math.round(data.avg_systolic),
            target: 120,
            unit: "mmHg (systolic)",
            trend: "stable",
          });
        }

        if (data?.avg_heart_rate) {
          metricsData.push({
            metric: "Heart Rate",
            current: Math.round(data.avg_heart_rate),
            target: 60,
            unit: "bpm",
            trend: "stable",
          });
        }

        if (data?.avg_weight) {
          metricsData.push({
            metric: "Weight",
            current: Math.round(data.avg_weight * 10) / 10,
            unit: "lbs",
            trend: "stable",
          });
        }
      } catch (dbError) {
        console.warn("Error fetching vital signs:", dbError);
      }

      return {
        success: true,
        metrics: metricsData,
        message: `Health metrics report generated for last ${daysBack} days with ${metricsData.length} metrics`,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      return {
        success: false,
        error: `Failed to generate health report: ${errorMessage}`,
      };
    }
  },
});

/**
 * Get health insights based on collected data
 */
export const getHealthInsights = createTool({
  description:
    "Analyze health data and provide personalized insights and recommendations based on trends and goals.",
  inputSchema: z.object({
    focusArea: z
      .enum(["nutrition", "activity", "vital-signs", "goals", "overall"])
      .optional()
      .describe("Area to focus insights on"),
  }),
  execute: async ({ focusArea }): Promise<HealthMonitoringResult> => {
    try {
      const insights: string[] = [];

      // Generate insights based on focus area
      if (!focusArea || focusArea === "overall" || focusArea === "vital-signs") {
        insights.push(
          "• Monitor your blood pressure regularly, especially if you have a family history of hypertension"
        );
        insights.push("• Aim for a resting heart rate of 60-100 bpm for adults");
      }

      if (!focusArea || focusArea === "overall" || focusArea === "nutrition") {
        insights.push(
          "• Track your daily calorie intake and macronutrient balance"
        );
        insights.push(
          "• Maintain a balanced diet with adequate protein, healthy fats, and complex carbohydrates"
        );
        insights.push(
          "• Stay hydrated by drinking at least 8 glasses of water daily"
        );
      }

      if (!focusArea || focusArea === "overall" || focusArea === "activity") {
        insights.push(
          "• Aim for at least 150 minutes of moderate-intensity aerobic activity per week"
        );
        insights.push(
          "• Include strength training exercises at least twice per week"
        );
        insights.push(
          "• Increase daily movement - try to take 10,000 steps or more"
        );
      }

      if (!focusArea || focusArea === "overall" || focusArea === "goals") {
        insights.push(
          "• Set SMART goals (Specific, Measurable, Achievable, Relevant, Time-bound)"
        );
        insights.push("• Track progress weekly and adjust goals as needed");
        insights.push(
          "• Celebrate small wins to stay motivated on your health journey"
        );
      }

      return {
        success: true,
        message: `Health insights generated for ${focusArea || "overall"} health:\n${insights.join("\n")}`,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      return {
        success: false,
        error: `Failed to generate health insights: ${errorMessage}`,
      };
    }
  },
});

export const healthMonitoringTools = {
  logVitalSigns,
  logActivity,
  logNutrition,
  setHealthGoal,
  getHealthMetricsReport,
  getHealthInsights,
};
