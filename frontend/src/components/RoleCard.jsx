import { useState } from 'react'
import ScoreGauge from './ScoreGauge'
import { IconChevronDown, IconChevronUp, IconCheck } from './Icons'

function getFitBadge(fit_color) {
  return {
    green:  'badge-green',
    blue:   'badge-blue',
    yellow: 'badge-yellow',
    red:    'badge-red',
  }[fit_color] || 'badge-gray'
}

export default function RoleCard({ role, index }) {
  const [expanded, setExpanded] = useState(false)
  const {
    title, category, description, match_score, fit_label, fit_color,
    matched_skills = [], missing_skills = [],
    preferred_matched = [], preferred_missing = [],
    avg_salary, experience_years, skill_gap_count,
  } = role

  return (
    <div className={`card animate-in delay-${Math.min(index + 1, 4)}`} style={{ marginBottom: '12px' }}>
      {/* Main row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '18px 20px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '220px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--ln-text)' }}>{title}</span>
            <span className={`badge ${getFitBadge(fit_color)}`}>{fit_label}</span>
            <span className="badge badge-gray">{category}</span>
          </div>
          <p style={{ fontSize: '0.85rem', margin: '0 0 8px', lineHeight: '1.5' }}>{description}</p>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--ln-green)', fontWeight: 600 }}>
              {avg_salary}
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--ln-text-muted)' }}>
              {experience_years} yrs experience required
            </span>
            {skill_gap_count > 0 ? (
              <span style={{ fontSize: '0.78rem', color: 'var(--ln-yellow)', fontWeight: 600 }}>
                {skill_gap_count} skills to develop
              </span>
            ) : (
              <span style={{ fontSize: '0.78rem', color: 'var(--ln-green)', fontWeight: 600 }}>
                All required skills matched
              </span>
            )}
          </div>
        </div>

        <ScoreGauge score={match_score} size={88} label="Match" />

        <button
          id={`role-expand-${index}`}
          className="collapse-btn"
          onClick={() => setExpanded(e => !e)}
          style={{ flexShrink: 0 }}
        >
          {expanded ? <><IconChevronUp /> Hide gap</> : <><IconChevronDown /> Skill gap</>}
        </button>
      </div>

      {/* Skills preview */}
      <div style={{ padding: '0 20px 14px', display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
        {matched_skills.slice(0, 5).map(s => (
          <span key={s} className="skill-pill skill-matched"><IconCheck /> {s}</span>
        ))}
        {missing_skills.slice(0, 3).map(s => (
          <span key={s} className="skill-pill skill-missing">{s}</span>
        ))}
      </div>

      {/* Expanded gap analysis */}
      {expanded && (
        <div className="animate-fade" style={{ borderTop: '1px solid var(--ln-border)' }}>
          <div className="grid-2" style={{ padding: '20px', gap: '28px' }}>
            {/* Have */}
            <div>
              <div className="section-label">Required Skills You Have</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '16px' }}>
                {matched_skills.length > 0
                  ? matched_skills.map(s => <span key={s} className="skill-pill skill-matched"><IconCheck /> {s}</span>)
                  : <span style={{ fontSize: '0.82rem', color: 'var(--ln-text-muted)' }}>None detected</span>
                }
              </div>

              <div className="section-label">Preferred Skills You Have</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {preferred_matched.length > 0
                  ? preferred_matched.map(s => <span key={s} className="skill-pill skill-preferred">{s}</span>)
                  : <span style={{ fontSize: '0.82rem', color: 'var(--ln-text-muted)' }}>None detected</span>
                }
              </div>
            </div>

            {/* Need */}
            <div>
              <div className="section-label">Skills to Develop</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '16px' }}>
                {missing_skills.length > 0
                  ? missing_skills.map(s => <span key={s} className="skill-pill skill-missing">{s}</span>)
                  : <span style={{ fontSize: '0.82rem', color: 'var(--ln-green)', fontWeight: 500 }}>You meet all required skills for this role.</span>
                }
              </div>

              {preferred_missing.length > 0 && (
                <>
                  <div className="section-label">Preferred Skills to Develop</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    {preferred_missing.slice(0, 8).map(s => <span key={s} className="skill-pill skill-neutral">{s}</span>)}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
