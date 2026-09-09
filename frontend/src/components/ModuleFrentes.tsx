'use client';

import React, { useState } from 'react';
import { Module, Topic } from '../types/curriculum';

interface ModuleFrentesProps {
  modules: Module[];
  completedTopics?: Record<string, number>;
  onOpenBriefing: (topic: Topic) => void;
}

export const ModuleFrentes: React.FC<ModuleFrentesProps> = ({
  modules,
  completedTopics = {},
  onOpenBriefing,
}) => {
  const [openFrenteId, setOpenFrenteId] = useState<number>(modules[0]?.id || 1);

  const toggleFrente = (id: number) => {
    setOpenFrenteId(prev => prev === id ? 0 : id);
  };

  const getGuidanceLabel = (level: string) => {
    switch (level) {
      case 'direct':
        return { text: 'PISTAS DIRETAS (CORTE >= 70%)', style: { color: 'var(--copper-signature)', borderColor: 'var(--copper-signature)', backgroundColor: 'var(--status-investigating-bg)' } };
      case 'subtle':
        return { text: 'PISTAS SUTIS (CORTE >= 85%)', style: { color: 'var(--copper-signature)', borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-surface-sunken)' } };
      default:
        return { text: 'SEM PISTAS (AUTONOMIA REAL · CORTE 100%)', style: { color: 'var(--status-bug)', borderColor: 'var(--status-bug)', backgroundColor: 'var(--status-bug-bg)' } };
    }
  };

  return (
    <section>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '21px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
        Frentes de Investigação da Trilha
      </h2>
      <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
        A trilha progride de instruções assistidas para autonomia completa do analista.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {modules.map((mod) => {
          const isOpen = openFrenteId === mod.id;
          const badge = getGuidanceLabel(mod.guidance_level);

          return (
            <div key={mod.id} style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              overflow: 'hidden'
            }}>
              <div
                onClick={() => toggleFrente(mod.id)}
                style={{
                  padding: '16px 20px',
                  backgroundColor: 'var(--bg-surface-raised)',
                  borderBottom: isOpen ? '1px solid var(--border-subtle)' : 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    fontWeight: 700,
                    backgroundColor: 'var(--bg-surface-sunken)',
                    color: 'var(--text-secondary)',
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-xs)',
                    border: '1px solid var(--border-subtle)'
                  }}>
                    FRENTE {mod.number.toString().padStart(2, '0')}
                  </span>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {mod.title}
                  </span>
                </div>

                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-xs)',
                  border: '1px solid',
                  ...badge.style
                }}>
                  {badge.text}
                </span>
              </div>

              {isOpen && (
                <div style={{ padding: '20px' }}>
                  <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
                    {mod.description}
                  </p>

                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <tbody>
                      {mod.topics.map((topic, idx) => {
                        const isCompleted = completedTopics && topic.code in completedTopics;
                        const score = isCompleted ? completedTopics[topic.code] : null;

                        return (
                          <tr key={topic.id} style={{ borderBottom: idx === mod.topics.length - 1 ? 'none' : '1px solid var(--border-subtle)' }}>
                            <td style={{ padding: '12px 14px' }}>
                              <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                                {topic.order.toString().padStart(2, '0')}. {topic.title}
                              </div>
                              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11.5px', color: 'var(--text-muted)' }}>
                                ALVO: {topic.target_element || 'N/A'}
                              </div>
                            </td>
                            <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                              {isCompleted ? (
                                <span style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  fontFamily: 'var(--font-mono)',
                                  fontSize: '11.5px',
                                  padding: '2px 7px',
                                  borderRadius: 'var(--radius-xs)',
                                  backgroundColor: 'var(--status-pass-bg)',
                                  color: 'var(--status-pass)',
                                  border: '1px solid var(--status-pass)'
                                }}>
                                  ✓ Homologado ({score}%)
                                </span>
                              ) : (
                                <span style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  fontFamily: 'var(--font-mono)',
                                  fontSize: '11.5px',
                                  padding: '2px 7px',
                                  borderRadius: 'var(--radius-xs)',
                                  backgroundColor: 'var(--status-investigating-bg)',
                                  color: 'var(--status-investigating)',
                                  border: '1px solid var(--status-investigating)'
                                }}>
                                  ● Ativo (+{topic.xp_reward} XP)
                                </span>
                              )}
                            </td>
                            <td style={{ padding: '12px 14px', textAlign: 'right', width: '120px' }}>
                              <button
                                type="button"
                                onClick={() => onOpenBriefing(topic)}
                                style={{
                                  backgroundColor: isCompleted ? 'var(--bg-surface-sunken)' : 'var(--accent-command)',
                                  color: isCompleted ? 'var(--text-primary)' : 'var(--accent-command-contrast)',
                                  border: isCompleted ? '1px solid var(--border-strong)' : '1px solid var(--accent-command)',
                                  fontFamily: 'var(--font-sans)',
                                  fontSize: '12px',
                                  fontWeight: 600,
                                  padding: '5px 12px',
                                  borderRadius: 'var(--radius-xs)',
                                  cursor: 'pointer'
                                }}
                              >
                                {isCompleted ? 'Revisar' : 'Investigar'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
