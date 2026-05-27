import { translations } from '../i18n/translations'
import { useSimulatorStore } from '../store/simulatorStore'

export function OutputModeToggle({
  compact,
  onCompactChange,
}: {
  compact: boolean
  onCompactChange: (compact: boolean) => void
}) {
  const language = useSimulatorStore((state) => state.language)
  const t = translations[language]

  return (
    <div className="grid grid-cols-2 rounded-md border border-[#26313a] bg-[#0f1418] p-1">
      <button
        type="button"
        onClick={() => {
          onCompactChange(true)
        }}
        className={
          compact
            ? 'rounded bg-[#6ab7d6] px-2 py-1 text-xs font-semibold text-[#061018]'
            : 'rounded px-2 py-1 text-xs font-medium text-[#9fb0bf] hover:text-[#e8edf2]'
        }
      >
        {t.compact}
      </button>
      <button
        type="button"
        onClick={() => {
          onCompactChange(false)
        }}
        className={
          compact
            ? 'rounded px-2 py-1 text-xs font-medium text-[#9fb0bf] hover:text-[#e8edf2]'
            : 'rounded bg-[#6ab7d6] px-2 py-1 text-xs font-semibold text-[#061018]'
        }
      >
        {t.detailed}
      </button>
    </div>
  )
}
