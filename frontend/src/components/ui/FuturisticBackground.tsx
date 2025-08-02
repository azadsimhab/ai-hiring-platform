import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { inSphere } from 'maath/random';

interface FuturisticBackgroundProps {
  children?: React.ReactNode;
  particleCount?: number;
  color?: string;
}

function AnimatedParticles({ count = 5000, color = '#00ffff' }: { count?: number; color?: string }) {
  const ref = useRef<THREE.Points>(null!);
  
  const positions = useMemo(() => {
    const positions = new Float32Array(count * 3);
    // Generate random positions in a sphere
    for (let i = 0; i < count; i++) {
      const tempArray = new Float32Array(3);
      inSphere(tempArray, { radius: 10 });
      positions[i * 3] = tempArray[0];
      positions[i * 3 + 1] = tempArray[1];
      positions[i * 3 + 2] = tempArray[2];
    }
    return positions;
  }, [count]);

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 10;
      ref.current.rotation.y -= delta / 15;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color={color}
          size={0.002}
          sizeAttenuation={true}
          depthWrite={false}
          blending={2}
        />
      </Points>
    </group>
  );
}

function Grid() {
  const gridRef = useRef<THREE.GridHelper>(null!);

  useFrame((state) => {
    if (gridRef.current) {
      const material = gridRef.current.material as THREE.LineBasicMaterial;
      material.opacity = Math.sin(state.clock.elapsedTime) * 0.3 + 0.1;
    }
  });

  return (
    <primitive
      ref={gridRef}
      object={new THREE.GridHelper(100, 100, '#00ffff', '#0080ff')}
      position={[0, -10, 0]}
    />
  );
}

export function FuturisticBackground({ 
  children, 
  particleCount = 5000, 
  color = '#00ffff' 
}: FuturisticBackgroundProps) {
  return (
    <div className="fixed inset-0 bg-black">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)' }}
      >
        <ambientLight intensity={0.1} />
        <pointLight position={[10, 10, 10]} intensity={0.5} color="#00ffff" />
        <pointLight position={[-10, -10, -10]} intensity={0.3} color="#ff00ff" />
        
        <AnimatedParticles count={particleCount} color={color} />
        <Grid />
        
        {children}
      </Canvas>
      
      {/* Overlay gradient for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-black/20 to-black/40 pointer-events-none" />
      
      {/* Animated scan lines */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="h-full w-full bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent animate-pulse" />
      </div>
    </div>
  );
} 