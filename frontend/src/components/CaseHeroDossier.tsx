'use client';

import React, { useEffect } from 'react';
import { IconAuditShield, IconViewfinder, IconCrosshairTouch } from './TechnicalIcons';

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
  caseCode = 'DOSSIÊ § QA-MAN-012',
  levelLabel = 'NÍVEL 01 // FUNDAMENTOS E ROTEIROS EXPLORATÓRIOS',
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
  // Atalho de teclado real [ENTER] ↵ com salvaguardas estritas de foco
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
    <article
      aria-label="Dossiê do Caso em Destaque"
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-strong)',
        borderLeft: '4px solid var(--copper-signature)',
        boxShadow: 'var(--shadow-desk)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* 1. RÉGUA DE CABEÇALHO TÉCNICO // CLASSIFICAÇÃO FORENSE */}
      <div style={{
        padding: '10px 20px',
        backgroundColor: 'var(--bg-surface-raised)',
        borderBottom: '1px solid var(--border-strong)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontFamily: 'var(--font-mono)',
          fontSize: '11px'
        }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            color: 'var(--copper-signature)',
            fontWeight: 700,
            letterSpacing: '0.04em'
          }}>
            <IconViewfinder size={13} />
            {caseCode}
          </span>
          <span style={{ color: 'var(--border-strong)' }}>//</span>
          <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{levelLabel}</span>
          <span style={{ color: 'var(--border-strong)' }}>//</span>
          <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
            ALVO: <code style={{
              color: 'var(--text-primary)',
              backgroundColor: 'var(--bg-surface-sunken)',
              border: '1px solid var(--border-strong)',
              padding: '1px 6px',
              borderRadius: '2px',
              fontWeight: 700
            }}>{targetElement}</code>
          </span>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          padding: '2px 8px',
          borderRadius: 'var(--radius-xs)',
          backgroundColor: 'var(--status-investigating-bg)',
          color: 'var(--copper-signature)',
          border: '1px solid var(--copper-signature)',
          fontWeight: 700
        }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--copper-signature)' }} />
          <span>INVESTIGAÇÃO ATIVA</span>
        </div>
      </div>

      {/* 2. CORPO DO DOSSIÊ: COMPOSIÇÃO ASSIMÉTRICA BIPARTIDA */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.45fr) minmax(320px, 1fr)',
        gap: '0',
        minHeight: '250px'
      }}>
        {/* COLUNA ESQUERDA: NARRATIVA DO CASO & AÇÃO PRIMÁRIA IMPOENTE */}
        <div style={{
          padding: '24px 24px 20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          borderRight: '1px solid var(--border-strong)'
        }}>
          <div>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '24px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              lineHeight: 1.25,
              marginBottom: '12px',
              letterSpacing: '-0.01em'
            }}>
              {title}
            </h1>

            <p style={{
              fontSize: '14px',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              maxWidth: '680px',
              marginBottom: '18px',
              fontWeight: 400
            }}>
              {scenario}
            </p>

            {/* Chips de metadados técnicos */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: '8px',
              fontFamily: 'var(--font-mono)',
              fontSize: '10.5px',
              marginBottom: '20px'
            }}>
              <span style={{
                padding: '3px 8px',
                backgroundColor: 'var(--bg-surface-sunken)',
                border: '1px solid var(--border-strong)',
                borderRadius: '2px',
                color: 'var(--text-secondary)'
              }}>
                AMBIENTE: <strong style={{ color: 'var(--text-primary)' }}>SANDBOX ISOLADA</strong>
              </span>

              <span style={{
                padding: '3px 8px',
                backgroundColor: 'var(--bg-surface-sunken)',
                border: '1px solid var(--border-strong)',
                borderRadius: '2px',
                color: 'var(--text-secondary)'
              }}>
                ORÁCULO: <strong style={{ color: 'var(--copper-signature)' }}>RESTRIÇÃO FORMAL</strong>
              </span>

              <span style={{
                padding: '3px 8px',
                backgroundColor: 'var(--bg-surface-sunken)',
                border: '1px solid var(--border-strong)',
                borderRadius: '2px',
                color: 'var(--text-secondary)'
              }}>
                RECOMPENSA: <strong style={{ color: 'var(--status-pass)' }}>+{xpReward} XP</strong>
              </span>
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
                fontSize: '13.5px',
                fontWeight: 700,
                letterSpacing: '0.04em',
                padding: '12px 18px',
                borderRadius: 'var(--radius-xs)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: 'var(--shadow-subtle)',
                transition: 'filter 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.filter = 'brightness(1.08)'}
              onMouseLeave={(e) => e.currentTarget.style.filter = 'brightness(1)'}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <IconAuditShield size={16} />
                <span>INICIAR INVESTIGAÇÃO NO LABORATÓRIO</span>
              </span>

              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                fontWeight: 700,
                padding: '2px 6px',
                backgroundColor: 'rgba(0, 0, 0, 0.25)',
                color: 'inherit',
                borderRadius: '2px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                letterSpacing: '0.05em'
              }}>
                [ENTER] ↵
              </span>
            </button>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              color: 'var(--text-secondary)',
              marginTop: '5px',
              textAlign: 'right',
              fontWeight: 500
            }}>
              Atalho ativo no teclado para entrada imediata na bancada
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA: ESPECIFICAÇÃO FORENSE DE CRITÉRIOS DE ACEITAÇÃO */}
        <div style={{
          backgroundColor: 'var(--bg-surface-sunken)',
          padding: '20px 20px 18px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          borderLeft: '1px solid var(--border-strong)'
        }}>
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid var(--border-strong)',
              paddingBottom: '8px',
              marginBottom: '12px'
            }}>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10.5px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <IconAuditShield size={12} style={{ color: 'var(--copper-signature)' }} />
                FOLHA DE CRITÉRIOS DE ACEITE
              </span>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '9.5px',
                color: 'var(--text-secondary)',
                fontWeight: 600
              }}>
                CRITÉRIOS FORMAIS
              </span>
            </div>

            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {criteria.map((c, idx) => (
                <li key={idx} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  fontSize: '12px',
                  lineHeight: 1.45,
                  color: 'var(--text-primary)'
                }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--copper-signature)',
                    fontWeight: 700,
                    fontSize: '10.5px',
                    flexShrink: 0,
                    marginTop: '1px'
                  }}>
                    {c.code}
                  </span>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{c.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* TELEMETRIA DE COBERTURA DESTE TÓPICO */}
          <div style={{
            marginTop: '16px',
            paddingTop: '12px',
            borderTop: '1px solid var(--border-strong)',
            fontFamily: 'var(--font-mono)',
            fontSize: '10.5px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>COMPORTAMENTOS MAPEADOS:</span>
              <strong style={{ color: 'var(--copper-signature)' }}>{mappedCount} / {totalCount} CONFIRMADOS</strong>
            </div>

            {/* Microbarra métrica segmentada */}
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${totalCount}, 1fr)`, gap: '4px', height: '5px' }}>
              {Array.from({ length: totalCount }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    backgroundColor: i < mappedCount ? 'var(--copper-signature)' : 'var(--border-strong)',
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
