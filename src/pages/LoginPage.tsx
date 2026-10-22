import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowRight, BarChart3, Check, Layers3, LoaderCircle, ShieldCheck } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { usePreferences } from '../features/preferences/store'
const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(4, 'Enter at least 4 characters'),
})
export default function LoginPage() {
  const [pending, setPending] = useState(false)
  const set = usePreferences((s) => s.set)
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: 'alex@nexus.demo', password: 'demo1234' },
  })
  async function enter() {
    setPending(true)
    await new Promise((resolve) => setTimeout(resolve, 450))
    set({ session: true })
    navigate('/overview', { replace: true })
  }
  return (
    <div className="login-page">
      <section className="login-story">
        <Link className="brand" to="/overview">
          <span className="brand-mark">
            <Layers3 size={23} />
          </span>
          NEXUS<span className="brand-period">.</span>
        </Link>
        <div className="login-story-content">
          <span className="eyebrow">CLARITY STARTS HERE</span>
          <h1>
            Your business.
            <br />
            The bigger picture.
          </h1>
          <p>Connect the dots between your revenue, your customers, and what comes next.</p>
          <div className="login-mini-chart">
            <div>
              <span>Business momentum</span>
              <BarChart3 size={21} />
            </div>
            <svg viewBox="0 0 400 140" role="img" aria-label="Illustrative upward revenue trend">
              <defs>
                <linearGradient id="login-gradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0" stopColor="#a89bff" stopOpacity=".4" />
                  <stop offset="1" stopColor="#a89bff" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M0 110 C25 110 25 80 50 85 S80 125 105 80 S140 100 160 60 S190 90 220 55 S260 75 290 30 S340 55 365 15 L400 10 V140 H0Z"
                fill="url(#login-gradient)"
              />
              <path
                d="M0 110 C25 110 25 80 50 85 S80 125 105 80 S140 100 160 60 S190 90 220 55 S260 75 290 30 S340 55 365 15 L400 10"
                fill="none"
                stroke="#b7aaff"
                strokeWidth="3"
              />
            </svg>
            <small>Illustrative chart · your actual data awaits inside</small>
          </div>
        </div>
        <span className="login-copyright">
          © {new Date().getFullYear()} NEXUS. A portfolio experience.
        </span>
      </section>
      <section className="login-form-section">
        <div className="login-form-wrap">
          <span className="login-icon">
            <ShieldCheck size={28} />
          </span>
          <h2>Welcome to your workspace</h2>
          <p>Explore a fully interactive business analytics platform.</p>
          <div className="demo-login-note">
            <strong>Take a look around</strong>
            <span>
              Demo credentials are already filled in. Any valid email and a password of 4+
              characters will work.
            </span>
          </div>
          <form
            noValidate
            onSubmit={handleSubmit(() => {
              void enter()
            })}
          >
            <label className="field">
              Email address
              <input type="email" autoComplete="username" {...register('email')} />
              {errors.email && (
                <span role="alert" className="field-error">
                  {errors.email.message}
                </span>
              )}
            </label>
            <label className="field">
              Password
              <input type="password" autoComplete="current-password" {...register('password')} />
              {errors.password && (
                <span role="alert" className="field-error">
                  {errors.password.message}
                </span>
              )}
            </label>
            <button className="button primary login-submit" disabled={pending}>
              {pending ? <LoaderCircle size={18} className="spin" /> : null}
              {pending ? 'Opening workspace…' : 'Enter demo workspace'}
              <ArrowRight size={17} />
            </button>
          </form>
          <div className="login-feature-list">
            <span>
              <Check size={14} />
              Real CRUD workflows
            </span>
            <span>
              <Check size={14} />
              Persistent local data
            </span>
            <span>
              <Check size={14} />
              No account needed
            </span>
          </div>
          <p className="login-disclaimer">
            This is demo authentication for a portfolio project. It provides no real security. All
            data stays in your browser.
          </p>
        </div>
      </section>
    </div>
  )
}
