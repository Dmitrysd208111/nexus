import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { CheckCircle2, CircleAlert, X } from 'lucide-react'
const ToastContext = createContext<(message: string, error?: boolean) => void>(() => undefined)
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<{ id: number; message: string; error: boolean }[]>([])
  const notify = useCallback((message: string, error = false) => {
    const id = Date.now() + Math.random()
    setToasts((current) => [...current, { id, message, error }])
    setTimeout(() => setToasts((current) => current.filter((t) => t.id !== id)), 5000)
  }, [])
  return (
    <ToastContext.Provider value={notify}>
      {children}
      <div className="toast-stack" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.error ? 'error' : ''}`}>
            {t.error ? <CircleAlert size={19} /> : <CheckCircle2 size={19} />}
            <span>{t.message}</span>
            <button
              className="icon-button"
              onClick={() => setToasts((current) => current.filter((item) => item.id !== t.id))}
              aria-label="Dismiss notification"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
// Hook and provider share this small context module.
// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => useContext(ToastContext)
