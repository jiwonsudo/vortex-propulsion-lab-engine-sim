import { calculateRocketPerformance } from './rocketEquations'
import type { SimulatorInput } from '../store/simulatorStore'

type InputMap = Record<string, SimulatorInput>

export type ValidationMessageKey =
  | 'gamma'
  | 'temperature'
  | 'areaRatio'
  | 'massFlow'
  | 'exitVelocity'
  | 'thrust'
  | 'chamberPressure'
  | 'throatArea'
  | 'exitArea'
  | 'gasConstant'

export type ValidationMessage = {
  id: string
  level: 'warning' | 'error'
  messageKey: ValidationMessageKey
}

function value(inputs: InputMap, key: string) {
  return inputs[key]?.value ?? 0
}

export function validateRocketInputs(inputs: InputMap): ValidationMessage[] {
  const messages: ValidationMessage[] = []

  const chamberPressure = value(inputs, 'chamberPressure')
  const throatArea = value(inputs, 'throatArea')
  const exitArea = value(inputs, 'exitArea')
  const gamma = value(inputs, 'gamma')
  const chamberTemperature = value(inputs, 'chamberTemperature')
  const gasConstant = value(inputs, 'gasConstant')

  if (chamberPressure <= 0) {
    messages.push({
      id: 'chamber-pressure',
      level: 'error',
      messageKey: 'chamberPressure',
    })
  }

  if (throatArea <= 0) {
    messages.push({
      id: 'throat-area',
      level: 'error',
      messageKey: 'throatArea',
    })
  }

  if (exitArea <= 0) {
    messages.push({
      id: 'exit-area',
      level: 'error',
      messageKey: 'exitArea',
    })
  }

  if (gasConstant <= 0) {
    messages.push({
      id: 'gas-constant',
      level: 'error',
      messageKey: 'gasConstant',
    })
  }

  if (gamma <= 1) {
    messages.push({
      id: 'gamma',
      level: 'error',
      messageKey: 'gamma',
    })
  }

  if (chamberTemperature <= 0) {
    messages.push({
      id: 'temperature',
      level: 'error',
      messageKey: 'temperature',
    })
  }

  if (exitArea <= throatArea) {
    messages.push({
      id: 'area-ratio',
      level: 'warning',
      messageKey: 'areaRatio',
    })
  }

  const performance = calculateRocketPerformance(inputs)

  if (!Number.isFinite(performance.massFlow) || performance.massFlow <= 0) {
    messages.push({
      id: 'mass-flow',
      level: 'error',
      messageKey: 'massFlow',
    })
  }

  if (
    !Number.isFinite(performance.exitVelocity) ||
    performance.exitVelocity <= 0
  ) {
    messages.push({
      id: 'exit-velocity',
      level: 'error',
      messageKey: 'exitVelocity',
    })
  }

  if (!Number.isFinite(performance.thrust)) {
    messages.push({
      id: 'thrust',
      level: 'error',
      messageKey: 'thrust',
    })
  }

  return messages
}
