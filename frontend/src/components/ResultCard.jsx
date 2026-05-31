import { useState } from 'react'
import ScoreGauge from './ScoreGauge'
import { IconLink, IconChevronDown, IconChevronUp, IconCheck, IconX } from './Icons'

function RankNum({ rank }) {
  const cls = rank <= 3 ? `rank-${rank}` : ''
  return <div className={`rank-num ${cls}`}>{rank}</div>
}

function ProgressRow({ label, value }) {
  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--ln-text-3)', fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: '0.8rem', color: 'var(--ln-text-2)', fontWeight: 600 }}>{value}%</span>
      </div>
      <div className="progress-wrap">
        <div className="progress-fill" style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

function getTagProps(recommendation_color) {
  return {
    green:  'badge-green',
    blue:   'badge-blue',
    yellow: 'badge-yellow',
    red:    'badge-red',
  }[recommendation_color] || 'badge-gray'
}

export default function ResultCard({ result }) {
  const [expanded, setExpanded] = useState(false)
  const {
    rank, name, filename, email, phone, linkedin, github,
    total_score, semantic_score, skill_score, experience_score,
    matched_skills = [], missing_skills = [],
    recommendation_tag, recommendation_color, candidate_years_experience,
  } = result

  const displayName = name || filename?.replace(/\.(pdf|docx)$/i, '') || 'Unnamed Candidate'
  const initials = displayName.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()

  return (
    <div className="card animate-in" style={{ marginBottom: '12px' }}>
      {/* Main row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '18px 20px', flexWrap: 'wrap' }}>
        <RankNum rank={rank} />

        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--ln-blue-light)', border: '1px solid var(--ln-blue-mid)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem', color: 'var(--ln-blue)', flexShrink: 0 }}>
          {initials || rank}
        </div>

        <div style={{ flex: 1, minWidth: '180px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--ln-text)' }}>{displayName}</span>
            <span className={`badge ${getTagProps(recommendation_color)}`}>{recommendation_tag}</span>
          </div>
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
            {email && (
              <a href={`mailto:${email}`} style={{ fontSize: '0.78rem', color: 'var(--ln-text-muted)' }}>{email}</a>
            )}
            {phone && (
              <span style={{ fontSize: '0.78rem', color: 'var(--ln-text-muted)' }}>{phone}</span>
            )}
            {linkedin && (() => { const li = String(linkedin); return (
              <a href={li.startsWith('http') ? li : `https://${li}`} target="_blank" rel="noreferrer" style={{ fontSize: '0.78rem', color: 'var(--ln-blue)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                <IconLink /> LinkedIn
              </a>
            ); })()}
            {github && (() => { const gh = String(github); return (
              <a href={gh.startsWith('http') ? gh : `https://${gh}`} target="_blank" rel="noreferrer" style={{ fontSize: '0.78rem', color: 'var(--ln-blue)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                <IconLink /> GitHub
              </a>
            ); })()}
          </div>
          {candidate_years_experience > 0 && (
            <div style={{ fontSize: '0.75rem', color: 'var(--ln-text-muted)', marginTop: '3px' }}>
              {candidate_years_experience} years of experience
            </div>
          )}
        </div>

        <ScoreGauge score={total_score} size={88} label="Match" />

        <button
          id={`result-expand-${rank}`}
          className="collapse-btn"
          onClick={() => setExpanded(e => !e)}
          style={{ flexShrink: 0 }}
        >
          {expanded ? <><IconChevronUp /> Hide details</> : <><IconChevronDown /> View details</>}
        </button>
      </div>

      {/* Skills preview strip */}
      {(matched_skills.length > 0 || missing_skills.length > 0) && (
        <div style={{ padding: '0 20px 14px', display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
          {matched_skills.slice(0, 5).map(s => (
            <span key={s} className="skill-pill skill-matched"><IconCheck /> {s}</span>
          ))}
          {missing_skills.slice(0, 4).map(s => (
            <span key={s} className="skill-pill skill-missing">{s}</span>
          ))}
          {(matched_skills.length + missing_skills.length) > 9 && (
            <span className="skill-pill skill-neutral">+{matched_skills.length + missing_skills.length - 9} more</span>
          )}
        </div>
      )}

      {/* Expanded panel */}
      {expanded && (
        <div className="animate-fade" style={{ borderTop: '1px solid var(--ln-border)' }}>
          <div className="grid-2" style={{ padding: '20px', gap: '28px' }}>
            {/* Score breakdown */}
            <div>
              <div className="section-label">Score Breakdown</div>
              <ProgressRow label="Semantic Similarity" value={semantic_score} />
              <ProgressRow label="Skill Match" value={skill_score} />
              <ProgressRow label="Experience Match" value={experience_score} />
            </div>

            {/* Skill analysis */}
            <div>
              <div className="section-label">Skill Analysis</div>
              {matched_skills.length > 0 && (
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--ln-green)', marginBottom: '6px' }}>
                    Matched ({matched_skills.length})
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    {matched_skills.map(s => (
                      <span key={s} className="skill-pill skill-matched"><IconCheck /> {s}</span>
                    ))}
                  </div>
                </div>
              )}
              {missing_skills.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--ln-red)', marginBottom: '6px' }}>
                    Missing ({missing_skills.length})
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    {missing_skills.map(s => (
                      <span key={s} className="skill-pill skill-missing">{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
