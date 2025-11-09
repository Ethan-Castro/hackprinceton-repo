import { NextResponse } from "next/server";
import {
  getEnabledModelDefinitions,
  getProviderStatus,
} from "@/lib/server/model-definitions";

export async function GET() {
  try {
    const providerStatus = getProviderStatus();
    const enabledModels = getEnabledModelDefinitions().map((definition) => ({
      id: definition.id,
      name: definition.name,
      description: "",
      modelType: "language",
    }));

    return NextResponse.json({
      models: enabledModels,
      meta: {
        providers: providerStatus,
        hasAnyProviders: enabledModels.length > 0,
      },
    });
  } catch (error) {
    console.error("[Models API] Error:", error);
    
    return NextResponse.json(
      {
        models: [],
        error: "Failed to fetch models",
      },
      { status: 500 }
    );
  }
}
