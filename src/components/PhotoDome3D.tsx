import React, { useRef, useMemo, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { OrbitControls, Html, Float } from '@react-three/drei';
import { useMediaQuery } from 'react-responsive';

interface PhotoItem {
  id: string;
  url: string;
  caption?: string;
}

interface PhotoDomeProps {
  photos: PhotoItem[];
  fit?: number;
  minRadius?: number;
  maxVerticalRotation?: number;
  segments?: number;
  dragDampening?: number;
  grayscale?: boolean;
}

// Individual photo frame component
const PhotoFrame: React.FC<{
  position: [number, number, number];
  photo: PhotoItem;
  grayscale?: boolean;
  index: number;
}> = ({ position, photo, grayscale, index }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const imageRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Load texture manually with error handling
  useEffect(() => {
    const textureLoader = new THREE.TextureLoader();
    setLoading(true);
    setError(false);
    
    textureLoader.load(
      photo.url,
      (loadedTexture) => {
        loadedTexture.needsUpdate = true;
        setTexture(loadedTexture);
        setLoading(false);
      },
      undefined,
      (err) => {
        console.error('Failed to load image:', photo.url, err);
        setError(true);
        setLoading(false);
      }
    );
  }, [photo.url]);

  useFrame((state) => {
    if (meshRef.current && groupRef.current) {
      const time = state.clock.elapsedTime;
      
      // Subtle floating animation
      groupRef.current.position.y = position[1] + Math.sin(time * 0.5 + index) * 0.02;
      
      // Scale on hover
      const targetScale = hovered ? 1.15 : 1;
      meshRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.1
      );
      
      // Gentle rotation
      meshRef.current.rotation.y = Math.sin(time * 0.2 + index) * 0.1;
    }
  });

  return (
    <Float
      speed={1.2}
      rotationIntensity={0.1}
      floatIntensity={0.2}
      floatingRange={[-0.02, 0.02]}
    >
      <group ref={groupRef} position={position}>
        {/* Photo frame background */}
        <mesh
          ref={meshRef}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <boxGeometry args={[1.2, 1.2, 0.05]} />
          <meshPhysicalMaterial
            color={hovered ? '#2a2a2a' : '#1a1a1a'}
            metalness={0.5}
            roughness={0.3}
            clearcoat={1}
            clearcoatRoughness={0.1}
          />
        </mesh>

        {/* Photo image plane */}
        {texture && !error && (
          <mesh ref={imageRef} position={[0, 0, 0.03]}>
            <planeGeometry args={[1, 1]} />
            <meshBasicMaterial
              map={texture}
              transparent
              opacity={grayscale ? 0.7 : 1}
            />
          </mesh>
        )}

        {/* Fallback for error or loading */}
        {(error || loading) && (
          <mesh position={[0, 0, 0.03]}>
            <planeGeometry args={[1, 1]} />
            <meshBasicMaterial color={error ? '#ff0000' : '#333333'} opacity={0.5} transparent />
          </mesh>
        )}

        {/* Glass effect overlay */}
        <mesh position={[0, 0, 0.04]}>
          <planeGeometry args={[1.05, 1.05]} />
          <meshPhysicalMaterial
            color="#ffffff"
            metalness={0}
            roughness={0}
            transmission={0.95}
            thickness={0.1}
            transparent
            opacity={0.3}
          />
        </mesh>

        {/* Caption on hover */}
        {hovered && photo.caption && (
          <Html
            position={[0, -0.8, 0]}
            center
            distanceFactor={8}
            style={{
              transition: 'opacity 0.3s',
              opacity: hovered ? 1 : 0,
              pointerEvents: 'none'
            }}
          >
            <div className="bg-black/95 backdrop-blur-lg px-4 py-2 rounded-lg border border-gray-700/50 max-w-[200px]">
              <p className="text-xs text-white font-medium text-center">
                {photo.caption}
              </p>
            </div>
          </Html>
        )}

        {/* Glow effect on hover */}
        {hovered && (
          <mesh position={[0, 0, -0.05]} scale={1.3}>
            <planeGeometry args={[1.2, 1.2]} />
            <meshBasicMaterial
              color="#4080ff"
              transparent
              opacity={0.2}
            />
          </mesh>
        )}

        {/* Loading indicator */}
        {loading && (
          <Html center>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          </Html>
        )}
      </group>
    </Float>
  );
};

const DomeContent: React.FC<{
  photos: PhotoItem[];
  fit: number;
  minRadius: number;
  maxVerticalRotation: number;
  segments: number;
  grayscale?: boolean;
}> = ({ photos, fit, minRadius, maxVerticalRotation, segments, grayscale }) => {
  const groupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();

  // Calculate dome positions with golden ratio spiral
  const positions = useMemo(() => {
    const points: [number, number, number][] = [];
    const radius = minRadius / 150;
    
    // Golden spiral distribution for aesthetic arrangement
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    
    photos.forEach((_, index) => {
      const theta = goldenAngle * index;
      const y = 1 - (index / (photos.length - 1)) * 2;
      const radiusAtY = Math.sqrt(1 - y * y);
      
      const phi = theta;
      const verticalRange = maxVerticalRotation / 60;
      
      const x = radius * radiusAtY * Math.cos(phi);
      const actualY = radius * y * verticalRange;
      const z = radius * radiusAtY * Math.sin(phi);
      
      points.push([x * fit, actualY * fit, z * fit]);
    });
    
    return points;
  }, [photos, fit, minRadius, maxVerticalRotation]);

  useFrame((state) => {
    if (groupRef.current) {
      // Very slow auto-rotation for viewing
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.03;
    }
  });

  // Set initial camera position
  useEffect(() => {
    camera.position.set(0, 0, minRadius / 50);
    camera.lookAt(0, 0, 0);
  }, [camera, minRadius]);

  return (
    <>
      {/* Lighting optimized for photos */}
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={0.4} color="#ffffff" />
      <pointLight position={[-10, 10, 10]} intensity={0.4} color="#ffffff" />
      <pointLight position={[0, -10, 10]} intensity={0.2} color="#4080ff" />
      
      {/* Subtle fog for depth */}
      <fog attach="fog" args={['#000000', 15, 40]} />
      
      {/* Photo dome */}
      <group ref={groupRef}>
        {photos.map((photo, index) => (
          <PhotoFrame
            key={photo.id}
            position={positions[index]}
            photo={photo}
            grayscale={grayscale}
            index={index}
          />
        ))}
      </group>
      
      {/* Decorative elements */}
      <group>
        {/* Central sphere */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.2, 32, 32]} />
          <meshPhysicalMaterial
            color="#1a1a1a"
            metalness={0.9}
            roughness={0.1}
            clearcoat={1}
          />
        </mesh>
        
        {/* Orbit rings */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[minRadius / 200 * fit, 0.003, 3, segments]} />
          <meshBasicMaterial color="#333333" opacity={0.15} transparent />
        </mesh>
        <mesh rotation={[Math.PI / 2.5, 0, Math.PI / 4]}>
          <torusGeometry args={[minRadius / 180 * fit, 0.003, 3, segments]} />
          <meshBasicMaterial color="#333333" opacity={0.1} transparent />
        </mesh>
      </group>
    </>
  );
};

const PhotoDome3D: React.FC<PhotoDomeProps> = ({
  photos,
  fit = 0.8,
  minRadius = 800,
  maxVerticalRotation = 34,
  segments = 34,
  dragDampening = 0.9,
  grayscale = false,
}) => {
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });
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
        camera={{ fov: 45, near: 0.1, far: 1000 }}
        style={{ background: 'transparent' }}
        dpr={isMobile ? 1 : [1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <DomeContent
            photos={photos}
            fit={fit}
            minRadius={minRadius}
            maxVerticalRotation={maxVerticalRotation}
            segments={segments}
            grayscale={grayscale}
          />
        </Suspense>
        
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          rotateSpeed={0.5}
          dampingFactor={dragDampening}
          enableDamping
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 2}
          minDistance={8}
          maxDistance={20}
        />
      </Canvas>
      
      {/* Interactive instructions */}
      <div className="absolute top-4 right-4 text-xs text-gray-500">
        <div className="bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-lg space-y-1">
          <div>Drag to rotate</div>
          <div>Scroll to zoom</div>
        </div>
      </div>
      
      {/* Photo count indicator */}
      <div className="absolute bottom-4 left-4">
        <div className="bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-lg">
          <span className="text-xs text-gray-400">
            {photos.length} memories
          </span>
        </div>
      </div>
    </div>
  );
};

export default PhotoDome3D;