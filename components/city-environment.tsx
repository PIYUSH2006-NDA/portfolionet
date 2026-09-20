'use client'

import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

// Refined futuristic color palette
const CHARCOAL = '#0a0d14'
const SLATE_DARK = '#0f141d'
const GRAPHITE_STEEL = '#182030'
const METALLIC_SILVER = '#283347'
const CRIMSON_BEACON = '#ef4444'
const DEEP_CRIMSON = '#b91c1c'
const WARM_GOLD = '#fde047'
const WARM_WHITE = '#fef3c7'
const CYAN_ACCENT = '#06b6d4'
const TEAL_ACCENT = '#0d9488'

/**
 * Procedural distant futuristic skyline spanning both flanks and far horizon.
 * Uses InstancedMesh for optimal rendering performance with 100+ high-rises.
 */
export function DistantMetropolis() {
  const towersRef = useRef<THREE.InstancedMesh>(null)
  const spiresRef = useRef<THREE.InstancedMesh>(null)
  const beaconsRef = useRef<THREE.InstancedMesh>(null)
  const windowsRef = useRef<THREE.InstancedMesh>(null)

  // Generate outer city layout
  const towerData = useMemo(() => {
    const list: Array<{
      x: number
      z: number
      w: number
      h: number
      d: number
      spireH: number
      color: THREE.Color
      hasSpire: boolean
    }> = []

    const random = (seed: number) => {
      const x = Math.sin(seed * 9999) * 10000
      return x - Math.floor(x)
    }

    let seed = 42
    const nextRand = () => {
      seed += 1
      return random(seed)
    }

    // Left flank: x from -20 to -115, z from -230 to 45
    // Right flank: x from 24 to 115, z from -230 to 45 (giving clearance for camera at x=13)
    // Far horizon: x from -115 to 115, z from -170 to -240
    const flanks = [-1, 1]
    flanks.forEach((side) => {
      for (let i = 0; i < 48; i++) {
        const xDist = (side < 0 ? 18 : 25) + nextRand() * 85
        const x = side * xDist
        const z = 40 - nextRand() * 260
        const w = 3 + nextRand() * 4.5
        const d = 3 + nextRand() * 4.5
        // Distance-based height scaling: massive mega-towers in mid/far distance
        const baseH = 8 + nextRand() * 32 + (Math.abs(x) > 35 ? 12 : 0)
        const spireH = 2 + nextRand() * 8
        const hasSpire = nextRand() > 0.3

        const shade = nextRand()
        const col = shade > 0.6 ? new THREE.Color(GRAPHITE_STEEL) : shade > 0.25 ? new THREE.Color(SLATE_DARK) : new THREE.Color(CHARCOAL)

        list.push({ x, z, w, h: baseH, d, spireH, color: col, hasSpire })
      }
    })

    // Far horizon backdrop clusters
    for (let i = 0; i < 32; i++) {
      const x = (nextRand() - 0.5) * 200
      const z = -175 - nextRand() * 65
      const w = 4.5 + nextRand() * 7
      const d = 4.5 + nextRand() * 6
      const h = 22 + nextRand() * 38
      const spireH = 4 + nextRand() * 10
      list.push({
        x,
        z,
        w,
        h,
        d,
        spireH,
        color: new THREE.Color(CHARCOAL),
        hasSpire: true,
      })
    }

    return list
  }, [])

  // Generate thousands of glowing window points on outer buildings
  // Palette: 70% warm white/gold, 15% crimson, 15% teal
  const windowData = useMemo(() => {
    const list: Array<{ x: number; y: number; z: number; color: THREE.Color }> = []
    const palette = [
      new THREE.Color(WARM_WHITE),
      new THREE.Color(WARM_GOLD),
      new THREE.Color(WARM_WHITE),
      new THREE.Color(WARM_GOLD),
      new THREE.Color(CRIMSON_BEACON),
      new THREE.Color(WARM_WHITE),
      new THREE.Color(TEAL_ACCENT),
    ]

    towerData.forEach((t, tIdx) => {
      if (Math.abs(t.x) > 85) return // skip furthest to optimize
      const numStories = Math.min(24, Math.floor(t.h / 1.5))
      for (let s = 1; s < numStories; s++) {
        if ((s + tIdx) % 3 === 0) continue // dark floor
        const y = s * 1.45
        // front face windows
        list.push({
          x: t.x,
          y,
          z: t.z + t.d / 2 + 0.04,
          color: palette[(s * 7 + tIdx * 11) % palette.length],
        })
        // inner facing flank windows
        list.push({
          x: t.x + (t.x > 0 ? -t.w / 2 - 0.04 : t.w / 2 + 0.04),
          y,
          z: t.z,
          color: palette[(s * 5 + tIdx * 13) % palette.length],
        })
      }
    })
    return list
  }, [towerData])

  // Setup instanced mesh matrices
  useMemo(() => {
    // will apply via useFrame/effects
  }, [])

  useFrame(({ clock }) => {
    // Pulse aviation warning beacons
    if (beaconsRef.current) {
      const pulse = (Math.sin(clock.elapsedTime * 3) + 1) * 0.5
      beaconsRef.current.visible = pulse > 0.2
    }
  })

  // Apply matrix transformations
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const spireCount = towerData.filter((t) => t.hasSpire).length

  // Build instanced towers on mount
  const handleTowersRef = (mesh: THREE.InstancedMesh | null) => {
    if (!mesh) return
    towerData.forEach((t, i) => {
      dummy.position.set(t.x, t.h / 2, t.z)
      dummy.scale.set(t.w, t.h, t.d)
      dummy.rotation.set(0, 0, 0)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
      mesh.setColorAt(i, t.color)
    })
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  }

  const handleSpiresRef = (mesh: THREE.InstancedMesh | null) => {
    if (!mesh) return
    let idx = 0
    towerData.forEach((t) => {
      if (!t.hasSpire) return
      dummy.position.set(t.x, t.h + t.spireH / 2, t.z)
      dummy.scale.set(0.2, t.spireH, 0.2)
      dummy.updateMatrix()
      mesh.setMatrixAt(idx++, dummy.matrix)
    })
    mesh.instanceMatrix.needsUpdate = true
  }

  const handleBeaconsRef = (mesh: THREE.InstancedMesh | null) => {
    if (!mesh) return
    let idx = 0
    towerData.forEach((t) => {
      if (!t.hasSpire) return
      dummy.position.set(t.x, t.h + t.spireH + 0.3, t.z)
      dummy.scale.set(0.4, 0.4, 0.4)
      dummy.updateMatrix()
      mesh.setMatrixAt(idx++, dummy.matrix)
    })
    mesh.instanceMatrix.needsUpdate = true
  }

  const handleWindowsRef = (mesh: THREE.InstancedMesh | null) => {
    if (!mesh) return
    windowData.forEach((w, i) => {
      dummy.position.set(w.x, w.y, w.z)
      dummy.scale.set(0.32, 0.16, 0.04)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
      mesh.setColorAt(i, w.color)
    })
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  }

  return (
    <group>
      {/* Outer Skyscraper Monoliths */}
      <instancedMesh
        ref={handleTowersRef}
        args={[undefined, undefined, towerData.length]}
      >
        <boxGeometry />
        <meshStandardMaterial
          color={CHARCOAL}
          metalness={0.88}
          roughness={0.28}
        />
      </instancedMesh>

      {/* Rooftop Spires & Antennas */}
      <instancedMesh
        ref={handleSpiresRef}
        args={[undefined, undefined, spireCount]}
      >
        <cylinderGeometry args={[0.04, 0.25, 1, 6]} />
        <meshStandardMaterial
          color={METALLIC_SILVER}
          metalness={0.9}
          roughness={0.2}
        />
      </instancedMesh>

      {/* Rooftop Blinking Aviation Beacons */}
      <instancedMesh
        ref={beaconsRef}
        args={[undefined, undefined, spireCount]}
      >
        <sphereGeometry args={[0.3, 6, 6]} />
        <meshBasicMaterial color={CRIMSON_BEACON} toneMapped={false} />
      </instancedMesh>

      {/* Distant Window Light Strips */}
      <instancedMesh
        ref={handleWindowsRef}
        args={[undefined, undefined, windowData.length]}
      >
        <boxGeometry />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
    </group>
  )
}

/**
 * Distant majestic mountain ridges shrouded in dark graphite atmospheric mist.
 * Modeled after the cinematic reference skyline backdrop.
 */
export function MountainBackdrop() {
  const ridges = useMemo(() => {
    const list: Array<{ x: number; z: number; scaleX: number; scaleY: number; rotY: number }> = []
    // 3 layered mountain rows in the far background
    for (let i = -7; i <= 7; i++) {
      list.push({
        x: i * 32 + (i % 2) * 8,
        z: -230 - Math.abs(i) * 5,
        scaleX: 42 + Math.abs(i % 3) * 12,
        scaleY: 34 + Math.cos(i * 1.5) * 14,
        rotY: (i * 0.15),
      })
    }
    // Mid layer ridges
    for (let i = -5; i <= 5; i++) {
      list.push({
        x: i * 38,
        z: -190 - Math.abs(i) * 6,
        scaleX: 36,
        scaleY: 22 + Math.sin(i * 1.2) * 8,
        rotY: i * 0.2,
      })
    }
    return list
  }, [])

  return (
    <group position={[0, -5, 0]}>
      {ridges.map((r, idx) => (
        <mesh
          key={idx}
          position={[r.x, r.scaleY / 2, r.z]}
          rotation={[0, r.rotY, 0]}
        >
          <coneGeometry args={[r.scaleX / 2, r.scaleY, 4]} />
          <meshStandardMaterial
            color="#070a11"
            roughness={0.95}
            metalness={0.1}
            flatShading
          />
        </mesh>
      ))}
    </group>
  )
}

/**
 * Distant Citadel / Iconic Central Megatower.
 * Positioned on the horizon with glowing crimson spine and crown illumination.
 */
export function DistantCitadel() {
  return (
    <group position={[0, 0, -170]}>
      {/* Massive stepped foundation */}
      <mesh position={[0, 4, 0]}>
        <boxGeometry args={[16, 8, 16]} />
        <meshStandardMaterial color="#090d15" metalness={0.9} roughness={0.22} />
      </mesh>
      {/* Central monolithic tower body */}
      <mesh position={[0, 26, 0]}>
        <boxGeometry args={[9.5, 36, 9.5]} />
        <meshStandardMaterial color="#0c111a" metalness={0.88} roughness={0.25} />
      </mesh>
      {/* Glowing vertical crimson architectural spines */}
      <mesh position={[0, 26, 4.8]}>
        <boxGeometry args={[0.45, 35, 0.12]} />
        <meshBasicMaterial color={CRIMSON_BEACON} toneMapped={false} />
      </mesh>
      <mesh position={[-4.8, 26, 0]}>
        <boxGeometry args={[0.12, 35, 0.45]} />
        <meshBasicMaterial color={CRIMSON_BEACON} toneMapped={false} />
      </mesh>
      <mesh position={[4.8, 26, 0]}>
        <boxGeometry args={[0.12, 35, 0.45]} />
        <meshBasicMaterial color={CRIMSON_BEACON} toneMapped={false} />
      </mesh>
      {/* Upper crown with golden warm lighting */}
      <mesh position={[0, 46, 0]}>
        <boxGeometry args={[6.5, 4, 6.5]} />
        <meshStandardMaterial color="#182232" metalness={0.92} roughness={0.18} />
      </mesh>
      <mesh position={[0, 48.2, 0]}>
        <boxGeometry args={[6.7, 0.25, 6.7]} />
        <meshBasicMaterial color={WARM_GOLD} toneMapped={false} />
      </mesh>
      {/* Pinnacle spire */}
      <mesh position={[0, 52, 0]}>
        <cylinderGeometry args={[0.08, 0.6, 8, 8]} />
        <meshStandardMaterial color={METALLIC_SILVER} metalness={0.95} roughness={0.1} />
      </mesh>
      <mesh position={[0, 56.4, 0]}>
        <sphereGeometry args={[0.6, 8, 8]} />
        <meshBasicMaterial color={CRIMSON_BEACON} toneMapped={false} />
      </mesh>
    </group>
  )
}

/**
 * Expansive dark reflective bay, canals, and illuminated highway interchanges with moving traffic.
 */
export function ExpansiveWaterAndGround() {
  const ringTrafficRef = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (!ringTrafficRef.current) return
    const t = clock.elapsedTime
    const cars = ringTrafficRef.current.children
    // Highway Ring 1 (z = 14, radius 11.2)
    if (cars[0]) cars[0].position.set(Math.cos(t * 0.8) * 11.2, 0.85, 14 + Math.sin(t * 0.8) * 11.2)
    if (cars[1]) cars[1].position.set(Math.cos(-t * 0.65 + 2.4) * 10.8, 0.85, 14 + Math.sin(-t * 0.65 + 2.4) * 10.8)
    // Highway Ring 2 (z = -72, radius 14.2)
    if (cars[2]) cars[2].position.set(Math.cos(t * 0.6 + 1.2) * 14.25, 1.08, -72 + Math.sin(t * 0.6 + 1.2) * 14.25)
    if (cars[3]) cars[3].position.set(Math.cos(-t * 0.55 + 3.6) * 13.75, 1.08, -72 + Math.sin(-t * 0.55 + 3.6) * 13.75)
    // Highway Ring 3 (z = -155, radius 16.2)
    if (cars[4]) cars[4].position.set(Math.cos(t * 0.45 + 0.5) * 16.25, 1.48, -155 + Math.sin(t * 0.45 + 0.5) * 16.25)
  })

  return (
    <group>
      {/* Broad reflective dark water / plaza bay spanning entire visible perimeter */}
      <mesh position={[0, -0.42, -90]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[360, 420]} />
        <meshStandardMaterial
          color="#05070d"
          roughness={0.2}
          metalness={0.9}
        />
      </mesh>

      {/* Flanking waterway canal borders with glowing guide rails */}
      {[-24, 24].map((side) => (
        <group key={side} position={[side, -0.32, -90]}>
          {/* Water channel strip */}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[8, 380]} />
            <meshStandardMaterial
              color="#04060b"
              roughness={0.08}
              metalness={0.95}
            />
          </mesh>
          {/* Glowing quay rim lights */}
          <mesh position={[-4, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.12, 380]} />
            <meshBasicMaterial color={CRIMSON_BEACON} toneMapped={false} />
          </mesh>
          <mesh position={[4, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.12, 380]} />
            <meshBasicMaterial color={TEAL_ACCENT} toneMapped={false} />
          </mesh>
        </group>
      ))}

      {/* Elevated Glowing Highway Ring Interchanges (cinematic focal features) */}
      {/* Front circular cloverleaf interchange */}
      <group position={[0, 0.6, 14]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[11, 0.38, 8, 48]} />
          <meshStandardMaterial color={GRAPHITE_STEEL} roughness={0.3} metalness={0.7} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.22, 0]}>
          <torusGeometry args={[11.2, 0.06, 6, 48]} />
          <meshBasicMaterial color={WARM_GOLD} toneMapped={false} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.22, 0]}>
          <torusGeometry args={[10.8, 0.06, 6, 48]} />
          <meshBasicMaterial color={CRIMSON_BEACON} toneMapped={false} />
        </mesh>
      </group>

      {/* Mid-journey highway overpass ring */}
      <group position={[0, 0.8, -72]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[14, 0.45, 8, 48]} />
          <meshStandardMaterial color={GRAPHITE_STEEL} roughness={0.3} metalness={0.7} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.26, 0]}>
          <torusGeometry args={[14.25, 0.07, 6, 48]} />
          <meshBasicMaterial color={WARM_WHITE} toneMapped={false} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.26, 0]}>
          <torusGeometry args={[13.75, 0.07, 6, 48]} />
          <meshBasicMaterial color={DEEP_CRIMSON} toneMapped={false} />
        </mesh>
      </group>

      {/* Far terminus highway loop */}
      <group position={[0, 1.2, -155]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[16, 0.5, 8, 48]} />
          <meshStandardMaterial color={GRAPHITE_STEEL} roughness={0.3} metalness={0.7} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.3, 0]}>
          <torusGeometry args={[16.25, 0.08, 6, 48]} />
          <meshBasicMaterial color={CYAN_ACCENT} toneMapped={false} />
        </mesh>
      </group>

      {/* Animated moving cars on the rings */}
      <group ref={ringTrafficRef}>
        <mesh><sphereGeometry args={[0.18, 6, 6]} /><meshBasicMaterial color={WARM_WHITE} toneMapped={false} /></mesh>
        <mesh><sphereGeometry args={[0.18, 6, 6]} /><meshBasicMaterial color={CRIMSON_BEACON} toneMapped={false} /></mesh>
        <mesh><sphereGeometry args={[0.2, 6, 6]} /><meshBasicMaterial color={WARM_GOLD} toneMapped={false} /></mesh>
        <mesh><sphereGeometry args={[0.2, 6, 6]} /><meshBasicMaterial color={DEEP_CRIMSON} toneMapped={false} /></mesh>
        <mesh><sphereGeometry args={[0.22, 6, 6]} /><meshBasicMaterial color={CYAN_ACCENT} toneMapped={false} /></mesh>
      </group>
    </group>
  )
}

/**
 * Majestic vertical sky beams / searchlight pillars rising from the metropolis.
 * Features the signature central crimson beam from the reference photo.
 */
export function VolumetricSkyBeams() {
  const beamRef = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (beamRef.current) {
      const t = clock.elapsedTime
      beamRef.current.children.forEach((child, i) => {
        const mesh = child as THREE.Mesh
        const mat = mesh.material as THREE.MeshBasicMaterial
        if (mat) {
          mat.opacity = 0.25 + Math.sin(t * 1.5 + i * 1.2) * 0.08
        }
      })
    }
  })

  return (
    <group ref={beamRef}>
      {/* Central iconic Crimson Sky Beam (behind central hub) */}
      <mesh position={[0, 24, -135]}>
        <cylinderGeometry args={[0.3, 1.8, 65, 12, 1, true]} />
        <meshBasicMaterial
          color="#ff1e38"
          transparent
          opacity={0.32}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* Flanking secondary golden and cyan light columns */}
      <mesh position={[-28, 18, -45]}>
        <cylinderGeometry args={[0.2, 1.2, 50, 8, 1, true]} />
        <meshBasicMaterial
          color={WARM_GOLD}
          transparent
          opacity={0.2}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      <mesh position={[28, 18, -95]}>
        <cylinderGeometry args={[0.2, 1.2, 50, 8, 1, true]} />
        <meshBasicMaterial
          color={CRIMSON_BEACON}
          transparent
          opacity={0.22}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      <mesh position={[-36, 18, -120]}>
        <cylinderGeometry args={[0.25, 1.4, 52, 8, 1, true]} />
        <meshBasicMaterial
          color={CYAN_ACCENT}
          transparent
          opacity={0.16}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      <mesh position={[38, 22, -160]}>
        <cylinderGeometry args={[0.3, 1.6, 60, 8, 1, true]} />
        <meshBasicMaterial
          color={WARM_WHITE}
          transparent
          opacity={0.18}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}

/**
 * Autonomous flying drones, aerodynes, and courier hovercrafts.
 * Fly across the skyline at varied altitudes and trajectories with glowing navigation lights.
 */
export function MetropolisAerialTraffic() {
  const dronesRef = useRef<THREE.Group>(null)

  // Configure 14 aerial vehicles with distinctive orbits/paths
  const flightPaths = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => ({
      speed: 0.25 + (i % 4) * 0.12,
      dir: i % 2 === 0 ? 1 : -1,
      startX: (i % 2 === 0 ? -1 : 1) * (14 + (i % 5) * 8),
      y: 5.5 + (i % 6) * 2.2,
      centerZ: -12 - i * 11,
      spanX: 25 + (i % 3) * 12,
      spanZ: 18 + (i % 2) * 8,
      phase: i * 0.85,
      isHeavy: i % 4 === 0,
    }))
  }, [])

  useFrame(({ clock }) => {
    if (!dronesRef.current) return
    const t = clock.elapsedTime
    dronesRef.current.children.forEach((craft, i) => {
      const p = flightPaths[i]
      const angle = (t * p.speed * p.dir + p.phase)
      const x = p.startX + Math.sin(angle) * p.spanX
      const z = p.centerZ + Math.cos(angle * 0.7) * p.spanZ
      craft.position.set(x, p.y + Math.sin(t * 1.8 + i) * 0.35, z)
      craft.rotation.y = Math.atan2(
        Math.cos(angle) * p.spanX * p.dir,
        -Math.sin(angle * 0.7) * p.spanZ * 0.7
      )
    })
  })

  return (
    <group ref={dronesRef}>
      {flightPaths.map((p, i) => (
        <group key={i}>
          {/* Craft Chassis */}
          <mesh>
            <boxGeometry args={[p.isHeavy ? 0.8 : 0.45, 0.12, p.isHeavy ? 0.6 : 0.3]} />
            <meshStandardMaterial color="#141a24" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Forward White Headlight */}
          <mesh position={[0, 0, p.isHeavy ? 0.32 : 0.18]}>
            <sphereGeometry args={[0.07, 6, 6]} />
            <meshBasicMaterial color={WARM_WHITE} toneMapped={false} />
          </mesh>
          {/* Aft Crimson Taillight */}
          <mesh position={[0, 0, p.isHeavy ? -0.32 : -0.18]}>
            <sphereGeometry args={[0.08, 6, 6]} />
            <meshBasicMaterial color={CRIMSON_BEACON} toneMapped={false} />
          </mesh>
          {/* Wingtip beacons */}
          <mesh position={[p.isHeavy ? 0.42 : 0.24, 0, 0]}>
            <sphereGeometry args={[0.04, 6, 6]} />
            <meshBasicMaterial color={CYAN_ACCENT} toneMapped={false} />
          </mesh>
          <mesh position={[p.isHeavy ? -0.42 : -0.24, 0, 0]}>
            <sphereGeometry args={[0.04, 6, 6]} />
            <meshBasicMaterial color={CRIMSON_BEACON} toneMapped={false} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/**
 * 3D Suspended Atmospheric Particulate Dust & Digital Motes.
 * Provides crucial physical motion feedback when scrolling through the metropolis.
 */
export function AtmosphericDustField() {
  const pointsRef = useRef<THREE.Points>(null)

  const { positions, colors } = useMemo(() => {
    const count = 350
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)

    const cGold = new THREE.Color(WARM_GOLD)
    const cWhite = new THREE.Color(WARM_WHITE)
    const cCrimson = new THREE.Color(CRIMSON_BEACON)

    for (let i = 0; i < count; i++) {
      // Span across corridor width and travel depth
      pos[i * 3] = (Math.random() - 0.5) * 55
      pos[i * 3 + 1] = 0.5 + Math.random() * 18
      pos[i * 3 + 2] = 25 - Math.random() * 185

      const c = i % 7 === 0 ? cCrimson : i % 3 === 0 ? cGold : cWhite
      col[i * 3] = c.r
      col[i * 3 + 1] = c.g
      col[i * 3 + 2] = c.b
    }
    return { positions: pos, colors: col }
  }, [])

  useFrame(({ clock }) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = Math.sin(clock.elapsedTime * 0.04) * 0.02
    }
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.16}
        vertexColors
        transparent
        opacity={0.65}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        toneMapped={false}
      />
    </points>
  )
}

/**
 * Foreground Parallax Guide Pylons & Transit Markers.
 * Positioned close to the camera path on the lateral boundaries to create
 * powerful near-field motion parallax when scrolling up or down.
 */
export function CorridorParallaxPylons() {
  const pylons = useMemo(() => {
    const list: Array<{ x: number; z: number; h: number; side: number }> = []
    for (let i = 0; i < 20; i++) {
      const z = 18 - i * 8.5
      // Left and right guide pylons flanking the main arterial channel
      list.push({ x: -14.5 - (i % 2) * 1.5, z, h: 4.5 + (i % 3) * 1.2, side: -1 })
      list.push({ x: 14.5 + (i % 2) * 1.5, z, h: 4.5 + (i % 3) * 1.2, side: 1 })
    }
    return list
  }, [])

  return (
    <group>
      {pylons.map((p, idx) => (
        <group key={idx} position={[p.x, 0, p.z]}>
          {/* Sleek architectural pylon column */}
          <mesh position={[0, p.h / 2, 0]}>
            <cylinderGeometry args={[0.1, 0.16, p.h, 6]} />
            <meshStandardMaterial
              color={GRAPHITE_STEEL}
              metalness={0.85}
              roughness={0.3}
            />
          </mesh>
          {/* Pulsing beacon cap */}
          <mesh position={[0, p.h + 0.12, 0]}>
            <sphereGeometry args={[0.12, 8, 8]} />
            <meshBasicMaterial
              color={p.side < 0 ? CRIMSON_BEACON : WARM_WHITE}
              toneMapped={false}
            />
          </mesh>
          {/* Vertical edge light stripe */}
          <mesh position={[p.side * 0.12, p.h / 2, 0]}>
            <boxGeometry args={[0.02, p.h * 0.85, 0.02]} />
            <meshBasicMaterial
              color={p.side < 0 ? CRIMSON_BEACON : TEAL_ACCENT}
              toneMapped={false}
            />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/**
 * Composite Futuristic Metropolis Environment Component.
 * Encapsulates all environmental upgrades surrounding the existing 3D city.
 */
export default function CityEnvironment() {
  return (
    <group name="city-futuristic-environment">
      {/* 1. Expansive Dark Water & Highway Interchanges */}
      <ExpansiveWaterAndGround />

      {/* 2. Procedural Distant High-Rise Metropolis */}
      <DistantMetropolis />

      {/* 3. Central Horizon Megatower Citadel */}
      <DistantCitadel />

      {/* 4. Mountain Ridge Silhouettes against Night Sky */}
      <MountainBackdrop />

      {/* 5. Cinematic Crimson & Golden Volumetric Sky Beams */}
      <VolumetricSkyBeams />

      {/* 6. Autonomous Aerial Hovercrafts & Drones */}
      <MetropolisAerialTraffic />

      {/* 7. Atmospheric Particulate Dust Field for Scroll Velocity */}
      <AtmosphericDustField />

      {/* 8. Near-field Parallax Corridor Pylons */}
      <CorridorParallaxPylons />
    </group>
  )
}
