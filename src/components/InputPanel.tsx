import { useRef, useState } from 'react';
import { translations } from '../i18n/translations';
import { InfoModal } from './InfoModal';
import {
  calculateRocketPerformance,
  clamp,
} from '../simulation/rocketEquations';
import {
  type SimulatorInput,
  type SimulatorInputGroup,
  type SimulatorInputKey,
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

const INPUT_ORDER: SimulatorInputKey[] = [
  'targetThrust',
  'targetSpecificImpulse',
  'maxNozzleMass',
  'minStructuralSafetyFactor',
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
  'yieldStrength',
  'materialDensity',
  'latticeMassFactor',
];

function compareInputs(a: SimulatorInput, b: SimulatorInput) {
  return INPUT_ORDER.indexOf(a.key) - INPUT_ORDER.indexOf(b.key);
}

function getDisplayScale(input: SimulatorInput) {
  return input.displayScale ?? 1;
}

function roundForStep(value: number, step: number) {
  const fractionDigits = getFractionDigits(step);
  return Number(value.toFixed(fractionDigits + 2));
}

function toDisplayValue(input: SimulatorInput, value: number) {
  return roundForStep(
    value * getDisplayScale(input),
    input.step * getDisplayScale(input),
  );
}

function fromDisplayValue(input: SimulatorInput, value: number) {
  return value / getDisplayScale(input);
}

function getDisplayUnit(input: SimulatorInput) {
  return input.displayUnit ?? input.unit;
}

function getFractionDigits(step: number) {
  if (!Number.isFinite(step) || step <= 0) {
    return 3;
  }

  const stepText = step.toString();

  if (stepText.includes('e-')) {
    return Number(stepText.split('e-')[1] ?? 3);
  }

  return stepText.split('.')[1]?.length ?? 0;
}

function formatNumber(value: number, step: number) {
  const fractionDigits = getFractionDigits(step);

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits:
      value !== 0 && Math.abs(value) < 1 ? fractionDigits : 0,
    maximumFractionDigits: Math.max(fractionDigits, 3),
  }).format(value);
}

function formatInputValue(input: SimulatorInput) {
  return formatNumber(
    toDisplayValue(input, input.value),
    input.step * getDisplayScale(input),
  );
}

function formatInputLimit(input: SimulatorInput, value: number) {
  return `${formatNumber(
    toDisplayValue(input, value),
    input.step * getDisplayScale(input),
  )} ${getDisplayUnit(input)}`;
}

function formatDesignArea(value: number) {
  return formatNumber(value * 10_000, 0.01);
}

function formatDesignLength(value: number) {
  return formatNumber(value * 1_000, 0.1);
}

function getGroupClasses(group: SimulatorInputGroup) {
  switch (group) {
    case 'design':
      return 'border-[#35506b] bg-[#121f2b]';
    case 'target':
      return 'border-[#5f4d83] bg-[#181529]';
    case 'environment':
      return 'border-[#3b5c48] bg-[#121f19]';
    case 'gas':
      return 'border-[#4f456c] bg-[#1b1728]';
    case 'cfd':
      return 'border-[#4f5d36] bg-[#191f13]';
    case 'manufacturing':
      return 'border-[#5c4a3b] bg-[#211914]';
    case 'operating':
      return 'border-[#4d3f2b] bg-[#221b12]';
  }
}

function getGroupBadgeClasses(group: SimulatorInputGroup) {
  switch (group) {
    case 'design':
      return 'border-[#5d9fd6] text-[#9fd3ff]';
    case 'target':
      return 'border-[#b49aff] text-[#d8caff]';
    case 'environment':
      return 'border-[#6fb985] text-[#a7e7ba]';
    case 'gas':
      return 'border-[#9a87d8] text-[#c9bdff]';
    case 'cfd':
      return 'border-[#a7c46a] text-[#d6f0a0]';
    case 'manufacturing':
      return 'border-[#d69b6d] text-[#ffd0aa]';
    case 'operating':
      return 'border-[#c28b3f] text-[#ffd28a]';
  }
}

function InputControl({ input }: { input: SimulatorInput }) {
  const language = useSimulatorStore((state) => state.language);
  const setInputValue = useSimulatorStore((state) => state.setInputValue);
  const resetInputValue = useSimulatorStore((state) => state.resetInputValue);
  const setInputInteractionActive = useSimulatorStore(
    (state) => state.setInputInteractionActive,
  );
  const interactionTimeoutRef = useRef<number | null>(null);
  const t = translations[language];
  const canReset = input.group === 'gas' || input.group === 'environment';
  const tooltipText = `${t.inputDescriptions[input.key]} ${t.range}: ${formatInputLimit(
    input,
    input.min,
  )} - ${formatInputLimit(input, input.max)}.`;
  const pauseFlowAnimation = () => {
    if (interactionTimeoutRef.current !== null) {
      window.clearTimeout(interactionTimeoutRef.current);
    }

    setInputInteractionActive(true);
  };
  const resumeFlowAnimationSoon = (delay = 140) => {
    if (interactionTimeoutRef.current !== null) {
      window.clearTimeout(interactionTimeoutRef.current);
    }

    interactionTimeoutRef.current = window.setTimeout(() => {
      setInputInteractionActive(false);
    }, delay);
  };

  return (
    <label
      className={`block rounded-md border p-3 ${getGroupClasses(input.group)}`}
      aria-label={t.inputPanelLabel}
    >
      <div className="mb-2 flex items-start justify-between gap-3">
        <div>
          <span className="group relative inline-flex text-sm font-medium text-[#e8edf2]">
            {t.inputLabels[input.key]}
            <span className="pointer-events-none absolute left-0 top-6 z-30 w-64 rounded-md border border-[#34505f] bg-[#071016] p-2 text-[11px] font-normal leading-4 text-[#c9d4dd] opacity-0 shadow-xl transition-opacity delay-1000 duration-150 group-hover:opacity-100">
              {tooltipText}
            </span>
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
        onPointerDown={pauseFlowAnimation}
        onPointerUp={() => {
          resumeFlowAnimationSoon(80);
        }}
        onPointerCancel={() => {
          resumeFlowAnimationSoon(80);
        }}
        onChange={(event) => {
          pauseFlowAnimation();
          setInputValue(
            input.key,
            fromDisplayValue(input, Number(event.target.value)),
          );
          resumeFlowAnimationSoon();
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
          onFocus={pauseFlowAnimation}
          onBlur={() => {
            resumeFlowAnimationSoon(80);
          }}
          onChange={(event) => {
            pauseFlowAnimation();
            setInputValue(
              input.key,
              fromDisplayValue(input, Number(event.target.value)),
            );
            resumeFlowAnimationSoon(260);
          }}
          className="min-w-0 rounded-md border border-[#26313a] bg-[#0f1418] px-2 py-1 font-mono text-xs text-[#e8edf2] outline-none focus:border-[#6ab7d6]"
        />
        {canReset ? (
          <button
            type="button"
            onClick={() => {
              resetInputValue(input.key);
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
  );
}

function targetMatchScore(
  performance: ReturnType<typeof calculateRocketPerformance>,
  inputs: ReturnType<typeof useSimulatorStore.getState>['inputs'],
) {
  const targetThrust = inputs.targetThrust.value;
  const targetSpecificImpulse = inputs.targetSpecificImpulse.value;
  const maxNozzleMass = inputs.maxNozzleMass.value;
  const minSafetyFactor = inputs.minStructuralSafetyFactor.value;
  const thrustError =
    Math.abs(performance.thrust - targetThrust) / Math.max(targetThrust, 1);
  const ispError =
    Math.abs(performance.specificImpulse - targetSpecificImpulse) /
    Math.max(targetSpecificImpulse, 1);
  const massPenalty = clamp(
    (performance.nozzleMass - maxNozzleMass) / Math.max(maxNozzleMass, 0.1),
    0,
    2,
  );
  const underusedMassPenalty = clamp(
    (maxNozzleMass * 0.08 - performance.nozzleMass) /
      Math.max(maxNozzleMass * 0.08, 0.1),
    0,
    1,
  );
  const structuralPenalty = clamp(
    (minSafetyFactor - performance.structuralSafetyFactor) /
      Math.max(minSafetyFactor, 1),
    0,
    2,
  );
  const overExpansionPenalty = clamp(
    (inputs.ambientPressure.value - performance.exitPressure) /
      Math.max(inputs.ambientPressure.value, 1),
    0,
    1,
  );
  const negativePressureThrustPenalty =
    performance.pressureThrust < 0
      ? clamp(
          Math.abs(performance.pressureThrust) /
            Math.max(Math.abs(performance.momentumThrust), 1),
          0,
          1,
        )
      : 0;

  return (
    thrustError * 3.2 +
    ispError * 1.8 +
    performance.flowSeparationRisk * 4 +
    structuralPenalty * 5 +
    massPenalty * 1.2 +
    underusedMassPenalty * 0.35 +
    (1 - performance.contourEfficiency) * 2 +
    overExpansionPenalty * 6 +
    negativePressureThrustPenalty * 8
  );
}

function matchTargetPerformance(
  inputs: ReturnType<typeof useSimulatorStore.getState>['inputs'],
) {
  const throatInput = inputs.throatArea;
  const exitInput = inputs.exitArea;
  const bellLengthInput = inputs.bellLengthPercent;
  const wallThicknessInput = inputs.wallThickness;
  let bestThroatArea = throatInput.value;
  let bestExitArea = exitInput.value;
  let bestBellLengthPercent = bellLengthInput.value;
  let bestWallThickness = wallThicknessInput.value;
  let bestScore = Number.POSITIVE_INFINITY;

  for (
    let throatArea = throatInput.min;
    throatArea <= throatInput.max;
    throatArea += throatInput.step * 2
  ) {
    const exitAreaMin = Math.max(exitInput.min, throatArea + exitInput.step);

    for (
      let exitArea = exitAreaMin;
      exitArea <= exitInput.max;
      exitArea += exitInput.step * 4
    ) {
      for (
        let bellLengthPercent = bellLengthInput.min;
        bellLengthPercent <= bellLengthInput.max;
        bellLengthPercent += 4
      ) {
        for (
          let wallThickness = wallThicknessInput.min;
          wallThickness <= wallThicknessInput.max;
          wallThickness += wallThicknessInput.step * 4
        ) {
          const candidateInputs = {
            ...inputs,
            throatArea: { ...throatInput, value: throatArea },
            exitArea: { ...exitInput, value: exitArea },
            bellLengthPercent: {
              ...bellLengthInput,
              value: bellLengthPercent,
            },
            wallThickness: { ...wallThicknessInput, value: wallThickness },
          };
          const performance = calculateRocketPerformance(candidateInputs);
          const score = targetMatchScore(performance, candidateInputs);

          if (Number.isFinite(score) && score < bestScore) {
            bestScore = score;
            bestThroatArea = throatArea;
            bestExitArea = exitArea;
            bestBellLengthPercent = bellLengthPercent;
            bestWallThickness = wallThickness;
          }
        }
      }
    }
  }

  return {
    bestThroatArea,
    bestExitArea,
    bestBellLengthPercent,
    bestWallThickness,
  };
}

export function InputPanel() {
  const language = useSimulatorStore((state) => state.language);
  const inputsByKey = useSimulatorStore((state) => state.inputs);
  const setInputValue = useSimulatorStore((state) => state.setInputValue);
  const t = translations[language];
  const inputs = Object.values(inputsByKey);

  const [optimizationInfoOpen, setOptimizationInfoOpen] = useState(false);
  const [targetMatchRunning, setTargetMatchRunning] = useState(false);
  const [targetMatchComplete, setTargetMatchComplete] = useState<string | null>(
    null,
  );
  const groupedInputs = INPUT_GROUP_ORDER.map((group) => ({
    group,
    inputs: inputs.filter((input) => input.group === group).sort(compareInputs),
  })).filter((section) => section.inputs.length > 0);
  const runTargetMatch = () => {
    setTargetMatchComplete(null);
    setTargetMatchRunning(true);

    window.setTimeout(() => {
      const {
        bestThroatArea,
        bestExitArea,
        bestBellLengthPercent,
        bestWallThickness,
      } = matchTargetPerformance(useSimulatorStore.getState().inputs);

      setInputValue('throatArea', bestThroatArea);
      setInputValue('exitArea', bestExitArea);
      setInputValue('bellLengthPercent', bestBellLengthPercent);
      setInputValue('wallThickness', bestWallThickness);
      setTargetMatchRunning(false);
      setTargetMatchComplete(
        `${t.targetDesignComplete}: At ${formatDesignArea(
          bestThroatArea,
        )} cm² / Ae ${formatDesignArea(
          bestExitArea,
        )} cm² / t ${formatDesignLength(bestWallThickness)} mm`,
      );

      window.setTimeout(() => {
        setTargetMatchComplete(null);
      }, 2400);
    }, 30);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <button
            type="button"
            onClick={runTargetMatch}
            disabled={targetMatchRunning}
            className="min-w-0 rounded-md border border-[#b49aff] bg-[#1a1433] px-3 py-2 font-mono text-xs font-black tracking-wide text-[#d8caff] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] hover:bg-[#241b45] disabled:cursor-wait disabled:border-[#6f618f] disabled:text-[#9b8ac8]"
          >
            {targetMatchRunning
              ? t.matchingTargetPerformance
              : t.matchTargetPerformance}
          </button>
          <button
            type="button"
            onClick={() => {
              setOptimizationInfoOpen(true);
            }}
            className="grid h-9 w-9 place-items-center rounded-md border border-[#34505f] bg-[#111820] font-mono text-sm font-black text-[#9fd3ff] hover:border-[#6ab7d6] hover:bg-[#152b44]"
            aria-label={t.optimizationInfoButtonLabel}
          >
            ?
          </button>
        </div>

        {targetMatchRunning ? (
          <div className="overflow-hidden rounded-md border border-[#514170] bg-[#100d1d] p-2">
            <div className="h-1.5 overflow-hidden rounded bg-[#231a3a]">
              <div className="h-full w-1/3 animate-[target-progress_1s_ease-in-out_infinite] rounded bg-[#b49aff]" />
            </div>
          </div>
        ) : null}

        {targetMatchComplete !== null ? (
          <div className="rounded-md border border-[#3a6f55] bg-[#102018] px-3 py-2 font-mono text-[11px] font-bold text-[#9ee6bd]">
            {targetMatchComplete}
          </div>
        ) : null}
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
          setOptimizationInfoOpen(false);
        }}
      />
    </div>
  );
}
