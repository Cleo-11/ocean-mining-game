"use client"

interface SubmarineProps {
  color: string
}

// Tier 1: Basic Submarine
export function BasicSubmarine({ color }: SubmarineProps) {
  return (
    <>
      {/* Main body */}
      <mesh castShadow>
        <capsuleGeometry args={[0.5, 1.5, 16, 16]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.7} />
      </mesh>

      {/* Top fin */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[0.1, 0.4, 0.6]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.7} />
      </mesh>

      {/* Viewport */}
      <mesh position={[0.6, 0.1, 0]} castShadow>
        <sphereGeometry args={[0.2, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#7dd3fc" roughness={0.1} metalness={0.3} />
      </mesh>

      {/* Propeller housing */}
      <mesh position={[-0.8, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.2, 0.2, 0.3, 16]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.7} />
      </mesh>
    </>
  )
}

// Tier 2: Enhanced Submarine
export function EnhancedSubmarine({ color }: SubmarineProps) {
  return (
    <>
      <BasicSubmarine color={color} />

      {/* Side panels for extra storage */}
      <mesh position={[0, -0.3, 0.4]} castShadow>
        <boxGeometry args={[1.2, 0.2, 0.3]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.7} />
      </mesh>
      <mesh position={[0, -0.3, -0.4]} castShadow>
        <boxGeometry args={[1.2, 0.2, 0.3]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.7} />
      </mesh>
    </>
  )
}

// Tier 3: Deep-Sea Submarine
export function DeepSeaSubmarine({ color }: SubmarineProps) {
  return (
    <>
      {/* Reinforced main body */}
      <mesh castShadow>
        <capsuleGeometry args={[0.6, 1.8, 16, 16]} />
        <meshStandardMaterial color={color} roughness={0.2} metalness={0.8} />
      </mesh>

      {/* Reinforcement rings */}
      {[-0.5, 0, 0.5].map((z, i) => (
        <mesh key={i} position={[0, 0, z]} castShadow>
          <torusGeometry args={[0.65, 0.05, 8, 16]} />
          <meshStandardMaterial color="#475569" roughness={0.1} metalness={0.9} />
        </mesh>
      ))}

      {/* Enhanced top fin */}
      <mesh position={[0, 0.6, 0]} castShadow>
        <boxGeometry args={[0.15, 0.5, 0.8]} />
        <meshStandardMaterial color={color} roughness={0.2} metalness={0.8} />
      </mesh>

      {/* Viewport */}
      <mesh position={[0.7, 0.1, 0]} castShadow>
        <sphereGeometry args={[0.25, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#7dd3fc" roughness={0.1} metalness={0.3} />
      </mesh>

      {/* Propeller housing */}
      <mesh position={[-0.9, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.25, 0.25, 0.4, 16]} />
        <meshStandardMaterial color={color} roughness={0.2} metalness={0.8} />
      </mesh>
    </>
  )
}

// Tier 4: Heavy-Duty Submarine
export function HeavyDutySubmarine({ color }: SubmarineProps) {
  return (
    <>
      {/* Larger main body */}
      <mesh castShadow>
        <capsuleGeometry args={[0.7, 2.0, 16, 16]} />
        <meshStandardMaterial color={color} roughness={0.2} metalness={0.8} />
      </mesh>

      {/* Cargo pods */}
      <mesh position={[0, -0.5, 0.8]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 1.5, 16]} />
        <meshStandardMaterial color={color} roughness={0.2} metalness={0.8} />
      </mesh>
      <mesh position={[0, -0.5, -0.8]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 1.5, 16]} />
        <meshStandardMaterial color={color} roughness={0.2} metalness={0.8} />
      </mesh>

      {/* Mining arms */}
      <mesh position={[0.8, -0.3, 0.5]} rotation={[0, 0, Math.PI / 4]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.8, 8]} />
        <meshStandardMaterial color="#475569" roughness={0.3} metalness={0.9} />
      </mesh>
      <mesh position={[0.8, -0.3, -0.5]} rotation={[0, 0, -Math.PI / 4]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.8, 8]} />
        <meshStandardMaterial color="#475569" roughness={0.3} metalness={0.9} />
      </mesh>

      {/* Command tower */}
      <mesh position={[0, 0.7, 0]} castShadow>
        <cylinderGeometry args={[0.4, 0.6, 0.8, 16]} />
        <meshStandardMaterial color={color} roughness={0.2} metalness={0.8} />
      </mesh>

      {/* Viewport */}
      <mesh position={[0.8, 0.1, 0]} castShadow>
        <sphereGeometry args={[0.3, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#7dd3fc" roughness={0.1} metalness={0.3} />
      </mesh>

      {/* Propeller housing */}
      <mesh position={[-1.0, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.5, 16]} />
        <meshStandardMaterial color={color} roughness={0.2} metalness={0.8} />
      </mesh>
    </>
  )
}

// Tier 5: Thermal Submarine
export function ThermalSubmarine({ color }: SubmarineProps) {
  return (
    <>
      {/* Heat-resistant main body */}
      <mesh castShadow>
        <capsuleGeometry args={[0.8, 2.2, 16, 16]} />
        <meshStandardMaterial color={color} roughness={0.1} metalness={0.9} />
      </mesh>

      {/* Thermal vents */}
      {[0.3, -0.3].map((y, i) => (
        <mesh key={i} position={[0, y, 0.9]} castShadow>
          <cylinderGeometry args={[0.1, 0.15, 0.4, 8]} />
          <meshStandardMaterial color="#ff6b35" emissive="#ff6b35" emissiveIntensity={0.3} />
        </mesh>
      ))}

      {/* Heat shields */}
      <mesh position={[0, 0, 0]} castShadow>
        <sphereGeometry args={[0.9, 16, 16, 0, Math.PI * 2, 0, Math.PI]} />
        <meshStandardMaterial color={color} transparent opacity={0.7} roughness={0.1} metalness={0.9} />
      </mesh>

      {/* Thermal glow */}
      <pointLight position={[0, 0, 0]} intensity={0.5} color="#ff6b35" distance={3} />

      {/* Enhanced viewport */}
      <mesh position={[0.9, 0.1, 0]} castShadow>
        <sphereGeometry args={[0.3, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#ff9500" roughness={0.1} metalness={0.3} />
      </mesh>

      {/* Propeller housing */}
      <mesh position={[-1.1, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.35, 0.35, 0.6, 16]} />
        <meshStandardMaterial color={color} roughness={0.1} metalness={0.9} />
      </mesh>
    </>
  )
}

// Tier 6: Pressure Submarine
export function PressureSubmarine({ color }: SubmarineProps) {
  return (
    <>
      {/* Pressure-resistant main body */}
      <mesh castShadow>
        <capsuleGeometry args={[0.9, 2.5, 20, 20]} />
        <meshStandardMaterial color={color} roughness={0.05} metalness={0.95} />
      </mesh>

      {/* Pressure chambers */}
      {[-0.8, 0, 0.8].map((x, i) => (
        <mesh key={i} position={[x, 0, 0]} castShadow>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshStandardMaterial color="#0ea5e9" transparent opacity={0.6} />
        </mesh>
      ))}

      {/* Energy valves */}
      {[0.4, -0.4].map((y, i) => (
        <mesh key={i} position={[0, y, 1.0]} castShadow>
          <cylinderGeometry args={[0.15, 0.2, 0.3, 8]} />
          <meshStandardMaterial color="#0ea5e9" emissive="#0ea5e9" emissiveIntensity={0.4} />
        </mesh>
      ))}

      {/* Blue energy glow */}
      <pointLight position={[0, 0, 0]} intensity={0.6} color="#0ea5e9" distance={4} />

      {/* Advanced viewport */}
      <mesh position={[1.0, 0.1, 0]} castShadow>
        <sphereGeometry args={[0.35, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#0ea5e9" roughness={0.05} metalness={0.3} />
      </mesh>

      {/* Propeller housing */}
      <mesh position={[-1.25, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.4, 0.4, 0.7, 16]} />
        <meshStandardMaterial color={color} roughness={0.05} metalness={0.95} />
      </mesh>
    </>
  )
}

// Tier 7-10: Advanced Submarines (simplified for now)
export function KrakenSubmarine({ color }: SubmarineProps) {
  return (
    <>
      {/* Massive main body */}
      <mesh castShadow>
        <capsuleGeometry args={[1.2, 3.0, 20, 20]} />
        <meshStandardMaterial color={color} roughness={0.02} metalness={0.98} />
      </mesh>

      {/* Sonar arrays */}
      {[0.6, -0.6].map((y, i) => (
        <mesh key={i} position={[0, y, 1.2]} castShadow>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial color="#7c3aed" emissive="#7c3aed" emissiveIntensity={0.5} />
        </mesh>
      ))}

      {/* Purple energy field */}
      <pointLight position={[0, 0, 0]} intensity={0.8} color="#7c3aed" distance={5} />

      {/* Advanced viewport */}
      <mesh position={[1.3, 0.1, 0]} castShadow>
        <sphereGeometry args={[0.4, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#7c3aed" roughness={0.02} metalness={0.3} />
      </mesh>
    </>
  )
}

export function CosmicSubmarine({ color }: SubmarineProps) {
  return (
    <>
      {/* Cosmic main body */}
      <mesh castShadow>
        <capsuleGeometry args={[1.0, 2.8, 20, 20]} />
        <meshStandardMaterial color={color} roughness={0.05} metalness={0.95} />
      </mesh>

      {/* Star core */}
      <mesh position={[0, 0, 0]} castShadow>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.6} transparent opacity={0.8} />
      </mesh>

      {/* Cosmic wings */}
      <mesh position={[0, 0.5, 0.8]} rotation={[Math.PI / 4, 0, 0]} castShadow>
        <boxGeometry args={[0.1, 1.0, 0.3]} />
        <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0, 0.5, -0.8]} rotation={[-Math.PI / 4, 0, 0]} castShadow>
        <boxGeometry args={[0.1, 1.0, 0.3]} />
        <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.3} />
      </mesh>

      {/* Golden energy glow */}
      <pointLight position={[0, 0, 0]} intensity={1.0} color="#fbbf24" distance={6} />
    </>
  )
}

export function OmegaSubmarine({ color }: SubmarineProps) {
  return (
    <>
      {/* Reality-warping main body */}
      <mesh castShadow>
        <capsuleGeometry args={[1.1, 2.9, 20, 20]} />
        <meshStandardMaterial color={color} roughness={0.01} metalness={0.99} />
      </mesh>

      {/* Reality distortion matrix */}
      <mesh position={[0, 0, 0]} castShadow>
        <torusGeometry args={[1.2, 0.1, 16, 32]} />
        <meshStandardMaterial color="#dc2626" emissive="#dc2626" emissiveIntensity={0.7} />
      </mesh>
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[1.2, 0.1, 16, 32]} />
        <meshStandardMaterial color="#dc2626" emissive="#dc2626" emissiveIntensity={0.7} />
      </mesh>

      {/* Red energy field */}
      <pointLight position={[0, 0, 0]} intensity={1.2} color="#dc2626" distance={7} />
    </>
  )
}

export function LeviathanSubmarine({ color }: SubmarineProps) {
  return (
    <>
      {/* Ultimate main body */}
      <mesh castShadow>
        <capsuleGeometry args={[1.5, 3.5, 24, 24]} />
        <meshStandardMaterial color={color} roughness={0.0} metalness={1.0} />
      </mesh>

      {/* Omnimining arrays */}
      {[0.8, 0, -0.8].map((y, i) => (
        <mesh key={i} position={[0, y, 1.5]} castShadow>
          <cylinderGeometry args={[0.2, 0.3, 0.6, 16]} />
          <meshStandardMaterial color="#7e22ce" emissive="#7e22ce" emissiveIntensity={0.8} />
        </mesh>
      ))}

      {/* Ultimate energy core */}
      <mesh position={[0, 0, 0]} castShadow>
        <sphereGeometry args={[0.6, 20, 20]} />
        <meshStandardMaterial color="#7e22ce" emissive="#7e22ce" emissiveIntensity={0.9} transparent opacity={0.7} />
      </mesh>

      {/* Purple ultimate glow */}
      <pointLight position={[0, 0, 0]} intensity={1.5} color="#7e22ce" distance={8} />

      {/* Ultimate viewport */}
      <mesh position={[1.6, 0.1, 0]} castShadow>
        <sphereGeometry args={[0.5, 20, 20, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#7e22ce" roughness={0.0} metalness={0.3} />
      </mesh>
    </>
  )
}
