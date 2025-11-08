"use client"

import { useEffect, useMemo, useRef, useState } from "react"
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

const comparisons: Comparison[] = [
  {
    threshold: 0,
    title: "One friendly ping",
    description: "Comparable to a single push notification.",
    detail: "~0.00005 kg CO₂",
    shape: "spark",
    cameraZ: 5.6,
    story:
      "Seems harmless — a whisper of carbon that barely registers. CS-3 keeps it near 1.6 mg CO₂ per token, about 2.4× leaner than GPU racks — roughly 2.25 tCO₂ saved every billion tokens.",
  },
  {
    threshold: 0.02,
    title: "Fully charging your phone",
    description: "Roughly the same as filling your phone battery.",
    detail: "~0.008 kg CO₂",
    shape: "phone",
    cameraZ: 5.8,
    story: "Now we are in daily-habit territory. Cerebras shows exactly when tinkering turns into tangible demand.",
  },
  {
    threshold: 0.05,
    title: "Growing an apple",
    description: "Energy to grow, harvest, and ship one apple.",
    detail: "~0.03 kg CO₂",
    shape: "apple",
    cameraZ: 6.2,
    story: "Nature starts to feel it: the same oomph it takes to coax fruit from soil is now in your sentence.",
  },
  {
    threshold: 0.15,
    title: "Manufacturing a laptop",
    description: "Short bursts rival building fresh hardware.",
    detail: "~0.08 kg CO₂",
    shape: "laptop",
    cameraZ: 6.6,
    story: "Ideas alone can summon the footprint of forged aluminum. Efficient prompts matter more than ever.",
  },
  {
    threshold: 0.3,
    title: "Driving a car for a mile",
    description: "Dense ideation equals a quick mile in a compact EV.",
    detail: "~0.15 kg CO₂",
    shape: "car",
    cameraZ: 7,
    story: "We just left the driveway. Carbon is now a road trip metric, not a whisper.",
  },
  {
    threshold: 0.6,
    title: "Creating a designer chair",
    description: "Sourcing, shaping, and shipping one premium chair.",
    detail: "~0.3 kg CO₂",
    shape: "chair",
    cameraZ: 7.4,
    story: "Entire supply chains come into focus. Cerebras makes sure you see them before they happen.",
  },
  {
    threshold: 1.2,
    title: "Running a rack for an hour",
    description: "About the energy a brisk rack of servers drinks in an hour.",
    detail: "~0.6 kg CO₂",
    shape: "server",
    cameraZ: 7.8,
    story: "You are now keeping a slice of a data center humming. Time to question whether the tokens are worth it.",
  },
  {
    threshold: 2.5,
    title: "Flying a short regional hop",
    description: "Equivalent to a one-way commuter flight segment.",
    detail: "~1.5 kg CO₂",
    shape: "plane",
    cameraZ: 8.2,
    story: "A puddle-jumper’s worth of emissions emerges from pure ideation. Efficiency talks back.",
  },
  {
    threshold: 4.5,
    title: "Lighting a city block",
    description: "Keeping mixed-use buildings glowing for an evening.",
    detail: "~3 kg CO₂",
    shape: "city",
    cameraZ: 8.6,
    story: "Your canvas now touches neighborhoods. Cerebras flags the scale before it quietly locks in.",
  },
  {
    threshold: 6,
    title: "Off the charts",
    description: "Past our planned envelope. Time to pause or offset.",
    detail: ">6 kg CO₂",
    shape: "planet",
    cameraZ: 9,
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
  // Approximate tokens: characters ÷ 4 (simple heuristic)
  const tokens = useMemo(() => Math.max(0, Math.round(draft.length / 4)), [draft])
  const carbonKg = useMemo(() => Number((tokens * KG_PER_TOKEN).toFixed(3)), [tokens])
  const statLine = `Tokens ${formatNumber(tokens)} · Intensity ${getIntensity(tokens)}`

  // Dynamic expansion threshold (characters). Once exceeded, bubble grows to larger size.
  const EXPAND_CHAR_THRESHOLD = 48
  const expanded = draft.length > EXPAND_CHAR_THRESHOLD

  const activeComparison = useMemo(() => {
    return comparisons.reduce((result, option) => {
      if (carbonKg >= option.threshold) return option
      return result
    }, comparisons[0])
  }, [carbonKg])

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer>()
  const sceneRef = useRef<THREE.Scene>()
  const cameraRef = useRef<THREE.PerspectiveCamera>()
  const footprintRef = useRef<THREE.Mesh>()
  const comparisonRef = useRef<THREE.Object3D>()
  const animationRef = useRef<number>()
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
    const factor = Math.min(carbonKg / maxThreshold, 1)
    const scale = 0.8 + factor * 0.8
    comparisonRef.current?.scale.setScalar(scale)
  }, [carbonKg])

  return (
    <div className="w-full rounded-[32px] bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white shadow-2xl">
      <div className="flex flex-col gap-8 rounded-[32px] px-6 py-10 lg:flex-row lg:items-stretch lg:px-12">
  <section className="flex flex-1 flex-col items-center justify-center gap-6 lg:gap-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-200/80">
            Cerebras instant carbon
          </p>
          <div
            className={`mt-2 md:mt-4 w-full max-w-xl rounded-[999px] border border-white/10 bg-white/5 shadow-[0_20px_80px_rgb(0,0,0,0.45)] backdrop-blur-2xl overflow-hidden transition-all duration-300 ${
              expanded ? 'p-4 md:p-5' : 'p-3 md:p-4'
            }`}
          >
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Hi, how can I help?"
              aria-label="Describe your idea"
              rows={4}
              className={`w-full resize-none bg-transparent text-base md:text-[1.02rem] text-white placeholder:text-white/50 focus:outline-none px-5 md:px-6 transition-[height,padding] duration-300 ease-out ${
                expanded
                  ? 'h-20 md:h-24 leading-6 md:leading-7 py-3 md:py-4'
                  : 'h-12 md:h-14 leading-[1.35rem] md:leading-[1.4rem] py-2 md:py-2.5'
              }`}
            />
          </div>
          <p className="max-w-xl text-sm text-white/70">{activeComparison.story}</p>
        </section>

        <div className="hidden w-px bg-white/10 lg:block" />

        <section className="flex flex-1 flex-col items-center gap-5">
          <canvas ref={canvasRef} className="aspect-square w-full max-w-sm" aria-hidden="true" />
          <div className="space-y-2 text-center">
            <p className="text-3xl font-medium">{carbonKg.toFixed(3)} kg CO₂</p>
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
    </div>
  )
}
