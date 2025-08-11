import React, { useRef } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'

export function Model(props) {
  const group = useRef()
  const { nodes, materials, animations } = useGLTF('/BlackHole.glb')
  const { actions } = useAnimations(animations, group)
  return (
    <group ref={group} {...props} dispose={null}>
      <group name="Scene">
        <group name="Sketchfab_model" rotation={[-Math.PI / 2, 0, 0]}>
          <group
            name="5dd040ad759e483c8caab1b1648f4ca4fbx"
            rotation={[Math.PI / 2, 0, 0]}
            scale={0.01}>
            <group name="RootNode">
              <group name="body" rotation={[-Math.PI / 2, 0, 0]} scale={100} />
              <group
                name="Cube"
                position={[0, -101.673, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
                scale={[1120.013, 1120.013, 100]}>
                <mesh
                  name="Cube_Material001_0"
                  castShadow
                  receiveShadow
                  geometry={nodes.Cube_Material001_0.geometry}
                  material={materials['Material.001']}
                />
              </group>
              <group
                name="particles"
                position={[489.69, 793.811, 355.293]}
                rotation={[-Math.PI / 2, 0, -Math.PI / 2]}
                scale={20.408}>
                <mesh
                  name="particles_Material002_0"
                  castShadow
                  receiveShadow
                  geometry={nodes.particles_Material002_0.geometry}
                  material={materials['Material.002']}
                />
              </group>
              <group
                name="Sphere"
                position={[375.469, 427.948, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
                scale={62.402}>
                <mesh
                  name="Sphere_Material001_0"
                  castShadow
                  receiveShadow
                  geometry={nodes.Sphere_Material001_0.geometry}
                  material={materials['Material.001']}
                />
              </group>
              <group
                name="Sphere001"
                position={[375.469, 427.948, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
                scale={60.324}>
                <mesh
                  name="Sphere001_Material002_0"
                  castShadow
                  receiveShadow
                  geometry={nodes.Sphere001_Material002_0.geometry}
                  material={materials['Material.002']}
                />
              </group>
              <group
                name="Sphere002"
                position={[-357.404, 392.646, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
                scale={39.706}>
                <mesh
                  name="Sphere002_Material001_0"
                  castShadow
                  receiveShadow
                  geometry={nodes.Sphere002_Material001_0.geometry}
                  material={materials['Material.001']}
                />
                <mesh
                  name="Sphere002_Material002_0"
                  castShadow
                  receiveShadow
                  geometry={nodes.Sphere002_Material002_0.geometry}
                  material={materials['Material.002']}
                />
              </group>
              <group
                name="Sphere003"
                position={[-357.404, 392.646, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
                scale={41.075}>
                <mesh
                  name="Sphere003_Material002_0"
                  castShadow
                  receiveShadow
                  geometry={nodes.Sphere003_Material002_0.geometry}
                  material={materials['Material.002']}
                />
              </group>
              <group
                name="Sphere004"
                position={[375.469, 427.948, 0]}
                rotation={[-0.688, 0, 0]}
                scale={[104.129, 81.609, 0]}>
                <mesh
                  name="Sphere004_Material002_0"
                  castShadow
                  receiveShadow
                  geometry={nodes.Sphere004_Material002_0.geometry}
                  material={materials['Material.002']}
                  position={[0, 0, -22703540]}
                  rotation={[0.644, 0, 0]}
                  scale={[1, 4194304, 1]}
                />
              </group>
              <group
                name="Sphere005"
                position={[-341.988, 460.196, -117.028]}
                rotation={[-Math.PI / 2, 0, 0]}
                scale={62.402}>
                <mesh
                  name="Sphere005_Material001_0"
                  castShadow
                  receiveShadow
                  geometry={nodes.Sphere005_Material001_0.geometry}
                  material={materials['Material.001']}
                />
              </group>
              <group
                name="Sphere006"
                position={[-341.988, 460.196, -117.028]}
                rotation={[-Math.PI / 2, 0, 0]}
                scale={60.324}>
                <mesh
                  name="Sphere006_Material002_0"
                  castShadow
                  receiveShadow
                  geometry={nodes.Sphere006_Material002_0.geometry}
                  material={materials['Material.002']}
                />
              </group>
              <group
                name="Sphere007"
                position={[199.634, 566.883, -221.001]}
                rotation={[-Math.PI / 2, 0, 0]}
                scale={39.706}>
                <mesh
                  name="Sphere007_Material001_0"
                  castShadow
                  receiveShadow
                  geometry={nodes.Sphere007_Material001_0.geometry}
                  material={materials['Material.001']}
                />
                <mesh
                  name="Sphere007_Material002_0"
                  castShadow
                  receiveShadow
                  geometry={nodes.Sphere007_Material002_0.geometry}
                  material={materials['Material.002']}
                />
              </group>
              <group
                name="Sphere008"
                position={[199.634, 566.883, -221.001]}
                rotation={[-Math.PI / 2, 0, 0]}
                scale={41.075}>
                <mesh
                  name="Sphere008_Material002_0"
                  castShadow
                  receiveShadow
                  geometry={nodes.Sphere008_Material002_0.geometry}
                  material={materials['Material.002']}
                />
              </group>
              <group
                name="Sphere009"
                position={[507.522, 667.594, -214.475]}
                rotation={[-Math.PI / 2, 0, 0]}
                scale={16.881}>
                <mesh
                  name="Sphere009_Material002_0"
                  castShadow
                  receiveShadow
                  geometry={nodes.Sphere009_Material002_0.geometry}
                  material={materials['Material.002']}
                />
              </group>
              <group
                name="Sphere010"
                position={[-287.442, 585.792, -311.857]}
                rotation={[-Math.PI / 2, 0, 0]}
                scale={16.881}>
                <mesh
                  name="Sphere010_Material002_0"
                  castShadow
                  receiveShadow
                  geometry={nodes.Sphere010_Material002_0.geometry}
                  material={materials['Material.002']}
                />
              </group>
              <group
                name="Sphere011"
                position={[-553.462, 331.074, -379.067]}
                rotation={[-Math.PI / 2, 0, 0]}
                scale={11.437}>
                <mesh
                  name="Sphere011_Material002_0"
                  castShadow
                  receiveShadow
                  geometry={nodes.Sphere011_Material002_0.geometry}
                  material={materials['Material.002']}
                />
              </group>
              <group name="waves" rotation={[-Math.PI / 2, 0, 0]} scale={[100, 100, 1.891]}>
                <mesh
                  name="waves_Material002_0"
                  castShadow
                  receiveShadow
                  geometry={nodes.waves_Material002_0.geometry}
                  material={materials['Material.002']}
                />
              </group>
              <group name="waves1" rotation={[-Math.PI / 2, 0, 0]} scale={[100, 100, 1.891]}>
                <mesh
                  name="waves1_Material002_0"
                  castShadow
                  receiveShadow
                  geometry={nodes.waves1_Material002_0.geometry}
                  material={materials['Material.002']}
                />
              </group>
              <group
                name="waves2"
                position={[92.464, 15.529, 2.112]}
                rotation={[-Math.PI / 2, 0, 0]}
                scale={[100, 100, 1.891]}>
                <mesh
                  name="waves2_Material002_0"
                  castShadow
                  receiveShadow
                  geometry={nodes.waves2_Material002_0.geometry}
                  material={materials['Material.002']}
                />
              </group>
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
                      geometry={nodes.Lathe_L_Blackhole_03_0.geometry}
                      material={materials.Blackhole_03}
                    />
                  </group>
                  <group name="Lathe_M" position={[0, 5.518, 0]}>
                    <mesh
                      name="Lathe_M_Blackhole_02_0"
                      castShadow
                      receiveShadow
                      geometry={nodes.Lathe_M_Blackhole_02_0.geometry}
                      material={materials.Blackhole_02}
                    />
                  </group>
                  <group name="Lathe_S" position={[0, 12.893, 0]}>
                    <mesh
                      name="Lathe_S_Blackhole_01_0"
                      castShadow
                      receiveShadow
                      geometry={nodes.Lathe_S_Blackhole_01_0.geometry}
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
}

useGLTF.preload('/BlackHole.glb')
