"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useEffect, useState, useRef } from "react";
import { Float } from "@react-three/drei";
import * as THREE from "three";
import { SpeedParticleStream } from "../core/SpeedParticleStream";
import { SpeedRings } from "../core/SpeedRings";

// Lightning Bolt 3D Icon
function LightningBolt3D() {
  const groupRef = useRef<THREE.Group>(null);

  // Animate: breathing effect + emissive glow pulsing + rotation
  useFrame((state) => {
    if (!groupRef.current) return;

    const time = state.clock.elapsedTime;

    // Breathing scale animation
    const scale = 1 + Math.sin(time * 0.8) * 0.05;
    groupRef.current.scale.set(scale, scale, scale);

    // Slow rotation
    groupRef.current.rotation.y = time * 0.3;
    groupRef.current.rotation.z = Math.sin(time * 0.5) * 0.1;

    // Pulse emissive intensity
    groupRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
        const intensity = 0.5 + Math.sin(time * 1.5) * 0.3;
        child.material.emissiveIntensity = intensity;
      }
    });
  });

  const yellowColor = 0xfbbf24; // yellow-400
  const material = new THREE.MeshStandardMaterial({
    color: yellowColor,
    emissive: yellowColor,
    emissiveIntensity: 0.5,
    metalness: 0.8,
    roughness: 0.2,
  });

  return (
    <Float
      speed={1.5}
      rotationIntensity={0.2}
      floatIntensity={0.5}
      floatingRange={[-0.1, 0.1]}
    >
      <group ref={groupRef}>
        {/* Main lightning bolt body - zigzag shape */}

        {/* Top segment */}
        <mesh position={[0, 0.8, 0]} rotation={[0, 0, 0.3]} material={material}>
          <boxGeometry args={[0.25, 0.8, 0.15]} />
        </mesh>

        {/* Middle-top segment (angled) */}
        <mesh position={[0.15, 0.2, 0]} rotation={[0, 0, -0.3]} material={material}>
          <boxGeometry args={[0.25, 0.7, 0.15]} />
        </mesh>

        {/* Middle segment (straight) */}
        <mesh position={[0, -0.3, 0]} rotation={[0, 0, 0.2]} material={material}>
          <boxGeometry args={[0.25, 0.6, 0.15]} />
        </mesh>

        {/* Bottom segment (angled) */}
        <mesh position={[0.1, -0.9, 0]} rotation={[0, 0, -0.4]} material={material}>
          <boxGeometry args={[0.2, 0.5, 0.15]} />
        </mesh>

        {/* Connecting joints for smooth transitions */}
        <mesh position={[0.08, 0.4, 0]} material={material}>
          <sphereGeometry args={[0.15, 16, 16]} />
        </mesh>
        <mesh position={[0.08, -0.05, 0]} material={material}>
          <sphereGeometry args={[0.15, 16, 16]} />
        </mesh>
        <mesh position={[0.05, -0.6, 0]} material={material}>
          <sphereGeometry args={[0.12, 16, 16]} />
        </mesh>

        {/* Glow effect around the bolt */}
        <mesh material={material} scale={1.2}>
          <group>
            <mesh position={[0, 0.8, 0]} rotation={[0, 0, 0.3]}>
              <boxGeometry args={[0.25, 0.8, 0.15]} />
              <meshBasicMaterial
                color={0xfbbf24}
                transparent
                opacity={0.1}
                side={THREE.BackSide}
              />
            </mesh>
          </group>
        </mesh>
      </group>
    </Float>
  );
}

interface SpeedLightningAnimationProps {
  className?: string;
}

export function SpeedLightningAnimation({
  className = "",
}: SpeedLightningAnimationProps) {
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
          {/* Lighting - warm yellow tones */}
          <ambientLight intensity={0.4} />
          <directionalLight position={[5, 5, 5]} intensity={0.8} />
          <pointLight
            position={[0, 0, 3]}
            intensity={1.2}
            color="#fbbf24"
          />
          <pointLight
            position={[2, 2, 2]}
            intensity={0.8}
            color="#f59e0b"
          />

          {/* Lightning Bolt Icon (center, large) */}
          <LightningBolt3D />

          {/* Speed Particle Stream (yellow particles) */}
          <SpeedParticleStream
            color="#fbbf24"
            particleCount={400}
            speed={1.2}
            opacity={0.4}
          />

          {/* Expanding Speed Rings (yellow/amber) */}
          <SpeedRings color="#f59e0b" count={2} speed={0.7} />
        </Suspense>
      </Canvas>
    </div>
  );
}
