import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';

// Simple Floating Geometry without complex elements
function SimpleGeometry() {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.2;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={0.5}>
      <mesh ref={meshRef} position={[2, 0, 0]}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial
          color="#6366f1"
          transparent
          opacity={0.7}
          emissive="#6366f1"
          emissiveIntensity={0.2}
        />
      </mesh>
      
      <mesh position={[-2, 1, 0]}>
        <sphereGeometry args={[0.3, 8, 8]} />
        <meshStandardMaterial
          color="#3b82f6"
          transparent
          opacity={0.7}
          emissive="#3b82f6"
          emissiveIntensity={0.2}
        />
      </mesh>
      
      <mesh position={[0, -1, 1]}>
        <coneGeometry args={[0.3, 0.6, 6]} />
        <meshStandardMaterial
          color="#10b981"
          transparent
          opacity={0.7}
          emissive="#10b981"
          emissiveIntensity={0.2}
        />
      </mesh>
    </Float>
  );
}

// Simple 3D Scene without complex elements
interface SimpleSceneProps {
  className?: string;
}

export function SimpleScene({ className = '' }: SimpleSceneProps) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#6366f1" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#3b82f6" />
        
        <SimpleGeometry />
      </Canvas>
    </div>
  );
}

// 2D Floating UI Cards (same as before)
interface FloatingCardProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export function FloatingCard({ children, delay = 0, className = '' }: FloatingCardProps) {
  return (
    <motion.div
      className={`absolute z-20 ${className}`}
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
      <div className="glass rounded-xl p-6 shadow-glow backdrop-blur-xl">
        {children}
      </div>
    </motion.div>
  );
}

// Particle Field Background (CSS-based, no Three.js)
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

// Holographic Interface Elements (CSS-based)
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

// Simple CSS-based background
export function SimpleBackground({ 
  children, 
  className = '' 
}: { 
  children?: React.ReactNode; 
  className?: string; 
}) {
  return (
    <div className={`fixed inset-0 bg-dark-900 ${className}`}>
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-dark-900 via-primary-900/10 to-electric-900/10"></div>
      
      {/* Mesh gradient overlay */}
      <div className="absolute inset-0 bg-mesh-gradient opacity-20"></div>
      
      {/* Animated overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-primary-500/5 to-electric-500/5 animate-gradient-slow"></div>
      
      {children}
      
      {/* Overlay gradient for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-dark-900/20 to-dark-900/40 pointer-events-none" />
      
      {/* Animated scan lines */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="h-full w-full bg-gradient-to-b from-transparent via-primary-500/10 to-transparent animate-pulse" />
      </div>
    </div>
  );
}