'use client';

import React, { useEffect, useState } from 'react';

interface BadgeItem {
  id: number;
  code: string;
  name: string;
  category: string;
  description: string;
  icon_symbol: string;
  rarity: string;
  xp_reward: number;
  is_unlocked: boolean;
  awarded_at?: string | null;
  evidence?: Record<string, unknown> | null;
}

interface BadgeDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BadgeDossierModal: React.FC<BadgeDossierModalProps> = ({ isOpen, onClose }) => {
  const [badges, setBadges] = useState<BadgeItem[]>([]);
  const [unlockedCount, setUnlockedCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch('http://127.0.0.1:8000/api/v1/gamification/badges/')
        .then(res => res.json())
        .then(data => {
          if (data.badges) {
            setBadges(data.badges);
            setUnlockedCount(data.unlocked_count || 0);
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getRarityTag = (rarity: string) => {
    switch (rarity) {
      case 'chief_inspector':
        return { label: 'INSPETOR-CHEFE', color: '#ffd700', border: '#ffd700' };
      case 'rare':
        return { label: 'RARO', color: 'var(--copper-signature)', border: 'var(--copper-signature)' };
      case 'notable':
        return { label: 'NOTÁVEL', color: 'var(--pine-accent)', border: 'var(--pine-accent)' };
      default:
        return { label: 'PADRÃO', color: 'var(--text-muted)', border: 'var(--border-subtle)' };
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(10, 15, 12, 0.85)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '24px'
    }}>
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--copper-border)',
        borderRadius: 'var(--radius-sm)',
        width: '100%',
        maxWidth: '860px',
        maxHeight: '85vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
        overflow: 'hidden'
      }}>
        {/* CABEÇALHO */}
        <div style={{
          padding: '20px 28px',
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-surface-sunken)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--copper-signature)', letterSpacing: '0.08em' }}>
              DOSSIÊ DE CONQUISTAS // REGISTRO DE DISTINTIVOS DE QA
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', margin: '4px 0 0 0' }}>
              Selos de Inspeção e Habilitação ({unlockedCount} / {badges.length} Homologados)
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '6px 14px',
              backgroundColor: 'transparent',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-xs)',
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            ✕ Fechar
          </button>
        </div>

        {/* GRADE DE DISTINTIVOS */}
        <div style={{ padding: '28px', overflowY: 'auto', flex: 1 }}>
          {loading ? (
            <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>
              Carregando distintivos...
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
              gap: '16px'
            }}>
              {badges.map(b => {
                const rarity = getRarityTag(b.rarity);
                return (
                  <div
                    key={b.code}
                    style={{
                      backgroundColor: b.is_unlocked ? 'var(--bg-surface-sunken)' : 'rgba(20, 25, 22, 0.4)',
                      border: b.is_unlocked ? '1px solid var(--copper-border)' : '1px dashed var(--border-subtle)',
                      borderRadius: 'var(--radius-xs)',
                      padding: '16px',
                      display: 'flex',
                      gap: '16px',
                      position: 'relative',
                      opacity: b.is_unlocked ? 1 : 0.65
                    }}
                  >
                    {/* ÍCONE / SELO METÁLICO */}
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '4px',
                      backgroundColor: b.is_unlocked ? 'rgba(184, 115, 51, 0.15)' : 'var(--bg-surface-sunken)',
                      border: `1px solid ${b.is_unlocked ? 'var(--copper-signature)' : 'var(--border-subtle)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '22px',
                      flexShrink: 0
                    }}>
                      {b.icon_symbol}
                    </div>

                    {/* DADOS DA BADGE */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 600, color: b.is_unlocked ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                          {b.name}
                        </span>
                        <span style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '9.5px',
                          padding: '1px 6px',
                          borderRadius: '2px',
                          border: `1px solid ${rarity.border}`,
                          color: rarity.color,
                          fontWeight: 700
                        }}>
                          {rarity.label}
                        </span>
                      </div>

                      <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12.5px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.35 }}>
                        {b.description}
                      </p>

                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: '6px',
                        paddingTop: '6px',
                        borderTop: '1px solid var(--border-subtle)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '10.5px'
                      }}>
                        <span style={{ color: 'var(--copper-signature)' }}>+{b.xp_reward} XP</span>
                        {b.is_unlocked ? (
                          <span style={{ color: 'var(--status-pass)', fontWeight: 600 }}>
                            ✓ HOMOLOGADO {b.awarded_at ? new Date(b.awarded_at).toLocaleDateString() : ''}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>EM BLOQUEIO TÉCNICO</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RODAPÉ */}
        <div style={{
          padding: '14px 28px',
          borderTop: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-surface-sunken)',
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          color: 'var(--text-muted)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>DISTINTIVOS VINCULADOS A COMPORTAMENTOS DE QA REAIS</span>
          <span style={{ color: 'var(--copper-signature)' }}>AUTENTICAÇÃO // BUREAU DE INSPEÇÃO</span>
        </div>
      </div>
    </div>
  );
};
