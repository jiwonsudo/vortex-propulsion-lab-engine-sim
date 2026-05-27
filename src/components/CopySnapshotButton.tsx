import { useState } from 'react';
import { translations } from '../i18n/translations';
import { calculateRocketPerformance } from '../simulation/rocketEquations';
import {
  type SimulatorInput,
  type SimulatorInputGroup,
  useSimulatorStore,
} from '../store/simulatorStore';

const INPUT_GROUP_ORDER: SimulatorInputGroup[] = [
  'target',
  'design',
  'operating',
  'gas',
  'cfd',
  'environment',
  'manufacturing',
];

function formatValue(value: number) {
  if (!Number.isFinite(value)) {
    return '—';
  }

  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 6,
  }).format(value);
}

function displayValue(input: SimulatorInput) {
  return input.value * (input.displayScale ?? 1);
}

function displayUnit(input: SimulatorInput) {
  return input.displayUnit ?? input.unit;
}

function buildSnapshotText(
  inputs: ReturnType<typeof useSimulatorStore.getState>['inputs'],
  language: ReturnType<typeof useSimulatorStore.getState>['language'],
) {
  const t = translations[language];
  const performance = calculateRocketPerformance(inputs);
  const outputs = [
    [t.outputLabels.massFlow, performance.massFlow, 'kg/s'],
    [
      t.outputLabels.characteristicVelocity,
      performance.characteristicVelocity,
      'm/s',
    ],
    [t.outputLabels.effectiveGamma, performance.effectiveGamma, ''],
    [t.outputLabels.exitMach, performance.exitMach, ''],
    [t.outputLabels.exitPressure, performance.exitPressure, 'Pa'],
    [t.outputLabels.exitVelocity, performance.exitVelocity, 'm/s'],
    [t.outputLabels.idealThrust, performance.idealThrust, 'N'],
    [t.outputLabels.momentumThrust, performance.momentumThrust, 'N'],
    [t.outputLabels.pressureThrust, performance.pressureThrust, 'N'],
    [t.outputLabels.totalThrust, performance.thrust, 'N'],
    [t.outputLabels.specificImpulse, performance.specificImpulse, 's'],
    [t.outputLabels.thrustCoefficient, performance.thrustCoefficient, ''],
    [t.outputLabels.expansionRatio, performance.expansionRatio, ''],
    [t.outputLabels.contourEfficiency, performance.contourEfficiency, ''],
    [t.outputLabels.correctionEfficiency, performance.correctionEfficiency, ''],
    [t.outputLabels.nozzleLength, performance.nozzleLength, 'm'],
    [
      t.outputLabels.conicalEquivalentLength,
      performance.conicalEquivalentLength,
      'm',
    ],
    [t.outputLabels.nozzleMass, performance.nozzleMass, 'kg'],
    [
      t.outputLabels.flowSeparationRatio,
      performance.flowSeparationRatio,
      'Pe/Pa',
    ],
    [
      t.outputLabels.flowSeparationRisk,
      performance.flowSeparationRisk * 100,
      '%',
    ],
    [
      t.outputLabels.structuralRadius,
      performance.structuralRadius * 1_000,
      'mm',
    ],
    [t.outputLabels.wallThicknessRatio, performance.wallThicknessRatio, 't/r'],
    [
      t.outputLabels.estimatedWallTemperature,
      performance.estimatedWallTemperature,
      'K',
    ],
    [
      t.outputLabels.effectiveYieldStrength,
      performance.effectiveYieldStrength / 1_000_000,
      'MPa',
    ],
    [t.outputLabels.hoopStress, performance.hoopStress / 1_000_000, 'MPa'],
    [
      t.outputLabels.structuralSafetyFactor,
      performance.structuralSafetyFactor,
      '',
    ],
  ] as const;

  const lines = [
    `${t.appTitle}`,
    new Date().toISOString(),
    '',
    `[${t.inputs}]`,
  ];

  for (const group of INPUT_GROUP_ORDER) {
    const groupInputs = Object.values(inputs).filter(
      (input) => input.group === group,
    );

    if (groupInputs.length === 0) {
      continue;
    }

    lines.push('', `${t.inputGroups[group]}`);

    for (const input of groupInputs) {
      lines.push(
        `- ${t.inputLabels[input.key]}: ${formatValue(displayValue(input))} ${displayUnit(input)}`.trim(),
      );
    }
  }

  lines.push('', `[${t.keyOutputs}]`);

  for (const [label, value, unit] of outputs) {
    lines.push(`- ${label}: ${formatValue(value)} ${unit}`.trim());
  }

  return lines.join('\n');
}

export function CopySnapshotButton() {
  const language = useSimulatorStore((state) => state.language);
  const inputs = useSimulatorStore((state) => state.inputs);
  const t = translations[language];
  const [status, setStatus] = useState<'idle' | 'copied' | 'failed'>('idle');

  const copySnapshot = async () => {
    try {
      await navigator.clipboard.writeText(buildSnapshotText(inputs, language));
      setStatus('copied');
    } catch {
      setStatus('failed');
    }

    window.setTimeout(() => {
      setStatus('idle');
    }, 1800);
  };

  return (
    <button
      type="button"
      onClick={() => {
        void copySnapshot();
      }}
      className="rounded-md border border-[#34505f] bg-[#101923] px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-wide text-[#9fd3ff] hover:border-[#6ab7d6] hover:bg-[#152b44]"
    >
      {status === 'copied'
        ? t.copyValuesDone
        : status === 'failed'
          ? t.copyValuesFailed
          : t.copyValues}
    </button>
  );
}
