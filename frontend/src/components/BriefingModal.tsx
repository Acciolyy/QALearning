'use client';

import React from 'react';
import { Topic } from '../types/curriculum';

interface BriefingModalProps {
  topic: Topic | null;
  sessionSeed: string;
  onClose: () => void;
  onEnterLab: (topic: Topic) => void;
}

export const BriefingModal: React.FC<BriefingModalProps> = ({
  topic,
  sessionSeed,
  onClose,
  onEnterLab,
}) => {
  if (!topic) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(8, 21, 17, 0.75)',
      backdropFilter: 'blur(2px)',
      zIndex: 200,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-strong)',
        borderRadius: 'var(--radius-sm)',
        maxWidth: '680px',
        width: '100%',
        boxShadow: 'var(--shadow-desk)',
        overflow: 'hidden'
      }}>
        <div style={{
          backgroundColor: 'var(--bg-surface-raised)',
          borderBottom: '1px solid var(--border-strong)',
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11.5px', color: 'var(--copper-signature)', fontWeight: 600 }}>
            BRIEFING DE AUDITORIA // {topic.code}
          </span>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '18px', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}
          >
            ✕
          </button>
        </div>

        <div style={{ padding: '24px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>
            {topic.title}
          </h3>

          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
            {topic.investigation_scope}
          </p>

          <div style={{
            backgroundColor: 'var(--status-investigating-bg)',
            border: '1px dashed var(--copper-signature)',
            borderRadius: 'var(--radius-xs)',
            padding: '14px 18px',
            fontSize: '13px',
            color: 'var(--text-primary)',
            marginBottom: '24px'
          }}>
            <strong>Regra Pedagógica Inegociável:</strong> Este briefing define <em>o que</em> investigar, nunca <em>quais</em> comportamentos defeituosos estão ativos. Uma semente determinística (<code>{sessionSeed}</code>) configurou o conjunto ativo desta sessão de teste.
          </div>
        </div>

        <div style={{
          borderTop: '1px solid var(--border-subtle)',
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
          backgroundColor: 'var(--bg-surface-raised)'
        }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-strong)',
              fontFamily: 'var(--font-sans)',
              fontSize: '13px',
              fontWeight: 600,
              padding: '8px 16px',
              borderRadius: 'var(--radius-xs)',
              cursor: 'pointer'
            }}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => onEnterLab(topic)}
            style={{
              backgroundColor: 'var(--accent-command)',
              color: 'var(--accent-command-contrast)',
              border: '1px solid var(--accent-command)',
              fontFamily: 'var(--font-sans)',
              fontSize: '13px',
              fontWeight: 600,
              padding: '8px 16px',
              borderRadius: 'var(--radius-xs)',
              cursor: 'pointer'
            }}
          >
            Abrir Laboratório Prático
          </button>
        </div>
      </div>
    </div>
  );
};
