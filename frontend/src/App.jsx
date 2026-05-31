import { useState } from 'react'
import Home from './pages/Home'
import RecruiterView from './pages/RecruiterView'
import JobSeekerView from './pages/JobSeekerView'
import AuthPage from './pages/AuthPage'
import ErrorBoundary from './components/ErrorBoundary'

export default function App() {
  const [user, setUser]   = useState(null)   // null = not logged in
  const [page, setPage]   = useState('home')

  /* Called by AuthPage on successful login/signup */
  function handleAuth({ role, name, email }) {
    setUser({ name, email, role })
    setPage(role === 'recruiter' ? 'recruiter' : 'seeker')
  }

  function handleSignOut() {
    setUser(null)
    setPage('home')
  }

  /* Show auth gate when not logged in */
  if (!user) {
    return <AuthPage onAuth={handleAuth} />
  }

  return (
    <>
      <nav className="nav">
        <div className="nav-inner">
          <button className="nav-logo" onClick={() => setPage('home')}>
            <div className="nav-logo-mark">T</div>
            <span>Talentoid</span>
          </button>

          {page !== 'home' && (
            <>
              <div className="nav-divider" />
              <div className="nav-actions">
                <button
                  id="nav-recruiter-btn"
                  className={`btn ${page === 'recruiter' ? 'btn-primary' : 'btn-ghost'} btn-sm`}
                  onClick={() => setPage('recruiter')}
                >
                  Recruiter View
                </button>
                <button
                  id="nav-seeker-btn"
                  className={`btn ${page === 'seeker' ? 'btn-primary' : 'btn-ghost'} btn-sm`}
                  onClick={() => setPage('seeker')}
                >
                  Candidate View
                </button>
              </div>
            </>
          )}

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* User pill */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%',
                background: 'var(--ln-blue)', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.75rem', fontWeight: 700, flexShrink: 0,
              }}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--ln-text-2)', display: 'none' }}
                    className="nav-username">
                {user.name.split(' ')[0]}
              </span>
              <span className="badge badge-blue" style={{ fontSize: '0.68rem' }}>
                {user.role === 'recruiter' ? 'Recruiter' : 'Candidate'}
              </span>
            </div>

            <button
              id="nav-signout-btn"
              className="btn btn-ghost btn-sm"
              onClick={handleSignOut}
            >
              Sign out
            </button>
          </div>
        </div>
      </nav>

      {/* ErrorBoundary resets when page changes via key prop */}
      <ErrorBoundary key={page}>
        {page === 'home'      && <Home onSelect={setPage} />}
        {page === 'recruiter' && <RecruiterView />}
        {page === 'seeker'    && <JobSeekerView />}
      </ErrorBoundary>
    </>
  )
}
