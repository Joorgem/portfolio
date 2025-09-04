/*
Model: ManInBlackHole.glb - Astronaut with Black Hole
Based on space boi model with additional black hole element
*/

import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle, ForwardedRef } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'
import { useMotionValue, useSpring } from "motion/react"
import { useFrame } from "@react-three/fiber"
import * as THREE from 'three'
import { GLTF } from 'three-stdlib'

interface AstronautProps {
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

export const Astronaut = forwardRef<THREE.Group, AstronautProps>((props, ref: ForwardedRef<THREE.Group>) => {
  const group = useRef<THREE.Group>(null!);
  
  // Expõe a referência do grupo para componentes externos
  useImperativeHandle(ref, () => group.current);
  const { nodes, materials, animations } = useGLTF('/models/ManInBlackHole.glb') as GLTFResult;
  const { actions } = useAnimations(animations, group);
  
  // Estado para controlar se está arrastando
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartX = useRef<number>(0);
  const lastX = useRef<number>(0);
  const velocity = useRef<number>(0);
  const currentRotation = useRef<number>(0);
  
  // Animação de entrada - subindo de baixo
  const yPosition = useMotionValue(-15);
  const ySpring = useSpring(yPosition, { damping: 20, stiffness: 50 });
  
  // Spring para rotação suave e densa
  const rotationY = useMotionValue(0);
  const rotationYSpring = useSpring(rotationY, { damping: 35, stiffness: 50 });
  
  useEffect(() => {
    ySpring.set(props.position?.[1] || 0);
  }, [ySpring, props.position]);
  
  // Ativa animações se existirem
  useEffect(() => {
    if (actions && Object.keys(actions).length > 0) {
      Object.values(actions).forEach(action => {
        if (action) action.play();
      });
    }
  }, [actions]);
  
  // Handlers para arrastar
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
      // Mantém a velocidade para continuar o movimento com inércia
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
    // Cleanup function is required for all branches
    return undefined;
  }, [isDragging]);
  
  // Rotação com inércia natural
  useFrame((_state, _delta) => {
    if (group.current) {
      // Movimento de entrada
      group.current.position.y = ySpring.get();
      
      // Se não está arrastando, aplica inércia e fricção
      if (!isDragging) {
        // Movimento de rotação inicial muito lento
        if (Math.abs(velocity.current) < 0.001) {
          velocity.current = -0.0008; // Velocidade reduzida: 0.002 → 0.0008 (invertida)
        }
        
        // Aplica a velocidade atual à rotação
        currentRotation.current += velocity.current;
        
        // Aplica fricção ultra suave para movimento contemplativo
        velocity.current *= 0.998; // Fricção reduzida: 0.995 → 0.998
        
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
  
  return (
    <group 
      ref={group}
      dispose={null}
      scale={props.scale || 0.5}
      position={[props.position?.[0] || 0, 0, props.position?.[2] || 0]}
      onPointerDown={handlePointerDown}
    >
      <group name="Scene">
        <group name="Sketchfab_model" rotation={[-Math.PI / 2, 0, 0]}>
          <group
            name="5dd040ad759e483c8caab1b1648f4ca4fbx"
            rotation={[Math.PI / 2, 0, 0]}
            scale={0.01}>
            <group name="RootNode">
              <group name="body" rotation={[-Math.PI / 2, 0, 0]} scale={100}>
                <mesh
                  name="body_Material001_0"
                  castShadow
                  receiveShadow
                  geometry={nodes.body_Material001_0?.geometry}
                  material={materials['Material.001']}
                />
                <mesh
                  name="body_Material002_0"
                  castShadow
                  receiveShadow
                  geometry={nodes.body_Material002_0?.geometry}
                  material={materials['Material.002']}
                />
              </group>
        <group position={[-357.404, 392.646, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={39.706}>
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Sphere002_Material001_0?.geometry}
            material={materials['Material.001']}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Sphere002_Material002_0?.geometry}
            material={materials['Material.002']}
          />
        </group>
        <group
          position={[199.634, 566.883, -221.001]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={39.706}>
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Sphere007_Material001_0?.geometry}
            material={materials['Material.001']}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Sphere007_Material002_0?.geometry}
            material={materials['Material.002']}
          />
        </group>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.waves_Material002_0?.geometry}
          material={materials['Material.002']}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={[100, 100, 1.891]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.waves1_Material002_0?.geometry}
          material={materials['Material.002']}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={[100, 100, 1.891]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.waves2_Material002_0?.geometry}
          material={materials['Material.002']}
          position={[92.464, 15.529, 2.112]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={[100, 100, 1.891]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.particles_Material002_0?.geometry}
          material={materials['Material.002']}
          position={[489.69, 793.811, 355.293]}
          rotation={[-Math.PI / 2, 0, -Math.PI / 2]}
          scale={20.408}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Sphere_Material001_0?.geometry}
          material={materials['Material.001']}
          position={[375.469, 427.948, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={62.402}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Sphere001_Material002_0?.geometry}
          material={materials['Material.002']}
          position={[375.469, 427.948, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={60.324}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Sphere004_Material002_0?.geometry}
          material={materials['Material.002']}
          position={[375.469, 427.948, 0]}
          rotation={[-0.688, 0, 0]}
          scale={[104.129, 81.609, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Sphere005_Material001_0?.geometry}
          material={materials['Material.001']}
          position={[-341.988, 460.196, -117.028]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={62.402}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Sphere006_Material002_0?.geometry}
          material={materials['Material.002']}
          position={[-341.988, 460.196, -117.028]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={60.324}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Sphere009_Material002_0?.geometry}
          material={materials['Material.002']}
          position={[507.522, 667.594, -214.475]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={16.881}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Sphere010_Material002_0?.geometry}
          material={materials['Material.002']}
          position={[-287.442, 585.792, -311.857]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={16.881}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Sphere011_Material002_0?.geometry}
          material={materials['Material.002']}
          position={[-553.462, 331.074, -379.067]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={11.437}
        />
              <group
                name="Cube"
                position={[0, -101.673, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
                scale={[1120.013, 1120.013, 100]}>
                <mesh
                  name="Cube_Material001_0"
                  castShadow
                  receiveShadow
                  geometry={nodes.Cube_Material001_0?.geometry}
                  material={materials['Material.001']}
                />
              </group>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Sphere003_Material002_0?.geometry}
          material={materials['Material.002']}
          position={[-357.404, 392.646, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={41.075}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Sphere008_Material002_0?.geometry}
          material={materials['Material.002']}
          position={[199.634, 566.883, -221.001]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={41.075}
        />
            </group>
          </group>
        </group>
        <group name="Sketchfab_model001" rotation={[-Math.PI / 2, 0, 0]}>
          <group
            name="dcaa5659b3224679ba61a4e0f55630b4fbx"
            rotation={[Math.PI / 2, 0, 0]}
            scale={0.01}>
            <group name="Object_2">
              <group name="RootNode001">
                <group name="Blackhole">
                  <group name="Lathe_L">
                    <mesh
                      name="Lathe_L_Blackhole_03_0"
                      castShadow
                      receiveShadow
                      geometry={nodes.Lathe_L_Blackhole_03_0?.geometry}
                      material={materials.Blackhole_03}
                    />
                  </group>
                  <group name="Lathe_M" position={[0, 5.518, 0]}>
                    <mesh
                      name="Lathe_M_Blackhole_02_0"
                      castShadow
                      receiveShadow
                      geometry={nodes.Lathe_M_Blackhole_02_0?.geometry}
                      material={materials.Blackhole_02}
                    />
                  </group>
                  <group name="Lathe_S" position={[0, 12.893, 0]}>
                    <mesh
                      name="Lathe_S_Blackhole_01_0"
                      castShadow
                      receiveShadow
                      geometry={nodes.Lathe_S_Blackhole_01_0?.geometry}
                      material={materials.Blackhole_01}
                    />
                  </group>
                </group>
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  )
});

useGLTF.preload('/models/ManInBlackHole.glb')