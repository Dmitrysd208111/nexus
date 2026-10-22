import { useState } from 'react'
import { differenceInCalendarDays, format, parseISO } from 'date-fns'
import { CalendarDays, ChevronDown } from 'lucide-react'
import { useDateFilter } from '../features/analytics/filterStore'
import { Modal } from './Modal'
export function DateFilter() {
  const { period, range, select, custom } = useDateFilter()
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(range)
  const valid =
    draft.from &&
    draft.to &&
    draft.from <= draft.to &&
    differenceInCalendarDays(parseISO(draft.to), parseISO(draft.from)) < 366
  return (
    <>
      <div className="date-filter">
        <div className="segmented" aria-label="Date range">
          {[7, 30, 90].map((days) => (
            <button
              key={days}
              aria-pressed={period === days}
              className={period === days ? 'selected' : ''}
              onClick={() => select(days)}
            >
              {days} days
            </button>
          ))}
        </div>
        <button
          className="button secondary date-button"
          onClick={() => {
            setDraft(range)
            setOpen(true)
          }}
        >
          <CalendarDays size={16} />
          <span>
            {format(parseISO(range.from), 'MMM d')} – {format(parseISO(range.to), 'MMM d, yyyy')}
          </span>
          <ChevronDown size={14} />
        </button>
      </div>
      {open && (
        <Modal
          title="Choose a date range"
          description="Compare any period of up to 366 days."
          onClose={() => setOpen(false)}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (valid) {
                custom(draft)
                setOpen(false)
              }
            }}
          >
            <div className="form-grid">
              <label className="field">
                Start date
                <input
                  type="date"
                  required
                  value={draft.from}
                  onChange={(e) => setDraft({ ...draft, from: e.target.value })}
                />
              </label>
              <label className="field">
                End date
                <input
                  type="date"
                  required
                  min={draft.from}
                  value={draft.to}
                  onChange={(e) => setDraft({ ...draft, to: e.target.value })}
                />
              </label>
            </div>
            {!valid && (
              <p className="field-error">Select a valid range of no more than 366 days.</p>
            )}
            <div className="modal-footer">
              <button type="button" className="button secondary" onClick={() => setOpen(false)}>
                Cancel
              </button>
              <button disabled={!valid} className="button primary">
                Apply range
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  )
}
