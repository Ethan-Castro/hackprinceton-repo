"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { useRef, useState, useEffect, Suspense } from "react";
import { useTheme } from "next-themes";
import * as THREE from "three";

// Animated logo plane with pulsing effect
function LogoPlane() {
  const meshRef = useRef<THREE.Mesh>(null);
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine which theme to use
  const currentTheme = theme === "system" ? systemTheme : theme;
  
  // Load both textures and switch based on theme
  const [darkTexture, lightTexture] = useTexture([
    "/Augment Logo dark.png",
    "/Augment Logo light.png",
  ]);

  // Use the appropriate texture based on theme
  const texture = currentTheme === "dark" ? darkTexture : lightTexture;

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime;
      // Simple pulsing effect
      const scale = 1 + Math.sin(time * 1.5) * 0.1;
      meshRef.current.scale.set(scale, scale, 1);
    }
  });

  // Update material when texture changes
  useEffect(() => {
    if (meshRef.current && meshRef.current.material instanceof THREE.MeshStandardMaterial) {
      meshRef.current.material.map = texture;
      meshRef.current.material.needsUpdate = true;
    }
  }, [texture]);

  if (!mounted) return null;

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <planeGeometry args={[2, 2]} />
      <meshStandardMaterial
        map={texture}
        transparent
        opacity={0.95}
      />
    </mesh>
  );
}

export function AnimatedLogoFooter() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-24 flex items-center justify-center">
        <div className="w-16 h-16 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className="w-full h-24 relative">
      <Canvas
        camera={{ position: [0, 0, 3], fov: 50 }}
        className="w-full h-full"
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <color attach="background" args={["transparent"]} />

        {/* Simple lighting setup */}
        <ambientLight intensity={0.8} />
        <directionalLight position={[0, 0, 2]} intensity={0.5} color="#ffffff" />

        <Suspense fallback={null}>
          <LogoPlane />
        </Suspense>
      </Canvas>
    </div>
  );
}

