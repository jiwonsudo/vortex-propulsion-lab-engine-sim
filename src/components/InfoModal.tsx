import { useEffect, useId } from 'react'

type InfoModalProps = {
  open: boolean
  title: string
  closeLabel: string
  sections: readonly {
    title: string
    body: readonly string[]
  }[]
  onClose: () => void
}

export function InfoModal({
  open,
  title,
  closeLabel,
  sections,
  onClose,
}: InfoModalProps) {
  const titleId = useId()

  useEffect(() => {
    if (!open) {
      return
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose, open])

  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <button
        type="button"
        className="absolute inset-0 cursor-default bg-[#05080a]/70 backdrop-blur-sm"
        aria-label={closeLabel}
        onClick={onClose}
      />
      <div
        className="relative max-h-[82vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-[#34505f] bg-[#12181e] p-5 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 id={titleId} className="m-0 text-lg font-bold">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-[#33414d] bg-[#0f1418] font-mono text-sm font-bold text-[#9fb0bf] hover:border-[#6ab7d6] hover:text-[#e8edf2]"
            aria-label={closeLabel}
          >
            X
          </button>
        </div>

        <div className="space-y-4">
          {sections.map((section) => (
            <section key={section.title}>
              <h3 className="mb-2 text-sm font-semibold text-[#c7d4dd]">
                {section.title}
              </h3>
              <div className="space-y-2 text-sm leading-6 text-[#9fb0bf]">
                {section.body.map((paragraph) => (
                  <p key={paragraph} className="m-0">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
