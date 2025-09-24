import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle, ForwardedRef } from 'react'
import { useMotionValue, useSpring } from "motion/react"
import { useFrame } from "@react-three/fiber"
import * as THREE from 'three'
import { GLTF } from 'three-stdlib'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { useNavigationStore } from '../stores/navigation.store'

interface AstronautWithCurtainProps {
  scale?: number;
  position?: [number, number, number];
}

type GLTFResult = GLTF & {
  nodes: {
    [key: string]: THREE.Mesh;
  };
  materials: {
    [key: string]: THREE.Material;
  };
}

export const AstronautWithCurtain = forwardRef<THREE.Group, AstronautWithCurtainProps>((props, ref: ForwardedRef<THREE.Group>) => {
  const group = useRef<THREE.Group>(null!);

  // Estados para controle de loading
  const [modelLoaded, setModelLoaded] = useState(false);
  const [modelAssets, setModelAssets] = useState<GLTFResult | null>(null);

  // Estado do tutorial do store
  const showTutorial = useNavigationStore(state => state.showTutorial);

  // Estados de drag (copiados do componente original)
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartX = useRef<number>(0);
  const lastX = useRef<number>(0);
  const velocity = useRef<number>(0);
  const currentRotation = useRef<number>(Math.PI/2);

  // Animações (copiadas do componente original)
  const yPosition = useMotionValue(-15);
  const ySpring = useSpring(yPosition, { damping: 20, stiffness: 50 });
  const rotationY = useMotionValue(Math.PI/2);
  const rotationYSpring = useSpring(rotationY, { damping: 35, stiffness: 50 });

  // Expõe a referência do grupo para componentes externos
  useImperativeHandle(ref, () => group.current);

  // Background loading do modelo
  useEffect(() => {
    const loadModelInBackground = async () => {
      try {
        // Load model silently in background
        const gltf = await new Promise<GLTFResult>((resolve, reject) => {
          const loader = new GLTFLoader();
          loader.load(
            '/models/ManInBlackHole.glb',
            (result) => resolve(result as unknown as GLTFResult),
            undefined,
            reject
          );
        });

        // Pre-process model for performance
        gltf.scene.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            if (child.material) {
              child.material.needsUpdate = true;
            }
          }
        });

        // Start animations if they exist
        if (gltf.animations && gltf.animations.length > 0) {
          const mixer = new THREE.AnimationMixer(gltf.scene);
          gltf.animations.forEach(animation => {
            const action = mixer.clipAction(animation);
            action.play();
          });
        }

        setModelAssets(gltf);
        setModelLoaded(true);

      } catch (error) {
        console.error('Background model loading failed:', error);
        setModelLoaded(false);
      }
    };

    loadModelInBackground();
  }, []);

  // Setup de posição inicial
  useEffect(() => {
    ySpring.set(props.position?.[1] || 0);
  }, [ySpring, props.position]);

  // Handlers para arrastar (copiados do componente original)
  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    dragStartX.current = e.clientX;
    lastX.current = e.clientX;
    velocity.current = 0;
  };

  const handlePointerUp = () => {
    if (isDragging) {
      setIsDragging(false);
    }
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (isDragging) {
      const deltaX = e.clientX - lastX.current;
      velocity.current = deltaX * 0.0003;
      currentRotation.current += velocity.current;
      rotationY.set(currentRotation.current);
      lastX.current = e.clientX;
    }
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      return () => {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
      };
    }
    return undefined;
  }, [isDragging]);

  // Frame loop para animações (copiado do componente original)
  useFrame((_state, _delta) => {
    if (group.current && modelLoaded && !showTutorial) {
      // Movimento de entrada
      group.current.position.y = ySpring.get();

      // Se não está arrastando, aplica inércia e fricção
      if (!isDragging) {
        // Movimento de rotação inicial muito lento
        if (Math.abs(velocity.current) < 0.001) {
          velocity.current = -0.0008;
        }

        // Aplica a velocidade atual à rotação
        currentRotation.current += velocity.current;

        // Aplica fricção ultra suave para movimento contemplativo
        velocity.current *= 0.998;

        // Define a nova rotação
        rotationY.set(currentRotation.current);
      }

      // Aplica a rotação com spring (sempre suave)
      group.current.rotation.y = rotationYSpring.get();

      // Remove rotações nos outros eixos - mantém modelo estável
      group.current.rotation.x = 0;
      group.current.rotation.z = 0;
    }
  });

  // Só renderiza o modelo se estiver carregado E tutorial fechado
  const readyModel = modelLoaded && !showTutorial ? modelAssets : null;
  const shouldShowModel = Boolean(readyModel);

  return (
    <group
      ref={group}
      dispose={null}
      scale={props.scale || 0.5}
      position={[props.position?.[0] || 0, 0, props.position?.[2] || 0]}
      onPointerDown={handlePointerDown}
      visible={shouldShowModel}
    >
      {readyModel && (
        <primitive object={readyModel.scene} />
      )}
    </group>
  );
});

// Remove o preload global pois agora fazemos loading manual
export default AstronautWithCurtain;



