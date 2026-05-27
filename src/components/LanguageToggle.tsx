import type { Language } from '../i18n/translations'
import { translations } from '../i18n/translations'
import { useSimulatorStore } from '../store/simulatorStore'

export function LanguageToggle() {
  const language = useSimulatorStore((state) => state.language)
  const setLanguage = useSimulatorStore((state) => state.setLanguage)
  const t = translations[language]

  const options: Language[] = ['en', 'ko']

  return (
    <div className="flex shrink-0 items-center gap-2" aria-label={t.language}>
      <span className="whitespace-nowrap text-xs font-medium text-[#9fb0bf]">
        {t.language}
      </span>
      <div className="grid w-[84px] grid-cols-2 rounded-md border border-[#26313a] bg-[#0f1418] p-1">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => {
              setLanguage(option)
            }}
            className={
              option === language
                ? 'h-7 rounded bg-[#6ab7d6] px-1 text-xs font-semibold text-[#061018]'
                : 'h-7 rounded px-1 text-xs font-medium text-[#9fb0bf] hover:text-[#e8edf2]'
            }
            aria-label={option === 'en' ? t.english : t.korean}
          >
            {option.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  )
}
