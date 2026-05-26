import { OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'

function HybridMotorModel() {
  return (
    <group rotation={[0, 0, -Math.PI / 2]}>
      {/* Outer transparent casing */}
      <mesh>
        <cylinderGeometry args={[0.9, 0.9, 3.8, 96, 1, true]} />
        <meshStandardMaterial
          color="#a8c7dc"
          metalness={0.15}
          roughness={0.18}
          transparent
          opacity={0.22}
          side={2}
        />
      </mesh>

      {/* Paraffin fuel grain */}
      <mesh>
        <cylinderGeometry args={[0.68, 0.68, 3.15, 96]} />
        <meshStandardMaterial color="#f1efe3" roughness={0.55} />
      </mesh>

      {/* Central port visual tunnel */}
      <mesh>
        <cylinderGeometry args={[0.24, 0.24, 3.3, 64]} />
        <meshStandardMaterial color="#05080a" roughness={0.7} />
      </mesh>

      {/* Front oxidizer inlet */}
      <mesh position={[0, -2.05, 0]}>
        <cylinderGeometry args={[0.34, 0.34, 0.2, 64]} />
        <meshStandardMaterial color="#6ab7d6" metalness={0.35} roughness={0.25} />
      </mesh>

      {/* Nozzle throat / converging section */}
      <mesh position={[0, 1.9, 0]}>
        <cylinderGeometry args={[0.32, 0.7, 0.55, 64]} />
        <meshStandardMaterial color="#65717c" metalness={0.55} roughness={0.3} />
      </mesh>

      {/* Nozzle divergent section */}
      <mesh position={[0, 2.45, 0]}>
        <cylinderGeometry args={[0.55, 0.32, 0.75, 64]} />
        <meshStandardMaterial color="#4d5862" metalness={0.6} roughness={0.26} />
      </mesh>

      {/* Exhaust plume */}
      <mesh position={[0, 3.25, 0]}>
        <coneGeometry args={[0.32, 1.5, 64]} />
        <meshStandardMaterial
          color="#ff9b3d"
          emissive="#ff5a1f"
          emissiveIntensity={2}
          transparent
          opacity={0.72}
        />
      </mesh>
    </group>
  )
}

export function RocketScene() {
  return (
    <Canvas camera={{ position: [4.5, 2.8, 4.5], fov: 45 }}>
      <color attach="background" args={['#151c22']} />

      <ambientLight intensity={0.7} />
      <directionalLight position={[4, 5, 3]} intensity={2.2} />
      <pointLight position={[-3, -2, 2]} intensity={1.3} color="#7dd3fc" />
      <pointLight position={[0, 0, 4]} intensity={1.8} color="#ff8a32" />

      <HybridMotorModel />

      <gridHelper args={[8, 16, '#33414d', '#25313a']} />
      <OrbitControls enableDamping makeDefault />
    </Canvas>
  )
}