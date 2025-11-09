import { NextResponse } from "next/server"

const CEREBRAS_API_URL =
  process.env.CEREBRAS_API_URL ?? "https://api.cerebras.ai/v1/chat/completions"
const CEREBRAS_API_KEY = process.env.CEREBRAS_API_KEY
const DEFAULT_MODEL = process.env.CEREBRAS_CARBON_MODEL ?? "llama-3.3-70b"
const DEFAULT_COMPLETION_TOKENS = Number(process.env.CEREBRAS_CARBON_COMPLETION_TOKENS ?? 1024)

export async function POST(req: Request) {
  if (!CEREBRAS_API_KEY) {
    return NextResponse.json({ error: "Missing CEREBRAS_API_KEY." }, { status: 500 })
  }

  let prompt: string | undefined
  let model: string | undefined
  let requestedMaxTokens: number | undefined

  try {
    const body = await req.json()
    prompt = typeof body?.prompt === "string" ? body.prompt : undefined
    model = typeof body?.model === "string" ? body.model : undefined
    requestedMaxTokens =
      typeof body?.maxTokens === "number" && body?.maxTokens > 0 ? body.maxTokens : undefined
  } catch (error) {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 })
  }

  if (!prompt?.trim()) {
    return NextResponse.json({ error: "Prompt is required." }, { status: 400 })
  }

  try {
    const response = await fetch(CEREBRAS_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${CEREBRAS_API_KEY}`,
      },
      body: JSON.stringify({
        model: model ?? DEFAULT_MODEL,
        messages: [{ role: "user", content: prompt }],
        max_tokens: requestedMaxTokens ?? DEFAULT_COMPLETION_TOKENS,
        temperature: 0,
        stream: false,
      }),
    })

    if (!response.ok) {
      const errorPayload = await response.text()
      return NextResponse.json(
        { error: "Cerebras API error", details: errorPayload },
        { status: response.status },
      )
    }

    const data = await response.json()
    const usage = data?.usage ?? {}
    const promptTokens = usage?.prompt_tokens ?? 0
    const completionTokens = usage?.completion_tokens ?? 0
    const totalTokens = usage?.total_tokens ?? promptTokens + completionTokens

    const firstChoice = Array.isArray(data?.choices) ? data.choices[0] : undefined
    const completionText = firstChoice?.message?.content ?? ""

    return NextResponse.json({
      model: data?.model ?? model ?? DEFAULT_MODEL,
      promptTokens,
      completionTokens,
      totalTokens,
      created: data?.created ?? Date.now(),
      completionPreview: completionText,
    })
  } catch (error) {
    console.error("Cerebras estimate error", error)
    return NextResponse.json({ error: "Unable to contact Cerebras." }, { status: 502 })
  }
}
