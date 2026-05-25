import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Float, MeshTransmissionMaterial } from '@react-three/drei';
import * as THREE from 'three';

function GlassBlob({ position, scale, speed, distort, color }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * speed * 0.3) * 0.2;
      meshRef.current.rotation.y += speed * 0.002;
    }
  });

  return (
    <Float
      speed={speed}
      rotationIntensity={0.4}
      floatingRange={[-0.3, 0.3]}
    >
      <mesh ref={meshRef} position={position} scale={scale}>
        <icosahedronGeometry args={[1, 6]} />
        <MeshDistortMaterial
          color={color}
          transparent
          opacity={0.15}
          roughness={0.1}
          metalness={0.8}
          distort={distort}
          speed={speed * 0.5}
          envMapIntensity={1}
        />
      </mesh>
    </Float>
  );
}

function InnerGlow({ position, color, scale = 1 }) {
  const ref = useRef();

  useFrame((state) => {
    if (ref.current) {
      ref.current.material.opacity = 0.08 + Math.sin(state.clock.elapsedTime * 0.5) * 0.04;
    }
  });

  return (
    <mesh ref={ref} position={position} scale={scale}>
      <sphereGeometry args={[1.5, 16, 16]} />
      <meshBasicMaterial color={color} transparent opacity={0.1} />
    </mesh>
  );
}

export default function FloatingBlobs({ count = 3, className = '' }) {
  const blobs = useMemo(() => [
    { position: [2.5, 0.5, -1], scale: 1.8, speed: 1.2, distort: 0.4, color: '#8b5cf6' },
    { position: [-2, -0.5, -2], scale: 1.3, speed: 0.8, distort: 0.3, color: '#3b82f6' },
    { position: [0.5, -1.5, -1.5], scale: 1, speed: 1.5, distort: 0.5, color: '#22d3ee' },
    { position: [-1, 2, -3], scale: 0.8, speed: 1, distort: 0.35, color: '#a78bfa' },
  ].slice(0, count), [count]);

  return (
    <div className={`three-canvas-container ${className}`} style={{ position: 'absolute' }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <pointLight position={[-3, 2, 4]} intensity={0.6} color="#8b5cf6" />
        <pointLight position={[3, -2, 3]} intensity={0.4} color="#22d3ee" />

        {blobs.map((blob, i) => (
          <GlassBlob key={i} {...blob} />
        ))}

        <InnerGlow position={[2, 0, -2]} color="#8b5cf6" scale={2} />
        <InnerGlow position={[-2, -1, -3]} color="#3b82f6" scale={1.5} />
      </Canvas>
    </div>
  );
}
