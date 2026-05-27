import { translations } from '../i18n/translations';
import { calculateRocketPerformance } from '../simulation/rocketEquations';
import { useSimulatorStore } from '../store/simulatorStore';

function formatValue(value: number) {
  if (!Number.isFinite(value)) {
    return '—';
  }

  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 4,
  }).format(value);
}

type OutputPanelProps = {
  compact?: boolean;
};

type OutputItem = readonly [
  label: string,
  value: number,
  unit: string,
  description: string,
  minMax: string,
];

export function OutputPanel({ compact = false }: OutputPanelProps) {
  const language = useSimulatorStore((state) => state.language);
  const inputs = useSimulatorStore((state) => state.inputs);
  const performance = calculateRocketPerformance(inputs);
  const labels = translations[language].outputLabels;
  const descriptions = translations[language].outputDescriptions;
  const range = translations[language].range;
  const modelDependent = translations[language].modelDependent;
  const noFixedMaximum = translations[language].noFixedMaximum;

  const outputs = compact
    ? ([
        [
          labels.totalThrust,
          performance.thrust,
          'N',
          descriptions.totalThrust,
          `${range}: ${modelDependent}`,
        ],
        [
          labels.specificImpulse,
          performance.specificImpulse,
          's',
          descriptions.specificImpulse,
          `${range}: ${modelDependent}`,
        ],
        [
          labels.massFlow,
          performance.massFlow,
          'kg/s',
          descriptions.massFlow,
          `${range}: 0 - ${modelDependent}`,
        ],
        [
          labels.exitMach,
          performance.exitMach,
          '',
          descriptions.exitMach,
          `${range}: 1 - 20`,
        ],
        [
          labels.exitPressure,
          performance.exitPressure,
          'Pa',
          descriptions.exitPressure,
          `${range}: 0 - ${modelDependent}`,
        ],
      ] satisfies OutputItem[])
    : ([
        [
          labels.massFlow,
          performance.massFlow,
          'kg/s',
          descriptions.massFlow,
          `${range}: 0 - ${modelDependent}`,
        ],
        [
          labels.characteristicVelocity,
          performance.characteristicVelocity,
          'm/s',
          descriptions.characteristicVelocity,
          `${range}: 0 - ${modelDependent}`,
        ],
        [
          labels.effectiveGamma,
          performance.effectiveGamma,
          '',
          descriptions.effectiveGamma,
          `${range}: 1.05 - 1.4`,
        ],
        [
          labels.exitMach,
          performance.exitMach,
          '',
          descriptions.exitMach,
          `${range}: 1 - 20`,
        ],
        [
          labels.exitPressure,
          performance.exitPressure,
          'Pa',
          descriptions.exitPressure,
          `${range}: 0 - ${modelDependent}`,
        ],
        [
          labels.exitVelocity,
          performance.exitVelocity,
          'm/s',
          descriptions.exitVelocity,
          `${range}: 0 - ${modelDependent}`,
        ],
        [
          labels.idealThrust,
          performance.idealThrust,
          'N',
          descriptions.idealThrust,
          `${range}: ${modelDependent}`,
        ],
        [
          labels.momentumThrust,
          performance.momentumThrust,
          'N',
          descriptions.momentumThrust,
          `${range}: 0 - ${modelDependent}`,
        ],
        [
          labels.pressureThrust,
          performance.pressureThrust,
          'N',
          descriptions.pressureThrust,
          `${range}: ${modelDependent}`,
        ],
        [
          labels.totalThrust,
          performance.thrust,
          'N',
          descriptions.totalThrust,
          `${range}: ${modelDependent}`,
        ],
        [
          labels.specificImpulse,
          performance.specificImpulse,
          's',
          descriptions.specificImpulse,
          `${range}: ${modelDependent}`,
        ],
        [
          labels.thrustCoefficient,
          performance.thrustCoefficient,
          '',
          descriptions.thrustCoefficient,
          `${range}: ${modelDependent}`,
        ],
        [
          labels.expansionRatio,
          performance.expansionRatio,
          '',
          descriptions.expansionRatio,
          `${range}: 1 - ${noFixedMaximum}`,
        ],
        [
          labels.contourEfficiency,
          performance.contourEfficiency,
          '',
          descriptions.contourEfficiency,
          `${range}: 0.88 - 0.995`,
        ],
        [
          labels.correctionEfficiency,
          performance.correctionEfficiency,
          '',
          descriptions.correctionEfficiency,
          `${range}: 0 - 1`,
        ],
        [
          labels.nozzleLength,
          performance.nozzleLength,
          'm',
          descriptions.nozzleLength,
          `${range}: 0 - ${modelDependent}`,
        ],
        [
          labels.conicalEquivalentLength,
          performance.conicalEquivalentLength,
          'm',
          descriptions.conicalEquivalentLength,
          `${range}: 0 - ${modelDependent}`,
        ],
        [
          labels.nozzleMass,
          performance.nozzleMass,
          'kg',
          descriptions.nozzleMass,
          `${range}: 0 - ${modelDependent}`,
        ],
        [
          labels.flowSeparationRatio,
          performance.flowSeparationRatio,
          'Pe/Pa',
          descriptions.flowSeparationRatio,
          `${range}: 0 - ${noFixedMaximum}`,
        ],
        [
          labels.flowSeparationRisk,
          performance.flowSeparationRisk * 100,
          '%',
          descriptions.flowSeparationRisk,
          `${range}: 0 - 100`,
        ],
        [
          labels.structuralRadius,
          performance.structuralRadius * 1_000,
          'mm',
          descriptions.structuralRadius,
          `${range}: 0 - ${modelDependent}`,
        ],
        [
          labels.wallThicknessRatio,
          performance.wallThicknessRatio,
          't/r',
          descriptions.wallThicknessRatio,
          `${range}: 0 - ${noFixedMaximum}`,
        ],
        [
          labels.estimatedWallTemperature,
          performance.estimatedWallTemperature,
          'K',
          descriptions.estimatedWallTemperature,
          `${range}: 300 - 1,150`,
        ],
        [
          labels.effectiveYieldStrength,
          performance.effectiveYieldStrength / 1_000_000,
          'MPa',
          descriptions.effectiveYieldStrength,
          `${range}: 0 - ${modelDependent}`,
        ],
        [
          labels.hoopStress,
          performance.hoopStress / 1_000_000,
          'MPa',
          descriptions.hoopStress,
          `${range}: 0 - ${modelDependent}`,
        ],
        [
          labels.structuralSafetyFactor,
          performance.structuralSafetyFactor,
          '',
          descriptions.structuralSafetyFactor,
          `${range}: 0 - ${noFixedMaximum}`,
        ],
      ] satisfies OutputItem[]);

  return (
    <div className={compact ? 'grid grid-cols-1 gap-3' : 'space-y-3'}>
      {outputs.map(([label, value, unit, description, minMax]) => (
        <div
          key={label}
          className="rounded-md border border-[#26313a] bg-[#12181e] p-3"
        >
          <div className="mb-1 flex items-start justify-between gap-3">
            <span className="group relative inline-flex text-xs font-medium text-[#9fb0bf]">
              {label}
              <span className="pointer-events-none absolute left-0 top-5 z-30 w-64 rounded-md border border-[#34505f] bg-[#071016] p-2 text-[11px] font-normal leading-4 text-[#c9d4dd] opacity-0 shadow-xl transition-opacity delay-1000 duration-150 group-hover:opacity-100">
                {description} {minMax}.
              </span>
            </span>
            <span className="font-mono text-[11px] text-[#718494]">{unit}</span>
          </div>

          <p className="m-0 font-mono text-lg text-[#f4f7fa]">
            {formatValue(value)}
          </p>
        </div>
      ))}
    </div>
  );
}
