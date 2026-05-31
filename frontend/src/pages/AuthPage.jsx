import { useState } from 'react'
import { IconBriefcase, IconUser } from '../components/Icons'

/* ── tiny inline SVG icons ─────────────────────────────────────────── */
function IconEye({ open }) {
  return open ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  )
}

/* ── Role selector pill ─────────────────────────────────────────────── */
function RolePill({ id, icon, label, sub, active, onClick }) {
  return (
    <button
      id={id}
      type="button"
      onClick={onClick}
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px',
        padding: '14px 10px',
        border: `1.5px solid ${active ? 'var(--ln-blue)' : 'var(--ln-border-dark)'}`,
        borderRadius: 'var(--radius-md)',
        background: active ? 'var(--ln-blue-light)' : 'var(--ln-white)',
        cursor: 'pointer',
        transition: 'all var(--transition)',
        fontFamily: 'var(--font)',
      }}
    >
      <span style={{ color: active ? 'var(--ln-blue)' : 'var(--ln-text-muted)' }}>{icon}</span>
      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: active ? 'var(--ln-blue)' : 'var(--ln-text)' }}>
        {label}
      </span>
      <span style={{ fontSize: '0.72rem', color: active ? 'var(--ln-blue-dark)' : 'var(--ln-text-muted)', lineHeight: 1.4, textAlign: 'center' }}>
        {sub}
      </span>
    </button>
  )
}

/* ── Main component ─────────────────────────────────────────────────── */
export default function AuthPage({ onAuth }) {
  const [mode, setMode]         = useState('login')   // 'login' | 'signup'
  const [role, setRole]         = useState('recruiter') // 'recruiter' | 'seeker'
  const [showPw, setShowPw]     = useState(false)
  const [form, setForm]         = useState({ name: '', email: '', password: '' })
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const isSignup = mode === 'signup'

  function set(field) {
    return (e) => {
      setForm(f => ({ ...f, [field]: e.target.value }))
      setError('')
    }
  }

  function validate() {
    if (isSignup && !form.name.trim())      return 'Full name is required.'
    if (!form.email.trim())                  return 'Email is required.'
    if (!/\S+@\S+\.\S+/.test(form.email))   return 'Enter a valid email address.'
    if (!form.password)                      return 'Password is required.'
    if (isSignup && form.password.length < 6) return 'Password must be at least 6 characters.'
    return ''
  }

  function handleSubmit(e) {
    e.preventDefault()
    const err = validate()
    if (err) { setError(err); return }

    setLoading(true)
    // Simulate a brief auth delay, then pass role + mode to parent
    setTimeout(() => {
      setLoading(false)
      onAuth({ role, mode, email: form.email, name: form.name || form.email.split('@')[0] })
    }, 600)
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--ln-bg)', display: 'flex', flexDirection: 'column' }}>

      {/* ── Minimal nav ──────────────────────────────────────────────── */}
      <nav className="nav">
        <div className="nav-inner">
          <div className="nav-logo" style={{ pointerEvents: 'none' }}>
            <div className="nav-logo-mark">T</div>
            <span>Talentoid</span>
          </div>
        </div>
      </nav>

      {/* ── Card ─────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 16px' }}>
        <div
          className="card animate-in"
          style={{ width: '100%', maxWidth: '420px', overflow: 'visible' }}
        >
          {/* Header */}
          <div style={{ padding: '28px 28px 0' }}>
            <h2 style={{ marginBottom: '4px', fontSize: '1.3rem' }}>
              {isSignup ? 'Create your account' : 'Welcome back'}
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--ln-text-muted)', marginBottom: '24px' }}>
              {isSignup
                ? 'Join Talentoid and streamline your hiring or job search.'
                : 'Sign in to continue to Talentoid.'}
            </p>

            {/* Role selector */}
            <div style={{ marginBottom: '8px' }}>
              <label className="form-label">I am a</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <RolePill
                  id="role-recruiter"
                  icon={<IconBriefcase />}
                  label="Recruiter"
                  sub="Rank & shortlist candidates"
                  active={role === 'recruiter'}
                  onClick={() => setRole('recruiter')}
                />
                <RolePill
                  id="role-seeker"
                  icon={<IconUser />}
                  label="Job Seeker"
                  sub="Find matching roles"
                  active={role === 'seeker'}
                  onClick={() => setRole('seeker')}
                />
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="divider" style={{ margin: '20px 0 0' }} />

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate style={{ padding: '20px 28px 28px' }}>

            {isSignup && (
              <div style={{ marginBottom: '14px' }}>
                <label htmlFor="auth-name" className="form-label">Full name</label>
                <input
                  id="auth-name"
                  className="input"
                  type="text"
                  placeholder="Jane Smith"
                  value={form.name}
                  onChange={set('name')}
                  autoComplete="name"
                />
              </div>
            )}

            <div style={{ marginBottom: '14px' }}>
              <label htmlFor="auth-email" className="form-label">Email address</label>
              <input
                id="auth-email"
                className="input"
                type="email"
                placeholder="jane@company.com"
                value={form.email}
                onChange={set('email')}
                autoComplete="email"
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label htmlFor="auth-password" className="form-label" style={{ margin: 0 }}>Password</label>
                {!isSignup && (
                  <button
                    type="button"
                    id="auth-forgot"
                    style={{ background: 'none', border: 'none', fontSize: '0.78rem', color: 'var(--ln-blue)', cursor: 'pointer', padding: 0, fontFamily: 'var(--font)' }}
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  id="auth-password"
                  className="input"
                  type={showPw ? 'text' : 'password'}
                  placeholder={isSignup ? 'Min. 6 characters' : 'Your password'}
                  value={form.password}
                  onChange={set('password')}
                  autoComplete={isSignup ? 'new-password' : 'current-password'}
                  style={{ paddingRight: '40px' }}
                />
                <button
                  type="button"
                  id="auth-toggle-pw"
                  onClick={() => setShowPw(v => !v)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ln-text-muted)',
                    display: 'flex', padding: 0,
                  }}
                  tabIndex={-1}
                >
                  <IconEye open={showPw} />
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="alert alert-error animate-fade" style={{ marginBottom: '16px', fontSize: '0.82rem' }}>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              id="auth-submit"
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', height: '40px', fontSize: '0.9rem' }}
            >
              {loading
                ? <span className="spinner" />
                : isSignup ? 'Create account' : 'Sign in'}
            </button>

            {/* Toggle mode */}
            <p style={{ textAlign: 'center', marginTop: '18px', fontSize: '0.85rem', color: 'var(--ln-text-muted)' }}>
              {isSignup ? 'Already have an account? ' : "Don't have an account? "}
              <button
                id="auth-mode-toggle"
                type="button"
                onClick={() => { setMode(isSignup ? 'login' : 'signup'); setError('') }}
                style={{ background: 'none', border: 'none', color: 'var(--ln-blue)', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)', fontSize: '0.85rem', padding: 0 }}
              >
                {isSignup ? 'Sign in' : 'Sign up'}
              </button>
            </p>
          </form>
        </div>
      </div>

      {/* ── Footer note ──────────────────────────────────────────────── */}
      <footer style={{ textAlign: 'center', padding: '16px', fontSize: '0.75rem', color: 'var(--ln-text-muted)', borderTop: '1px solid var(--ln-border)', background: 'var(--ln-white)' }}>
        Talentoid &mdash; AI-powered resume intelligence &bull; Demo / Hackathon build
      </footer>
    </main>
  )
}
