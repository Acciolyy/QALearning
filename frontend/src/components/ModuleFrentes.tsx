'use client';

import React, { useState } from 'react';
import { Module, Topic } from '../types/curriculum';
import { IconViewfinder, IconCheck, IconArrowRight } from './TechnicalIcons';

interface ModuleFrentesProps {
  modules: Module[];
  completedTopics?: Record<string, number>;
  onOpenBriefing: (topic: Topic) => void;
  activeTopicCode?: string;
}

export const ModuleFrentes: React.FC<ModuleFrentesProps> = ({
  modules,
  completedTopics = {},
  onOpenBriefing,
  activeTopicCode,
}) => {
  const [openFrenteId, setOpenFrenteId] = useState<number>(modules[0]?.id || 1);

  const toggleFrente = (id: number) => {
    setOpenFrenteId(prev => prev === id ? 0 : id);
  };

  const getGuidanceBadge = (level: string) => {
    switch (level) {
      case 'direct':
        return {
          code: 'NV-01',
          text: 'PISTAS DIRETAS (CORTE >= 70%)',
          color: 'var(--copper-signature)',
          bg: 'var(--status-investigating-bg)',
          border: 'var(--copper-signature)'
        };
      case 'subtle':
        return {
          code: 'NV-02',
          text: 'PISTAS SUTIS (CORTE >= 85%)',
          color: 'var(--text-secondary)',
          bg: 'var(--bg-surface-sunken)',
          border: 'var(--border-subtle)'
        };
      default:
        return {
          code: 'NV-03',
          text: 'SEM PISTAS (AUTONOMIA · CORTE 100%)',
          color: 'var(--status-bug)',
          bg: 'var(--status-bug-bg)',
          border: 'var(--status-bug)'
        };
    }
  };

  return (
    <section aria-label="Frentes de Investigação da Trilha" style={{ marginTop: '8px' }}>
      {/* CABEÇALHO DA SEÇÃO: RITMO EDITORIAL PAUSADO */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        borderBottom: '1px solid var(--border-strong)',
        paddingBottom: '8px',
        marginBottom: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '20px',
            fontWeight: 600,
            color: 'var(--text-primary)',
            letterSpacing: '-0.01em'
          }}>
            Frentes de Investigação da Trilha
          </h2>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
            // MATRIZ OPERACIONAL
          </span>
        </div>

        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11.5px', color: 'var(--text-muted)' }}>
          {modules.reduce((acc, m) => acc + m.topics.length, 0)} TÓPICOS TOTAIS
        </span>
      </div>

      {/* FOLIO CONTÍNUO DE FRENTES (SUBSTITUI CARDS IDÊNTICOS EMPILHADOS) */}
      <div style={{
        border: '1px solid var(--border-subtle)',
        backgroundColor: 'var(--bg-surface)',
        boxShadow: 'var(--shadow-subtle)'
      }}>
        {modules.map((mod, index) => {
          const isOpen = openFrenteId === mod.id;
          const badge = getGuidanceBadge(mod.guidance_level);
          const isLast = index === modules.length - 1;

          return (
            <div
              key={mod.id}
              style={{
                borderBottom: isLast && !isOpen ? 'none' : '1px solid var(--border-subtle)',
                backgroundColor: isOpen ? 'var(--bg-surface)' : 'var(--bg-surface-raised)'
              }}
            >
              {/* CABEÇALHO DA FRENTE COM ABAS / FOLIO INDEXADO */}
              <button
                type="button"
                onClick={() => toggleFrente(mod.id)}
                style={{
                  width: '100%',
                  padding: '14px 20px',
                  backgroundColor: isOpen ? 'var(--bg-surface-raised)' : 'transparent',
                  border: 'none',
                  borderLeft: isOpen ? '4px solid var(--copper-signature)' : '4px solid transparent',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background-color 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 7px',
                    borderRadius: 'var(--radius-xs)',
                    backgroundColor: isOpen ? 'var(--copper-signature)' : 'var(--bg-surface-sunken)',
                    color: isOpen ? 'var(--copper-signature-contrast)' : 'var(--text-secondary)',
                    letterSpacing: '0.04em'
                  }}>
                    FRENTE {mod.number.toString().padStart(2, '0')}
                  </span>

                  <span style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '16.5px',
                    fontWeight: 600,
                    color: 'var(--text-primary)'
                  }}>
                    {mod.title}
                  </span>

                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    color: 'var(--text-muted)'
                  }}>
                    ({mod.topics.length} casos)
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10.5px',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-xs)',
                    backgroundColor: badge.bg,
                    color: badge.color,
                    border: `1px solid ${badge.border}`
                  }}>
                    {badge.text}
                  </span>

                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    color: 'var(--text-muted)',
                    letterSpacing: '0.05em'
                  }}>
                    {isOpen ? '[ − RECOLHER ]' : '[ + EXPANDIR ]'}
                  </span>
                </div>
              </button>

              {/* CONTEÚDO DA FRENTE: TABELA FORENSE DE ALTA DENSIDADE */}
              {isOpen && (
                <div style={{
                  padding: '16px 20px 22px',
                  borderTop: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-surface)'
                }}>
                  <p style={{
                    fontSize: '13px',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.5,
                    marginBottom: '16px',
                    maxWidth: '820px'
                  }}>
                    {mod.description}
                  </p>

                  <div style={{
                    border: '1px solid var(--border-subtle)',
                    overflow: 'hidden'
                  }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead>
                        <tr style={{
                          backgroundColor: 'var(--bg-surface-sunken)',
                          borderBottom: '1px solid var(--border-subtle)',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '10.5px',
                          color: 'var(--text-muted)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em'
                        }}>
                          <th style={{ padding: '8px 16px', width: '70px' }}>ORD</th>
                          <th style={{ padding: '8px 16px' }}>TÓPICO & ESCOPO DE AUDITORIA</th>
                          <th style={{ padding: '8px 16px', width: '180px' }}>ALVO NO DOM</th>
                          <th style={{ padding: '8px 16px', width: '150px', textAlign: 'right' }}>ESTADO</th>
                          <th style={{ padding: '8px 16px', width: '130px', textAlign: 'right' }}>AÇÃO</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mod.topics.map((topic, idx) => {
                          const isCompleted = completedTopics && topic.code in completedTopics;
                          const score = isCompleted ? completedTopics[topic.code] : null;
                          const isCurrentActive = activeTopicCode === topic.code;

                          return (
                            <tr
                              key={topic.id}
                              style={{
                                borderBottom: idx === mod.topics.length - 1 ? 'none' : '1px solid var(--border-subtle)',
                                backgroundColor: isCurrentActive ? 'var(--status-investigating-bg)' : (idx % 2 === 1 ? 'rgba(0,0,0,0.02)' : 'transparent')
                              }}
                            >
                              <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
                                {String(topic.order).padStart(2, '0')}.
                              </td>

                              <td style={{ padding: '12px 16px' }}>
                                <div style={{
                                  fontWeight: 600,
                                  color: 'var(--text-primary)',
                                  fontSize: '13.5px',
                                  marginBottom: '2px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px'
                                }}>
                                  <span>{topic.title}</span>
                                  {isCurrentActive && (
                                    <span style={{
                                      fontFamily: 'var(--font-mono)',
                                      fontSize: '9.5px',
                                      color: 'var(--copper-signature)',
                                      border: '1px solid var(--copper-signature)',
                                      padding: '0 4px',
                                      borderRadius: '1px'
                                    }}>
                                      NO DOSSIÊ
                                    </span>
                                  )}
                                </div>
                                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                                  {topic.oracle_description}
                                </div>
                              </td>

                              <td style={{ padding: '12px 16px' }}>
                                <code style={{
                                  fontFamily: 'var(--font-mono)',
                                  fontSize: '11px',
                                  color: 'var(--text-primary)',
                                  backgroundColor: 'var(--bg-surface-sunken)',
                                  padding: '2px 6px',
                                  borderRadius: '2px',
                                  border: '1px solid var(--border-subtle)'
                                }}>
                                  {topic.target_element || 'N/A'}
                                </code>
                              </td>

                              <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                                {isCompleted ? (
                                  <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '11px',
                                    padding: '2px 7px',
                                    borderRadius: 'var(--radius-xs)',
                                    backgroundColor: 'var(--status-pass-bg)',
                                    color: 'var(--status-pass)',
                                    border: '1px solid var(--status-pass)'
                                  }}>
                                    <IconCheck size={11} />
                                    Homologado ({score}%)
                                  </span>
                                ) : (
                                  <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '11px',
                                    padding: '2px 7px',
                                    borderRadius: 'var(--radius-xs)',
                                    backgroundColor: 'var(--status-investigating-bg)',
                                    color: 'var(--status-investigating)',
                                    border: '1px solid var(--status-investigating)'
                                  }}>
                                    ● Aberto (+{topic.xp_reward} XP)
                                  </span>
                                )}
                              </td>

                              {/* AÇÃO DE LINHA: GHOST ACTION DISCRETA (NÃO É BOTÃO LARANJA) */}
                              <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                                <button
                                  type="button"
                                  onClick={() => onOpenBriefing(topic)}
                                  style={{
                                    background: 'none',
                                    border: '1px solid var(--border-strong)',
                                    color: 'var(--text-primary)',
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '11.5px',
                                    fontWeight: 500,
                                    padding: '4px 10px',
                                    borderRadius: 'var(--radius-xs)',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    transition: 'all 0.15s ease'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = 'var(--copper-signature)';
                                    e.currentTarget.style.color = 'var(--copper-signature)';
                                    e.currentTarget.style.backgroundColor = 'var(--bg-surface-sunken)';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = 'var(--border-strong)';
                                    e.currentTarget.style.color = 'var(--text-primary)';
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                  }}
                                >
                                  <span>{isCompleted ? 'Revisar' : 'Inspecionar'}</span>
                                  <IconArrowRight size={11} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
