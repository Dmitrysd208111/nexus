import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQueryClient } from '@tanstack/react-query'
import { Check, Database, FlaskConical, Laptop, Moon, Sun } from 'lucide-react'
import { usePreferences } from '../features/preferences/store'
import { PageHeading } from '../shared/PageHeading'
import { Avatar } from '../shared/Avatar'
import { useToast } from '../shared/Toast'
import { simulateFailure } from '../services/api'
import { workspaceKey } from '../hooks/useWorkspace'
import { useNavigate } from 'react-router-dom'
const settingsSchema = z.object({
  name: z.string().trim().min(2, 'Enter your name').max(80),
  email: z.string().email('Enter a valid email'),
  workspace: z.string().trim().min(2, 'Enter a workspace name').max(60),
})
export default function SettingsPage() {
  const preferences = usePreferences()
  const toast = useToast()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [saved, setSaved] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: preferences.name,
      email: preferences.email,
      workspace: preferences.workspace,
    },
  })
  return (
    <>
      <PageHeading
        title="Settings"
        eyebrow="MAKE YOURSELF AT HOME"
        description="A workspace that works the way you do."
      />
      <div className="settings-layout">
        <div className="settings-nav">
          <a href="#profile">Profile & workspace</a>
          <a href="#appearance">Appearance</a>
          <a href="#preferences">Preferences</a>
          <a href="#demo">Demo information</a>
        </div>
        <div className="settings-sections">
          <section className="panel settings-panel" id="profile">
            <div className="panel-heading">
              <div>
                <h2>Profile & workspace</h2>
                <p>Your details across this local demo</p>
              </div>
            </div>
            <form
              noValidate
              onSubmit={handleSubmit((values) => {
                preferences.set(values)
                setSaved(true)
                toast('Profile and workspace saved')
                setTimeout(() => setSaved(false), 2500)
              })}
            >
              <div className="settings-avatar">
                <Avatar name={preferences.name} size="large" />
                <div>
                  <strong>{preferences.name}</strong>
                  <span>Workspace administrator</span>
                </div>
              </div>
              <div className="form-grid">
                <label className="field">
                  Full name
                  <input {...register('name')} />
                  {errors.name && (
                    <span className="field-error" role="alert">
                      {errors.name.message}
                    </span>
                  )}
                </label>
                <label className="field">
                  Email address
                  <input type="email" {...register('email')} />
                  {errors.email && (
                    <span className="field-error" role="alert">
                      {errors.email.message}
                    </span>
                  )}
                </label>
                <label className="field full">
                  Workspace name
                  <input {...register('workspace')} />
                  {errors.workspace && (
                    <span className="field-error" role="alert">
                      {errors.workspace.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="settings-footer">
                <span>Changes are stored on this device.</span>
                <button className="button primary" disabled={!isDirty && !saved}>
                  {saved ? <Check size={15} /> : null}
                  {saved ? 'Saved' : 'Save changes'}
                </button>
              </div>
            </form>
          </section>
          <section className="panel settings-panel" id="appearance">
            <div className="panel-heading">
              <div>
                <h2>Appearance</h2>
                <p>Choose the view that keeps you focused</p>
              </div>
            </div>
            <div className="theme-options">
              {(['light', 'dark'] as const).map((theme) => (
                <button
                  key={theme}
                  aria-pressed={preferences.theme === theme}
                  className={`theme-option ${preferences.theme === theme ? 'active' : ''}`}
                  onClick={() => preferences.set({ theme })}
                >
                  <div className={`theme-preview preview-${theme}`}>
                    <div />
                    <div>
                      <i />
                      <i />
                      <i />
                    </div>
                  </div>
                  <span>
                    {theme === 'light' ? <Sun size={16} /> : <Moon size={16} />}{' '}
                    {theme === 'light' ? 'Light mode' : 'Dark mode'}
                    {preferences.theme === theme && <Check size={16} />}
                  </span>
                </button>
              ))}
            </div>
          </section>
          <section className="panel settings-panel" id="preferences">
            <div className="panel-heading">
              <div>
                <h2>Preferences</h2>
                <p>The little things that make a difference</p>
              </div>
            </div>
            <div className="preference-row">
              <div>
                <strong>Compact tables</strong>
                <p>Fit more records into your workspace.</p>
              </div>
              <button
                role="switch"
                aria-label="Compact tables"
                aria-checked={preferences.compact}
                className={`switch ${preferences.compact ? 'on' : ''}`}
                onClick={() => preferences.set({ compact: !preferences.compact })}
              >
                <span />
              </button>
            </div>
            <div className="preference-row">
              <div>
                <strong>In-app business digest</strong>
                <p>Show pending orders and low stock in your notification panel.</p>
              </div>
              <button
                role="switch"
                aria-label="In-app business digest"
                aria-checked={preferences.digest}
                className={`switch ${preferences.digest ? 'on' : ''}`}
                onClick={() => preferences.set({ digest: !preferences.digest })}
              >
                <span />
              </button>
            </div>
          </section>
          <section className="panel settings-panel" id="demo">
            <div className="panel-heading">
              <div>
                <h2>Built for exploration</h2>
                <p>A transparent, self-contained portfolio demo</p>
              </div>
              <FlaskConical size={20} />
            </div>
            <div className="demo-facts">
              <p>
                <Database size={18} />
                <span>
                  <strong>Local persistence</strong> · Records live in IndexedDB in this browser.
                  Clear browser storage to start with a fresh dataset.
                </span>
              </p>
              <p>
                <Laptop size={18} />
                <span>
                  <strong>Demo authentication</strong> · No server, passwords, payment processing,
                  email delivery, or real access control.
                </span>
              </p>
            </div>
            <button
              className="button secondary"
              onClick={() => {
                simulateFailure()
                queryClient.removeQueries({ queryKey: workspaceKey })
                navigate('/overview')
                toast('A one-time API error is enabled. Use “Try again” to recover.')
              }}
            >
              Test error & retry experience
            </button>
          </section>
        </div>
      </div>
    </>
  )
}
