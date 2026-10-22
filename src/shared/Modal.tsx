import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
export function Modal({
  title,
  description,
  children,
  onClose,
  wide = false,
  drawer = false,
}: {
  title: string
  description?: string
  children: ReactNode
  onClose: () => void
  wide?: boolean
  drawer?: boolean
}) {
  const panel = useRef<HTMLDivElement>(null)
  const close = useRef(onClose)
  useEffect(() => {
    close.current = onClose
  }, [onClose])
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    const oldOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const first = panel.current?.querySelector<HTMLElement>('input, select, textarea, button')
    first?.focus()
    const keydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close.current()
      if (e.key !== 'Tab') return
      const focusable = Array.from(
        panel.current?.querySelectorAll<HTMLElement>(
          'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]',
        ) ?? [],
      ).filter((el) => el.getClientRects().length > 0)
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last?.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first?.focus()
      }
    }
    document.addEventListener('keydown', keydown)
    return () => {
      document.body.style.overflow = oldOverflow
      document.removeEventListener('keydown', keydown)
      previous?.focus()
    }
  }, [])
  return createPortal(
    <div
      className={`modal-backdrop ${drawer ? 'drawer-backdrop' : ''}`}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        aria-describedby={description ? 'dialog-description' : undefined}
        className={`modal ${wide ? 'wide' : ''} ${drawer ? 'drawer' : ''}`}
      >
        <div className="modal-heading">
          <div>
            <div className="eyebrow">NEXUS WORKSPACE</div>
            <h2 id="dialog-title">{title}</h2>
            {description && <p id="dialog-description">{description}</p>}
          </div>
          <button className="icon-button" aria-label="Close dialog" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  )
}
