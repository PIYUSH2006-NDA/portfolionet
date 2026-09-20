'use client'

import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { ArrowUpRight } from 'lucide-react'
import { Component, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import * as THREE from 'three'
import CityEnvironment from './city-environment'

const CRIMSON = '#e63946'
const DEEP_CRIMSON = '#d90429'
const CYAN = '#22d3ee'
const TEAL = '#14b8a6'
const WARM_AMBER = '#fde047'
const WARM_LIGHT = '#fef3c7'
const WHITE = '#f8fafc'
const STEEL = '#141c2a'
const DIM = '#273344'
const SKY = '#060911'

export const districts = ['home', 'about', 'skills', 'projects', 'experience', 'certificates', 'others', 'contact'] as const
export type District = typeof districts[number]

type TowerData = { x: number; z: number; h: number; w: number; d: number; district?: District; label?: string; tier?: boolean }
const DISTRICT_SPACING = 16
const towers: TowerData[] = districts.flatMap((district, index) => [
  { x: index % 2 ? 4.5 : -4.5, z: -index * DISTRICT_SPACING, h: district === 'home' ? 8.8 : district === 'others' ? 3.4 : 4.8 + index % 3, w: district === 'others' ? 3.4 : 2.2, d: 2.6, district, label: district === 'home' ? 'PIYUSH.DEV' : district.toUpperCase(), tier: district !== 'others' },
  { x: index % 2 ? -4.5 : 4.5, z: -index * DISTRICT_SPACING - 5, h: 2.8 + index % 3, w: 2, d: 2.4 },
  { x: index % 2 ? 7.5 : -7.5, z: -index * DISTRICT_SPACING - 8, h: 3.2 + index % 2, w: 1.8, d: 2 },
])

function Windows({ w, h, d, seed }: { w: number; h: number; d: number; seed: number }) {
  const ref = useRef<THREE.InstancedMesh>(null)
  const windows = useMemo(() => {
    const result: { position: [number, number, number]; scale: [number, number, number]; lit: boolean }[] = []
    for (let floor = .22; floor < h - .12; floor += .28) {
      for (let col = -w / 2 + .15; col < w / 2 - .1; col += .22) {
        for (const side of [-1, 1]) result.push({ position: [col, floor, side * (d / 2 + .007)], scale: [.095, .075, .012], lit: Math.sin(floor * 98 + col * 84 + seed * 21 + side * 17) > .24 })
      }
      for (let col = -d / 2 + .15; col < d / 2 - .1; col += .22) {
        for (const side of [-1, 1]) result.push({ position: [side * (w / 2 + .007), floor, col], scale: [.012, .075, .095], lit: Math.cos(floor * 51 + col * 71 + seed * 13 + side * 19) > .28 })
      }
    }
    return result
  }, [w, h, d, seed])
  useLayoutEffect(() => {
    const mesh = ref.current
    if (!mesh) return
    const obj = new THREE.Object3D()
    windows.forEach((window, index) => {
      obj.position.set(...window.position)
      obj.scale.set(...window.scale)
      obj.updateMatrix()
      mesh.setMatrixAt(index, obj.matrix)
      mesh.setColorAt(index, new THREE.Color(window.lit ? (index % 13 === 0 ? CRIMSON : index % 5 === 0 ? TEAL : index % 7 === 0 ? WARM_AMBER : CYAN) : DIM))
    })
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  }, [windows])
  return <instancedMesh ref={ref} args={[undefined, undefined, windows.length]}><boxGeometry /><meshBasicMaterial toneMapped={false} /></instancedMesh>
}

function Rim({ w, h, d, active }: { w: number; h: number; d: number; active: boolean }) {
  const geometry = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(w, h, d)), [w, h, d])
  useEffect(() => () => geometry.dispose(), [geometry])
  return <lineSegments position={[0, h / 2, 0]} geometry={geometry}><lineBasicMaterial color={active ? CYAN : CRIMSON} transparent opacity={active ? 1 : .72} toneMapped={false} /></lineSegments>
}

function Tower({ data, index, selected, onNavigate, hovered, setHovered }: { data: TowerData; index: number; selected: District; onNavigate: (id: District) => void; hovered: District | null; setHovered: (id: District | null) => void }) {
  const group = useRef<THREE.Group>(null)
  const active = hovered === data.district || (selected !== 'home' && selected === data.district)
  useFrame((_, dt) => { if (group.current) group.current.position.y = THREE.MathUtils.damp(group.current.position.y, active ? .35 : 0, 6, dt) })
  const over = (e: ThreeEvent<PointerEvent>) => { if (data.district) { e.stopPropagation(); setHovered(data.district); document.body.style.cursor = 'pointer' } }
  const out = () => { setHovered(null); document.body.style.cursor = '' }
  return (
    <group ref={group} position={[data.x, 0, data.z]}>
      <group onPointerOver={over} onPointerOut={out} onClick={(e) => { if (data.district) { e.stopPropagation(); onNavigate(data.district) } }}>
        <mesh position={[0, .08, 0]}><boxGeometry args={[data.w + .7, .16, data.d + .7]} /><meshStandardMaterial color={STEEL} roughness={.6} metalness={.5} /></mesh>
        <mesh position={[0, data.h / 2, 0]}><boxGeometry args={[data.w, data.h, data.d]} /><meshStandardMaterial color={STEEL} metalness={.7} roughness={.32} /></mesh>
        <Windows w={data.w} h={data.h} d={data.d} seed={index} />
        <Rim w={data.w + .02} h={data.h} d={data.d + .02} active={active} />
        {data.tier && <group position={[0, data.h, 0]}>
          <mesh position={[0, .35, 0]}><boxGeometry args={[data.w * .75, .7, data.d * .75]} /><meshStandardMaterial color={STEEL} metalness={.6} roughness={.3} /></mesh>
          <Rim w={data.w * .75} h={.7} d={data.d * .75} active={active} />
          <mesh position={[0, 1.1, 0]}><cylinderGeometry args={[.015, .025, .8, 6]} /><meshBasicMaterial color={DEEP_CRIMSON} /></mesh>
          <mesh position={[0, 1.52, 0]}><sphereGeometry args={[.045, 6, 6]} /><meshBasicMaterial color={WHITE} /></mesh>
        </group>}
        {Array.from({ length: Math.floor(data.h / 1.05) }, (_, i) => <mesh key={i} position={[0, i * 1.05 + .14, 0]}><boxGeometry args={[data.w + .06, .025, data.d + .06]} /><meshStandardMaterial color={DIM} metalness={.8} roughness={.4} /></mesh>)}
      </group>
      {data.label && data.district && (hovered === data.district || (districts.indexOf(data.district) >= districts.indexOf(selected) && districts.indexOf(data.district) <= districts.indexOf(selected) + 1)) && <Html position={[0, data.h + (data.tier ? 1.9 : .6), 0]} center zIndexRange={[20, 10]} style={{ pointerEvents: 'auto' }}>
        <button className={`city-sign ${data.district === 'home' ? 'city-sign-main' : ''} ${active ? 'is-active' : ''}`} onClick={() => onNavigate(data.district!)} onMouseEnter={() => setHovered(data.district!)} onMouseLeave={() => setHovered(null)} aria-label={`Explore ${data.label}`}>
          <span className="sign-light" />{data.label}{active && data.district !== 'home' && <span className="sign-hint">ENTER DISTRICT <ArrowUpRight size={14} aria-hidden="true" /></span>}
        </button>
      </Html>}
    </group>
  )
}

function Traffic() {
  const ref = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.children.forEach((car, i) => {
      const t = ((clock.elapsedTime * (i % 2 ? 1.5 : -1.5) + i * 17) % 138 + 138) % 138
      car.position.z = 10 - t
    })
  })
  return <group ref={ref}>{Array.from({ length: 8 }, (_, i) => <mesh key={i} position={[i % 2 ? -.85 : .85, .06, 0]}><boxGeometry args={[.22, .1, .65]} /><meshBasicMaterial color={i % 3 ? CRIMSON : WHITE} toneMapped={false} /></mesh>)}</group>
}

function BalancedCityDistrict() {
  const blocks = useMemo(() => {
    const result: Array<{ x: number; z: number; h: number; w: number; d: number; seed: number; kind: 'tower' | 'low' | 'campus' }> = []
    const lanes = [-1, 1]
    lanes.forEach((side) => {
      for (let row = 0; row < 12; row++) {
        const z = 5 - row * 8 - (row % 2) * 1.8
        const base = side * (5.3 + (row % 3) * 1.45)
        result.push({ x: base, z, h: 2.4 + (row * 1.7) % 5.6, w: 1.35 + (row % 3) * .38, d: 1.55 + (row % 2) * .35, seed: row + (side < 0 ? 40 : 80), kind: row % 4 === 0 ? 'campus' : 'tower' })
        result.push({ x: side * (9.5 + (row % 2) * 2.1), z: z - 2.4, h: 1.7 + (row % 4) * .7, w: 1.1 + (row % 2) * .4, d: 1.35, seed: row + (side < 0 ? 120 : 160), kind: 'low' })
      }
    })
    return result
  }, [])
  return <group>
    <mesh position={[0, -.08, -43]}><boxGeometry args={[28, .22, 108]} /><meshStandardMaterial color="#101d3d" metalness={.65} roughness={.38} /></mesh>
    {blocks.map((building) => <group key={`${building.x}-${building.z}`} position={[building.x, 0, building.z]}>
      <mesh position={[0, building.h / 2, 0]}><boxGeometry args={[building.w, building.h, building.d]} /><meshStandardMaterial color={building.kind === 'campus' ? '#274472' : building.kind === 'low' ? '#1b3157' : '#203a68'} metalness={.78} roughness={.25} transparent opacity={.94} /></mesh>
      <Windows w={building.w} h={building.h} d={building.d} seed={building.seed} />
      <Rim w={building.w + .03} h={building.h} d={building.d + .03} active={false} />
      {building.kind === 'campus' && <mesh position={[0, building.h + .16, 0]}><boxGeometry args={[building.w * .72, .09, building.d * .72]} /><meshBasicMaterial color={building.seed % 3 ? CYAN : CRIMSON} toneMapped={false} /></mesh>}
    </group>)}
    {[-1, 1].map((side) => <group key={side}>
      <mesh position={[side * 7, .025, -43]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[2.4, 108]} /><meshStandardMaterial color="#162746" metalness={.35} roughness={.5} /></mesh>
      {Array.from({ length: 14 }, (_, i) => <group key={i} position={[side * (6.1 + (i % 2) * 2.2), .08, 3 - i * 8]}>
        <mesh position={[0, .7, 0]}><cylinderGeometry args={[.025, .035, 1.4, 6]} /><meshBasicMaterial color={WHITE} /></mesh>
        <mesh position={[0, 1.45, 0]}><sphereGeometry args={[.075, 6, 6]} /><meshBasicMaterial color={i % 3 ? CYAN : CRIMSON} toneMapped={false} /></mesh>
        <mesh position={[side * .7, .18, 0]}><sphereGeometry args={[.26, 8, 6]} /><meshStandardMaterial color="#125e63" roughness={.9} /></mesh>
        <mesh position={[side * .7, .4, 0]}><sphereGeometry args={[.15, 8, 6]} /><meshStandardMaterial color="#24734e" roughness={.9} /></mesh>
      </group>)}
      {Array.from({ length: 7 }, (_, i) => <mesh key={`bridge-${i}`} position={[side * 7, 1.7 + (i % 2) * .4, -4 - i * 16]} rotation={[0, 0, side * .04]}><boxGeometry args={[5.5, .12, .42]} /><meshBasicMaterial color={i % 2 ? CYAN : TEAL} toneMapped={false} /></mesh>)}
    </group>)}
    {Array.from({ length: 10 }, (_, i) => <group key={`drone-${i}`} position={[(i % 2 ? -1 : 1) * (5 + (i % 3) * 2.4), 3.4 + (i % 4) * 1.2, -6 - i * 9]}><mesh><boxGeometry args={[.28, .08, .18]} /><meshBasicMaterial color={i % 3 ? WHITE : CRIMSON} toneMapped={false} /></mesh><pointLight intensity={.2} distance={2} color={CYAN} /></group>)}
  </group>
}

function RightCityDistrict() {
  const buildings = [
    { x: 8.2, z: -3, h: 3.2, w: 1.45, d: 1.7 },
    { x: 10.1, z: -8, h: 5.8, w: 1.7, d: 1.9 },
    { x: 7.7, z: -12, h: 2.5, w: 1.25, d: 1.5 },
    { x: 11.8, z: -17, h: 4.2, w: 1.6, d: 1.8 },
    { x: 8.6, z: -22, h: 6.8, w: 1.8, d: 2 },
    { x: 12.6, z: -28, h: 3.3, w: 1.35, d: 1.5 },
    { x: 9.5, z: -34, h: 5.1, w: 1.55, d: 1.7 },
    { x: 13.2, z: -42, h: 3.8, w: 1.2, d: 1.4 },
  ]
  return <group>
    <mesh position={[10, .02, -21]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[9, 58]} /><meshStandardMaterial color="#0f1b38" metalness={.35} roughness={.34} /></mesh>
    <mesh position={[10, .08, -21]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[.055, 58]} /><meshBasicMaterial color={CRIMSON} toneMapped={false} /></mesh>
    <mesh position={[10, 1.25, -20]} rotation={[0, 0, Math.PI / 2]}><torusGeometry args={[3.2, .055, 6, 48, Math.PI]} /><meshBasicMaterial color={CYAN} toneMapped={false} /></mesh>
    {buildings.map((building, index) => <group key={`${building.x}-${building.z}`} position={[building.x, 0, building.z]}>
      <mesh position={[0, building.h / 2, 0]}><boxGeometry args={[building.w, building.h, building.d]} /><meshStandardMaterial color="#20345b" metalness={.76} roughness={.24} transparent opacity={.88} /></mesh>
      <Windows w={building.w} h={building.h} d={building.d} seed={index + 31} />
      <Rim w={building.w + .03} h={building.h} d={building.d + .03} active={false} />
      <mesh position={[0, building.h + .18, 0]}><boxGeometry args={[building.w * .58, .08, building.d * .58]} /><meshBasicMaterial color={index % 3 === 0 ? CRIMSON : WHITE} toneMapped={false} /></mesh>
    </group>)}
    <group position={[9.5, 0, -15]}>
      <mesh position={[0, 2.9, 0]}><boxGeometry args={[2.35, 5.8, 2.05]} /><meshStandardMaterial color="#263d66" metalness={.9} roughness={.2} transparent opacity={.92} /></mesh>
      <Windows w={2.35} h={5.8} d={2.05} seed={83} />
      <Rim w={2.4} h={5.8} d={2.1} active={false} />
      <Html position={[0, 6.3, 0]} center zIndexRange={[15, 8]}><div className="secondary-landmark"><span className="sign-light" />AI RESEARCH CENTER</div></Html>
    </group>
    {[-1.8, 1.8].map((x) => <mesh key={x} position={[10 + x, .28, -21]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[.035, .035, 58, 6]} /><meshBasicMaterial color={x < 0 ? CYAN : TEAL} toneMapped={false} /></mesh>)}
    {[-2, 0, 2].map((x) => <group key={x} position={[10 + x, .15, -6]}><mesh position={[0, .8, 0]}><cylinderGeometry args={[.035, .035, 1.6, 6]} /><meshBasicMaterial color={WHITE} /></mesh><mesh position={[0, 1.65, 0]}><sphereGeometry args={[.09, 6, 6]} /><meshBasicMaterial color={CRIMSON} toneMapped={false} /></mesh></group>)}
    {Array.from({ length: 10 }, (_, index) => <group key={index} position={[8.1 + (index % 2) * 3.7, .05, -2 - index * 4.3]}><mesh position={[0, .12, 0]}><sphereGeometry args={[.38, 8, 6]} /><meshStandardMaterial color="#164e63" roughness={.8} /></mesh><mesh position={[0, .34, 0]}><sphereGeometry args={[.22, 8, 6]} /><meshStandardMaterial color="#166534" roughness={.85} /></mesh></group>)}
  </group>
}

function City({ selected, onNavigate, onReady, onError }: { selected: District; onNavigate: (id: District) => void; onReady: () => void; onError: () => void }) {
  const [hovered, setHovered] = useState<District | null>(null)
  const renderer = useThree(state => state.gl)
  useEffect(() => {
    const canvas = renderer.domElement
    const handleLoss = (event: Event) => { event.preventDefault(); onError() }
    canvas.addEventListener('webglcontextlost', handleLoss)
    return () => canvas.removeEventListener('webglcontextlost', handleLoss)
  }, [renderer, onError])
  const progress = useRef(0)
  const travel = useRef(0)
  const lookAt = useMemo(() => new THREE.Vector3(), [])
  const target = useMemo(() => new THREE.Vector3(), [])
  useEffect(() => {
    let stops: number[] = []
    const update = () => {
      const position = window.scrollY
      let index = 0
      while (index < stops.length - 1 && position >= stops[index + 1]) index++
      const next = stops[index + 1]
      const fraction = next === undefined ? 0 : THREE.MathUtils.clamp((position - stops[index]) / Math.max(1, next - stops[index]), 0, 1)
      progress.current = (index + fraction) * DISTRICT_SPACING
    }
    const measure = () => {
      const offset = window.innerWidth < 768 ? 75 : 90
      stops = districts.map(id => Math.max(0, (document.getElementById(id)?.getBoundingClientRect().top ?? 0) + window.scrollY - offset))
      update()
    }
    measure()
    travel.current = progress.current
    const observer = new ResizeObserver(measure)
    observer.observe(document.body)
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', measure)
    return () => { observer.disconnect(); window.removeEventListener('scroll', update); window.removeEventListener('resize', measure) }
  }, [])
  useEffect(() => { onReady(); return () => { document.body.style.cursor = '' } }, [onReady])
  useFrame(({ camera, pointer }, dt) => {
    travel.current = THREE.MathUtils.damp(travel.current, progress.current, 5, Math.min(dt, .1))
    target.set(13 + pointer.x * .3, 12, 21 - travel.current)
    camera.position.lerp(target, 1 - Math.exp(-6 * Math.min(dt, .1)))
    lookAt.set(0, 2.5, -travel.current - 9)
    camera.lookAt(lookAt)
    renderer.domElement.dataset.travel = travel.current.toFixed(2)
  })
  return <>
    <color attach="background" args={[SKY]} />
    <fog attach="fog" args={[SKY, 45, 270]} />
    <ambientLight intensity={0.85} color="#1b2434" />
    <directionalLight position={[15, 30, 15]} intensity={2.6} color={WARM_LIGHT} />
    <directionalLight position={[-15, 20, -50]} intensity={1.5} color={CRIMSON} />
    <directionalLight position={[0, 15, -110]} intensity={0.9} color={TEAL} />
    <pointLight position={[0, 6, -28]} intensity={14} distance={38} color={WARM_AMBER} />
    <pointLight position={[0, 6, -92]} intensity={16} distance={42} color={CRIMSON} />
    <pointLight position={[0, 6, -148]} intensity={14} distance={40} color={CYAN} />
    <mesh position={[0, -.3, -58]}><boxGeometry args={[22, .55, 148]} /><meshStandardMaterial color={STEEL} metalness={.75} roughness={.35} /></mesh>
    <mesh position={[0, .012, -58]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[3.4, 148]} /><meshStandardMaterial color="#070b18" metalness={.5} roughness={.2} /></mesh>
    {[-1.8, 1.8].map((x, index) => <mesh key={x} position={[x, .019, -58]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[.045, 148]} /><meshBasicMaterial color={index ? TEAL : CYAN} /></mesh>)}
    {Array.from({ length: 48 }, (_, i) => <mesh key={i} position={[0, .022, 12 - i * 3]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[.05, 1.2]} /><meshBasicMaterial color={WHITE} /></mesh>)}
    {districts.map((id, index) => <group key={id} position={[0, .024, -index * DISTRICT_SPACING]}><mesh rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[19, .09]} /><meshBasicMaterial color={CRIMSON} transparent opacity={.6} /></mesh><mesh position={[0, -.18, 0]}><boxGeometry args={[20, .2, 9]} /><meshStandardMaterial color={STEEL} /></mesh></group>)}
    {towers.map((data, index) => <Tower key={index} data={data} index={index} selected={selected} onNavigate={onNavigate} hovered={hovered} setHovered={setHovered} />)}
    <BalancedCityDistrict />
    <Traffic />
    <CityEnvironment />
  </>
}

class CanvasBoundary extends Component<{ children: ReactNode; onError: () => void }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch() { this.props.onError() }
  render() { return this.state.failed ? null : this.props.children }
}

export default function CityScene({ selected, onNavigate, onReady, onError }: { selected: District; onNavigate: (id: District) => void; onReady: () => void; onError: () => void }) {
  return <CanvasBoundary onError={onError}><Canvas dpr={[1, 1.5]} camera={{ position: [13, 12, 21], fov: 43, near: .1, far: 380 }} gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }} onCreated={({ gl }) => { gl.setClearColor(0x000000, 0) }} fallback={null}>
    <City selected={selected} onNavigate={onNavigate} onReady={onReady} onError={onError} />
  </Canvas></CanvasBoundary>
}
