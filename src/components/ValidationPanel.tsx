import { translations } from '../i18n/translations'
import { validateRocketInputs } from '../simulation/validation'
import { useSimulatorStore } from '../store/simulatorStore'

export function ValidationPanel() {
  const language = useSimulatorStore((state) => state.language)
  const inputs = useSimulatorStore((state) => state.inputs)
  const messages = validateRocketInputs(inputs)
  const t = translations[language]

  if (messages.length === 0) {
    return (
      <div className="rounded-md border border-[#2f604a] bg-[#102018] p-3">
        <p className="m-0 text-sm text-[#9ee6bd]">{t.validationOk}</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {messages.map((message) => (
        <div
          key={message.id}
          className={
            message.level === 'error'
              ? 'rounded-md border border-[#7f2f2f] bg-[#241313] p-3'
              : 'rounded-md border border-[#7a5f24] bg-[#241d10] p-3'
          }
        >
          <p
            className={
              message.level === 'error'
                ? 'm-0 text-sm text-[#ffaaa0]'
                : 'm-0 text-sm text-[#ffd98a]'
            }
          >
            {t.validationMessages[message.messageKey]}
          </p>
        </div>
      ))}
    </div>
  )
}
