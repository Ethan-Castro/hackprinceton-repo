"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Text3D, Center, Float } from "@react-three/drei";
import { useRef, useMemo } from "react";
import { useTheme } from "next-themes";
import * as THREE from "three";

// Enhanced animated particles with trails
function Particles() {
  const particlesRef = useRef<THREE.Points>(null);
  const { theme } = useTheme();

  const particles = useMemo(() => {
    const count = 150;
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      // Position
      positions[i3] = (Math.random() - 0.5) * 12;
      positions[i3 + 1] = (Math.random() - 0.5) * 12;
      positions[i3 + 2] = (Math.random() - 0.5) * 8;
      // Velocity
      velocities[i3] = (Math.random() - 0.5) * 0.02;
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.02;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.02;
      // Size
      sizes[i] = Math.random() * 0.03 + 0.01;
    }

    return { positions, velocities, sizes };
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      const time = state.clock.elapsedTime;
      particlesRef.current.rotation.y = time * 0.05;
      particlesRef.current.rotation.x = Math.sin(time * 0.1) * 0.1;
      
      // Animate particle positions
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i] += Math.sin(time + i) * 0.001;
        positions[i + 1] += Math.cos(time + i) * 0.001;
        positions[i + 2] += Math.sin(time * 0.5 + i) * 0.001;
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  const particleColor = theme === "dark" ? "#6366f1" : "#8b5cf6";

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[particles.positions, 3]}
          count={particles.positions.length / 3}
        />
        <bufferAttribute
          attach="attributes-size"
          args={[particles.sizes, 1]}
          count={particles.sizes.length}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.025}
        color={particleColor}
        transparent
        opacity={0.7}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Orbiting rings around the logo
function OrbitingRings() {
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);
  const { theme } = useTheme();

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x = time * 0.3;
      ring1Ref.current.rotation.z = time * 0.2;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.y = time * 0.4;
      ring2Ref.current.rotation.x = time * 0.25;
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.z = time * 0.35;
      ring3Ref.current.rotation.y = time * 0.15;
    }
  });

  const ringColor = theme === "dark" ? "#818cf8" : "#a78bfa";
  const ringOpacity = theme === "dark" ? 0.15 : 0.1;

  return (
    <>
      <mesh ref={ring1Ref} position={[0, 0, 0]}>
        <torusGeometry args={[2.5, 0.02, 16, 100]} />
        <meshBasicMaterial
          color={ringColor}
          transparent
          opacity={ringOpacity}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh ref={ring2Ref} position={[0, 0, 0]}>
        <torusGeometry args={[3, 0.015, 16, 100]} />
        <meshBasicMaterial
          color={ringColor}
          transparent
          opacity={ringOpacity * 0.7}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh ref={ring3Ref} position={[0, 0, 0]}>
        <torusGeometry args={[3.5, 0.01, 16, 100]} />
        <meshBasicMaterial
          color={ringColor}
          transparent
          opacity={ringOpacity * 0.5}
          side={THREE.DoubleSide}
        />
      </mesh>
    </>
  );
}

function AnimatedText() {
  const textRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const { theme } = useTheme();

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    if (textRef.current) {
      // Smooth continuous rotation with multiple frequencies
      textRef.current.rotation.y = Math.sin(time * 0.4) * 0.15 + Math.cos(time * 0.2) * 0.05;
      textRef.current.rotation.x = Math.sin(time * 0.3) * 0.05;

      // Breathing effect with varying intensity
      const scale = 1 + Math.sin(time * 0.6) * 0.04 + Math.cos(time * 0.4) * 0.02;
      textRef.current.scale.set(scale, scale, scale);

      // Animate material properties
      if (textRef.current.material instanceof THREE.MeshStandardMaterial) {
        const hue = (time * 0.08) % 1;
        const intensity = 0.4 + Math.sin(time * 0.5) * 0.2;
        textRef.current.material.emissive.setHSL(hue, 0.8, intensity);
        textRef.current.material.emissiveIntensity = 0.5 + Math.sin(time * 0.7) * 0.2;
      }
    }

    if (glowRef.current) {
      // Animate glow intensity
      const glowIntensity = 0.2 + Math.sin(time * 0.8) * 0.1;
      if (glowRef.current.material instanceof THREE.MeshBasicMaterial) {
        glowRef.current.material.opacity = glowIntensity;
      }
    }
  });

  const baseColor = theme === "dark" ? "#a78bfa" : "#7c3aed";
  const glowColor = theme === "dark" ? "#818cf8" : "#a78bfa";

  return (
    <Float
      speed={2}
      rotationIntensity={0.5}
      floatIntensity={0.8}
      floatingRange={[-0.2, 0.2]}
    >
      <Center>
        {/* Main text with enhanced material */}
        <Text3D
          ref={textRef}
          font="/fonts/helvetiker_regular.typeface.json"
          size={0.7}
          height={0.25}
          curveSegments={20}
          bevelEnabled
          bevelThickness={0.04}
          bevelSize={0.03}
          bevelOffset={0}
          bevelSegments={10}
        >
          instantedu
          <meshStandardMaterial
            color={baseColor}
            emissive="#6366f1"
            emissiveIntensity={0.5}
            metalness={0.8}
            roughness={0.15}
            envMapIntensity={1.2}
          />
        </Text3D>

        {/* Enhanced glow outline with multiple layers */}
        <Text3D
          ref={glowRef}
          font="/fonts/helvetiker_regular.typeface.json"
          size={0.7}
          height={0.25}
          curveSegments={20}
          bevelEnabled
          bevelThickness={0.04}
          bevelSize={0.03}
          bevelOffset={0}
          bevelSegments={10}
        >
          instantedu
          <meshBasicMaterial
            color={glowColor}
            transparent
            opacity={0.2}
            side={THREE.BackSide}
          />
        </Text3D>

        {/* Outer glow layer */}
        <Text3D
          font="/fonts/helvetiker_regular.typeface.json"
          size={0.75}
          height={0.25}
          curveSegments={16}
          bevelEnabled
          bevelThickness={0.02}
          bevelSize={0.02}
          bevelOffset={0}
          bevelSegments={8}
        >
          instantedu
          <meshBasicMaterial
            color={glowColor}
            transparent
            opacity={0.08}
            side={THREE.BackSide}
          />
        </Text3D>
      </Center>
    </Float>
  );
}

// Enhanced gradient background with animated colors
function GradientBackground() {
  const meshRef = useRef<THREE.Mesh>(null);
  const { theme } = useTheme();

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime;
      meshRef.current.rotation.z = time * 0.05;
      meshRef.current.rotation.x = Math.sin(time * 0.1) * 0.1;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -4]} scale={[20, 20, 1]}>
      <planeGeometry args={[1, 1, 64, 64]} />
      <meshBasicMaterial
        color={theme === "dark" ? "#1e1b4b" : "#ede9fe"}
        transparent
        opacity={0.4}
      />
    </mesh>
  );
}

// Animated light orbs
function LightOrbs() {
  const orb1Ref = useRef<THREE.Mesh>(null);
  const orb2Ref = useRef<THREE.Mesh>(null);
  const orb3Ref = useRef<THREE.Mesh>(null);
  const { theme } = useTheme();

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    if (orb1Ref.current) {
      orb1Ref.current.position.x = Math.sin(time * 0.5) * 3;
      orb1Ref.current.position.y = Math.cos(time * 0.5) * 2;
      orb1Ref.current.position.z = Math.sin(time * 0.3) * 2;
    }
    
    if (orb2Ref.current) {
      orb2Ref.current.position.x = Math.cos(time * 0.4) * -3;
      orb2Ref.current.position.y = Math.sin(time * 0.6) * 2.5;
      orb2Ref.current.position.z = Math.cos(time * 0.4) * 2;
    }
    
    if (orb3Ref.current) {
      orb3Ref.current.position.x = Math.sin(time * 0.7) * 2;
      orb3Ref.current.position.y = Math.cos(time * 0.5) * -2.5;
      orb3Ref.current.position.z = Math.sin(time * 0.6) * -2;
    }
  });

  const orbColor = theme === "dark" ? "#6366f1" : "#8b5cf6";

  return (
    <>
      <mesh ref={orb1Ref}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshBasicMaterial
          color={orbColor}
          transparent
          opacity={0.6}
        />
      </mesh>
      <mesh ref={orb2Ref}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshBasicMaterial
          color={orbColor}
          transparent
          opacity={0.5}
        />
      </mesh>
      <mesh ref={orb3Ref}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshBasicMaterial
          color={orbColor}
          transparent
          opacity={0.4}
        />
      </mesh>
    </>
  );
}

export function AnimatedLogo() {
  const { theme } = useTheme();

  return (
    <div className="w-full h-48 relative">
      <Canvas
        camera={{ position: [0, 0, 7], fov: 50 }}
        className="w-full h-full"
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <color attach="background" args={[theme === "dark" ? "#0f0f23" : "#faf5ff"]} />

        {/* Enhanced lighting setup */}
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 5, 5]} intensity={1.5} color="#ffffff" />
        <directionalLight position={[-5, -5, -5]} intensity={0.5} color="#6366f1" />
        <pointLight position={[0, 3, 3]} intensity={2} color="#a78bfa" />
        <pointLight position={[0, -3, -3]} intensity={1} color="#818cf8" />
        <spotLight
          position={[0, 5, 5]}
          angle={0.4}
          penumbra={1}
          intensity={2}
          color="#c4b5fd"
          castShadow
        />
        <pointLight position={[3, 0, 3]} intensity={1.2} color="#a78bfa" />
        <pointLight position={[-3, 0, 3]} intensity={1.2} color="#818cf8" />

        <GradientBackground />
        <OrbitingRings />
        <Particles />
        <LightOrbs />
        <AnimatedText />
      </Canvas>
    </div>
  );
}
