'use client';

import React, { useEffect } from 'react';
import { IconAuditShield, IconViewfinder } from './TechnicalIcons';

interface CaseHeroDossierProps {
  caseCode?: string;
  levelLabel?: string;
  title: string;
  scenario: string;
  targetElement?: string;
  criteria: Array<{ code: string; text: string }>;
  mappedCount: number;
  totalCount: number;
  xpReward: number;
  onEnterLab: () => void;
  isModalOpen?: boolean;
}

export const CaseHeroDossier: React.FC<CaseHeroDossierProps> = ({
  caseCode = 'DOSSIÊ #QA-MAN-012',
  levelLabel = 'NÍVEL 01 // ONBOARDING EXPLORATÓRIO',
  title,
  scenario,
  targetElement = 'input#user-age',
  criteria,
  mappedCount,
  totalCount,
  xpReward,
  onEnterLab,
  isModalOpen = false,
}) => {
  // Atalho de teclado real [ENTER] ↵ com salvaguardas estritas
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Enter') return;
      if (isModalOpen) return;

      const activeEl = document.activeElement;
      const isInputActive = activeEl && (
        activeEl.tagName === 'INPUT' ||
        activeEl.tagName === 'TEXTAREA' ||
        activeEl.tagName === 'SELECT' ||
        (activeEl as HTMLElement).isContentEditable
      );
      if (isInputActive) return;

      e.preventDefault();
      onEnterLab();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onEnterLab, isModalOpen]);

  return (
    <article style={{
      backgroundColor: 'var(--bg-surface)',
      border: '1px solid var(--border-strong)',
      borderLeft: '4px solid var(--copper-signature)',
      boxShadow: 'var(--shadow-desk)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* 1. RÉGUA DE CABEÇALHO TÉCNICO // CLASSIFICAÇÃO FORENSE */}
      <div style={{
        padding: '12px 24px',
        backgroundColor: 'var(--bg-surface-raised)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontFamily: 'var(--font-mono)', fontSize: '11.5px' }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--copper-signature)',
            fontWeight: 700,
            letterSpacing: '0.04em'
          }}>
            <IconViewfinder size={13} />
            {caseCode}
          </span>
          <span style={{ color: 'var(--border-strong)' }}>//</span>
          <span style={{ color: 'var(--text-muted)' }}>{levelLabel}</span>
          <span style={{ color: 'var(--border-strong)' }}>//</span>
          <span style={{ color: 'var(--text-secondary)' }}>ALVO: <code style={{ color: 'var(--text-primary)', backgroundColor: 'var(--bg-surface-sunken)', padding: '1px 6px', borderRadius: '2px' }}>{targetElement}</code></span>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontFamily: 'var(--font-mono)',
          fontSize: '10.5px',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          padding: '3px 10px',
          borderRadius: 'var(--radius-xs)',
          backgroundColor: 'var(--status-investigating-bg)',
          color: 'var(--copper-signature)',
          border: '1px solid var(--copper-signature)'
        }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--copper-signature)' }}></span>
          <span>INVESTIGAÇÃO ATIVA</span>
        </div>
      </div>

      {/* 2. CORPO DO DOSSIÊ: COMPOSIÇÃO ASSIMÉTRICA BIPARTIDA */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.45fr) minmax(300px, 1fr)',
        gap: '0',
        minHeight: '260px'
      }}>
        {/* COLUNA ESQUERDA: NARRATIVA DO CASO & AÇÃO PRIMÁRIA IMPOENTE */}
        <div style={{
          padding: '28px 28px 24px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          borderRight: '1px solid var(--border-subtle)'
        }}>
          <div>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '27px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              lineHeight: 1.25,
              marginBottom: '14px',
              letterSpacing: '-0.01em'
            }}>
              {title}
            </h1>

            <p style={{
              fontSize: '14.5px',
              color: 'var(--text-secondary)',
              lineHeight: 1.65,
              maxWidth: '680px',
              marginBottom: '20px'
            }}>
              {scenario}
            </p>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              fontFamily: 'var(--font-mono)',
              fontSize: '11.5px',
              color: 'var(--text-muted)',
              marginBottom: '24px'
            }}>
              <span>AMBIENTE: <strong style={{ color: 'var(--text-primary)' }}>SANDBOX ISOLADA</strong></span>
              <span>·</span>
              <span>ORÁCULO: <strong style={{ color: 'var(--copper-signature)' }}>CONFIRMAÇÃO VIA TELEMETRIA</strong></span>
              <span>·</span>
              <span>RECOMPENSA: <strong style={{ color: 'var(--status-pass)' }}>+{xpReward} XP</strong></span>
            </div>
          </div>

          {/* AÇÃO PRIMÁRIA DA TELA: BARRA DE COMANDO IMPOENTE COM ATALHO REAL */}
          <div>
            <button
              type="button"
              onClick={onEnterLab}
              aria-keyshortcuts="Enter"
              style={{
                width: '100%',
                backgroundColor: 'var(--accent-command)',
                color: 'var(--accent-command-contrast)',
                border: 'none',
                fontFamily: 'var(--font-sans)',
                fontSize: '14px',
                fontWeight: 700,
                letterSpacing: '0.04em',
                padding: '13px 20px',
                borderRadius: 'var(--radius-xs)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.25)',
                transition: 'transform 0.1s ease, filter 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.filter = 'brightness(1.08)'}
              onMouseLeave={(e) => e.currentTarget.style.filter = 'brightness(1)'}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <IconAuditShield size={18} />
                <span>INICIAR INVESTIGAÇÃO NO LABORATÓRIO</span>
              </span>

              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                fontWeight: 600,
                padding: '3px 7px',
                backgroundColor: 'rgba(0, 0, 0, 0.22)',
                color: 'inherit',
                borderRadius: '2px',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                letterSpacing: '0.05em'
              }}>
                [ENTER] ↵
              </span>
            </button>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10.5px', color: 'var(--text-muted)', marginTop: '6px', textAlign: 'right' }}>
              Atalho ativo no teclado para entrada imediata na bancada
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA: ESPECIFICAÇÃO FORENSE DE CRITÉRIOS DE ACEITAÇÃO */}
        <div style={{
          backgroundColor: 'var(--bg-surface-sunken)',
          padding: '24px 22px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid var(--border-subtle)',
              paddingBottom: '10px',
              marginBottom: '14px'
            }}>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <IconAuditShield size={13} />
                FOLHA DE CRITÉRIOS DE ACEITE
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10.5px', color: 'var(--text-muted)' }}>
                NORMA V2.1
              </span>
            </div>

            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {criteria.map((c, idx) => (
                <li key={idx} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  fontSize: '12.5px',
                  lineHeight: 1.45,
                  color: 'var(--text-primary)'
                }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--copper-signature)',
                    fontWeight: 700,
                    fontSize: '11px',
                    flexShrink: 0,
                    marginTop: '1px'
                  }}>
                    {c.code}
                  </span>
                  <span style={{ color: 'var(--text-secondary)' }}>{c.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* TELEMETRIA DE COBERTURA DESTE TÓPICO */}
          <div style={{
            marginTop: '20px',
            paddingTop: '14px',
            borderTop: '1px solid var(--border-subtle)',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ color: 'var(--text-muted)' }}>COMPORTAMENTOS MAPEADOS:</span>
              <strong style={{ color: 'var(--copper-signature)' }}>{mappedCount} / {totalCount} CONFIRMADOS</strong>
            </div>

            {/* Microbarra métrica segmentada */}
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${totalCount}, 1fr)`, gap: '4px', height: '5px' }}>
              {Array.from({ length: totalCount }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    backgroundColor: i < mappedCount ? 'var(--copper-signature)' : 'var(--border-subtle)',
                    borderRadius: '1px'
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};
