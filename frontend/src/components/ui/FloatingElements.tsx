import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';

// 3D Floating Geometric Shapes
function FloatingGeometry() {
  const meshRef = useRef<THREE.Mesh>(null!);
  const geometries = useMemo(() => [
    new THREE.BoxGeometry(0.5, 0.5, 0.5),
    new THREE.SphereGeometry(0.3, 8, 8),
    new THREE.ConeGeometry(0.3, 0.6, 6),
    new THREE.OctahedronGeometry(0.4),
  ], []);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.2;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={0.5}>
      {geometries.map((geometry, index) => (
        <mesh
          key={index}
          ref={index === 0 ? meshRef : undefined}
          geometry={geometry}
          position={[
            Math.sin(index * 2) * 3,
            Math.cos(index * 2) * 2,
            Math.sin(index) * 1
          ]}
        >
          <meshStandardMaterial
            color={['#6366f1', '#3b82f6', '#10b981', '#f59e0b'][index]}
            transparent
            opacity={0.7}
            emissive={['#6366f1', '#3b82f6', '#10b981', '#f59e0b'][index]}
            emissiveIntensity={0.2}
          />
        </mesh>
      ))}
    </Float>
  );
}

// Simplified AI Network Nodes (no connection lines to avoid complexity)
function AINodes() {
  const nodesRef = useRef<THREE.Group>(null!);
  
  const nodes = useMemo(() => {
    const nodePositions = [];
    for (let i = 0; i < 12; i++) {
      nodePositions.push([
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 8,
      ]);
    }
    return nodePositions;
  }, []);

  useFrame((state) => {
    if (nodesRef.current) {
      nodesRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <group ref={nodesRef}>
      {nodes.map((position, index) => (
        <mesh key={index} position={position as [number, number, number]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial
            color="#00ffff"
            emissive="#00ffff"
            emissiveIntensity={0.4}
            transparent
            opacity={0.8}
          />
        </mesh>
      ))}
    </group>
  );
}

// Main 3D Scene Component
interface ThreeDSceneProps {
  showGeometry?: boolean;
  showNodes?: boolean;
  className?: string;
}

export function ThreeDScene({ 
  showGeometry = true, 
  showNodes = true, 
  className = '' 
}: ThreeDSceneProps) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 10], fov: 60 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#6366f1" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#3b82f6" />
        
        {showGeometry && <FloatingGeometry />}
        {showNodes && <AINodes />}
      </Canvas>
    </div>
  );
}

// 2D Floating UI Cards
interface FloatingCardProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export function FloatingCard({ children, delay = 0, className = '' }: FloatingCardProps) {
  return (
    <motion.div
      className={`absolute ${className}`}
      initial={{ opacity: 0, y: 20, rotateX: -15 }}
      animate={{ 
        opacity: 1, 
        y: 0, 
        rotateX: 0,
        transition: {
          duration: 0.8,
          delay,
          ease: "easeOut"
        }
      }}
      whileHover={{
        y: -10,
        rotateX: 5,
        scale: 1.05,
        transition: { duration: 0.3 }
      }}
      style={{
        perspective: 1000,
        transformStyle: 'preserve-3d'
      }}
    >
      <div className="glass rounded-xl p-6 shadow-glow">
        {children}
      </div>
    </motion.div>
  );
}

// Particle Field Background
export function ParticleField({ particleCount = 100, className = '' }: { particleCount?: number; className?: string }) {
  return (
    <div className={`absolute inset-0 ${className}`}>
      {[...Array(particleCount)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-primary-400 rounded-full opacity-60"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.6, 1, 0.6],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2
          }}
        />
      ))}
    </div>
  );
}

// Holographic Interface Elements
export function HolographicInterface({ className = '' }: { className?: string }) {
  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      {/* Scanning lines */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-transparent via-primary-500/20 to-transparent h-2"
        animate={{ y: ['0%', '100%'] }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      
      {/* Corner brackets */}
      <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-primary-400"></div>
      <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-primary-400"></div>
      <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-primary-400"></div>
      <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-primary-400"></div>
      
      {/* Grid overlay */}
      <div className="absolute inset-0 neural-grid opacity-20"></div>
    </div>
  );
}