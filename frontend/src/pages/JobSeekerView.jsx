import { useState } from 'react'
import axios from 'axios'
import FileUpload from '../components/FileUpload'
import RoleCard from '../components/RoleCard'

export default function JobSeekerView() {
  const [resume, setResume] = useState([])
  const [results, setResults] = useState(null)
  const [candidate, setCandidate] = useState(null)
  const [resumeSkills, setResumeSkills] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (resume.length === 0) return setError('Please upload your resume.')
    setError(''); setLoading(true); setResults(null)

    try {
      const form = new FormData()
      form.append('resume', resume[0])
      form.append('top_n', '8')
      const { data } = await axios.post('/api/suggest-roles', form)
      setResults(data.recommendations)
      setCandidate(data.candidate)
      setResumeSkills(data.resume_skills || [])
    } catch (err) {
      const detail = err.response?.data?.detail
      const message = Array.isArray(detail)
        ? detail.map(d => d.msg || JSON.stringify(d)).join(', ')
        : (typeof detail === 'string' ? detail : 'Server error. Ensure the backend server is running on port 8000.')
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const categories = results ? ['all', ...new Set(results.map(r => r.category))] : []
  const filtered = results
    ? (filter === 'all' ? results : results.filter(r => r.category === filter))
    : []

  const initials = candidate?.name
    ? candidate.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
    : 'U'

  return (
    <div style={{ background: 'var(--ln-bg)', minHeight: 'calc(100vh - 52px)' }}>
      <div className="page-layout">
        {/* Page header */}
        <div className="animate-in">
          <h2 style={{ marginBottom: '4px' }}>Career Match Analysis</h2>
          <p style={{ fontSize: '0.875rem' }}>
            Upload your resume to discover job roles that align with your skills and experience.
          </p>
        </div>

        {/* Upload card (only show before results) */}
        {!results && (
          <div className="card animate-in delay-1" style={{ maxWidth: '600px' }}>
            <div className="card-header">
              <h3 style={{ margin: 0 }}>Upload Your Resume</h3>
            </div>
            <div className="card-body">
              <FileUpload onFiles={setResume} files={resume} multiple={false} />
              <p className="form-hint" style={{ marginTop: '12px' }}>
                Supported formats: PDF, DOCX. Your resume is processed locally and not stored.
              </p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && <div className="alert alert-error animate-in">{error}</div>}

        {/* Submit */}
        {!results && (
          <button
            id="seeker-submit-btn"
            className="btn btn-primary btn-lg"
            disabled={loading}
            onClick={handleSubmit}
            style={{ maxWidth: '600px', width: '100%' }}
          >
            {loading ? <><span className="spinner" /> Analyzing your resume...</> : 'Analyze my resume'}
          </button>
        )}

        {/* Skeleton */}
        {loading && (
          <div>
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton" style={{ height: '90px', marginBottom: '12px' }} />
            ))}
          </div>
        )}

        {/* Results */}
        {results && !loading && (
          <div className="animate-fade">
            {/* Candidate profile */}
            <div className="card" style={{ marginBottom: '16px' }}>
              <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{
                  width: '52px', height: '52px', borderRadius: '50%', flexShrink: 0,
                  background: 'var(--ln-blue)', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '1.1rem', fontWeight: 700, color: '#fff',
                }}>
                  {initials}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '1.05rem', marginBottom: '3px' }}>
                    {candidate?.name || 'Your Profile'}
                  </div>
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    {candidate?.email && (
                      <a href={`mailto:${candidate.email}`} style={{ fontSize: '0.8rem', color: 'var(--ln-text-muted)' }}>
                        {candidate.email}
                      </a>
                    )}
                    {candidate?.years_experience > 0 && (
                      <span style={{ fontSize: '0.8rem', color: 'var(--ln-text-3)' }}>
                        {candidate.years_experience} years of experience
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ textAlign: 'center', padding: '0 16px', borderLeft: '1px solid var(--ln-border)' }}>
                  <div className="stat-value" style={{ fontSize: '1.5rem' }}>{resumeSkills.length}</div>
                  <div className="stat-label">skills detected</div>
                </div>

                <button className="btn btn-ghost btn-sm" onClick={() => { setResults(null); setResume([]) }}>
                  Upload new resume
                </button>
              </div>

              {resumeSkills.length > 0 && (
                <div style={{ padding: '0 24px 20px' }}>
                  <div className="section-label">Detected Skills</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    {resumeSkills.slice(0, 30).map(s => (
                      <span key={s} className="skill-pill skill-neutral">{s}</span>
                    ))}
                    {resumeSkills.length > 30 && (
                      <span className="skill-pill skill-neutral">+{resumeSkills.length - 30} more</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="grid-3" style={{ marginBottom: '16px' }}>
              {[
                { label: 'Best match', value: `${results[0]?.match_score}%` },
                { label: 'Strong matches', value: results.filter(r => r.match_score >= 70).length },
                { label: 'Roles analyzed', value: results.length },
              ].map(({ label, value }) => (
                <div key={label} className="stat-box">
                  <div className="stat-value">{value}</div>
                  <div className="stat-label">{label}</div>
                </div>
              ))}
            </div>

            {/* Category filter */}
            {categories.length > 2 && (
              <div style={{ marginBottom: '16px', overflowX: 'auto', paddingBottom: '4px' }}>
                <div style={{ display: 'flex', gap: '6px', width: 'max-content' }}>
                  {categories.map(cat => (
                    <button
                      key={cat}
                      className={`btn btn-sm ${filter === cat ? 'btn-primary' : 'btn-ghost'}`}
                      onClick={() => setFilter(cat)}
                    >
                      {cat === 'all' ? 'All roles' : cat}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div style={{ marginBottom: '8px' }}>
              <h3 style={{ margin: 0 }}>Recommended Roles</h3>
            </div>
            {filtered.map((role, i) => <RoleCard key={role.role_id} role={role} index={i} />)}
          </div>
        )}
      </div>
    </div>
  )
}
