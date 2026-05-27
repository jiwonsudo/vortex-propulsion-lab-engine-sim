import { translations } from '../i18n/translations';
import {
  type FlowFieldMode,
  type FlowFieldViewMode,
  useSimulatorStore,
} from '../store/simulatorStore';
export function EngineControlPanel() {
  const language = useSimulatorStore((state) => state.language);
  const engineRunning = useSimulatorStore((state) => state.engineRunning);
  const setEngineRunning = useSimulatorStore((state) => state.setEngineRunning);
  const soundEnabled = useSimulatorStore((state) => state.soundEnabled);
  const setSoundEnabled = useSimulatorStore((state) => state.setSoundEnabled);
  const flowFieldMode = useSimulatorStore((state) => state.flowFieldMode);
  const setFlowFieldMode = useSimulatorStore((state) => state.setFlowFieldMode);
  const flowFieldViewMode = useSimulatorStore(
    (state) => state.flowFieldViewMode,
  );
  const setFlowFieldViewMode = useSimulatorStore(
    (state) => state.setFlowFieldViewMode,
  );
  const t = translations[language];
  const flowFieldModes: FlowFieldMode[] = [
    'off',
    'mach',
    'pressure',
    'temperature',
    'velocity',
  ];
  const flowFieldViewModes: FlowFieldViewMode[] = ['slice', 'volume'];

  return (
    <section className="rounded-lg border border-[#3b4650] bg-[#151b20] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold">{t.engineControl}</h2>
          <p className="mt-0.5 truncate font-mono text-[10px] uppercase tracking-wide text-[#718494]">
            {engineRunning ? t.ignitionArmed : t.ignitionSafe}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2 rounded-md border border-[#26313a] bg-[#0f1418] px-2 py-1">
          <span
            className={
              engineRunning
                ? 'h-2 w-2 rounded-full bg-[#65ff9a] shadow-[0_0_10px_#65ff9a]'
                : 'h-2 w-2 rounded-full bg-[#77828c]'
            }
          />
          <span className="font-mono text-[11px] text-[#d7e1ea]">
            {engineRunning ? t.running : t.cutoff}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 rounded-md border border-[#222b33] bg-[#0d1115] p-1.5">
        <button
          type="button"
          onClick={() => {
            setEngineRunning(true);
          }}
          className={
            engineRunning
              ? 'rounded border border-[#7f5d1e] bg-[#332410] px-2 py-1.5 font-mono text-[10px] font-bold tracking-wide text-[#ffc15e]'
              : 'rounded border border-[#a36a18] bg-[#f59e0b] px-2 py-1.5 font-mono text-[10px] font-black tracking-wide text-[#120b02] shadow-[0_0_12px_rgba(245,158,11,0.24)] hover:bg-[#ffb020]'
          }
        >
          {t.ignite}
        </button>
        <button
          type="button"
          onClick={() => {
            setEngineRunning(false);
          }}
          className={
            engineRunning
              ? 'rounded border border-[#8a2323] bg-[#d72626] px-2 py-1.5 font-mono text-[10px] font-black tracking-wide text-white shadow-[0_0_12px_rgba(215,38,38,0.26)] hover:bg-[#ef3333]'
              : 'rounded border border-[#4b2525] bg-[#251313] px-2 py-1.5 font-mono text-[10px] font-bold tracking-wide text-[#a98b8b]'
          }
        >
          {t.shutdown}
        </button>
        <button
          type="button"
          onClick={() => {
            setSoundEnabled(!soundEnabled);
          }}
          className={
            soundEnabled
              ? 'rounded border border-[#2f7d9a] bg-[#123142] px-2 py-1.5 font-mono text-[10px] font-black tracking-wide text-[#8eeaff]'
              : 'rounded border border-[#33414d] bg-[#111820] px-2 py-1.5 font-mono text-[10px] font-bold tracking-wide text-[#9fb0bf] hover:border-[#6ab7d6] hover:text-[#e8edf2]'
          }
        >
          {soundEnabled ? t.soundOn : t.soundOff}
        </button>
      </div>

      <div className="mt-2 rounded-md border border-[#222b33] bg-[#0d1115] p-1.5">
        <div className="mb-1.5 flex items-center justify-between gap-2 px-1">
          <span className="font-mono text-[10px] font-bold uppercase tracking-wide text-[#718494]">
            {t.flowField}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-wide text-[#9fb0bf]">
            {t.flowFieldModes[flowFieldMode]}
          </span>
        </div>
        <div className="grid grid-cols-5 gap-1">
          {flowFieldModes.map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => {
                setFlowFieldMode(mode);
              }}
              className={
                mode === flowFieldMode
                  ? 'rounded border border-[#45b5dc] bg-[#123142] px-1 py-1.5 font-mono text-[9px] font-black text-[#8eeaff]'
                  : 'rounded border border-[#26313a] bg-[#111820] px-1 py-1.5 font-mono text-[9px] font-bold text-[#7f93a3] hover:border-[#6ab7d6] hover:text-[#e8edf2]'
              }
            >
              {t.flowFieldModes[mode]}
            </button>
          ))}
        </div>
        <div className="mt-2 grid grid-cols-[auto_1fr] items-center gap-2 rounded border border-[#1f2a32] bg-[#10161b] p-1.5">
          <span className="px-1 font-mono text-[10px] font-bold uppercase tracking-wide text-[#718494]">
            {t.flowFieldView}
          </span>
          <div className="grid grid-cols-2 gap-1">
            {flowFieldViewModes.map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => {
                  setFlowFieldViewMode(mode);
                }}
                className={
                  mode === flowFieldViewMode
                    ? 'rounded border border-[#45b5dc] bg-[#123142] px-2 py-1 font-mono text-[9px] font-black text-[#8eeaff]'
                    : 'rounded border border-[#26313a] bg-[#111820] px-2 py-1 font-mono text-[9px] font-bold text-[#7f93a3] hover:border-[#6ab7d6] hover:text-[#e8edf2]'
                }
              >
                {t.flowFieldViewModes[mode]}
              </button>
            ))}
          </div>
        </div>
        <p className="mt-2 min-h-10 rounded border border-[#1f2a32] bg-[#10161b] px-2 py-1.5 text-[11px] leading-5 text-[#9fb0bf]">
          {t.flowFieldDescriptions[flowFieldMode]}
        </p>
      </div>
    </section>
  );
}
