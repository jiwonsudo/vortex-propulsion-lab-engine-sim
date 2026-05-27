import type { SimulatorInput } from '../store/simulatorStore'
import { clamp } from './rocketEquations'

type InputMap = Record<string, SimulatorInput>

type ConservativeState = {
  rho: number
  rhoU: number
  rhoV: number
  energy: number
}

type PrimitiveState = {
  rho: number
  u: number
  v: number
  pressure: number
  temperature: number
  mach: number
  velocity: number
  soundSpeed: number
}

export type CfdCell = {
  axialIndex: number
  radialIndex: number
  station: number
  radialPosition: number
  wallRadius: number
  mach: number
  pressure: number
  temperature: number
  density: number
  velocity: number
  residual: number
}

export type CfdSolution = {
  cells: CfdCell[]
  residual: number
  iterations: number
  converged: boolean
}

const AXIAL_CELLS = 58
const RADIAL_CELLS = 24
const MAX_ITERATIONS = 220
const CFL = 0.32
const THROAT_STATION = 0.36
const DOMAIN_LENGTH = 1.75
const MIN_PRESSURE = 10
const MIN_DENSITY = 1e-6

function value(inputs: InputMap, key: string) {
  const inputValue = inputs[key]?.value ?? 0
  return Number.isFinite(inputValue) ? inputValue : 0
}

function smoothStep(valueToSmooth: number) {
  const x = clamp(valueToSmooth, 0, 1)
  return x * x * (3 - 2 * x)
}

function nozzleRadiusAtStation(
  station: number,
  throatRadius: number,
  exitRadius: number,
) {
  const chamberRadius = throatRadius * 1.78

  if (station > 1) {
    const plumeProgress = clamp((station - 1) / (DOMAIN_LENGTH - 1), 0, 1)
    return clamp(
      exitRadius * (1 + 0.95 * Math.sqrt(plumeProgress)),
      exitRadius,
      1,
    )
  }

  if (station <= THROAT_STATION) {
    const contraction = smoothStep(station / THROAT_STATION)
    return chamberRadius + (throatRadius - chamberRadius) * contraction
  }

  const divergentProgress = (station - THROAT_STATION) / (1 - THROAT_STATION)
  const bellProgress = 1 - Math.pow(1 - clamp(divergentProgress, 0, 1), 2.15)
  return throatRadius + (exitRadius - throatRadius) * bellProgress
}

function primitiveToConservative(
  primitive: PrimitiveState,
  gamma: number,
): ConservativeState {
  const internalEnergy = primitive.pressure / (gamma - 1)
  const kineticEnergy =
    0.5 *
    primitive.rho *
    (primitive.u * primitive.u + primitive.v * primitive.v)

  return {
    rho: primitive.rho,
    rhoU: primitive.rho * primitive.u,
    rhoV: primitive.rho * primitive.v,
    energy: internalEnergy + kineticEnergy,
  }
}

function conservativeToPrimitive(
  state: ConservativeState,
  gasConstant: number,
  gamma: number,
): PrimitiveState {
  const rho = Math.max(state.rho, MIN_DENSITY)
  const u = state.rhoU / rho
  const v = state.rhoV / rho
  const kineticEnergy = 0.5 * rho * (u * u + v * v)
  const pressure = Math.max(
    (gamma - 1) * (state.energy - kineticEnergy),
    MIN_PRESSURE,
  )
  const temperature = pressure / (rho * gasConstant)
  const soundSpeed = Math.sqrt(Math.max(gamma * gasConstant * temperature, 1))
  const velocity = Math.sqrt(u * u + v * v)

  return {
    rho,
    u,
    v,
    pressure,
    temperature,
    mach: velocity / soundSpeed,
    velocity,
    soundSpeed,
  }
}

function fluxX(state: ConservativeState, gasConstant: number, gamma: number) {
  const primitive = conservativeToPrimitive(state, gasConstant, gamma)
  return {
    rho: state.rhoU,
    rhoU: state.rhoU * primitive.u + primitive.pressure,
    rhoV: state.rhoV * primitive.u,
    energy: (state.energy + primitive.pressure) * primitive.u,
  }
}

function fluxY(state: ConservativeState, gasConstant: number, gamma: number) {
  const primitive = conservativeToPrimitive(state, gasConstant, gamma)
  return {
    rho: state.rhoV,
    rhoU: state.rhoU * primitive.v,
    rhoV: state.rhoV * primitive.v + primitive.pressure,
    energy: (state.energy + primitive.pressure) * primitive.v,
  }
}

function addState(a: ConservativeState, b: ConservativeState, scale = 1) {
  return {
    rho: a.rho + b.rho * scale,
    rhoU: a.rhoU + b.rhoU * scale,
    rhoV: a.rhoV + b.rhoV * scale,
    energy: a.energy + b.energy * scale,
  }
}

function subtractState(a: ConservativeState, b: ConservativeState) {
  return {
    rho: a.rho - b.rho,
    rhoU: a.rhoU - b.rhoU,
    rhoV: a.rhoV - b.rhoV,
    energy: a.energy - b.energy,
  }
}

function scaleState(state: ConservativeState, scale: number) {
  return {
    rho: state.rho * scale,
    rhoU: state.rhoU * scale,
    rhoV: state.rhoV * scale,
    energy: state.energy * scale,
  }
}

function rusanovFlux(
  left: ConservativeState,
  right: ConservativeState,
  axis: 'x' | 'y',
  gasConstant: number,
  gamma: number,
) {
  const leftPrimitive = conservativeToPrimitive(left, gasConstant, gamma)
  const rightPrimitive = conservativeToPrimitive(right, gasConstant, gamma)
  const leftFlux =
    axis === 'x'
      ? fluxX(left, gasConstant, gamma)
      : fluxY(left, gasConstant, gamma)
  const rightFlux =
    axis === 'x'
      ? fluxX(right, gasConstant, gamma)
      : fluxY(right, gasConstant, gamma)
  const leftSpeed =
    Math.abs(axis === 'x' ? leftPrimitive.u : leftPrimitive.v) +
    leftPrimitive.soundSpeed
  const rightSpeed =
    Math.abs(axis === 'x' ? rightPrimitive.u : rightPrimitive.v) +
    rightPrimitive.soundSpeed
  const spectralRadius = Math.max(leftSpeed, rightSpeed)

  return addState(
    scaleState(addState(leftFlux, rightFlux), 0.5),
    scaleState(subtractState(left, right), 0.5 * spectralRadius),
  )
}

function reflectState(state: ConservativeState, axis: 'x' | 'y') {
  if (axis === 'x') {
    return { ...state, rhoU: -state.rhoU }
  }

  return { ...state, rhoV: -state.rhoV }
}

function cellIndex(i: number, j: number) {
  return j * AXIAL_CELLS + i
}

function isFluidCell(
  i: number,
  j: number,
  throatRadius: number,
  exitRadius: number,
) {
  const station = (i / (AXIAL_CELLS - 1)) * DOMAIN_LENGTH
  const wallRadius = nozzleRadiusAtStation(station, throatRadius, exitRadius)
  const radialPosition = (j + 0.5) / RADIAL_CELLS

  return radialPosition <= wallRadius
}

function initialPrimitive(
  i: number,
  j: number,
  inputs: InputMap,
  throatRadius: number,
  exitRadius: number,
): PrimitiveState {
  const chamberPressure = value(inputs, 'chamberPressure')
  const chamberTemperature = value(inputs, 'chamberTemperature')
  const gamma = value(inputs, 'gamma')
  const gasConstant = value(inputs, 'gasConstant')
  const station = (i / (AXIAL_CELLS - 1)) * DOMAIN_LENGTH
  const wallRadius = nozzleRadiusAtStation(station, throatRadius, exitRadius)
  const throatAreaRatio =
    (wallRadius * wallRadius) / Math.max(throatRadius * throatRadius, 1e-6)
  const radialPosition = (j + 0.5) / RADIAL_CELLS
  const radialRatio = clamp(radialPosition / Math.max(wallRadius, 0.01), 0, 1)
  const ambientPressure = value(inputs, 'ambientPressure')
  let mach: number
  let temperature: number
  let pressure: number
  let radialVelocityRatio = 0

  if (station <= 1) {
    const acceleration =
      station < THROAT_STATION
        ? station / THROAT_STATION
        : 1 + 2.2 * ((station - THROAT_STATION) / (1 - THROAT_STATION))
    mach = clamp(0.08 + acceleration / Math.sqrt(throatAreaRatio), 0.04, 3.8)
    temperature = chamberTemperature / (1 + ((gamma - 1) / 2) * mach * mach)
    pressure =
      chamberPressure *
      Math.pow(temperature / chamberTemperature, gamma / (gamma - 1))
  } else {
    const plumeProgress = clamp((station - 1) / (DOMAIN_LENGTH - 1), 0, 1)
    const centerlineShape = Math.exp(-2.8 * radialRatio * radialRatio)
    const underExpansion = clamp(
      (chamberPressure * 0.045 - ambientPressure) /
        Math.max(ambientPressure, 1),
      0,
      4,
    )
    mach = clamp(
      2.4 + underExpansion * 0.18 - plumeProgress * 1.15 - radialRatio * 0.75,
      0.18,
      4.2,
    )
    pressure =
      ambientPressure +
      (chamberPressure * 0.045 - ambientPressure) *
        Math.exp(-2.4 * plumeProgress) *
        centerlineShape
    temperature =
      chamberTemperature *
      (0.22 + 0.18 * Math.exp(-2.2 * plumeProgress) * centerlineShape)
    radialVelocityRatio = plumeProgress * radialRatio * 0.24
  }

  const boundaryLayerShape = 1 - 0.2 * radialRatio * radialRatio
  const density = pressure / (gasConstant * temperature)
  const soundSpeed = Math.sqrt(gamma * gasConstant * temperature)
  const u = mach * soundSpeed * boundaryLayerShape

  return {
    rho: density,
    u,
    v: u * radialVelocityRatio,
    pressure,
    temperature,
    mach,
    velocity: Math.abs(u),
    soundSpeed,
  }
}

function inletState(inputs: InputMap): ConservativeState {
  const chamberPressure = value(inputs, 'chamberPressure')
  const chamberTemperature = value(inputs, 'chamberTemperature')
  const gamma = value(inputs, 'gamma')
  const gasConstant = value(inputs, 'gasConstant')
  const mach = 0.08
  const temperature = chamberTemperature / (1 + ((gamma - 1) / 2) * mach * mach)
  const pressure =
    chamberPressure *
    Math.pow(temperature / chamberTemperature, gamma / (gamma - 1))
  const soundSpeed = Math.sqrt(gamma * gasConstant * temperature)
  const rho = pressure / (gasConstant * temperature)

  return primitiveToConservative(
    {
      rho,
      u: mach * soundSpeed,
      v: 0,
      pressure,
      temperature,
      mach,
      velocity: mach * soundSpeed,
      soundSpeed,
    },
    gamma,
  )
}

function outletState(
  state: ConservativeState,
  ambientPressure: number,
  gasConstant: number,
  gamma: number,
) {
  const primitive = conservativeToPrimitive(state, gasConstant, gamma)
  const pressureError =
    (ambientPressure - primitive.pressure) / Math.max(ambientPressure, 1)
  const shockBlend = clamp(pressureError, 0, 1) * 0.36
  const subsonicBlend = primitive.mach < 1 ? 0.82 : 0
  const blend = Math.max(shockBlend, subsonicBlend)

  if (blend <= 0.001) {
    return state
  }

  const pressure =
    primitive.pressure + (ambientPressure - primitive.pressure) * blend
  const temperature =
    primitive.temperature *
    Math.pow(pressure / primitive.pressure, (gamma - 1) / gamma)
  const rho = pressure / (gasConstant * temperature)
  const velocityScale =
    pressure > primitive.pressure ? 1 - blend * 0.28 : 1 + blend * 0.12
  const u = primitive.u * velocityScale
  const soundSpeed = Math.sqrt(Math.max(gamma * gasConstant * temperature, 1))

  return primitiveToConservative(
    {
      ...primitive,
      rho,
      pressure,
      temperature,
      u,
      velocity: Math.abs(u),
      soundSpeed,
      mach: Math.abs(u) / soundSpeed,
    },
    gamma,
  )
}

export function runNozzleCfdSolver(inputs: InputMap): CfdSolution {
  const throatArea = value(inputs, 'throatArea')
  const exitArea = value(inputs, 'exitArea')
  const gamma = value(inputs, 'gamma')
  const chamberPressure = value(inputs, 'chamberPressure')
  const chamberTemperature = value(inputs, 'chamberTemperature')
  const ambientPressure = value(inputs, 'ambientPressure')
  const gasConstant = value(inputs, 'gasConstant')

  if (
    throatArea <= 0 ||
    exitArea <= throatArea ||
    gamma <= 1 ||
    chamberPressure <= 0 ||
    chamberTemperature <= 0 ||
    gasConstant <= 0
  ) {
    return { cells: [], residual: 1, iterations: 0, converged: false }
  }

  const throatRadius = 0.24
  const exitRadius = clamp(
    throatRadius * Math.sqrt(exitArea / throatArea),
    throatRadius * 1.05,
    0.96,
  )
  const dx = DOMAIN_LENGTH / AXIAL_CELLS
  const dy = 1 / RADIAL_CELLS
  const active = Array.from(
    { length: AXIAL_CELLS * RADIAL_CELLS },
    (_, index) => {
      const i = index % AXIAL_CELLS
      const j = Math.floor(index / AXIAL_CELLS)
      return isFluidCell(i, j, throatRadius, exitRadius)
    },
  )
  const inlet = inletState(inputs)
  let states = Array.from(
    { length: AXIAL_CELLS * RADIAL_CELLS },
    (_, index) => {
      const i = index % AXIAL_CELLS
      const j = Math.floor(index / AXIAL_CELLS)

      if (!active[index]) {
        return inlet
      }

      return primitiveToConservative(
        initialPrimitive(i, j, inputs, throatRadius, exitRadius),
        gamma,
      )
    },
  )

  let residual = 1
  let iterations = 0

  for (; iterations < MAX_ITERATIONS; iterations += 1) {
    let maxWaveSpeed = 1

    for (let index = 0; index < states.length; index += 1) {
      if (!active[index]) {
        continue
      }

      const primitive = conservativeToPrimitive(
        states[index],
        gasConstant,
        gamma,
      )
      maxWaveSpeed = Math.max(
        maxWaveSpeed,
        Math.abs(primitive.u) + Math.abs(primitive.v) + primitive.soundSpeed,
      )
    }

    const dt = (CFL * Math.min(dx, dy)) / maxWaveSpeed
    const nextStates = [...states]
    let residualSum = 0
    let residualCount = 0

    for (let j = 0; j < RADIAL_CELLS; j += 1) {
      for (let i = 0; i < AXIAL_CELLS; i += 1) {
        const index = cellIndex(i, j)

        if (!active[index]) {
          continue
        }

        const state = states[index]
        const leftIndex = cellIndex(Math.max(i - 1, 0), j)
        const rightIndex = cellIndex(Math.min(i + 1, AXIAL_CELLS - 1), j)
        const downIndex = cellIndex(i, Math.max(j - 1, 0))
        const upIndex = cellIndex(i, Math.min(j + 1, RADIAL_CELLS - 1))
        const left =
          i === 0
            ? inlet
            : active[leftIndex]
              ? states[leftIndex]
              : reflectState(state, 'x')
        const right =
          i === AXIAL_CELLS - 1
            ? outletState(state, ambientPressure, gasConstant, gamma)
            : active[rightIndex]
              ? states[rightIndex]
              : reflectState(state, 'x')
        const down =
          j === 0
            ? reflectState(state, 'y')
            : active[downIndex]
              ? states[downIndex]
              : reflectState(state, 'y')
        const up =
          j === RADIAL_CELLS - 1 || !active[upIndex]
            ? reflectState(state, 'y')
            : states[upIndex]
        const fluxRight = rusanovFlux(state, right, 'x', gasConstant, gamma)
        const fluxLeft = rusanovFlux(left, state, 'x', gasConstant, gamma)
        const fluxUp = rusanovFlux(state, up, 'y', gasConstant, gamma)
        const fluxDown = rusanovFlux(down, state, 'y', gasConstant, gamma)
        const xFluxDelta = scaleState(
          subtractState(fluxRight, fluxLeft),
          -dt / dx,
        )
        const yFluxDelta = scaleState(subtractState(fluxUp, fluxDown), -dt / dy)
        const updated = addState(addState(state, xFluxDelta), yFluxDelta)
        const primitive = conservativeToPrimitive(updated, gasConstant, gamma)
        const corrected = primitiveToConservative(primitive, gamma)
        const localResidual =
          Math.abs(corrected.rho - state.rho) /
            Math.max(state.rho, MIN_DENSITY) +
          Math.abs(corrected.rhoU - state.rhoU) /
            Math.max(Math.abs(state.rhoU), 1) +
          Math.abs(corrected.energy - state.energy) /
            Math.max(Math.abs(state.energy), 1)

        nextStates[index] = corrected
        residualSum += localResidual / 3
        residualCount += 1
      }
    }

    states = nextStates
    residual = residualCount > 0 ? residualSum / residualCount : 1

    if (residual < 0.0009) {
      break
    }
  }

  const cells: CfdCell[] = []

  for (let j = 0; j < RADIAL_CELLS; j += 1) {
    for (let i = 0; i < AXIAL_CELLS; i += 1) {
      const index = cellIndex(i, j)

      if (!active[index]) {
        continue
      }

      const station = (i / (AXIAL_CELLS - 1)) * DOMAIN_LENGTH
      const primitive = conservativeToPrimitive(
        states[index],
        gasConstant,
        gamma,
      )
      const outletInfluence = Math.pow(station, 3)
      const backPressureRatio =
        ambientPressure / Math.max(primitive.pressure, 1)
      const compression = clamp(
        (backPressureRatio - 1) * outletInfluence,
        0,
        1.2,
      )
      const expansion = clamp((1 - backPressureRatio) * outletInfluence, 0, 0.8)
      const adjustedPressure = primitive.pressure * (1 + compression * 0.75)
      const adjustedTemperature =
        primitive.temperature * (1 + compression * 0.18 - expansion * 0.1)
      const adjustedVelocity =
        primitive.velocity * (1 - compression * 0.22 + expansion * 0.14)
      const adjustedSoundSpeed = Math.sqrt(
        Math.max(gamma * gasConstant * adjustedTemperature, 1),
      )
      cells.push({
        axialIndex: i,
        radialIndex: j,
        station,
        radialPosition: (j + 0.5) / RADIAL_CELLS,
        wallRadius: nozzleRadiusAtStation(station, throatRadius, exitRadius),
        mach: adjustedVelocity / adjustedSoundSpeed,
        pressure: adjustedPressure,
        temperature: adjustedTemperature,
        density: adjustedPressure / (gasConstant * adjustedTemperature),
        velocity: adjustedVelocity,
        residual,
      })
    }
  }

  return {
    cells,
    residual,
    iterations: iterations + 1,
    converged: residual < 0.0009,
  }
}
