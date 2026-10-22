import { create } from 'zustand'
import { format, subDays } from 'date-fns'
import type { DateRange } from '../../types'
const today = () => format(new Date(), 'yyyy-MM-dd')
export const presetRange = (days: number): DateRange => ({
  from: format(subDays(new Date(), days - 1), 'yyyy-MM-dd'),
  to: today(),
})
export const useDateFilter = create<{
  period: number
  range: DateRange
  select: (days: number) => void
  custom: (range: DateRange) => void
}>((set) => ({
  period: 30,
  range: presetRange(30),
  select: (days) => set({ period: days, range: presetRange(days) }),
  custom: (range) => set({ period: 0, range }),
}))
