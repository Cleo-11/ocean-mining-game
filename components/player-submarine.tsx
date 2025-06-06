"use client"

import { useFrame } from "@react-three/fiber"
import { useRef } from "react"
import { getSubmarineByTier } from "@/lib/submarine-tiers"
import type * as THREE from "three"
import {
  BasicSubmarine,
  EnhancedSubmarine,
  DeepSeaSubmarine,
  HeavyDutySubmarine,
  ThermalSubmarine,
  PressureSubmarine,
  KrakenSubmarine,
  CosmicSubmarine,
  OmegaSubmarine,
  LeviathanSubmarine,
} from "@/components/submarine-types"

interface PlayerSubmarineProps {
  position: [number, number, number]
  rotation: [number, number, number]
  tier: number
  isMoving: boolean
}

export function PlayerSubmarine({ position, rotation, tier, isMoving }: PlayerSubmarineProps) {
  const groupRef = useRef<THREE.Group>(null)
  const propellerRef = useRef<THREE.Mesh>(null)
  const bubbleTimeRef = useRef(0)
  const bubblePositionsRef = useRef<Array<{ pos: [number, number, number]; size: number; speed: number }>>([])

  const submarineData = getSubmarineByTier(tier)
  const submarineColor = submarineData.color

  useFrame((state, delta) => {
    if (propellerRef.current) {
      // Rotate propeller faster when moving
      propellerRef.current.rotation.z += delta * (isMoving ? 10 : 3)
    }

    // Create bubbles when moving
    if (isMoving) {
      bubbleTimeRef.current += delta

      if (bubbleTimeRef.current > 0.2) {
        bubbleTimeRef.current = 0

        // Add new bubble
        if (bubblePositionsRef.current.length < 15) {
          bubblePositionsRef.current.push({
            pos: [
              position[0] + Math.random() * 0.5 - 0.25,
              position[1] - 0.3,
              position[2] + Math.random() * 0.5 - 0.25,
            ],
            size: Math.random() * 0.1 + 0.05,
            speed: Math.random() * 0.5 + 0.5,
          })
        }
      }
    }

    // Update bubbles
    for (let i = 0; i < bubblePositionsRef.current.length; i++) {
      const bubble = bubblePositionsRef.current[i]
      bubble.pos[1] += bubble.speed * delta

      // Remove bubbles that have risen too high
      if (bubble.pos[1] > position[1] + 5) {
        bubblePositionsRef.current.splice(i, 1)
        i--
      }
    }
  })

  // Render submarine based on tier
  const renderSubmarineByTier = () => {
    switch (tier) {
      case 1: // Nautilus I - Basic yellow submarine
        return <BasicSubmarine color={submarineColor} />

      case 2: // Nautilus II - Enhanced with side panels
        return <EnhancedSubmarine color={submarineColor} />

      case 3: // Abyssal Explorer - Deep-sea with reinforced hull
        return <DeepSeaSubmarine color={submarineColor} />

      case 4: // Mariana Miner - Heavy-duty with cargo pods
        return <HeavyDutySubmarine color={submarineColor} />

      case 5: // Hydrothermal Hunter - Heat-resistant with thermal vents
        return <ThermalSubmarine color={submarineColor} />

      case 6: // Pressure Pioneer - Advanced with pressure chambers
        return <PressureSubmarine color={submarineColor} />

      case 7: // Quantum Diver - Futuristic with quantum stabilizers
        return <OmegaSubmarine color={submarineColor} />

      case 8: // Titan Explorer - Massive with titanium plating
        return <KrakenSubmarine color={submarineColor} />

      case 9: // Void Stalker - Stealth with cloaking panels
        return <CosmicSubmarine color={submarineColor} />

      case 10: // Kraken Hunter - Legendary with sonar arrays
        return <LeviathanSubmarine color={submarineColor} />

      case 11: // Plasma Forge - Energy-powered with plasma cores
        return <BasicSubmarine color={submarineColor} />

      case 12: // Dimensional Rift - Interdimensional with space-time distortion
        return <EnhancedSubmarine color={submarineColor} />

      case 13: // Cosmic Voyager - Cosmic energy with star power
        return <DeepSeaSubmarine color={submarineColor} />

      case 14: // Omega Destroyer - Reality-warping technology
        return <HeavyDutySubmarine color={submarineColor} />

      case 15: // Leviathan - Ultimate deep-sea vessel
        return <ThermalSubmarine color={submarineColor} />

      default:
        return <PressureSubmarine color={submarineColor} />
    }
  }

  return (
    <>
      <group ref={groupRef} position={position} rotation={rotation}>
        {renderSubmarineByTier()}

        {/* Propeller - common to all submarines */}
        <mesh ref={propellerRef} position={[-1, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <torusGeometry args={[0.3, 0.03, 16, 4]} />
          <meshStandardMaterial color="#475569" roughness={0.5} metalness={0.8} />
        </mesh>

        {/* Main light - common to all submarines */}
        <pointLight position={[0.8, 0, 0]} intensity={1} color="#ffffff" distance={5} />
        <mesh position={[0.8, 0, 0]} castShadow>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={2} />
        </mesh>
      </group>

      {/* Bubbles */}
      {bubblePositionsRef.current.map((bubble, index) => (
        <mesh key={index} position={bubble.pos}>
          <sphereGeometry args={[bubble.size, 8, 8]} />
          <meshStandardMaterial color="#7dd3fc" transparent opacity={0.6} />
        </mesh>
      ))}
    </>
  )
}
