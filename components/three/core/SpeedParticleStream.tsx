"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { hexToNumber } from "../utils/DomainTheme";

interface SpeedParticleStreamProps {
  color?: string;
  particleCount?: number;
  speed?: number;
  opacity?: number;
}

export function SpeedParticleStream({
  color = "#60a5fa",
  particleCount = 600,
  speed = 1.0,
  opacity = 0.6,
}: SpeedParticleStreamProps) {
  const particlesRef = useRef<THREE.Points>(null);

  // Generate particle data (positions, velocities, sizes)
  const { positions, velocities, sizes } = useMemo(() => {
    const positionsArray = new Float32Array(particleCount * 3);
    const velocitiesArray = new Float32Array(particleCount * 3);
    const sizesArray = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;

      // Spread particles across the scene
      positionsArray[i3] = (Math.random() - 0.5) * 20;     // x: -10 to 10
      positionsArray[i3 + 1] = (Math.random() - 0.5) * 10; // y: -5 to 5
      positionsArray[i3 + 2] = (Math.random() - 0.5) * 10; // z: -5 to 5

      // Velocity - mostly horizontal flow (left to right)
      velocitiesArray[i3] = 0.02 + Math.random() * 0.04;     // x: forward motion
      velocitiesArray[i3 + 1] = (Math.random() - 0.5) * 0.01; // y: slight drift
      velocitiesArray[i3 + 2] = (Math.random() - 0.5) * 0.01; // z: slight drift

      // Random sizes for depth effect
      sizesArray[i] = Math.random() * 0.04 + 0.01;
    }

    return {
      positions: positionsArray,
      velocities: velocitiesArray,
      sizes: sizesArray,
    };
  }, [particleCount]);

  // Animate particles
  useFrame((state) => {
    if (!particlesRef.current) return;

    const time = state.clock.elapsedTime;
    const positions = particlesRef.current.geometry.attributes.position
      .array as Float32Array;

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;

      // Update positions based on velocity
      positions[i3] += velocities[i3] * speed;
      positions[i3 + 1] += velocities[i3 + 1] * speed + Math.sin(time + i) * 0.001;
      positions[i3 + 2] += velocities[i3 + 2] * speed;

      // Wrap around when particles go off screen (right to left)
      if (positions[i3] > 10) {
        positions[i3] = -10;
      }

      // Keep particles within vertical bounds
      if (Math.abs(positions[i3 + 1]) > 5) {
        positions[i3 + 1] = (Math.random() - 0.5) * 10;
      }
    }

    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={particleCount}
        />
        <bufferAttribute
          attach="attributes-size"
          args={[sizes, 1]}
          count={particleCount}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color={hexToNumber(color)}
        transparent
        opacity={opacity}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}
