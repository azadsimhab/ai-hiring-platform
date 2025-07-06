import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { Vector3, MathUtils } from 'three';
import { useMediaQuery } from '@mui/material';

/**
 * FlowingPath - Creates an animated path with nodes and connections
 */
const FlowingPath = ({ count = 80, nodeSize = 0.05, color = '#0064ff', speed = 0.3 }) => {
  const points = useRef([]);
  const lines = useRef([]);
  const group = useRef();
  
  // Create initial points
  useMemo(() => {
    points.current = Array.from({ length: count }, () => ({
      position: new Vector3(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 5,
        (Math.random() - 0.5) * 3
      ),
      velocity: new Vector3(
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.01,
        (Math.random() - 0.5) * 0.005
      ),
      size: Math.random() * nodeSize + nodeSize * 0.5,
      connected: []
    }));
    
    // Create connections between points
    for (let i = 0; i < count; i++) {
      const point = points.current[i];
      const connections = Math.floor(Math.random() * 2) + 1; // 1-2 connections per point
      
      for (let j = 0; j < connections; j++) {
        const targetIndex = Math.floor(Math.random() * count);
        if (targetIndex !== i && !point.connected.includes(targetIndex)) {
          point.connected.push(targetIndex);
          lines.current.push({
            from: i,
            to: targetIndex,
            progress: Math.random(), // Animation progress
            speed: Math.random() * 0.5 + 0.5, // Animation speed
            active: Math.random() > 0.3 // Some lines start inactive
          });
        }
      }
    }
  }, [count, nodeSize]);
  
  // Animation loop
  useFrame((state, delta) => {
    if (!group.current) return;
    
    // Update points
    points.current.forEach((point, i) => {
      // Move points
      point.position.add(point.velocity);
      
      // Boundary check and bounce
      if (Math.abs(point.position.x) > 5) {
        point.velocity.x *= -1;
      }
      if (Math.abs(point.position.y) > 2.5) {
        point.velocity.y *= -1;
      }
      if (Math.abs(point.position.z) > 1.5) {
        point.velocity.z *= -1;
      }
      
      // Update node meshes
      const nodeMesh = group.current.children[i];
      if (nodeMesh) {
        nodeMesh.position.copy(point.position);
        nodeMesh.scale.setScalar(point.size * (0.8 + Math.sin(state.clock.elapsedTime + i) * 0.2));
      }
    });
    
    // Update lines
    lines.current.forEach((line, i) => {
      const lineIndex = i + count;
      const lineMesh = group.current.children[lineIndex];
      
      if (!lineMesh) return;
      
      const fromPoint = points.current[line.from];
      const toPoint = points.current[line.to];
      
      // Update line position and scale
      lineMesh.position.copy(fromPoint.position);
      lineMesh.lookAt(toPoint.position);
      
      const distance = fromPoint.position.distanceTo(toPoint.position);
      lineMesh.scale.set(0.015, 0.015, distance);
      
      // Animate line opacity based on progress
      if (line.active) {
        line.progress += delta * line.speed * speed;
        if (line.progress > 1) {
          line.progress = 0;
          line.active = Math.random() > 0.3; // 70% chance to remain active
        }
        
        // Pulse effect
        const opacity = Math.sin(line.progress * Math.PI);
        lineMesh.material.opacity = opacity * 0.8 + 0.2;
      } else {
        lineMesh.material.opacity = 0.1;
        if (Math.random() > 0.995) {
          line.active = true;
        }
      }
    });
    
    // Slowly rotate the entire network
    group.current.rotation.y += delta * 0.05;
    group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
  });
  
  return (
    <group ref={group}>
      {/* Nodes */}
      {Array.isArray(points.current) && points.current.length > 0 && points.current.map((point, i) => (
        <mesh key={`node-${i}`} position={point.position}>
          <sphereGeometry args={[point.size, 8, 8]} />
          <meshBasicMaterial color={color} transparent opacity={0.8} />
        </mesh>
      ))}
      
      {/* Lines */}
      {Array.isArray(lines.current) && lines.current.length > 0 && lines.current.map((line, i) => {
        const fromPoint = points.current[line.from];
        const toPoint = points.current[line.to];
        if (!fromPoint || !toPoint) return null;
        const distance = fromPoint.position.distanceTo(toPoint.position);
        
        return (
          <mesh 
            key={`line-${i}`} 
            position={fromPoint.position}
            lookAt={toPoint.position}
            scale={[0.015, 0.015, distance]}
          >
            <cylinderGeometry args={[1, 1, 1, 6, 1, false]} />
            <meshBasicMaterial 
              color={color} 
              transparent 
              opacity={0.5} 
              depthWrite={false}
            />
          </mesh>
        );
      })}
    </group>
  );
};

/**
 * Particles - Creates a particle field effect
 */
const Particles = ({ count = 200, color = '#0064ff' }) => {
  const particles = useRef();
  const { viewport } = useThree();
  
  // Create particles with random positions
  const particlePositions = useMemo(() => {
    return Array.from({ length: count }, () => ({
      position: new Vector3(
        (Math.random() - 0.5) * viewport.width * 2,
        (Math.random() - 0.5) * viewport.height * 2,
        (Math.random() - 0.5) * 5
      ),
      speed: Math.random() * 0.2 + 0.1,
      offset: Math.random() * Math.PI * 2
    }));
  }, [count, viewport]);
  
  // Animation loop
  useFrame((state) => {
    if (!particles.current) return;
    
    const { children } = particles.current;
    for (let i = 0; i < children.length; i++) {
      const particle = children[i];
      const data = particlePositions[i];
      
      // Floating animation
      particle.position.y += Math.sin(state.clock.elapsedTime * data.speed + data.offset) * 0.01;
      particle.position.x += Math.cos(state.clock.elapsedTime * data.speed + data.offset) * 0.01;
      
      // Pulse size
      const scale = 0.5 + Math.sin(state.clock.elapsedTime * data.speed + data.offset) * 0.5;
      particle.scale.setScalar(scale * 0.1);
    }
  });
  
  return (
    <group ref={particles}>
      {Array.isArray(particlePositions) && particlePositions.length > 0 && particlePositions.map((data, i) => (
        <mesh key={i} position={data.position}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial 
            color={color} 
            transparent 
            opacity={0.6}
          />
        </mesh>
      ))}
    </group>
  );
};

/**
 * Scene - Main scene component with camera controls
 */
const Scene = ({ color = '#0064ff', density = 1 }) => {
  const { camera } = useThree();
  
  // Set initial camera position
  useEffect(() => {
    camera.position.z = 5;
  }, [camera]);
  
  // Camera movement
  useFrame((state) => {
    camera.position.x = MathUtils.lerp(
      camera.position.x,
      Math.sin(state.clock.elapsedTime * 0.1) * 0.5,
      0.05
    );
    camera.position.y = MathUtils.lerp(
      camera.position.y,
      Math.sin(state.clock.elapsedTime * 0.05) * 0.5,
      0.05
    );
    camera.lookAt(0, 0, 0);
  });
  
  // Adjust density based on performance needs
  const nodeCount = Math.floor(80 * density);
  const particleCount = Math.floor(200 * density);
  
  return (
    <>
      <FlowingPath count={nodeCount} color={color} />
      <Particles count={particleCount} color={color} />
      {/* Defensive: Only render EffectComposer if Bloom and Vignette are available */}
      {typeof Bloom !== 'undefined' && typeof Vignette !== 'undefined' && (
        <EffectComposer>
          <Bloom 
            intensity={1.5} 
            luminanceThreshold={0.1} 
            luminanceSmoothing={0.9} 
          />
          <Vignette eskil={false} offset={0.1} darkness={0.8} />
        </EffectComposer>
      )}
    </>
  );
};

/**
 * FuturisticBackground - Main component for the 3D background
 * 
 * @param {Object} props
 * @param {string} [props.color="#0064ff"] - Primary color of the background
 * @param {number} [props.density=1] - Density of elements (lower for better performance)
 */
const FuturisticBackground = ({ color = "#0064ff", density = 1 }) => {
  // Reduce density on mobile devices for better performance
  const isMobile = useMediaQuery('(max-width:600px)');
  const adjustedDensity = isMobile ? density * 0.5 : density;
  
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
        background: 'linear-gradient(to bottom, #0a0f18, #1a1f28)'
      }}
    >
      <Canvas dpr={[1, 2]} style={{ background: 'transparent' }}>
        <Scene color={color} density={adjustedDensity} />
      </Canvas>
    </div>
  );
};

export default FuturisticBackground;
