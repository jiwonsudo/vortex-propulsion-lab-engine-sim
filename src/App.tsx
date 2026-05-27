import { useState } from 'react';
import { translations } from './i18n/translations';
import { EngineControlPanel } from './components/EngineControlPanel';
import { InputPanel } from './components/InputPanel';
import { LanguageToggle } from './components/LanguageToggle';
import { OutputModeToggle } from './components/OutputModeToggle';
import { OutputPanel } from './components/OutputPanel';
import { RocketEngineAudio } from './components/RocketEngineAudio';
import { RocketScene } from './components/RocketScene';
import { ValidationPanel } from './components/ValidationPanel';
import { useSimulatorStore } from './store/simulatorStore';

export function App() {
  const language = useSimulatorStore((state) => state.language);
  const t = translations[language];
  const [outputCompact, setOutputCompact] = useState(true);

  return (
    <>
      <RocketEngineAudio />
      <main className="grid min-h-screen grid-cols-[minmax(0,1fr)_620px] bg-[#0f1418] text-[#e8edf2] max-[1100px]:grid-cols-1">
        <section className="min-w-0 p-4">
          <div className="h-[calc(100vh-32px)] overflow-hidden rounded-lg border border-[#26313a] bg-[#151c22] max-[1100px]:h-[52vh]">
            <RocketScene />
          </div>
        </section>

        <aside className="grid max-h-screen grid-rows-[auto_minmax(0,1fr)] gap-4 overflow-hidden border-l border-[#26313a] bg-[#12181e] p-5 max-[1100px]:max-h-none max-[1100px]:overflow-visible max-[1100px]:border-l-0 max-[1100px]:border-t">
          <header className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="m-0 text-2xl font-bold">{t.appTitle}</h1>
              <p className="mt-1.5 text-wrap text-[#9fb0bf]">{t.appSubtitle}</p>
            </div>
            <LanguageToggle />
          </header>

          <div className="grid min-h-0 grid-cols-2 gap-4 max-[700px]:grid-cols-1">
            <section className="min-h-0 overflow-y-auto rounded-lg border border-[#26313a] bg-[#182029] p-4">
              <h2 className="mb-2.5 text-[15px] font-semibold">{t.inputs}</h2>
              <InputPanel />
            </section>

            <div className="grid min-h-0 grid-rows-[minmax(0,1fr)_auto_minmax(150px,0.48fr)] gap-4">
              <section className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)] rounded-lg border border-[#34505f] bg-[#18242c] p-4">
                <div className="mb-2.5 flex items-center justify-between gap-3">
                  <h2 className="text-[15px] font-semibold">{t.keyOutputs}</h2>
                  <OutputModeToggle
                    compact={outputCompact}
                    onCompactChange={setOutputCompact}
                  />
                </div>
                <div className="min-h-0 overflow-y-auto">
                  <OutputPanel compact={outputCompact} />
                </div>
              </section>

              <EngineControlPanel />

              <section className="min-h-0 overflow-y-auto rounded-lg border border-[#26313a] bg-[#182029] p-4">
                <h2 className="mb-2.5 text-[15px] font-semibold">
                  {t.validation}
                </h2>
                <ValidationPanel />
              </section>
            </div>
          </div>
        </aside>
      </main>
    </>
  );
}
