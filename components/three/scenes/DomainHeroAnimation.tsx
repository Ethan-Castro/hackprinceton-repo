"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useState } from "react";
import { getDomainTheme, type DomainType } from "../utils/DomainTheme";
import { SpeedParticleStream } from "../core/SpeedParticleStream";
import { DomainIcon3D } from "../core/DomainIcon3D";
import { SpeedRings } from "../core/SpeedRings";

interface DomainHeroAnimationProps {
  domain: DomainType;
  className?: string;
}

export function DomainHeroAnimation({
  domain,
  className = "",
}: DomainHeroAnimationProps) {
  const theme = getDomainTheme(domain);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);

    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // Show minimal fallback for users who prefer reduced motion
  if (prefersReducedMotion) {
    return null; // No animation for reduced motion
  }

  return (
    <div
      className={`relative w-full h-64 md:h-80 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      {/* Three.js Canvas with transparent background */}
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        className="w-full h-full"
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          {/* Lighting - subtle and natural */}
          <ambientLight intensity={0.4} />
          <directionalLight position={[5, 5, 5]} intensity={0.8} />
          <pointLight
            position={[0, 0, 3]}
            intensity={1.0}
            color={theme.glowColor}
          />

          {/* Main 3D Icon (center, large) */}
          <DomainIcon3D domain={domain} color={theme.primary} size={1.2} />

          {/* Speed Particle Stream (flowing background) */}
          <SpeedParticleStream
            color={theme.particleColor}
            particleCount={400}
            speed={1.0}
            opacity={0.3}
          />

          {/* Expanding Speed Rings (background effect) */}
          <SpeedRings color={theme.ringColor} count={2} speed={0.6} />
        </Suspense>
      </Canvas>
    </div>
  );
}
