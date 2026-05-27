import { translations } from '../i18n/translations'
import { calculateRocketPerformance } from '../simulation/rocketEquations'
import { useSimulatorStore } from '../store/simulatorStore'

function formatValue(value: number) {
  if (!Number.isFinite(value)) {
    return '—'
  }

  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 4,
  }).format(value)
}

type OutputPanelProps = {
  compact?: boolean
}

export function OutputPanel({ compact = false }: OutputPanelProps) {
  const language = useSimulatorStore((state) => state.language)
  const inputs = useSimulatorStore((state) => state.inputs)
  const performance = calculateRocketPerformance(inputs)
  const labels = translations[language].outputLabels

  const outputs = compact
    ? ([
        [labels.totalThrust, performance.thrust, 'N'],
        [labels.specificImpulse, performance.specificImpulse, 's'],
        [labels.massFlow, performance.massFlow, 'kg/s'],
        [labels.exitMach, performance.exitMach, ''],
        [labels.exitPressure, performance.exitPressure, 'Pa'],
      ] as const)
    : ([
        [labels.massFlow, performance.massFlow, 'kg/s'],
        [
          labels.characteristicVelocity,
          performance.characteristicVelocity,
          'm/s',
        ],
        [labels.exitMach, performance.exitMach, ''],
        [labels.exitPressure, performance.exitPressure, 'Pa'],
        [labels.exitVelocity, performance.exitVelocity, 'm/s'],
        [labels.idealThrust, performance.idealThrust, 'N'],
        [labels.momentumThrust, performance.momentumThrust, 'N'],
        [labels.pressureThrust, performance.pressureThrust, 'N'],
        [labels.totalThrust, performance.thrust, 'N'],
        [labels.specificImpulse, performance.specificImpulse, 's'],
        [labels.thrustCoefficient, performance.thrustCoefficient, ''],
        [labels.expansionRatio, performance.expansionRatio, ''],
        [labels.contourEfficiency, performance.contourEfficiency, ''],
        [labels.correctionEfficiency, performance.correctionEfficiency, ''],
        [labels.nozzleLength, performance.nozzleLength, 'm'],
        [
          labels.conicalEquivalentLength,
          performance.conicalEquivalentLength,
          'm',
        ],
        [labels.nozzleMass, performance.nozzleMass, 'kg'],
      ] as const)

  return (
    <div className={compact ? 'grid grid-cols-1 gap-3' : 'space-y-3'}>
      {outputs.map(([label, value, unit]) => (
        <div
          key={label}
          className="rounded-md border border-[#26313a] bg-[#12181e] p-3"
        >
          <div className="mb-1 flex items-start justify-between gap-3">
            <span className="text-xs font-medium text-[#9fb0bf]">{label}</span>
            <span className="font-mono text-[11px] text-[#718494]">{unit}</span>
          </div>

          <p className="m-0 font-mono text-lg text-[#f4f7fa]">
            {formatValue(value)}
          </p>
        </div>
      ))}
    </div>
  )
}
