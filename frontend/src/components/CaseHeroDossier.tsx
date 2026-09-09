'use client';

import React from 'react';

interface CaseHeroDossierProps {
  caseCode?: string;
  levelLabel?: string;
  title: string;
  scenario: string;
  criteria: Array<{ code: string; text: string }>;
  mappedCount: number;
  totalCount: number;
  xpReward: number;
  onEnterLab: () => void;
}

export const CaseHeroDossier: React.FC<CaseHeroDossierProps> = ({
  caseCode = 'DOSSIÊ #QA-MAN-012',
  levelLabel = 'NÍVEL 01 // ONBOARDING EXPLORATÓRIO',
  title,
  scenario,
  criteria,
  mappedCount,
  totalCount,
  xpReward,
  onEnterLab,
}) => {
  return (
    <article style={{
      backgroundColor: 'var(--bg-surface)',
      border: '1px solid var(--border-strong)',
      borderTop: '4px solid var(--accent-command)',
      borderRadius: 'var(--radius-sm)',
      padding: '28px 32px',
      boxShadow: 'var(--shadow-desk)',
      position: 'relative'
    }}>
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '28px',
        fontFamily: 'var(--font-mono)',
        fontSize: '11px',
        fontWeight: 600,
        letterSpacing: '0.08em',
        padding: '4px 10px',
        border: '1.5px dashed var(--copper-signature)',
        color: 'var(--copper-signature)',
        borderRadius: 'var(--radius-xs)',
        textTransform: 'uppercase',
        transform: 'rotate(-1.5deg)'
      }}>
        EM ANDAMENTO
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 600, color: 'var(--copper-signature)' }}>
          {caseCode}
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', borderLeft: '1px solid var(--border-strong)', paddingLeft: '12px' }}>
          {levelLabel}
        </span>
      </div>

      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontSize: '28px',
        fontWeight: 700,
        color: 'var(--text-primary)',
        lineHeight: 1.25,
        marginBottom: '14px'
      }}>
        {title}
      </h1>

      <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '760px', marginBottom: '24px' }}>
        {scenario}
      </p>

      <div style={{
        backgroundColor: 'var(--bg-surface-sunken)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-xs)',
        padding: '16px 20px',
        marginBottom: '24px'
      }}>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: 'var(--text-muted)',
          marginBottom: '10px'
        }}>
          Oráculo & Critérios de Aceite Sob Inspeção
        </div>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {criteria.map((c, idx) => (
            <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13.5px', color: 'var(--text-primary)' }}>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-command)', fontWeight: 700 }}>{c.code}</span>
              <span>{c.text}</span>
            </li>
          ))}
        </ul>
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTop: '1px solid var(--border-subtle)',
        paddingTop: '20px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', gap: '20px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-secondary)' }}>
          <span>Comportamentos: <strong style={{ color: 'var(--text-primary)' }}>{mappedCount} / {totalCount} Mapeados</strong></span>
          <span>Recompensa: <strong style={{ color: 'var(--text-primary)' }}>+{xpReward} XP</strong></span>
          <span>Ambiente: <strong style={{ color: 'var(--text-primary)' }}>Iframe Sandboxed</strong></span>
        </div>

        <button
          type="button"
          onClick={onEnterLab}
          style={{
            backgroundColor: 'var(--accent-command)',
            color: 'var(--accent-command-contrast)',
            border: '1px solid var(--accent-command)',
            fontFamily: 'var(--font-sans)',
            fontSize: '13.5px',
            fontWeight: 600,
            padding: '9px 18px',
            borderRadius: 'var(--radius-xs)',
            cursor: 'pointer'
          }}
        >
          [ Iniciar Investigação no Laboratório ]
        </button>
      </div>
    </article>
  );
};
