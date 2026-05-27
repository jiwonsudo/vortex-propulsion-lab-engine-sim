import { useState } from 'react'
import { translations } from '../i18n/translations'
import { InfoModal } from './InfoModal'
import {
  calculateRocketPerformance,
  clamp,
} from '../simulation/rocketEquations'
import {
  type SimulatorInput,
  type SimulatorInputGroup,
  type SimulatorInputKey,
  useSimulatorStore,
} from '../store/simulatorStore'

const INPUT_GROUP_ORDER: SimulatorInputGroup[] = [
  'design',
  'operating',
  'gas',
  'cfd',
  'environment',
  'manufacturing',
]

const INPUT_ORDER: SimulatorInputKey[] = [
  'throatArea',
  'exitArea',
  'bellLengthPercent',
  'chamberPressure',
  'chamberTemperature',
  'gamma',
  'gasConstant',
  'combustionEfficiency',
  'cfdEfficiency',
  'ambientPressure',
  'wallThickness',
  'materialDensity',
  'latticeMassFactor',
]

function compareInputs(a: SimulatorInput, b: SimulatorInput) {
  return INPUT_ORDER.indexOf(a.key) - INPUT_ORDER.indexOf(b.key)
}

function getDisplayScale(input: SimulatorInput) {
  return input.displayScale ?? 1
}

function roundForStep(value: number, step: number) {
  const fractionDigits = getFractionDigits(step)
  return Number(value.toFixed(fractionDigits + 2))
}

function toDisplayValue(input: SimulatorInput, value: number) {
  return roundForStep(
    value * getDisplayScale(input),
    input.step * getDisplayScale(input),
  )
}

function fromDisplayValue(input: SimulatorInput, value: number) {
  return value / getDisplayScale(input)
}

function getDisplayUnit(input: SimulatorInput) {
  return input.displayUnit ?? input.unit
}

function getFractionDigits(step: number) {
  if (!Number.isFinite(step) || step <= 0) {
    return 3
  }

  const stepText = step.toString()

  if (stepText.includes('e-')) {
    return Number(stepText.split('e-')[1] ?? 3)
  }

  return stepText.split('.')[1]?.length ?? 0
}

function formatNumber(value: number, step: number) {
  const fractionDigits = getFractionDigits(step)

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits:
      value !== 0 && Math.abs(value) < 1 ? fractionDigits : 0,
    maximumFractionDigits: Math.max(fractionDigits, 3),
  }).format(value)
}

function formatInputValue(input: SimulatorInput) {
  return formatNumber(
    toDisplayValue(input, input.value),
    input.step * getDisplayScale(input),
  )
}

function getGroupClasses(group: SimulatorInputGroup) {
  switch (group) {
    case 'design':
      return 'border-[#35506b] bg-[#121f2b]'
    case 'environment':
      return 'border-[#3b5c48] bg-[#121f19]'
    case 'gas':
      return 'border-[#4f456c] bg-[#1b1728]'
    case 'cfd':
      return 'border-[#4f5d36] bg-[#191f13]'
    case 'manufacturing':
      return 'border-[#5c4a3b] bg-[#211914]'
    case 'operating':
      return 'border-[#4d3f2b] bg-[#221b12]'
  }
}

function getGroupBadgeClasses(group: SimulatorInputGroup) {
  switch (group) {
    case 'design':
      return 'border-[#5d9fd6] text-[#9fd3ff]'
    case 'environment':
      return 'border-[#6fb985] text-[#a7e7ba]'
    case 'gas':
      return 'border-[#9a87d8] text-[#c9bdff]'
    case 'cfd':
      return 'border-[#a7c46a] text-[#d6f0a0]'
    case 'manufacturing':
      return 'border-[#d69b6d] text-[#ffd0aa]'
    case 'operating':
      return 'border-[#c28b3f] text-[#ffd28a]'
  }
}

function InputControl({ input }: { input: SimulatorInput }) {
  const language = useSimulatorStore((state) => state.language)
  const setInputValue = useSimulatorStore((state) => state.setInputValue)
  const resetInputValue = useSimulatorStore((state) => state.resetInputValue)
  const t = translations[language]
  const canReset = input.group === 'gas' || input.group === 'environment'

  return (
    <label
      className={`block rounded-md border p-3 ${getGroupClasses(input.group)}`}
      aria-label={t.inputPanelLabel}
    >
      <div className="mb-2 flex items-start justify-between gap-3">
        <div>
          <span className="text-sm font-medium text-[#e8edf2]">
            {t.inputLabels[input.key]}
          </span>
          <div className="mt-1 flex items-center gap-2">
            <span
              className={`rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${getGroupBadgeClasses(input.group)}`}
            >
              {t.inputGroups[input.group]}
            </span>
          </div>
        </div>
        <span className="text-right font-mono text-xs text-[#9fb0bf]">
          {formatInputValue(input)} {getDisplayUnit(input)}
        </span>
      </div>

      <input
        type="range"
        min={toDisplayValue(input, input.min)}
        max={toDisplayValue(input, input.max)}
        step={input.step * getDisplayScale(input)}
        value={toDisplayValue(input, input.value)}
        onChange={(event) => {
          setInputValue(
            input.key,
            fromDisplayValue(input, Number(event.target.value)),
          )
        }}
        className="w-full accent-[#6ab7d6]"
      />

      <div
        className={
          canReset
            ? 'mt-2 grid grid-cols-[1fr_auto_auto] items-center gap-2'
            : 'mt-2 grid grid-cols-[1fr_auto] items-center gap-2'
        }
      >
        <input
          type="number"
          min={toDisplayValue(input, input.min)}
          max={toDisplayValue(input, input.max)}
          step={input.step * getDisplayScale(input)}
          value={toDisplayValue(input, input.value)}
          onChange={(event) => {
            setInputValue(
              input.key,
              fromDisplayValue(input, Number(event.target.value)),
            )
          }}
          className="min-w-0 rounded-md border border-[#26313a] bg-[#0f1418] px-2 py-1 font-mono text-xs text-[#e8edf2] outline-none focus:border-[#6ab7d6]"
        />
        {canReset ? (
          <button
            type="button"
            onClick={() => {
              resetInputValue(input.key)
            }}
            className="rounded-md border border-[#33414d] bg-[#111820] px-2 py-1 font-mono text-[10px] font-bold text-[#9fb0bf] hover:border-[#6ab7d6] hover:text-[#e8edf2]"
          >
            {t.reset}
          </button>
        ) : null}
        <span className="font-mono text-[11px] text-[#718494]">
          {formatNumber(
            toDisplayValue(input, input.min),
            input.step * getDisplayScale(input),
          )}
          –
          {formatNumber(
            toDisplayValue(input, input.max),
            input.step * getDisplayScale(input),
          )}
        </span>
      </div>
    </label>
  )
}

function optimizeDesignInputs(
  inputs: ReturnType<typeof useSimulatorStore.getState>['inputs'],
) {
  const exitInput = inputs.exitArea
  const bellLengthInput = inputs.bellLengthPercent
  const ambientPressure = inputs.ambientPressure.value
  let bestExitArea = exitInput.value
  let bestBellLengthPercent = bellLengthInput.value
  let bestScore = Number.POSITIVE_INFINITY

  for (
    let exitArea = exitInput.min;
    exitArea <= exitInput.max;
    exitArea += exitInput.step
  ) {
    if (exitArea <= inputs.throatArea.value) {
      continue
    }

    for (
      let bellLengthPercent = bellLengthInput.min;
      bellLengthPercent <= bellLengthInput.max;
      bellLengthPercent += bellLengthInput.step
    ) {
      const candidateInputs = {
        ...inputs,
        exitArea: { ...exitInput, value: exitArea },
        bellLengthPercent: { ...bellLengthInput, value: bellLengthPercent },
      }
      const performance = calculateRocketPerformance(candidateInputs)
      const pressureMismatch =
        Math.abs(performance.exitPressure - ambientPressure) /
        Math.max(ambientPressure, 1)
      const lengthRatio =
        performance.conicalEquivalentLength > 0
          ? performance.nozzleLength / performance.conicalEquivalentLength
          : 1
      const contourPenalty = 1 - performance.contourEfficiency
      const massPenalty = clamp(performance.nozzleMass / 8, 0, 1)
      const score =
        pressureMismatch +
        contourPenalty * 3 +
        lengthRatio * 0.08 +
        massPenalty * 0.12

      if (Number.isFinite(score) && score < bestScore) {
        bestScore = score
        bestExitArea = exitArea
        bestBellLengthPercent = bellLengthPercent
      }
    }
  }

  return { bestExitArea, bestBellLengthPercent }
}

export function InputPanel() {
  const language = useSimulatorStore((state) => state.language)
  const inputsByKey = useSimulatorStore((state) => state.inputs)
  const setInputValue = useSimulatorStore((state) => state.setInputValue)
  const t = translations[language]
  const inputs = Object.values(inputsByKey)

  const [optimizationInfoOpen, setOptimizationInfoOpen] = useState(false)
  const groupedInputs = INPUT_GROUP_ORDER.map((group) => ({
    group,
    inputs: inputs.filter((input) => input.group === group).sort(compareInputs),
  })).filter((section) => section.inputs.length > 0)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-[1fr_auto] gap-2">
        <button
          type="button"
          onClick={() => {
            const { bestExitArea, bestBellLengthPercent } =
              optimizeDesignInputs(inputsByKey)
            setInputValue('exitArea', bestExitArea)
            setInputValue('bellLengthPercent', bestBellLengthPercent)
          }}
          className="min-w-0 rounded-md border border-[#5d9fd6] bg-[#102033] px-3 py-2 font-mono text-xs font-black tracking-wide text-[#9fd3ff] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] hover:bg-[#152b44]"
        >
          {t.optimizeDesign}
        </button>
        <button
          type="button"
          onClick={() => {
            setOptimizationInfoOpen(true)
          }}
          className="grid h-9 w-9 place-items-center rounded-md border border-[#34505f] bg-[#111820] font-mono text-sm font-black text-[#9fd3ff] hover:border-[#6ab7d6] hover:bg-[#152b44]"
          aria-label={t.optimizationInfoButtonLabel}
        >
          ?
        </button>
      </div>

      {groupedInputs.map((section) => (
        <section key={section.group} className="space-y-2.5">
          <h3 className="text-[11px] font-bold uppercase tracking-wide text-[#718494]">
            {t.inputGroups[section.group]}
          </h3>
          {section.inputs.map((input) => (
            <InputControl key={input.key} input={input} />
          ))}
        </section>
      ))}

      <InfoModal
        open={optimizationInfoOpen}
        title={t.optimizationInfoTitle}
        closeLabel={t.close}
        sections={t.optimizationInfoSections}
        onClose={() => {
          setOptimizationInfoOpen(false)
        }}
      />
    </div>
  )
}
