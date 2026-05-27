import { create } from 'zustand'
import type { Language } from '../i18n/translations'

export type FlowFieldMode =
  | 'off'
  | 'mach'
  | 'pressure'
  | 'temperature'
  | 'velocity'

export type FlowFieldViewMode = 'slice' | 'volume'

export type SimulatorInputGroup =
  | 'operating'
  | 'design'
  | 'environment'
  | 'gas'
  | 'cfd'
  | 'manufacturing'

export type SimulatorInputKey =
  | 'chamberPressure'
  | 'chamberTemperature'
  | 'ambientPressure'
  | 'throatArea'
  | 'exitArea'
  | 'gamma'
  | 'gasConstant'
  | 'bellLengthPercent'
  | 'cfdEfficiency'
  | 'combustionEfficiency'
  | 'wallThickness'
  | 'materialDensity'
  | 'latticeMassFactor'

export type SimulatorInput = {
  key: SimulatorInputKey
  label: string
  unit: string
  displayUnit?: string
  displayScale?: number
  group: SimulatorInputGroup
  value: number
  defaultValue: number
  min: number
  max: number
  step: number
}

function getStepPrecision(step: number) {
  if (!Number.isFinite(step) || step <= 0) {
    return 6
  }

  const stepText = step.toString()

  if (stepText.includes('e-')) {
    return Number(stepText.split('e-')[1] ?? 6)
  }

  return stepText.split('.')[1]?.length ?? 0
}

function roundToInputStep(input: SimulatorInput, value: number) {
  if (!Number.isFinite(value) || input.step <= 0) {
    return value
  }

  const steppedValue =
    input.min + Math.round((value - input.min) / input.step) * input.step

  return Number(steppedValue.toFixed(getStepPrecision(input.step) + 2))
}

function clampInputValue(input: SimulatorInput, value: number) {
  if (!Number.isFinite(value)) {
    return input.value
  }

  const clampedValue = Math.min(Math.max(value, input.min), input.max)
  return roundToInputStep(input, clampedValue)
}

type SimulatorStore = {
  inputs: Record<SimulatorInputKey, SimulatorInput>
  language: Language
  engineRunning: boolean
  soundEnabled: boolean
  flowFieldMode: FlowFieldMode
  flowFieldViewMode: FlowFieldViewMode
  setEngineRunning: (running: boolean) => void
  setSoundEnabled: (enabled: boolean) => void
  setFlowFieldMode: (mode: FlowFieldMode) => void
  setFlowFieldViewMode: (mode: FlowFieldViewMode) => void
  setLanguage: (language: Language) => void
  setInputValue: (key: SimulatorInputKey, value: number) => void
  resetInputValue: (key: SimulatorInputKey) => void
}

export const useSimulatorStore = create<SimulatorStore>((set) => ({
  language: 'en',
  engineRunning: false,
  soundEnabled: false,
  flowFieldMode: 'off',
  flowFieldViewMode: 'slice',

  inputs: {
    chamberPressure: {
      key: 'chamberPressure',
      label: 'Chamber Pressure',
      unit: 'Pa',
      group: 'operating',
      value: 1_000_000,
      defaultValue: 1_000_000,
      min: 100_000,
      max: 5_000_000,
      step: 10_000,
    },
    chamberTemperature: {
      key: 'chamberTemperature',
      label: 'Chamber Temperature',
      unit: 'K',
      group: 'operating',
      value: 2_800,
      defaultValue: 2_800,
      min: 1_000,
      max: 4_000,
      step: 10,
    },
    ambientPressure: {
      key: 'ambientPressure',
      label: 'Ambient Pressure',
      unit: 'Pa',
      group: 'environment',
      value: 101_325,
      defaultValue: 101_325,
      min: 0,
      max: 101_325,
      step: 500,
    },
    throatArea: {
      key: 'throatArea',
      label: 'Throat Area',
      unit: 'm²',
      displayUnit: 'cm²',
      displayScale: 10_000,
      group: 'design',
      value: 0.0005,
      defaultValue: 0.0005,
      min: 0.0001,
      max: 0.01,
      step: 0.0001,
    },
    exitArea: {
      key: 'exitArea',
      label: 'Exit Area',
      unit: 'm²',
      displayUnit: 'cm²',
      displayScale: 10_000,
      group: 'design',
      value: 0.002,
      defaultValue: 0.002,
      min: 0.0001,
      max: 0.05,
      step: 0.0001,
    },
    gamma: {
      key: 'gamma',
      label: 'Specific Heat Ratio',
      unit: '',
      group: 'gas',
      value: 1.22,
      defaultValue: 1.22,
      min: 1.05,
      max: 1.4,
      step: 0.01,
    },
    gasConstant: {
      key: 'gasConstant',
      label: 'Gas Constant',
      unit: 'J/(kg·K)',
      group: 'gas',
      value: 355,
      defaultValue: 355,
      min: 100,
      max: 800,
      step: 1,
    },
    combustionEfficiency: {
      key: 'combustionEfficiency',
      label: 'Combustion Efficiency',
      unit: '',
      group: 'gas',
      value: 0.98,
      defaultValue: 0.98,
      min: 0.85,
      max: 1,
      step: 0.01,
    },
    bellLengthPercent: {
      key: 'bellLengthPercent',
      label: 'Bell Length',
      unit: '%',
      group: 'design',
      value: 80,
      defaultValue: 80,
      min: 60,
      max: 100,
      step: 1,
    },
    cfdEfficiency: {
      key: 'cfdEfficiency',
      label: 'CFD Correction',
      unit: '',
      group: 'cfd',
      value: 0.96,
      defaultValue: 0.96,
      min: 0.8,
      max: 1,
      step: 0.01,
    },
    wallThickness: {
      key: 'wallThickness',
      label: 'Wall Thickness',
      unit: 'm',
      displayUnit: 'mm',
      displayScale: 1_000,
      group: 'manufacturing',
      value: 0.002,
      defaultValue: 0.002,
      min: 0.0005,
      max: 0.008,
      step: 0.0001,
    },
    materialDensity: {
      key: 'materialDensity',
      label: 'Material Density',
      unit: 'kg/m³',
      group: 'manufacturing',
      value: 2_700,
      defaultValue: 2_700,
      min: 800,
      max: 9_000,
      step: 100,
    },
    latticeMassFactor: {
      key: 'latticeMassFactor',
      label: 'Lattice Mass Factor',
      unit: '%',
      group: 'manufacturing',
      value: 65,
      defaultValue: 65,
      min: 30,
      max: 100,
      step: 1,
    },
  },

  setEngineRunning: (running) => {
    set({ engineRunning: running })
  },

  setSoundEnabled: (enabled) => {
    set({ soundEnabled: enabled })
  },

  setFlowFieldMode: (mode) => {
    set({ flowFieldMode: mode })
  },

  setFlowFieldViewMode: (mode) => {
    set({ flowFieldViewMode: mode })
  },

  setLanguage: (language) => {
    set({ language })
  },

  setInputValue: (key, value) => {
    set((state) => ({
      inputs: {
        ...state.inputs,
        [key]: {
          ...state.inputs[key],
          value: clampInputValue(state.inputs[key], value),
        },
      },
    }))
  },

  resetInputValue: (key) => {
    set((state) => ({
      inputs: {
        ...state.inputs,
        [key]: {
          ...state.inputs[key],
          value: state.inputs[key].defaultValue,
        },
      },
    }))
  },
}))
