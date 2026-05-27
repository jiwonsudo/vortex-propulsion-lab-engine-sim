import type { SimulatorInput } from '../store/simulatorStore'

const STANDARD_GRAVITY = 9.80665
const SUPERSONIC_MACH_MIN = 1.0001
const SUPERSONIC_MACH_MAX = 20
const REFERENCE_CONICAL_HALF_ANGLE = (15 * Math.PI) / 180

type InputMap = Record<string, SimulatorInput>

export type RocketPerformance = {
  massFlow: number
  characteristicVelocity: number
  exitMach: number
  exitPressure: number
  exitVelocity: number
  idealMomentumThrust: number
  momentumThrust: number
  pressureThrust: number
  idealThrust: number
  thrust: number
  specificImpulse: number
  thrustCoefficient: number
  expansionRatio: number
  contourEfficiency: number
  correctionEfficiency: number
  nozzleLength: number
  conicalEquivalentLength: number
  nozzleMass: number
}

const ZERO_PERFORMANCE: RocketPerformance = {
  massFlow: 0,
  characteristicVelocity: 0,
  exitMach: 0,
  exitPressure: 0,
  exitVelocity: 0,
  idealMomentumThrust: 0,
  momentumThrust: 0,
  pressureThrust: 0,
  idealThrust: 0,
  thrust: 0,
  specificImpulse: 0,
  thrustCoefficient: 0,
  expansionRatio: 0,
  contourEfficiency: 0,
  correctionEfficiency: 0,
  nozzleLength: 0,
  conicalEquivalentLength: 0,
  nozzleMass: 0,
}

function value(inputs: InputMap, key: string) {
  const inputValue = inputs[key]?.value ?? 0
  return Number.isFinite(inputValue) ? inputValue : 0
}

function finiteOrZero(valueToCheck: number) {
  return Number.isFinite(valueToCheck) ? valueToCheck : 0
}

export function clamp(valueToClamp: number, min: number, max: number) {
  if (!Number.isFinite(valueToClamp)) {
    return min
  }

  return Math.min(Math.max(valueToClamp, min), max)
}

function areaMachRatio(mach: number, gamma: number) {
  const term = (2 / (gamma + 1)) * (1 + ((gamma - 1) / 2) * mach * mach)
  const exponent = (gamma + 1) / (2 * (gamma - 1))
  return (1 / mach) * Math.pow(term, exponent)
}

function solveSupersonicMach(expansionRatio: number, gamma: number) {
  if (expansionRatio <= 1) {
    return 1
  }

  let low = SUPERSONIC_MACH_MIN
  let high = SUPERSONIC_MACH_MAX

  for (let iteration = 0; iteration < 80; iteration += 1) {
    const mid = (low + high) / 2
    const areaRatio = areaMachRatio(mid, gamma)

    if (areaRatio < expansionRatio) {
      low = mid
    } else {
      high = mid
    }
  }

  return finiteOrZero((low + high) / 2)
}

export function calculateRocketPerformance(
  inputs: InputMap,
): RocketPerformance {
  const chamberPressure = value(inputs, 'chamberPressure')
  const chamberTemperature = value(inputs, 'chamberTemperature')
  const ambientPressure = value(inputs, 'ambientPressure')
  const throatArea = value(inputs, 'throatArea')
  const exitArea = value(inputs, 'exitArea')
  const gamma = value(inputs, 'gamma')
  const gasConstant = value(inputs, 'gasConstant')
  const bellLengthPercent = value(inputs, 'bellLengthPercent')
  const cfdEfficiency = value(inputs, 'cfdEfficiency')
  const combustionEfficiency = value(inputs, 'combustionEfficiency')
  const wallThickness = value(inputs, 'wallThickness')
  const materialDensity = value(inputs, 'materialDensity')
  const latticeMassFactor = value(inputs, 'latticeMassFactor')
  const expansionRatio =
    throatArea > 0 ? finiteOrZero(exitArea / throatArea) : 0

  if (
    chamberPressure <= 0 ||
    chamberTemperature <= 0 ||
    throatArea <= 0 ||
    exitArea <= 0 ||
    gamma <= 1 ||
    gasConstant <= 0 ||
    expansionRatio < 1
  ) {
    return {
      ...ZERO_PERFORMANCE,
      expansionRatio,
    }
  }

  const exitMach = solveSupersonicMach(expansionRatio, gamma)
  const pressureRatio = Math.pow(
    1 + ((gamma - 1) / 2) * exitMach * exitMach,
    -gamma / (gamma - 1),
  )
  const exitPressure = finiteOrZero(chamberPressure * pressureRatio)

  const criticalFlowFactor =
    Math.sqrt(gamma / gasConstant) *
    Math.pow(2 / (gamma + 1), (gamma + 1) / (2 * (gamma - 1)))

  const massFlow = finiteOrZero(
    (throatArea * chamberPressure * criticalFlowFactor) /
      Math.sqrt(chamberTemperature),
  )

  const characteristicVelocity =
    massFlow > 0 ? finiteOrZero((chamberPressure * throatArea) / massFlow) : 0

  const exitTemperature =
    chamberTemperature / (1 + ((gamma - 1) / 2) * exitMach * exitMach)
  const exitVelocity = finiteOrZero(
    exitMach * Math.sqrt(gamma * gasConstant * exitTemperature),
  )

  const throatRadius = Math.sqrt(throatArea / Math.PI)
  const exitRadius = Math.sqrt(exitArea / Math.PI)
  const conicalEquivalentLength = finiteOrZero(
    Math.max(
      (exitRadius - throatRadius) / Math.tan(REFERENCE_CONICAL_HALF_ANGLE),
      0,
    ),
  )
  const bellLengthRatio = clamp(bellLengthPercent / 100, 0.6, 1)
  const nozzleLength = finiteOrZero(conicalEquivalentLength * bellLengthRatio)
  const shortBellPenalty = Math.max(0, 0.78 - bellLengthRatio) * 0.32
  const highExpansionPenalty =
    Math.max(0, expansionRatio - 18) *
    Math.max(0, 0.82 - bellLengthRatio) *
    0.01
  const contourEfficiency = clamp(
    0.992 - shortBellPenalty - highExpansionPenalty,
    0.88,
    0.995,
  )
  const correctionEfficiency = clamp(
    contourEfficiency *
      clamp(cfdEfficiency, 0, 1) *
      clamp(combustionEfficiency, 0, 1),
    0,
    1,
  )

  const slantLength = Math.sqrt(
    Math.pow(exitRadius - throatRadius, 2) + Math.pow(nozzleLength, 2),
  )
  const nozzleSurfaceArea = Math.PI * (throatRadius + exitRadius) * slantLength
  const nozzleMass = finiteOrZero(
    nozzleSurfaceArea *
      Math.max(wallThickness, 0) *
      Math.max(materialDensity, 0) *
      clamp(latticeMassFactor / 100, 0, 1),
  )

  const idealMomentumThrust = finiteOrZero(massFlow * exitVelocity)
  const momentumThrust = finiteOrZero(
    idealMomentumThrust * correctionEfficiency,
  )
  const pressureThrust = finiteOrZero(
    (exitPressure - ambientPressure) * exitArea,
  )
  const idealThrust = finiteOrZero(idealMomentumThrust + pressureThrust)
  const thrust = finiteOrZero(momentumThrust + pressureThrust)

  const specificImpulse =
    massFlow > 0 ? finiteOrZero(thrust / (massFlow * STANDARD_GRAVITY)) : 0

  const thrustCoefficient =
    chamberPressure * throatArea > 0
      ? finiteOrZero(thrust / (chamberPressure * throatArea))
      : 0

  return {
    massFlow,
    characteristicVelocity,
    exitMach,
    exitPressure,
    exitVelocity,
    idealMomentumThrust,
    momentumThrust,
    pressureThrust,
    idealThrust,
    thrust,
    specificImpulse,
    thrustCoefficient,
    expansionRatio,
    contourEfficiency,
    correctionEfficiency,
    nozzleLength,
    conicalEquivalentLength,
    nozzleMass,
  }
}
