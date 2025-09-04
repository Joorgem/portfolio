import React, { useRef, useMemo, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { OrbitControls, Html, Float } from '@react-three/drei';
import { useMediaQuery } from 'react-responsive';

interface DomeItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  color?: string;
}

interface DomeProps {
  items: DomeItem[];
  fit?: number;
  minRadius?: number;
  maxVerticalRotation?: number;
  segments?: number;
  dragDampening?: number;
  grayscale?: boolean;
}

const DomeItem: React.FC<{
  position: [number, number, number];
  item: DomeItem;
  grayscale?: boolean;
  index: number;
}> = ({ position, item, grayscale, index }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current && groupRef.current) {
      // Orbital floating animation
      const time = state.clock.elapsedTime;
      meshRef.current.rotation.y = time * 0.2;
      
      // Add subtle floating movement
      groupRef.current.position.y = position[1] + Math.sin(time + index) * 0.05;
      
      // Scale on hover
      const targetScale = hovered ? 1.3 : 1;
      meshRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.1
      );
    }
  });

  return (
    <Float
      speed={1.5}
      rotationIntensity={0.2}
      floatIntensity={0.3}
      floatingRange={[-0.05, 0.05]}
    >
      <group ref={groupRef} position={position}>
        <mesh
          ref={meshRef}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          {/* Icosahedron for more interesting shape */}
          <icosahedronGeometry args={[0.4, 1]} />
          <meshPhysicalMaterial
            color={grayscale ? '#606060' : (item.color || '#33c2cc')}
            emissive={grayscale ? '#404040' : (item.color || '#33c2cc')}
            emissiveIntensity={hovered ? 0.5 : 0.15}
            roughness={0.2}
            metalness={0.8}
            clearcoat={1}
            clearcoatRoughness={0.2}
            transparent
            opacity={0.85}
          />
        </mesh>
        
        {/* HTML Label */}
        {hovered && (
          <Html
            position={[0, -0.7, 0]}
            center
            distanceFactor={8}
            style={{
              transition: 'opacity 0.3s',
              opacity: hovered ? 1 : 0,
              pointerEvents: 'none'
            }}
          >
            <div className="bg-black/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-gray-700/50">
              <span className="text-xs text-white font-medium whitespace-nowrap">
                {item.label}
              </span>
            </div>
          </Html>
        )}
        
        {/* Glow effect on hover */}
        {hovered && (
          <mesh scale={1.5}>
            <sphereGeometry args={[0.4, 16, 16]} />
            <meshBasicMaterial
              color={item.color || '#33c2cc'}
              transparent
              opacity={0.2}
            />
          </mesh>
        )}
      </group>
    </Float>
  );
};

const DomeContent: React.FC<{
  items: DomeItem[];
  fit: number;
  minRadius: number;
  maxVerticalRotation: number;
  segments: number;
  grayscale?: boolean;
}> = ({ items, fit, minRadius, maxVerticalRotation, segments, grayscale }) => {
  const groupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();

  // Calculate dome positions with better distribution
  const positions = useMemo(() => {
    const points: [number, number, number][] = [];
    const radius = minRadius / 150; // Convert from px to 3D units
    
    // Fibonacci sphere distribution for better spacing
    const goldenRatio = (1 + Math.sqrt(5)) / 2;
    const angleIncrement = Math.PI * 2 * goldenRatio;
    
    items.forEach((_, index) => {
      const t = index / items.length;
      const inclination = Math.acos(1 - 2 * t) * (maxVerticalRotation / 60);
      const azimuth = angleIncrement * index;
      
      const x = radius * Math.sin(inclination) * Math.cos(azimuth);
      const y = radius * (Math.cos(inclination) - 0.5);
      const z = radius * Math.sin(inclination) * Math.sin(azimuth);
      
      points.push([x * fit, y * fit, z * fit]);
    });
    
    return points;
  }, [items, fit, minRadius, maxVerticalRotation]);

  useFrame((state) => {
    if (groupRef.current) {
      // Auto-rotate the dome slowly
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  // Set initial camera position
  useEffect(() => {
    camera.position.set(0, 0, minRadius / 60);
    camera.lookAt(0, 0, 0);
  }, [camera, minRadius]);

  return (
    <>
      {/* Enhanced lighting */}
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={0.6} color="#ffffff" />
      <pointLight position={[-10, -10, -10]} intensity={0.3} color="#4080ff" />
      <pointLight position={[0, 15, 0]} intensity={0.5} color="#ffffff" />
      
      {/* Fog for depth */}
      <fog attach="fog" args={['#000000', 10, 30]} />
      
      {/* Dome items */}
      <group ref={groupRef}>
        {items.map((item, index) => (
          <DomeItem
            key={item.id}
            position={positions[index]}
            item={item}
            grayscale={grayscale}
            index={index}
          />
        ))}
      </group>
      
      {/* Multiple orbit rings */}
      <group>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[minRadius / 200 * fit, 0.005, 3, segments]} />
          <meshBasicMaterial color="#333333" opacity={0.2} transparent />
        </mesh>
        <mesh rotation={[Math.PI / 2.5, 0, 0]}>
          <torusGeometry args={[minRadius / 180 * fit, 0.005, 3, segments]} />
          <meshBasicMaterial color="#333333" opacity={0.15} transparent />
        </mesh>
        <mesh rotation={[Math.PI / 1.8, 0, 0]}>
          <torusGeometry args={[minRadius / 160 * fit, 0.005, 3, segments]} />
          <meshBasicMaterial color="#333333" opacity={0.1} transparent />
        </mesh>
      </group>
    </>
  );
};

const Dome3D: React.FC<DomeProps> = ({
  items,
  fit = 0.8,
  minRadius = 800,
  maxVerticalRotation = 34,
  segments = 34,
  dragDampening = 0.9,
  grayscale = false,
}) => {
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full h-full relative">
      {/* Loading state */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="text-gray-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
          </div>
        </div>
      )}
      
      <Canvas
        ref={canvasRef}
        camera={{ fov: 45, near: 0.1, far: 1000 }}
        style={{ background: 'transparent' }}
        dpr={isMobile ? 1 : [1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <DomeContent
            items={items}
            fit={fit}
            minRadius={minRadius}
            maxVerticalRotation={maxVerticalRotation}
            segments={segments}
            grayscale={grayscale}
          />
        </Suspense>
        
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          rotateSpeed={0.5}
          dampingFactor={dragDampening}
          enableDamping
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 2}
          autoRotate={false}
          autoRotateSpeed={0.5}
        />
      </Canvas>
      
      {/* Interactive instructions */}
      <div className="absolute top-4 right-4 text-xs text-gray-500">
        <div className="bg-black/50 backdrop-blur-sm px-2 py-1 rounded">
          Drag to rotate
        </div>
      </div>
      
      {/* Labels overlay with better design */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="flex flex-wrap gap-2 justify-center">
          {items.slice(0, 6).map((item) => (
            <span
              key={item.id}
              className="text-xs text-gray-400 bg-black/50 px-3 py-1 rounded-full backdrop-blur-md border border-gray-800/30 hover:border-gray-700/50 transition-colors"
            >
              {item.label}
            </span>
          ))}
          {items.length > 6 && (
            <span className="text-xs text-gray-500 bg-black/30 px-3 py-1 rounded-full">
              +{items.length - 6} more
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dome3D;