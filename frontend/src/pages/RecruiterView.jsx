import { useState } from 'react'
import axios from 'axios'
import FileUpload from '../components/FileUpload'
import ResultCard from '../components/ResultCard'

const SAMPLE_JD = `We are looking for a Software Engineer to join our backend engineering team.

Requirements:
- 2 or more years of experience in backend development
- Proficiency in Python, FastAPI or Django
- Experience with React or Vue.js
- Familiarity with Docker and Kubernetes
- Strong understanding of REST APIs and SQL databases such as PostgreSQL
- Experience with Git and CI/CD pipelines
- Agile development methodology experience

Preferred qualifications:
- Experience with AWS or GCP
- Knowledge of machine learning frameworks
- Open source contributions`

export default function RecruiterView() {
  const [jd, setJd] = useState('')
  const [resumes, setResumes] = useState([])
  const [results, setResults] = useState(null)
  const [jdSkills, setJdSkills] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sortBy, setSortBy] = useState('rank')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!jd.trim()) return setError('Please enter a job description.')
    if (resumes.length === 0) return setError('Please upload at least one resume.')
    setError(''); setLoading(true); setResults(null)

    try {
      const form = new FormData()
      form.append('job_description', jd)
      resumes.forEach(f => form.append('resumes', f))
      const { data } = await axios.post('/api/rank-resumes', form)
      setResults(data.results)
      setJdSkills(data.jd_skills || [])
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

  const sorted = results
    ? [...results].sort((a, b) =>
        sortBy === 'rank'  ? a.rank - b.rank :
        sortBy === 'score' ? b.total_score - a.total_score :
        b.matched_skills.length - a.matched_skills.length
      )
    : []

  return (
    <div style={{ background: 'var(--ln-bg)', minHeight: 'calc(100vh - 52px)' }}>
      <div className="page-layout">
        {/* Page header */}
        <div className="animate-in">
          <h2 style={{ marginBottom: '4px' }}>Resume Ranking</h2>
          <p style={{ fontSize: '0.875rem' }}>
            Upload a job description and candidate resumes to receive a ranked shortlist.
          </p>
        </div>

        {/* Input section */}
        <div className="grid-2" style={{ alignItems: 'start' }}>
          {/* JD input */}
          <div className="card animate-in delay-1">
            <div className="card-header">
              <h3 style={{ margin: 0 }}>Job Description</h3>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setJd(SAMPLE_JD)}>
                Load sample
              </button>
            </div>
            <div className="card-body">
              <textarea
                id="jd-input"
                className="textarea"
                placeholder="Paste the full job description here..."
                value={jd}
                onChange={e => setJd(e.target.value)}
                style={{ minHeight: '220px' }}
              />
              {jdSkills.length > 0 && (
                <div style={{ marginTop: '12px' }}>
                  <div className="section-label">Skills detected in job description</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    {jdSkills.slice(0, 20).map(s => (
                      <span key={s} className="skill-pill skill-neutral">{s}</span>
                    ))}
                    {jdSkills.length > 20 && (
                      <span className="skill-pill skill-neutral">+{jdSkills.length - 20} more</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Resume upload */}
          <div className="card animate-in delay-2">
            <div className="card-header">
              <h3 style={{ margin: 0 }}>Candidate Resumes</h3>
              {resumes.length > 0 && (
                <span className="badge badge-blue">{resumes.length} file{resumes.length > 1 ? 's' : ''} selected</span>
              )}
            </div>
            <div className="card-body">
              <FileUpload
                onFiles={setResumes}
                files={resumes}
                multiple={true}
              />
              <p className="form-hint" style={{ marginTop: '12px' }}>
                Upload up to 20 resume files at once. Supported formats: PDF, DOCX.
              </p>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="alert alert-error animate-in">{error}</div>
        )}

        {/* Submit */}
        <button
          id="rank-submit-btn"
          className="btn btn-primary btn-lg"
          disabled={loading}
          onClick={handleSubmit}
          style={{ width: '100%' }}
        >
          {loading ? <><span className="spinner" /> Analyzing resumes...</> : 'Rank candidates'}
        </button>

        {/* Skeleton loading */}
        {loading && (
          <div>
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton" style={{ height: '80px', marginBottom: '12px' }} />
            ))}
          </div>
        )}

        {/* Results */}
        {results && !loading && (
          <div className="animate-fade">
            {/* Summary stats */}
            <div className="grid-4" style={{ marginBottom: '16px' }}>
              {[
                { label: 'Total candidates', value: results.length },
                { label: 'Top match score', value: `${results[0]?.total_score}%` },
                { label: 'Average score', value: `${(results.reduce((a, r) => a + r.total_score, 0) / results.length).toFixed(1)}%` },
                { label: 'Recommended', value: results.filter(r => r.total_score >= 60).length },
              ].map(({ label, value }) => (
                <div key={label} className="stat-box">
                  <div className="stat-value">{value}</div>
                  <div className="stat-label">{label}</div>
                </div>
              ))}
            </div>

            {/* Results header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
              <h3 style={{ margin: 0 }}>
                {results.length} candidate{results.length > 1 ? 's' : ''} ranked
              </h3>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--ln-text-muted)' }}>Sort by</span>
                {[
                  { key: 'rank', label: 'Rank' },
                  { key: 'score', label: 'Score' },
                  { key: 'skills', label: 'Skills' },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    className={`btn btn-sm ${sortBy === key ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setSortBy(key)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {sorted.map(r => <ResultCard key={r.filename} result={r} jdSkills={jdSkills} />)}
          </div>
        )}
      </div>
    </div>
  )
}
