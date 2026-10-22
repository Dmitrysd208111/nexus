import { create } from 'zustand'
import { persist } from 'zustand/middleware'
interface Preferences {
  theme: 'light' | 'dark'
  name: string
  email: string
  workspace: string
  digest: boolean
  compact: boolean
  session: boolean
  set: (values: Partial<Omit<Preferences, 'set'>>) => void
}
export const usePreferences = create<Preferences>()(
  persist(
    (set) => ({
      theme: 'light',
      name: 'Alex Morgan',
      email: 'alex@nexus.demo',
      workspace: 'Acme Inc.',
      digest: true,
      compact: false,
      session: true,
      set: (values) => set(values),
    }),
    { name: 'nexus-preferences-v1' },
  ),
)
