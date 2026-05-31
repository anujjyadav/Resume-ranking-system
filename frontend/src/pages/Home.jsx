import { IconBriefcase, IconUser, IconBarChart, IconArrowRight, IconCheck } from '../components/Icons'

const STATS = [
  { value: '35%', label: 'More accurate than keyword matching' },
  { value: '25+', label: 'Job roles in database' },
  { value: '200+', label: 'Skills recognized' },
  { value: '5s', label: 'Average analysis time' },
]

const STEPS = [
  { num: '1', title: 'Upload documents', desc: 'Submit PDF or DOCX resume files. Our parser extracts structured data automatically.' },
  { num: '2', title: 'AI analysis runs', desc: 'Sentence-BERT generates semantic embeddings. A hybrid model scores semantic fit, skill overlap, and experience.' },
  { num: '3', title: 'View ranked results', desc: 'Receive detailed match scores, skill breakdowns, and explainable hiring recommendations.' },
]

export default function Home({ onSelect }) {
  return (
    <main>
      {/* Hero */}
      <section className="hero">
        <div className="hero-inner animate-in">
          <span className="hero-eyebrow">Resume Intelligence Platform</span>
          <h1 className="hero-title">
            Match the right candidates to the <span>right roles</span>
          </h1>
          <p className="hero-sub">
            Semantic resume analysis powered by Sentence-BERT. Rank candidates against job descriptions or discover career paths from a single resume upload.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button id="home-recruiter-btn" className="btn btn-primary btn-lg" onClick={() => onSelect('recruiter')}>
              Start ranking resumes
              <IconArrowRight />
            </button>
            <button id="home-seeker-btn" className="btn btn-secondary btn-lg" onClick={() => onSelect('seeker')}>
              Find matching roles
            </button>
          </div>
        </div>
      </section>

      {/* Stats row */}
      <section style={{ background: '#fff', borderBottom: '1px solid var(--ln-border)', padding: '24px 16px' }}>
        <div className="grid-4" style={{ maxWidth: '900px', margin: '0 auto' }}>
          {STATS.map(({ value, label }, i) => (
            <div key={value} className={`stat-box animate-in delay-${i + 1}`}>
              <div className="stat-value">{value}</div>
              <div className="stat-label">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Mode cards */}
      <section style={{ padding: '48px 16px', maxWidth: '860px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '8px' }}>Choose your workflow</h2>
        <p style={{ textAlign: 'center', marginBottom: '32px', fontSize: '0.9rem' }}>
          The platform serves both sides of the hiring process.
        </p>

        <div className="grid-2">
          {/* Recruiter card */}
          <button
            id="mode-recruiter-btn"
            className="feature-card animate-in delay-1"
            onClick={() => onSelect('recruiter')}
          >
            <div className="feature-icon">
              <IconBriefcase />
            </div>
            <div className="feature-title">Recruiter View</div>
            <p className="feature-desc">
              Upload a job description and multiple candidate resumes. Receive a ranked shortlist with transparent match scores and skill gap reports.
            </p>
            <ul className="feature-list">
              {['Batch resume ranking', 'Skill overlap analysis', 'Experience matching', 'Exportable results'].map(f => (
                <li key={f}><span className="check-dot" /> {f}</li>
              ))}
            </ul>
            <div className="btn btn-primary" style={{ marginTop: '20px', width: '100%' }}>
              Open Recruiter View <IconArrowRight />
            </div>
          </button>

          {/* Candidate card */}
          <button
            id="mode-seeker-btn"
            className="feature-card animate-in delay-2"
            onClick={() => onSelect('seeker')}
          >
            <div className="feature-icon">
              <IconUser />
            </div>
            <div className="feature-title">Candidate View</div>
            <p className="feature-desc">
              Upload your resume and receive a ranked list of job roles that match your skills, with a detailed skill gap report for each role.
            </p>
            <ul className="feature-list">
              {['Top role recommendations', 'Skill gap analysis', 'Salary range estimates', 'Career path insights'].map(f => (
                <li key={f}><span className="check-dot" /> {f}</li>
              ))}
            </ul>
            <div className="btn btn-secondary" style={{ marginTop: '20px', width: '100%' }}>
              Open Candidate View <IconArrowRight />
            </div>
          </button>
        </div>
      </section>

      {/* How it works */}
      <section style={{ background: '#fff', borderTop: '1px solid var(--ln-border)', borderBottom: '1px solid var(--ln-border)', padding: '48px 16px' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '32px' }}>How it works</h2>
          <div className="grid-3">
            {STEPS.map(({ num, title, desc }, i) => (
              <div key={num} className={`animate-in delay-${i + 1}`} style={{ textAlign: 'center', padding: '4px' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '50%',
                  background: 'var(--ln-blue-light)', border: '2px solid var(--ln-blue)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 14px', color: 'var(--ln-blue)', fontWeight: 700, fontSize: '1rem'
                }}>
                  {num}
                </div>
                <h3 style={{ marginBottom: '8px' }}>{title}</h3>
                <p style={{ fontSize: '0.875rem', lineHeight: '1.6' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech note */}
      <section style={{ padding: '32px 16px', maxWidth: '860px', margin: '0 auto', textAlign: 'center' }}>
        <div className="badge badge-blue" style={{ marginBottom: '10px', fontSize: '0.72rem' }}>Technical Details</div>
        <p style={{ fontSize: '0.875rem', lineHeight: '1.7' }}>
          Built with <strong style={{ color: 'var(--ln-text)' }}>Sentence-BERT (all-MiniLM-L6-v2)</strong> for semantic embeddings,{' '}
          <strong style={{ color: 'var(--ln-text)' }}>spaCy</strong> for entity extraction, and a hybrid scoring model combining semantic similarity, skill overlap, and experience matching. Runs fully offline — no third-party API required.
        </p>
      </section>
    </main>
  )
}
