"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";
import { hexToNumber } from "../utils/DomainTheme";
import type { DomainType } from "../utils/DomainTheme";

interface DomainIcon3DProps {
  domain: DomainType;
  color: string;
  size?: number;
}

export function DomainIcon3D({ domain, color, size = 1 }: DomainIcon3DProps) {
  const meshRef = useRef<THREE.Group>(null);

  // Animate: breathing effect + emissive glow pulsing
  useFrame((state) => {
    if (!meshRef.current) return;

    const time = state.clock.elapsedTime;

    // Breathing scale animation
    const scale = 1 + Math.sin(time * 0.8) * 0.05;
    meshRef.current.scale.set(scale * size, scale * size, scale * size);

    // Slow rotation
    meshRef.current.rotation.y = time * 0.3;

    // Pulse emissive intensity on all meshes
    meshRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
        const intensity = 0.3 + Math.sin(time * 1.2) * 0.2;
        child.material.emissiveIntensity = intensity;
      }
    });
  });

  // Render different geometry based on domain
  const renderIcon = () => {
    const colorNum = hexToNumber(color);
    const material = new THREE.MeshStandardMaterial({
      color: colorNum,
      emissive: colorNum,
      emissiveIntensity: 0.3,
      metalness: 0.7,
      roughness: 0.2,
    });

    switch (domain) {
      case "business":
        // Briefcase: rectangular body + handle
        return (
          <group ref={meshRef}>
            {/* Main body */}
            <mesh position={[0, -0.2, 0]} material={material}>
              <boxGeometry args={[1.2, 0.8, 0.4]} />
            </mesh>
            {/* Handle */}
            <mesh position={[0, 0.4, 0]} material={material}>
              <torusGeometry args={[0.35, 0.08, 16, 32, Math.PI]} />
            </mesh>
            {/* Lock detail */}
            <mesh position={[0, -0.1, 0.21]} material={material}>
              <cylinderGeometry args={[0.06, 0.06, 0.15, 16]} />
            </mesh>
          </group>
        );

      case "health":
        // Heart: two spheres + cone base
        return (
          <group ref={meshRef} rotation={[0, 0, Math.PI / 4]}>
            {/* Left sphere */}
            <mesh position={[-0.3, 0.3, 0]} material={material}>
              <sphereGeometry args={[0.4, 32, 32]} />
            </mesh>
            {/* Right sphere */}
            <mesh position={[0.3, 0.3, 0]} material={material}>
              <sphereGeometry args={[0.4, 32, 32]} />
            </mesh>
            {/* Bottom point */}
            <mesh position={[0, -0.2, 0]} rotation={[0, 0, Math.PI]} material={material}>
              <coneGeometry args={[0.6, 1, 32]} />
            </mesh>
          </group>
        );

      case "education":
        // Graduation cap: flat square top + tassel
        return (
          <group ref={meshRef}>
            {/* Cap top (flat square) */}
            <mesh position={[0, 0.3, 0]} material={material}>
              <boxGeometry args={[1.2, 0.05, 1.2]} />
            </mesh>
            {/* Cap base (hemisphere) */}
            <mesh position={[0, 0, 0]} material={material}>
              <sphereGeometry args={[0.5, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
            </mesh>
            {/* Tassel string */}
            <mesh position={[0.55, 0.3, 0]} material={material}>
              <cylinderGeometry args={[0.02, 0.02, 0.4, 8]} />
            </mesh>
            {/* Tassel */}
            <mesh position={[0.55, 0, 0]} material={material}>
              <sphereGeometry args={[0.08, 16, 16]} />
            </mesh>
          </group>
        );

      case "sustainability":
        // Leaf: curved organic shape
        return (
          <group ref={meshRef}>
            {/* Main leaf body (ellipsoid) */}
            <mesh position={[0, 0, 0]} material={material} scale={[0.5, 1, 0.15]}>
              <sphereGeometry args={[1, 32, 32]} />
            </mesh>
            {/* Center vein */}
            <mesh position={[0, 0, 0.08]} material={material}>
              <cylinderGeometry args={[0.03, 0.03, 1.8, 8]} />
            </mesh>
            {/* Stem */}
            <mesh position={[0, -1, 0.08]} material={material}>
              <cylinderGeometry args={[0.05, 0.02, 0.3, 8]} />
            </mesh>
          </group>
        );

      default:
        return null;
    }
  };

  return (
    <Float
      speed={1.5}
      rotationIntensity={0.2}
      floatIntensity={0.5}
      floatingRange={[-0.1, 0.1]}
    >
      {renderIcon()}
    </Float>
  );
}
