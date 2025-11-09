"use client"

import {
  FormEvent,
  KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import * as THREE from "three"

type ShapeId =
  | "spark"
  | "phone"
  | "apple"
  | "laptop"
  | "car"
  | "chair"
  | "server"
  | "plane"
  | "city"
  | "planet"

type Comparison = {
  threshold: number
  title: string
  description: string
  detail: string
  shape: ShapeId
  cameraZ: number
  story: string
}

const GPU_KG_PER_TOKEN = 3.86e-6
const KG_PER_TOKEN = GPU_KG_PER_TOKEN / 2.4
const GPT5_KG_PER_TOKEN = 7.6e-6 // ≈0.0076 g per token (18.35 Wh / 1k tokens with US grid + PUE 1.2)
const GPT5_REASONING_MULTIPLIER = 5

const comparisons: Comparison[] = [
  {
    threshold: 0,
    title: "One friendly ping",
    description: "Comparable to a single push notification.",
    detail: "~0.00005 kg CO₂",
    shape: "spark",
    cameraZ: 5.4,
    story:
      "Seems harmless — a whisper of carbon that barely registers. CS-3 keeps it near 1.6 mg CO₂ per token, about 2.4× leaner than GPU racks — roughly 2.25 tCO₂ saved every billion tokens.",
  },
  {
    threshold: 0.00003,
    title: "Blinking a status LED",
    description: "The energy for a single LED to glow for a second.",
    detail: "~0.00003 kg CO₂",
    shape: "spark",
    cameraZ: 5.5,
    story: "Tiny pulses add up. Even microscopic emissions are worth watching once prompts start flowing.",
  },
  {
    threshold: 0.00008,
    title: "Reading a push notification",
    description: "Equivalent to the network burst of receiving a notification.",
    detail: "~0.00008 kg CO₂",
    shape: "spark",
    cameraZ: 5.6,
    story: "Your sentence now mirrors the data wake of glancing at your lock screen.",
  },
  {
    threshold: 0.0002,
    title: "Breathing for a second",
    description: "Human respiration emits roughly this much CO₂ per breath.",
    detail: "~0.0002 kg CO₂",
    shape: "spark",
    cameraZ: 5.7,
    story: "Match a single breath and suddenly the footprint feels personal.",
  },
  {
    threshold: 0.0006,
    title: "Sending a short text",
    description: "Cell-tower + device energy for a quick SMS.",
    detail: "~0.0006 kg CO₂",
    shape: "phone",
    cameraZ: 5.8,
    story: "Our chat now rivals a tiny burst across the carrier network.",
  },
  {
    threshold: 0.002,
    title: "Refreshing a webpage",
    description: "A light page load on LTE/Wi-Fi networks.",
    detail: "~0.002 kg CO₂",
    shape: "phone",
    cameraZ: 5.9,
    story: "Still tiny, but the ripple is noticeable—like tapping reload a couple of times.",
  },
  {
    threshold: 0.02,
    title: "Fully charging your phone",
    description: "Roughly the same as filling your phone battery.",
    detail: "~0.008 kg CO₂",
    shape: "phone",
    cameraZ: 6.1,
    story:
      "Now we are in daily-habit territory. Cerebras shows exactly when tinkering turns into tangible demand.",
  },
  {
    threshold: 0.05,
    title: "Growing an apple",
    description: "Energy to grow, harvest, and ship one apple.",
    detail: "~0.03 kg CO₂",
    shape: "apple",
    cameraZ: 6.3,
    story: "Nature starts to feel it: the same oomph it takes to coax fruit from soil is now in your sentence.",
  },
  {
    threshold: 0.15,
    title: "Manufacturing a laptop",
    description: "Short bursts rival building fresh hardware.",
    detail: "~0.08 kg CO₂",
    shape: "laptop",
    cameraZ: 6.7,
    story: "Ideas alone can summon the footprint of forged aluminum. Efficient prompts matter more than ever.",
  },
  {
    threshold: 0.3,
    title: "Driving a car for a mile",
    description: "Dense ideation equals a quick mile in a compact EV.",
    detail: "~0.15 kg CO₂",
    shape: "car",
    cameraZ: 7.1,
    story: "We just left the driveway. Carbon is now a road trip metric, not a whisper.",
  },
  {
    threshold: 0.6,
    title: "Creating a designer chair",
    description: "Sourcing, shaping, and shipping one premium chair.",
    detail: "~0.3 kg CO₂",
    shape: "chair",
    cameraZ: 7.5,
    story: "Entire supply chains come into focus. Cerebras makes sure you see them before they happen.",
  },
  {
    threshold: 1.2,
    title: "Running a rack for an hour",
    description: "About the energy a brisk rack of servers drinks in an hour.",
    detail: "~0.6 kg CO₂",
    shape: "server",
    cameraZ: 7.9,
    story: "You are now keeping a slice of a data center humming. Time to question whether the tokens are worth it.",
  },
  {
    threshold: 2.5,
    title: "Flying a short regional hop",
    description: "Equivalent to a one-way commuter flight segment.",
    detail: "~1.5 kg CO₂",
    shape: "plane",
    cameraZ: 8.3,
    story: "A puddle-jumper’s worth of emissions emerges from pure ideation. Efficiency talks back.",
  },
  {
    threshold: 4.5,
    title: "Lighting a city block",
    description: "Keeping mixed-use buildings glowing for an evening.",
    detail: "~3 kg CO₂",
    shape: "city",
    cameraZ: 8.7,
    story: "Your canvas now touches neighborhoods. Cerebras flags the scale before it quietly locks in.",
  },
  {
    threshold: 6,
    title: "Off the charts",
    description: "Past our planned envelope. Time to pause or offset.",
    detail: ">6 kg CO₂",
    shape: "planet",
    cameraZ: 9.1,
    story: "We zoomed out as far as we go. Carbon is now planetary—either wind it down or plan a corrective action.",
  },
]

const shapeFactories: Record<ShapeId, () => THREE.Object3D> = {
  spark: () => new THREE.Mesh(new THREE.TetrahedronGeometry(0.7, 1), new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.4, roughness: 0.3 })),
  phone: () => {
    const group = new THREE.Group()
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 1.8, 0.15),
      new THREE.MeshStandardMaterial({ color: 0x2b2d42, metalness: 0.6, roughness: 0.4 }),
    )
    const screen = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 1.6, 0.05),
      new THREE.MeshStandardMaterial({ color: 0x1c92ff, emissive: 0x0a1f3f }),
    )
    screen.position.set(0, 0, 0.08)
    group.add(body, screen)
    return group
  },
  apple: () => {
    const group = new THREE.Group()
    const body = new THREE.Mesh(
      new THREE.SphereGeometry(1.1, 48, 48),
      new THREE.MeshStandardMaterial({ color: 0xff5757, metalness: 0.1, roughness: 0.4 }),
    )
    body.scale.set(1, 1, 0.9)
    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 0.6, 12),
      new THREE.MeshStandardMaterial({ color: 0x3a2014 }),
    )
    stem.position.set(0, 1, 0)
    const leaf = new THREE.Mesh(
      new THREE.ConeGeometry(0.25, 0.6, 16),
      new THREE.MeshStandardMaterial({ color: 0x8fe58c }),
    )
    leaf.position.set(0.25, 1.1, 0)
    leaf.rotation.set(0, 0, -0.8)
    group.add(body, stem, leaf)
    return group
  },
  laptop: () => {
    const group = new THREE.Group()
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 0.1, 1.1),
      new THREE.MeshStandardMaterial({ color: 0xdfe3eb, metalness: 0.7, roughness: 0.3 }),
    )
    base.position.set(0, -0.4, 0)
    const screen = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 1.2, 0.08),
      new THREE.MeshStandardMaterial({ color: 0x151515, emissive: 0x0b0b0b }),
    )
    screen.position.set(0, 0.35, -0.45)
    screen.rotation.x = -0.35
    group.add(base, screen)
    return group
  },
  car: () => {
    const group = new THREE.Group()
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 0.6, 1),
      new THREE.MeshStandardMaterial({ color: 0xff914d, metalness: 0.5, roughness: 0.35 }),
    )
    body.position.set(0, -0.2, 0)
    const cabin = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.5, 0.9),
      new THREE.MeshStandardMaterial({ color: 0x1f2a44, metalness: 0.4, roughness: 0.3 }),
    )
    cabin.position.set(-0.1, 0.1, 0)
    const wheelGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.4, 24)
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111010, roughness: 0.6 })
    ;[
      [-0.9, -0.5, 0.5],
      [-0.9, -0.5, -0.5],
      [0.9, -0.5, 0.5],
      [0.9, -0.5, -0.5],
    ].forEach(([x, y, z]) => {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat)
      wheel.rotation.z = Math.PI / 2
      wheel.position.set(x, y, z)
      group.add(wheel)
    })
    group.add(body, cabin)
    return group
  },
  chair: () => {
    const group = new THREE.Group()
    const seat = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 0.15, 1.2),
      new THREE.MeshStandardMaterial({ color: 0xcbb08f, roughness: 0.5 }),
    )
    seat.position.set(0, -0.3, 0)
    const back = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 1.2, 0.15),
      new THREE.MeshStandardMaterial({ color: 0xcbb08f, roughness: 0.5 }),
    )
    back.position.set(0, 0.35, -0.5)
    const legGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.9, 12)
    const legMat = new THREE.MeshStandardMaterial({ color: 0x7b6856 })
    ;[
      [-0.7, -0.8, 0.5],
      [0.7, -0.8, 0.5],
      [-0.7, -0.8, -0.5],
      [0.7, -0.8, -0.5],
    ].forEach(([x, y, z]) => {
      const leg = new THREE.Mesh(legGeo, legMat)
      leg.position.set(x, y, z)
      group.add(leg)
    })
    group.add(seat, back)
    return group
  },
  server: () => {
    const group = new THREE.Group()
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(1, 2.2, 0.8),
      new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.6, roughness: 0.4 }),
    )
    group.add(frame)
    for (let i = 0; i < 6; i += 1) {
      const blade = new THREE.Mesh(
        new THREE.BoxGeometry(0.9, 0.2, 0.7),
        new THREE.MeshStandardMaterial({ color: 0x222f3e, emissive: 0x061b2f }),
      )
      blade.position.set(0, -0.9 + i * 0.35, 0.45)
      group.add(blade)
    }
    return group
  },
  plane: () => {
    const group = new THREE.Group()
    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(0.4, 0.4, 2.6, 16),
      new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.4, roughness: 0.3 }),
    )
    body.rotation.z = Math.PI / 2
    const nose = new THREE.Mesh(
      new THREE.SphereGeometry(0.42, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.4, roughness: 0.3 }),
    )
    nose.position.set(1.3, 0, 0)
    const tail = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.6, 0.05),
      new THREE.MeshStandardMaterial({ color: 0x1c2b5a, metalness: 0.4 }),
    )
    tail.position.set(-1.3, 0.3, 0)
    const wing = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 1.8, 0.6),
      new THREE.MeshStandardMaterial({ color: 0x1c2b5a, metalness: 0.4 }),
    )
    group.add(body, nose, tail, wing)
    return group
  },
  city: () => {
    const group = new THREE.Group()
    for (let i = 0; i < 5; i += 1) {
      const height = 0.8 + Math.random() * 1.4
      const building = new THREE.Mesh(
        new THREE.BoxGeometry(0.5 + Math.random() * 0.4, height, 0.5 + Math.random() * 0.4),
        new THREE.MeshStandardMaterial({
          color: new THREE.Color().setHSL(0.58 + Math.random() * 0.1, 0.25, 0.5),
          metalness: 0.3,
          roughness: 0.4,
        }),
      )
      building.position.set(-0.6 + i * 0.6, -0.8 + height / 2, -0.3 + Math.random() * 0.6)
      group.add(building)
    }
    return group
  },
  planet: () => new THREE.Mesh(
    new THREE.SphereGeometry(1.4, 48, 48),
    new THREE.MeshStandardMaterial({ color: 0x5dade2, emissive: 0x0b1e2b, roughness: 0.35, metalness: 0.2 }),
  ),
}

const getIntensity = (tokens: number) => {
  if (!tokens) return "Idle"
  if (tokens < 180) return "Calm"
  if (tokens < 420) return "Cruising"
  return "Surging"
}

const formatNumber = (value: number) => value.toLocaleString(undefined, { maximumFractionDigits: 0 })

export function CarbonExperience() {
  const [draft, setDraft] = useState("")
  const [sessionTokens, setSessionTokens] = useState(0)
  const [sessionCarbon, setSessionCarbon] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [statusTone, setStatusTone] = useState<"default" | "error" | "success">("default")
  const [showComparison, setShowComparison] = useState(false)

  const previewTokens = useMemo(() => Math.max(0, Math.round(draft.length * 4)), [draft])
  const previewCarbon = useMemo(
    () => Number((previewTokens * KG_PER_TOKEN).toFixed(3)),
    [previewTokens],
  )
  const totalTokens = sessionTokens + (draft ? previewTokens : 0)
  const totalCarbon = useMemo(
    () => Number((sessionCarbon + (draft ? previewCarbon : 0)).toFixed(3)),
    [sessionCarbon, previewCarbon, draft],
  )
  const statLine = `Tokens ${formatNumber(totalTokens)} · Intensity ${getIntensity(totalTokens)}`
  const gpt5Carbon = Number((totalTokens * GPT5_KG_PER_TOKEN).toFixed(3))
  const gpt5ReasoningCarbon = Number(
    (totalTokens * GPT5_KG_PER_TOKEN * GPT5_REASONING_MULTIPLIER).toFixed(3),
  )

  const EXPAND_CHAR_THRESHOLD = 48
  const expanded = draft.length > EXPAND_CHAR_THRESHOLD

  const activeComparison = useMemo(() => {
    return comparisons.reduce((result, option) => {
      if (totalCarbon >= option.threshold) return option
      return result
    }, comparisons[0])
  }, [totalCarbon])

  const submitDraft = useCallback(async () => {
    if (!draft.trim() || isSubmitting) return

    setIsSubmitting(true)
    setStatusTone("default")
    setStatusMessage("Contacting Cerebras for a real token count…")

    try {
      const response = await fetch("/api/carbon/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: draft }),
      })

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}))
        throw new Error(errorPayload?.error ?? "Cerebras API error")
      }

      const payload = await response.json()
      const appliedTokens = Number(payload?.totalTokens ?? 0)

      if (Number.isFinite(appliedTokens) && appliedTokens > 0) {
        setSessionTokens((prev) => prev + appliedTokens)
        setSessionCarbon((prev) =>
          Number((prev + appliedTokens * KG_PER_TOKEN).toFixed(3)),
        )
        setStatusTone("success")
        setStatusMessage(
          `Cerebras logged +${formatNumber(appliedTokens)} tokens (${(appliedTokens * KG_PER_TOKEN).toFixed(3)} kg CO₂).`,
        )
      } else {
        setStatusTone("error")
        setStatusMessage("Cerebras returned zero tokens for this prompt.")
      }

      setDraft("")
    } catch (error) {
      console.error("Carbon submit error", error)
      setStatusTone("error")
      setStatusMessage("Unable to reach Cerebras. Please try again in a moment.")
    } finally {
      setIsSubmitting(false)
    }
  }, [draft, isSubmitting])

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void submitDraft()
  }

  const handleTextareaKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      void submitDraft()
    }
  }

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const footprintRef = useRef<THREE.Mesh | null>(null)
  const comparisonRef = useRef<THREE.Object3D | null>(null)
  const animationRef = useRef<number | null>(null)
  const currentShapeRef = useRef<ShapeId>("spark")

  useEffect(() => {
    if (!canvasRef.current) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100)
    camera.position.set(0, 0, 6)

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true,
    })
    renderer.setPixelRatio(window.devicePixelRatio ?? 1)

    const setRendererSize = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
    }

    setRendererSize()
    window.addEventListener("resize", setRendererSize)

    const ambient = new THREE.AmbientLight(0xffffff, 0.85)
    const directional = new THREE.DirectionalLight(0xffffff, 0.7)
    directional.position.set(4, 6, 8)
    scene.add(ambient, directional)

    const footprint = new THREE.Mesh(
      new THREE.SphereGeometry(0.55, 48, 48),
      new THREE.MeshStandardMaterial({
        color: 0x7cffc4,
        emissive: 0x0d3326,
        roughness: 0.2,
        metalness: 0.3,
      }),
    )
    footprint.position.set(-1.2, -0.1, 0)
    scene.add(footprint)

    const comparison = shapeFactories.spark()
    comparison.position.set(1.2, 0.3, 0)
    scene.add(comparison)

    sceneRef.current = scene
    cameraRef.current = camera
    rendererRef.current = renderer
    footprintRef.current = footprint
    comparisonRef.current = comparison

    const animate = () => {
      animationRef.current = requestAnimationFrame(animate)

      if (footprintRef.current) {
        footprintRef.current.rotation.y += 0.01
        footprintRef.current.position.y = -0.1 + Math.sin(Date.now() * 0.001) * 0.15
      }

      if (comparisonRef.current) {
        comparisonRef.current.rotation.y += 0.008
      }

      renderer.render(scene, camera)
    }

    animate()

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
      window.removeEventListener("resize", setRendererSize)
      renderer.dispose()
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose()
          if (Array.isArray(child.material)) child.material.forEach((m) => m.dispose())
          else child.material.dispose()
        }
      })
    }
  }, [])

  useEffect(() => {
    const camera = cameraRef.current
    const scene = sceneRef.current
    if (!camera || !scene) return

    camera.position.z = activeComparison.cameraZ
    camera.updateProjectionMatrix()

    if (currentShapeRef.current === activeComparison.shape) return

    if (comparisonRef.current) {
      scene.remove(comparisonRef.current)
      comparisonRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose()
          if (Array.isArray(child.material)) child.material.forEach((m) => m.dispose())
          else child.material.dispose()
        }
      })
    }

    const nextShape = shapeFactories[activeComparison.shape]()
    nextShape.position.set(1.2, 0.3, 0)
    scene.add(nextShape)
    comparisonRef.current = nextShape
    currentShapeRef.current = activeComparison.shape
  }, [activeComparison])

  useEffect(() => {
    const maxThreshold = comparisons[comparisons.length - 1]?.threshold ?? 1
    const factor = Math.min(totalCarbon / maxThreshold, 1)
    const scale = 0.8 + factor * 0.8
    comparisonRef.current?.scale.setScalar(scale)
  }, [totalCarbon])

  return (
    <div className="w-full rounded-[32px] bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white shadow-2xl">
      <div className="flex flex-col gap-6 rounded-[32px] px-6 py-8 lg:flex-row lg:items-stretch lg:px-10 lg:py-8">
        <section className="flex flex-1 flex-col items-center justify-center gap-6 lg:gap-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-200/80">
            Cerebras instant carbon
          </p>

          <div className="w-full max-w-xl">
            <form
              onSubmit={handleFormSubmit}
              className="flex items-center gap-3 rounded-[999px] border border-white/10 bg-white/5 px-5 py-3 shadow-[0_20px_80px_rgb(0,0,0,0.45)] backdrop-blur-2xl transition-all duration-300"
            >
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={handleTextareaKeyDown}
                placeholder="Describe the task you want Cerebras to run…"
                aria-label="Describe your idea"
                rows={1}
                className={`flex-1 resize-none bg-transparent text-base text-white placeholder:text-white/50 focus:outline-none ${
                  expanded ? "max-h-28 overflow-y-auto" : "max-h-16"
                }`}
                style={{ lineHeight: "1.35rem" }}
              />
              <button
                type="submit"
                disabled={isSubmitting || !draft.trim()}
                aria-label="Send to Cerebras"
                className="text-emerald-300 hover:text-emerald-200 disabled:text-white/30 transition"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="h-6 w-6"
                  fill="currentColor"
                >
                  <path d="M3.4 20.6 21 12 3.4 3.4l.01 6.9L15 12 3.41 13.7z" />
                </svg>
              </button>
            </form>
            <p className="mt-2 text-center text-xs text-white/55">
              Press Enter to send · Shift+Enter for a newline
            </p>
          </div>

          <p className="max-w-xl text-sm text-white/70">{activeComparison.story}</p>
          {statusMessage && (
            <p
              className={`text-xs ${
                statusTone === "error"
                  ? "text-rose-300"
                  : statusTone === "success"
                  ? "text-emerald-300"
                  : "text-white/60"
              }`}
            >
              {statusMessage}
            </p>
          )}
        </section>

        <div className="hidden w-px bg-white/10 lg:block" />

        <section className="flex flex-1 flex-col items-center gap-4">
          <canvas ref={canvasRef} className="aspect-square w-full max-w-[18rem]" aria-hidden="true" />
          <div className="space-y-2 text-center">
            <p className="text-3xl font-medium">{totalCarbon.toFixed(3)} kg CO₂</p>
            <p className="text-lg font-semibold text-white">{activeComparison.title}</p>
            <p className="text-sm text-white/70">
              {activeComparison.description} {activeComparison.detail}
            </p>
            <p className="text-xs text-white/60">
              CS-3 ≈ 1.6 mg CO₂/token — about 2.4× less energy than comparable GPU stacks (≈2.25 t savings per
              billion tokens).
            </p>
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">{statLine}</p>
        </section>
      </div>

      <div className="mt-4 rounded-[24px] border border-white/10 bg-white/5 px-4 py-2 shadow-[0_12px_45px_rgb(0,0,0,0.45)] backdrop-blur-2xl">
        <button
          type="button"
          onClick={() => setShowComparison((prev) => !prev)}
          className="flex w-full items-center justify-between text-left text-[11px] font-semibold uppercase tracking-[0.35em] text-white/50"
        >
          <span>Model comparison</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className={`h-4 w-4 transition-transform duration-200 ${showComparison ? "rotate-180" : ""}`}
            fill="currentColor"
          >
            <path d="M12 15.5 5 8.5l1.4-1.4L12 12.7l5.6-5.6L19 8.5z" />
          </svg>
        </button>
        <div
          className={`grid gap-3 overflow-hidden text-sm transition-all duration-300 ease-out ${
            showComparison ? "mt-3 max-h-64 opacity-100" : "mt-0 max-h-0 opacity-0"
          } sm:grid-cols-2`}
        >
          <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
            <p className="text-xs text-white/60">Cerebras CS-3 (live)</p>
            <p className="text-lg font-semibold">{totalCarbon.toFixed(3)} kg CO₂</p>
            <p className="text-[11px] text-white/45">
              {formatNumber(totalTokens)} tokens @ {(KG_PER_TOKEN * 1e6).toFixed(1)} mg/token.
            </p>
          </div>
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-3 py-2">
            <p className="text-xs text-emerald-200">GPT-5 (speculative)</p>
            <p className="text-lg font-semibold text-white">{gpt5Carbon.toFixed(3)} kg CO₂</p>
            <p className="text-[11px] text-white/70">
              Reasoning could hit {gpt5ReasoningCarbon.toFixed(3)} kg CO₂ (URI 18.35 Wh/1k tokens).
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
