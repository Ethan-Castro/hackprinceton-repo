"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { hexToNumber } from "../utils/DomainTheme";

interface SpeedRingsProps {
  color?: string;
  count?: number;
  speed?: number;
}

export function SpeedRings({
  color = "#60a5fa",
  count = 4,
  speed = 1.0,
}: SpeedRingsProps) {
  const groupRef = useRef<THREE.Group>(null);
  const ringsRef = useRef<THREE.Mesh[]>([]);

  // Animate rings: expand outward and fade out, then reset
  useFrame((state) => {
    if (!groupRef.current) return;

    const time = state.clock.elapsedTime * speed;

    ringsRef.current.forEach((ring, index) => {
      if (!ring) return;

      // Stagger each ring's animation
      const offset = (index / count) * 2 * Math.PI;
      const phase = (time + offset) % (Math.PI * 2);

      // Expand from small to large
      const scale = 0.3 + (phase / (Math.PI * 2)) * 1.5;
      ring.scale.set(scale, scale, scale);

      // Fade out as it expands
      const opacity = 1 - (phase / (Math.PI * 2));
      if (ring.material instanceof THREE.MeshBasicMaterial) {
        ring.material.opacity = Math.max(0, opacity * 0.3);
      }
    });
  });

  const colorNum = hexToNumber(color);

  return (
    <group ref={groupRef}>
      {Array.from({ length: count }).map((_, index) => (
        <mesh
          key={index}
          ref={(el) => {
            if (el) ringsRef.current[index] = el;
          }}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <torusGeometry args={[1, 0.02, 16, 64]} />
          <meshBasicMaterial
            color={colorNum}
            transparent
            opacity={0.3}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
}
