import { create } from 'zustand'

export type SimulatorInputKey =
  | 'oxidizerFlow'
  | 'chamberPressure'
  | 'burnTime'
  | 'portRadius'
  | 'fuelGrainLength'

export type SimulatorInput = {
  key: SimulatorInputKey
  label: string
  unit: string
  value: number
  min: number
  max: number
  step: number
}

type SimulatorStore = {
  inputs: Record<SimulatorInputKey, SimulatorInput>
  setInputValue: (key: SimulatorInputKey, value: number) => void
}

export const useSimulatorStore = create<SimulatorStore>((set) => ({
  inputs: {
    oxidizerFlow: {
      key: 'oxidizerFlow',
      label: 'Oxidizer Flow',
      unit: 'kg/s',
      value: 1,
      min: 0,
      max: 10,
      step: 0.1,
    },
    chamberPressure: {
      key: 'chamberPressure',
      label: 'Chamber Pressure',
      unit: 'Pa',
      value: 1_000_000,
      min: 100_000,
      max: 5_000_000,
      step: 10_000,
    },
    burnTime: {
      key: 'burnTime',
      label: 'Burn Time',
      unit: 's',
      value: 5,
      min: 0,
      max: 60,
      step: 0.1,
    },
    portRadius: {
      key: 'portRadius',
      label: 'Port Radius',
      unit: 'm',
      value: 0.03,
      min: 0.005,
      max: 0.15,
      step: 0.001,
    },
    fuelGrainLength: {
      key: 'fuelGrainLength',
      label: 'Fuel Grain Length',
      unit: 'm',
      value: 0.5,
      min: 0.1,
      max: 2,
      step: 0.01,
    },
  },

  setInputValue: (key, value) => {
    set((state) => ({
      inputs: {
        ...state.inputs,
        [key]: {
          ...state.inputs[key],
          value,
        },
      },
    }))
  },
}))