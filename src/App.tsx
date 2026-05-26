import { InputPanel } from './components/InputPanel'
import { RocketScene } from './components/RocketScene'

export function App() {
  return (
    <main className="grid min-h-screen grid-cols-[minmax(0,1fr)_380px] bg-[#0f1418] text-[#e8edf2] max-[900px]:grid-cols-1">
      <section className="min-w-0 p-4">
        <div className="h-[calc(100vh-32px)] overflow-hidden rounded-lg border border-[#26313a] bg-[#151c22] max-[900px]:h-[50vh]">
          <RocketScene />
        </div>
      </section>

      <aside className="flex flex-col gap-4 overflow-y-auto border-l border-[#26313a] bg-[#12181e] p-5 max-[900px]:border-l-0 max-[900px]:border-t">
        <header>
          <h1 className="m-0 text-2xl font-bold">Hybrid Rocket Lab</h1>
          <p className="mt-1.5 text-[#9fb0bf]">Formula-driven 3D simulator</p>
        </header>

        <section className="rounded-lg border border-[#26313a] bg-[#182029] p-4">
          <h2 className="mb-2.5 text-[15px] font-semibold">Inputs</h2>
          <InputPanel />
        </section>

        <section className="rounded-lg border border-[#26313a] bg-[#182029] p-4">
          <h2 className="mb-2.5 text-[15px] font-semibold">Formulas</h2>
          <p className="m-0 text-sm text-[#9fb0bf]">
            Formula editor will go here.
          </p>
        </section>

        <section className="rounded-lg border border-[#26313a] bg-[#182029] p-4">
          <h2 className="mb-2.5 text-[15px] font-semibold">Outputs</h2>
          <p className="m-0 text-sm text-[#9fb0bf]">
            Calculated results will go here.
          </p>
        </section>
      </aside>
    </main>
  )
}
