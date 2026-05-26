import { type SimulatorInput, useSimulatorStore } from '../store/simulatorStore'

function InputControl({ input }: { input: SimulatorInput }) {
  const setInputValue = useSimulatorStore((state) => state.setInputValue)

  return (
    <label
      className="block rounded-md border border-[#26313a] bg-[#12181e] p-3"
      aria-label="d"
    >
      <div className="mb-2 flex items-start justify-between gap-3">
        <span className="text-sm font-medium text-[#e8edf2]">
          {input.label}
        </span>
        <span className="text-right font-mono text-xs text-[#9fb0bf]">
          {input.value.toLocaleString()} {input.unit}
        </span>
      </div>

      <input
        type="range"
        min={input.min}
        max={input.max}
        step={input.step}
        value={input.value}
        onChange={(event) => {
          setInputValue(input.key, Number(event.target.value))
        }}
        className="w-full accent-[#6ab7d6]"
      />
    </label>
  )
}

export function InputPanel() {
  const inputsByKey = useSimulatorStore((state) => state.inputs)
  const inputs = Object.values(inputsByKey)

  return (
    <div className="space-y-3">
      {inputs.map((input) => (
        <InputControl key={input.key} input={input} />
      ))}
    </div>
  )
}
