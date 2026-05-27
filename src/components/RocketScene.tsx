import { Html, OrbitControls } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import {
  AdditiveBlending,
  DoubleSide,
  type Mesh,
  type MeshBasicMaterial,
  type MeshStandardMaterial,
  Vector2,
} from 'three'
import { translations } from '../i18n/translations'
import { type CfdCell, runNozzleCfdSolver } from '../simulation/cfdSolver'
import { calculateRocketPerformance } from '../simulation/rocketEquations'
import {
  type FlowFieldMode,
  type FlowFieldViewMode,
  useSimulatorStore,
} from '../store/simulatorStore'

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) {
    return min
  }

  return Math.min(Math.max(value, min), max)
}

function normalizeInput(value: number, inputMin: number, inputMax: number) {
  if (!Number.isFinite(value) || inputMax <= inputMin) {
    return 0
  }

  return clamp((value - inputMin) / (inputMax - inputMin), 0, 1)
}

function mapInputToVisualRange(
  value: number,
  inputMin: number,
  inputMax: number,
  visualMin: number,
  visualMax: number,
) {
  if (!Number.isFinite(value) || inputMax <= inputMin) {
    return visualMin
  }

  const normalized = normalizeInput(value, inputMin, inputMax)
  const eased = Math.sqrt(normalized)
  return visualMin + (visualMax - visualMin) * eased
}

function interpolateColor(
  start: [number, number, number],
  end: [number, number, number],
  amount: number,
) {
  const t = clamp(amount, 0, 1)
  const r = Math.round(start[0] + (end[0] - start[0]) * t)
  const g = Math.round(start[1] + (end[1] - start[1]) * t)
  const b = Math.round(start[2] + (end[2] - start[2]) * t)

  return `#${r.toString(16).padStart(2, '0')}${g
    .toString(16)
    .padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

function percentile(values: number[], fraction: number) {
  const sorted = values
    .filter((value) => Number.isFinite(value))
    .sort((a, b) => a - b)

  if (sorted.length === 0) {
    return 0
  }

  const index = Math.min(
    sorted.length - 1,
    Math.max(0, Math.round((sorted.length - 1) * fraction)),
  )

  return sorted[index]
}

function cfdPalette(amount: number) {
  const t = clamp(amount, 0, 1)

  if (t < 0.33) {
    return interpolateColor([18, 45, 122], [55, 182, 255], t / 0.33)
  }

  if (t < 0.66) {
    return interpolateColor([55, 182, 255], [255, 224, 88], (t - 0.33) / 0.33)
  }

  return interpolateColor([255, 224, 88], [255, 65, 43], (t - 0.66) / 0.34)
}

function fieldValue(mode: FlowFieldMode, cell: CfdCell) {
  switch (mode) {
    case 'mach':
      return cell.mach
    case 'pressure':
      return cell.pressure
    case 'temperature':
      return cell.temperature
    case 'velocity':
      return cell.velocity
    case 'off':
      return 0
  }
}

function fieldColor(mode: FlowFieldMode, cell: CfdCell, cells: CfdCell[]) {
  if (mode === 'off') {
    return '#000000'
  }

  const values = cells.map((sample) => fieldValue(mode, sample))
  const low = percentile(values, 0.05)
  const high = percentile(values, 0.95)
  const normalized =
    (fieldValue(mode, cell) - low) / Math.max(high - low, Number.EPSILON)

  return cfdPalette(normalized)
}

function FlowFieldOverlay({
  mode,
  cells,
  motorLength,
  throatRadius,
  exitRadius,
  nozzleExitY,
  engineRunning,
  legend,
  viewMode,
}: {
  mode: FlowFieldMode
  cells: CfdCell[]
  motorLength: number
  throatRadius: number
  exitRadius: number
  nozzleExitY: number
  engineRunning: boolean
  legend: string
  viewMode: FlowFieldViewMode
}) {
  if (mode === 'off' || cells.length === 0) {
    return null
  }

  const startY = -motorLength / 2 + 0.18
  const throatY = motorLength / 2 + 0.4
  const visibleCells = cells.filter((cell) =>
    viewMode === 'volume'
      ? cell.axialIndex % 3 === 0 && cell.radialIndex % 3 === 0
      : cell.axialIndex % 2 === 0 && cell.radialIndex % 2 === 0,
  )
  const volumeAngles = [
    0,
    Math.PI / 4,
    Math.PI / 2,
    (3 * Math.PI) / 4,
    Math.PI,
    (5 * Math.PI) / 4,
    (3 * Math.PI) / 2,
    (7 * Math.PI) / 4,
  ]
  const opacity = engineRunning ? 0.74 : 0.42

  return (
    <group>
      {visibleCells.map((cell) => {
        const beforeThroat = cell.station <= 0.36
        const insideNozzle = cell.station <= 1
        const localProgress = beforeThroat
          ? cell.station / 0.36
          : insideNozzle
            ? (cell.station - 0.36) / 0.64
            : (cell.station - 1) / 0.75
        const y = beforeThroat
          ? startY + (throatY - startY) * localProgress
          : insideNozzle
            ? throatY + (nozzleExitY - throatY) * localProgress
            : nozzleExitY + 2.25 * localProgress
        const radius = beforeThroat
          ? throatRadius * (1.55 - 0.5 * localProgress)
          : insideNozzle
            ? throatRadius +
              (exitRadius - throatRadius) * Math.sqrt(localProgress)
            : exitRadius * (1 + 1.15 * Math.sqrt(localProgress))
        const radialFraction = clamp(
          cell.radialPosition / Math.max(cell.wallRadius, 0.01),
          0,
          1,
        )
        const radialDistance = radialFraction * radius
        const color = fieldColor(mode, cell, cells)
        const cellWidth = Math.max(radius / 11, 0.026)
        const cellHeight = insideNozzle ? 0.055 : 0.074
        const sides = cell.radialIndex === 0 ? [0] : [-1, 1]

        if (viewMode === 'volume') {
          const angles = cell.radialIndex === 0 ? [0] : volumeAngles
          const particleSize = Math.max(cellWidth * 0.72, 0.028)

          return (
            <group key={cell.axialIndex + '-' + cell.radialIndex}>
              {angles.map((angle) => (
                <mesh
                  key={angle}
                  position={[
                    Math.cos(angle) * radialDistance,
                    y,
                    Math.sin(angle) * radialDistance,
                  ]}
                >
                  <sphereGeometry args={[particleSize, 10, 8]} />
                  <meshBasicMaterial
                    color={color}
                    transparent
                    opacity={opacity * 0.78}
                    blending={AdditiveBlending}
                    depthWrite={false}
                  />
                </mesh>
              ))}
            </group>
          )
        }

        return (
          <group key={cell.axialIndex + '-' + cell.radialIndex}>
            {sides.map((side) => (
              <mesh key={side} position={[radialDistance * side, y, 0.12]}>
                <boxGeometry args={[cellWidth, cellHeight, 0.045]} />
                <meshBasicMaterial
                  color={color}
                  transparent
                  opacity={opacity}
                  blending={AdditiveBlending}
                  depthWrite={false}
                />
              </mesh>
            ))}
          </group>
        )
      })}

      <Html
        position={[0, nozzleExitY + 0.34, -1.15]}
        center
        distanceFactor={8}
        zIndexRange={[20, 0]}
      >
        <div className="pointer-events-none w-48 rounded-md border border-[#34505f] bg-[#0f1418]/90 p-2 shadow-lg">
          <p className="m-0 font-mono text-[10px] font-bold uppercase tracking-wide text-[#8eeaff]">
            {viewMode === 'volume'
              ? '3D EULER CFD SOLVER'
              : '2D EULER CFD SOLVER'}
          </p>
          <p className="m-0 mt-1 text-[10px] leading-4 text-[#9fb0bf]">
            {legend}
          </p>
          <div className="mt-2 h-2 rounded bg-gradient-to-r from-[#2e89ff] via-[#7deaff] to-[#ff5c36]" />
        </div>
      </Html>
    </group>
  )
}

function SceneLabel({
  position,
  label,
  value,
}: {
  position: [number, number, number]
  label: string
  value: string
}) {
  return (
    <Html position={position} center distanceFactor={8} zIndexRange={[20, 0]}>
      <div className="pointer-events-none min-w-24 rounded-md border border-[#34505f] bg-[#0f1418]/90 px-2 py-1 text-center shadow-lg">
        <p className="m-0 text-[10px] uppercase tracking-wide text-[#9fb0bf]">
          {label}
        </p>
        <p className="m-0 font-mono text-xs text-[#f4f7fa]">{value}</p>
      </div>
    </Html>
  )
}

function Nozzle({
  throatRadius,
  exitRadius,
  motorLength,
  bellLengthPercent,
}: {
  throatRadius: number
  exitRadius: number
  motorLength: number
  bellLengthPercent: number
}) {
  const nozzleProfile = useMemo(() => {
    const chamberRadius = 0.72
    const throatY = 0.34
    const bellScale = clamp(bellLengthPercent / 80, 0.75, 1.25)
    const exitY = 1.18 * bellScale
    const points = [
      new Vector2(chamberRadius, 0),
      new Vector2(chamberRadius * 0.8, 0.12),
      new Vector2(throatRadius, throatY),
    ]

    for (let index = 1; index <= 9; index += 1) {
      const t = index / 9
      const eased = 1 - Math.pow(1 - t, 2.4)
      points.push(
        new Vector2(
          throatRadius + (exitRadius - throatRadius) * eased,
          throatY + (exitY - throatY) * t,
        ),
      )
    }

    return points
  }, [bellLengthPercent, exitRadius, throatRadius])

  return (
    <group position={[0, motorLength / 2 + 0.06, 0]}>
      <mesh>
        <latheGeometry args={[nozzleProfile, 96]} />
        <meshStandardMaterial
          color="#606a73"
          metalness={0.92}
          roughness={0.2}
          side={DoubleSide}
        />
      </mesh>

      <mesh
        position={[
          0,
          0.36 + 0.84 * clamp(bellLengthPercent / 80, 0.75, 1.25),
          0,
        ]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <torusGeometry args={[exitRadius * 0.84, 0.026, 12, 96]} />
        <meshStandardMaterial
          color="#14191d"
          roughness={0.55}
          metalness={0.45}
        />
      </mesh>
    </group>
  )
}

function CasingRing({
  positionY,
  radius,
}: {
  positionY: number
  radius: number
}) {
  return (
    <mesh position={[0, positionY, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[radius, 0.025, 12, 96]} />
      <meshStandardMaterial color="#9aa8b3" metalness={0.75} roughness={0.22} />
    </mesh>
  )
}

function AnimatedPlume({
  nozzleExitY,
  plumeLength,
  plumeRadius,
  thrustScale,
  pressureScale,
  temperatureScale,
  massFlowScale,
  velocityScale,
  pressureMismatchScale,
  engineRunning,
}: {
  nozzleExitY: number
  plumeLength: number
  plumeRadius: number
  thrustScale: number
  pressureScale: number
  temperatureScale: number
  massFlowScale: number
  velocityScale: number
  pressureMismatchScale: number
  engineRunning: boolean
}) {
  const initialRunScale = engineRunning ? 1 : 0
  const ignitionProgressRef = useRef(initialRunScale)
  const coreRef = useRef<Mesh>(null)
  const middleRef = useRef<Mesh>(null)
  const outerRef = useRef<Mesh>(null)
  const firstDiamondRef = useRef<Mesh>(null)
  const secondDiamondRef = useRef<Mesh>(null)
  const coreMaterialRef = useRef<MeshStandardMaterial>(null)
  const middleMaterialRef = useRef<MeshStandardMaterial>(null)
  const outerMaterialRef = useRef<MeshBasicMaterial>(null)
  const firstDiamondMaterialRef = useRef<MeshBasicMaterial>(null)
  const secondDiamondMaterialRef = useRef<MeshBasicMaterial>(null)

  useFrame(({ clock }, delta) => {
    const time = clock.elapsedTime
    const targetProgress = engineRunning ? 1 : 0
    const responseRate = engineRunning ? 2.8 : 5.4
    ignitionProgressRef.current +=
      (targetProgress - ignitionProgressRef.current) *
      (1 - Math.exp(-responseRate * delta))
    const runScale = clamp(ignitionProgressRef.current, 0, 1)
    const growthScale = clamp(runScale * 1.18, 0, 1)
    const thermalShimmer =
      Math.sin(time * 31.0) * 0.003 + Math.sin(time * 43.0) * 0.002
    const combustionPulse = Math.sin(time * 9.0) * 0.006
    const flowRipple = Math.sin(time * 4.4) * 0.006

    if (coreRef.current !== null) {
      const axialScale =
        (0.08 + growthScale * 0.92) * (1 + combustionPulse * 0.35)
      coreRef.current.scale.set(
        0.35 + growthScale * (0.65 + thermalShimmer),
        axialScale,
        0.35 + growthScale * (0.65 - thermalShimmer),
      )
      coreRef.current.position.y =
        nozzleExitY + 0.02 + (plumeLength * 0.96 * axialScale) / 2
    }

    if (middleRef.current !== null) {
      const axialScale = (0.08 + growthScale * 0.92) * (1 + flowRipple * 0.5)
      middleRef.current.scale.set(
        0.35 + growthScale * (0.65 - flowRipple * 0.35),
        axialScale,
        0.35 + growthScale * (0.65 + flowRipple * 0.25),
      )
      middleRef.current.position.y =
        nozzleExitY - 0.04 + (plumeLength * 1.08 * axialScale) / 2
    }

    if (outerRef.current !== null) {
      const axialScale =
        (0.08 + growthScale * 0.92) * (1 + Math.sin(time * 3.2) * 0.008)
      outerRef.current.scale.set(
        0.35 + growthScale * (0.65 + flowRipple * 0.6),
        axialScale,
        0.35 + growthScale * 0.65,
      )
      outerRef.current.position.y =
        nozzleExitY - 0.1 + (plumeLength * 1.18 * axialScale) / 2
    }

    if (firstDiamondRef.current !== null) {
      const diamondPulse = 1 + Math.sin(time * 18.0) * 0.025
      firstDiamondRef.current.scale.set(
        diamondPulse * growthScale,
        0.18 * growthScale,
        diamondPulse * growthScale,
      )
      firstDiamondRef.current.position.y =
        nozzleExitY +
        plumeLength * (0.26 + pressureMismatchScale * 0.14) +
        Math.sin(time * 8.0) * 0.004
    }

    if (secondDiamondRef.current !== null) {
      const diamondPulse = 1 + Math.sin(time * 15.0 + 1.6) * 0.02
      secondDiamondRef.current.scale.set(
        diamondPulse * growthScale,
        0.15 * growthScale,
        diamondPulse * growthScale,
      )
      secondDiamondRef.current.position.y =
        nozzleExitY +
        plumeLength * (0.5 + pressureMismatchScale * 0.16) +
        Math.sin(time * 7.0) * 0.004
    }

    if (coreMaterialRef.current !== null) {
      coreMaterialRef.current.emissiveIntensity =
        runScale *
        (3.2 +
          velocityScale * 2.2 +
          temperatureScale * 1.35 +
          thermalShimmer * 22)
      coreMaterialRef.current.opacity =
        runScale *
        clamp(0.58 + massFlowScale * 0.18 + thermalShimmer * 2.0, 0.5, 0.78)
    }

    if (middleMaterialRef.current !== null) {
      middleMaterialRef.current.emissiveIntensity =
        runScale *
        (1.15 +
          thrustScale * 0.32 +
          temperatureScale * 0.7 +
          combustionPulse * 6)
      middleMaterialRef.current.opacity =
        runScale *
        clamp(
          0.16 + massFlowScale * 0.16 + pressureScale * 0.035 + combustionPulse,
          0.14,
          0.36,
        )
    }

    if (outerMaterialRef.current !== null) {
      outerMaterialRef.current.opacity =
        runScale *
        clamp(
          0.035 + massFlowScale * 0.08 + pressureScale * 0.02 + flowRipple,
          0.03,
          0.15,
        )
    }

    if (firstDiamondMaterialRef.current !== null) {
      firstDiamondMaterialRef.current.opacity =
        runScale *
        clamp(
          0.08 + pressureMismatchScale * 0.34 + thermalShimmer * 4,
          0.06,
          0.44,
        )
    }

    if (secondDiamondMaterialRef.current !== null) {
      secondDiamondMaterialRef.current.opacity =
        runScale *
        clamp(
          0.04 + pressureMismatchScale * 0.24 + combustionPulse * 1.2,
          0.04,
          0.3,
        )
    }
  })

  return (
    <group>
      <mesh ref={coreRef} position={[0, nozzleExitY + plumeLength / 2, 0]}>
        <cylinderGeometry
          args={[
            plumeRadius * (0.2 + massFlowScale * 0.16),
            plumeRadius * (0.035 + velocityScale * 0.035),
            plumeLength * 1.06,
            128,
            1,
            true,
          ]}
        />
        <meshStandardMaterial
          ref={coreMaterialRef}
          color="#ecfbff"
          emissive="#7fe9ff"
          emissiveIntensity={
            initialRunScale *
            (3.2 + velocityScale * 2.2 + temperatureScale * 1.35)
          }
          transparent
          opacity={initialRunScale * (0.58 + massFlowScale * 0.18)}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <mesh
        ref={middleRef}
        position={[0, nozzleExitY - 0.04 + plumeLength / 2, 0]}
      >
        <cylinderGeometry
          args={[
            plumeRadius * (0.62 + massFlowScale * 0.46),
            plumeRadius * (0.12 + velocityScale * 0.12),
            plumeLength * 1.18,
            128,
            1,
            true,
          ]}
        />
        <meshStandardMaterial
          ref={middleMaterialRef}
          color={temperatureScale > 0.65 ? '#dffbff' : '#b8f2ff'}
          emissive={temperatureScale > 0.65 ? '#70e3ff' : '#38bdf8'}
          emissiveIntensity={
            initialRunScale *
            (1.15 + thrustScale * 0.32 + temperatureScale * 0.7)
          }
          transparent
          opacity={initialRunScale * (0.16 + massFlowScale * 0.16)}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <mesh
        ref={outerRef}
        position={[0, nozzleExitY - 0.1 + plumeLength / 2, 0]}
      >
        <cylinderGeometry
          args={[
            plumeRadius * (1.05 + massFlowScale * 0.58),
            plumeRadius * (0.24 + velocityScale * 0.16),
            plumeLength * 1.34,
            128,
            1,
            true,
          ]}
        />
        <meshBasicMaterial
          ref={outerMaterialRef}
          color="#ff9a4a"
          transparent
          opacity={initialRunScale * (0.035 + massFlowScale * 0.08)}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <mesh
        ref={firstDiamondRef}
        position={[
          0,
          nozzleExitY + plumeLength * (0.26 + pressureMismatchScale * 0.14),
          0,
        ]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <torusGeometry
          args={[
            plumeRadius * (0.2 + pressureMismatchScale * 0.22),
            plumeRadius * 0.018,
            10,
            72,
          ]}
        />
        <meshBasicMaterial
          ref={firstDiamondMaterialRef}
          color="#fff6ca"
          transparent
          opacity={initialRunScale * (0.08 + pressureMismatchScale * 0.34)}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <mesh
        ref={secondDiamondRef}
        position={[
          0,
          nozzleExitY + plumeLength * (0.5 + pressureMismatchScale * 0.16),
          0,
        ]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <torusGeometry
          args={[
            plumeRadius * (0.15 + pressureMismatchScale * 0.16),
            plumeRadius * 0.014,
            10,
            72,
          ]}
        />
        <meshBasicMaterial
          ref={secondDiamondMaterialRef}
          color="#ffd18a"
          transparent
          opacity={initialRunScale * (0.04 + pressureMismatchScale * 0.24)}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

function HybridMotorModel() {
  const language = useSimulatorStore((state) => state.language)
  const engineRunning = useSimulatorStore((state) => state.engineRunning)
  const flowFieldMode = useSimulatorStore((state) => state.flowFieldMode)
  const flowFieldViewMode = useSimulatorStore(
    (state) => state.flowFieldViewMode,
  )
  const inputs = useSimulatorStore((state) => state.inputs)
  const performance = calculateRocketPerformance(inputs)
  const cfdSolution = useMemo(() => runNozzleCfdSolver(inputs), [inputs])
  const sceneLabels = translations[language].sceneLabels
  const flowFieldLegend = translations[language].flowFieldLegend

  const thrustScale = clamp(performance.thrust / 3_000, 0.28, 3.5)
  const pressureScale = normalizeInput(
    inputs.chamberPressure.value,
    inputs.chamberPressure.min,
    inputs.chamberPressure.max,
  )
  const temperatureScale = normalizeInput(
    inputs.chamberTemperature.value,
    inputs.chamberTemperature.min,
    inputs.chamberTemperature.max,
  )
  const massFlowScale = clamp(Math.sqrt(performance.massFlow / 2.5), 0, 1)
  const velocityScale = clamp(performance.exitVelocity / 2_800, 0, 1)
  const pressureMismatchScale = clamp(
    Math.abs(performance.exitPressure - inputs.ambientPressure.value) /
      Math.max(inputs.ambientPressure.max, 1),
    0,
    1,
  )

  const motorLength = 3.4
  const casingRadius = 0.9
  const grainRadius = 0.68
  const throatRadius = mapInputToVisualRange(
    inputs.throatArea.value,
    inputs.throatArea.min,
    inputs.throatArea.max,
    0.16,
    0.42,
  )
  const exitRadius = mapInputToVisualRange(
    inputs.exitArea.value,
    inputs.exitArea.min,
    inputs.exitArea.max,
    throatRadius + 0.08,
    0.92,
  )

  const plumeLength = 0.95 + velocityScale * 1.95 + thrustScale * 0.38
  const plumeRadius = clamp(
    exitRadius * (0.62 + massFlowScale * 0.62),
    0.24,
    1.05,
  )
  const nozzleExitOffset =
    0.36 + 0.84 * clamp(inputs.bellLengthPercent.value / 80, 0.75, 1.25)
  const nozzleExitY = motorLength / 2 + 0.06 + nozzleExitOffset

  const thrustLabel = `${Math.round(performance.thrust).toLocaleString()} N`
  const exitVelocityLabel = `${Math.round(
    performance.exitVelocity,
  ).toLocaleString()} m/s`
  const expansionRatioLabel = `${performance.expansionRatio.toFixed(2)}:1`

  return (
    <group position={[-1.8, 1, 0]} rotation={[0, 0, -Math.PI / 2]}>
      <mesh>
        <cylinderGeometry
          args={[casingRadius, casingRadius, motorLength, 96, 1, true]}
        />
        <meshStandardMaterial
          color="#a8c7dc"
          metalness={0.15}
          roughness={0.18}
          transparent
          opacity={0.16 + pressureScale * 0.18}
          side={DoubleSide}
        />
      </mesh>

      <CasingRing positionY={-motorLength / 2} radius={casingRadius} />
      <CasingRing positionY={motorLength / 2} radius={casingRadius} />

      <mesh>
        <cylinderGeometry
          args={[grainRadius, grainRadius, motorLength - 0.55, 96]}
        />
        <meshStandardMaterial
          color={pressureScale > 0.7 ? '#fff1c4' : '#e8dfbd'}
          roughness={0.82}
          metalness={0.02}
        />
      </mesh>

      <mesh>
        <cylinderGeometry
          args={[
            throatRadius * 1.18,
            throatRadius * 1.18,
            motorLength - 0.34,
            64,
          ]}
        />
        <meshBasicMaterial
          color="#ff8a32"
          transparent
          opacity={engineRunning ? 0.08 + pressureScale * 0.16 : 0}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <mesh>
        <cylinderGeometry
          args={[
            throatRadius * 0.9,
            throatRadius * 0.9,
            motorLength - 0.45,
            64,
          ]}
        />
        <meshStandardMaterial color="#05080a" roughness={0.7} />
      </mesh>

      <mesh position={[0, -motorLength / 2 - 0.32, 0]}>
        <cylinderGeometry args={[0.34, 0.34, 0.2, 64]} />
        <meshStandardMaterial
          color="#6ab7d6"
          metalness={0.35}
          roughness={0.25}
        />
      </mesh>

      <Nozzle
        throatRadius={throatRadius}
        exitRadius={exitRadius}
        motorLength={motorLength}
        bellLengthPercent={inputs.bellLengthPercent.value}
      />

      <AnimatedPlume
        nozzleExitY={nozzleExitY}
        plumeLength={plumeLength}
        plumeRadius={plumeRadius}
        thrustScale={thrustScale}
        pressureScale={pressureScale}
        temperatureScale={temperatureScale}
        massFlowScale={massFlowScale}
        velocityScale={velocityScale}
        pressureMismatchScale={pressureMismatchScale}
        engineRunning={engineRunning}
      />

      <FlowFieldOverlay
        mode={flowFieldMode}
        cells={cfdSolution.cells}
        motorLength={motorLength}
        throatRadius={throatRadius}
        exitRadius={exitRadius}
        nozzleExitY={nozzleExitY}
        engineRunning={engineRunning}
        legend={flowFieldMode === 'off' ? '' : flowFieldLegend[flowFieldMode]}
        viewMode={flowFieldViewMode}
      />

      {flowFieldMode === 'off' ? (
        <>
          <SceneLabel
            position={[0, motorLength / 2 + 1.5, 0.9]}
            label={sceneLabels.thrust}
            value={thrustLabel}
          />

          <SceneLabel
            position={[0, motorLength / 2 + 0.7, -0.9]}
            label={sceneLabels.expansion}
            value={expansionRatioLabel}
          />

          <SceneLabel
            position={[0, motorLength / 2 + 2.2, 0]}
            label={sceneLabels.exitVelocity}
            value={exitVelocityLabel}
          />
        </>
      ) : null}
    </group>
  )
}

export function RocketScene() {
  const engineRunning = useSimulatorStore((state) => state.engineRunning)

  return (
    <Canvas camera={{ position: [4.5, 2.8, 4.5], fov: 45 }}>
      <color attach="background" args={['#151c22']} />

      <ambientLight intensity={0.7} />
      <directionalLight position={[4, 5, 3]} intensity={2.2} />
      <pointLight position={[-3, -2, 2]} intensity={1.3} color="#7dd3fc" />
      <pointLight
        position={[2.15, 0, 0]}
        intensity={engineRunning ? 2.6 : 0}
        distance={4.6}
        color="#72eaff"
      />
      <pointLight
        position={[3.2, 0, 0]}
        intensity={engineRunning ? 1.1 : 0}
        distance={5.5}
        color="#ff8a32"
      />

      <HybridMotorModel />

      <gridHelper args={[8, 16, '#33414d', '#25313a']} />
      <OrbitControls target={[0.45, 0, 0]} enableDamping makeDefault />
    </Canvas>
  )
}
