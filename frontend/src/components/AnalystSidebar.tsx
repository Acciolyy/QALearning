'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Track } from '../types/curriculum';
import { SkillTreeModal } from './SkillTreeModal';
import { BadgeDossierModal } from './BadgeDossierModal';
import { GamificationSettingsModal } from './GamificationSettingsModal';
import {
  IconMatrix,
  IconBadge,
  IconSettings,
  IconCadencePulse,
  IconSecurityLatch,
  IconFault,
  IconArrowRight
} from './TechnicalIcons';

interface StreakData {
  enabled: boolean;
  current_streak: number;
  longest_streak: number;
  tolerance_used: boolean;
  last_practice_date: string | null;
  is_active_today: boolean;
  scope: string;
}

interface RankInfo {
  level: number;
  title: string;
  current_xp: number;
  min_xp: number;
  max_xp: number;
  pct: number;
  xp_to_next: number;
}

interface ProfileData {
  id: number;
  callsign: string;
  analyst_id: string;
  total_xp: number;
  streak_enabled: boolean;
  rank_info: RankInfo;
  streak: StreakData | null;
}

interface AnalystSidebarProps {
  tracks: Track[];
  activeTrackNumber: number;
  onSelectTrack: (track: Track) => void;
  evidences?: Array<{ code: string; title: string; status: string }>;
  xp?: number;
}

export const AnalystSidebar: React.FC<AnalystSidebarProps> = ({
  tracks,
  activeTrackNumber,
  onSelectTrack,
  evidences = [
    { code: 'VAL-AGE-001', title: 'Idade 17 anos aceita sem bloqueio no checkout.', status: 'CONFIRMADO' },
    { code: 'SAN-WSP-004', title: 'Campo Nome aceita 5 espaços vazios e avança.', status: 'CONFIRMADO' },
  ],
  xp: externalXp
}) => {
  const [showLockedTracks, setShowLockedTracks] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);

  // Modais de Gamificação
  const [isSkillTreeOpen, setIsSkillTreeOpen] = useState(false);
  const [isBadgesOpen, setIsBadgesOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const fetchProfile = useCallback(() => {
    fetch('http://127.0.0.1:8000/api/v1/gamification/profile/')
      .then(res => res.json())
      .then(data => {
        if (data.callsign) setProfile(data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile, externalXp]);

  const activeAndNextTracks = tracks.filter(t => t.number <= 3 || t.number === 12);
  const lockedTracks = tracks.filter(t => t.number > 3 && t.number !== 12);

  const displayXp = externalXp !== undefined ? externalXp : (profile ? profile.total_xp : 1420);
  const rank = profile?.rank_info || {
    level: 3,
    title: 'Analista de QA Jr. II',
    current_xp: displayXp,
    min_xp: 1000,
    max_xp: 1999,
    pct: Math.min(Math.round((displayXp / 2000) * 100), 100),
    xp_to_next: Math.max(0, 2000 - displayXp)
  };

  const callsign = profile?.callsign || 'Thiago Accioly';
  const analystId = profile?.analyst_id || 'QA::ID-842';
  const streak = profile?.streak;
  const streakEnabled = profile ? profile.streak_enabled : true;

  return (
    <aside
      aria-label="Painel Lateral do Analista"
      style={{
        width: '320px',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '24px' // Espaçamento deliberado entre camadas
      }}
    >
      {/* =========================================================================
          CAMADA 1: IDENTIDADE & HÁBITO // CREDENCIAL DE SERVIÇO DO ANALISTA
          (Unifica perfil, XP e cadência em um único bloco de credencial)
         ========================================================================= */}
      <section
        aria-label="Credencial do Inspetor"
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-strong)',
          borderTop: '3px solid var(--copper-signature)',
          boxShadow: 'var(--shadow-subtle)'
        }}
      >
        {/* CABEÇALHO DO CRACHÁ / MATRÍCULA */}
        <div style={{
          padding: '14px 16px 12px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{
              width: '30px',
              height: '30px',
              backgroundColor: 'var(--bg-surface-sunken)',
              border: '1px solid var(--border-strong)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              fontSize: '11px',
              color: 'var(--copper-signature)',
              letterSpacing: '0.04em'
            }}>
              QA
            </div>

            <div>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 600,
                fontSize: '14.5px',
                color: 'var(--text-primary)',
                lineHeight: 1.2
              }}>
                {callsign}
              </div>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                color: 'var(--text-muted)',
                letterSpacing: '0.02em'
              }}>
                NÍVEL {String(rank.level).padStart(2, '0')} · {rank.title.toUpperCase()}
              </div>
            </div>
          </div>

          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            color: 'var(--copper-signature)',
            border: '1px solid var(--border-subtle)',
            padding: '1px 5px',
            borderRadius: '2px',
            backgroundColor: 'var(--bg-surface-sunken)'
          }}>
            {analystId}
          </span>
        </div>

        {/* MEDIDOR DE CARREIRA E PROGRESSO XP */}
        <div style={{ padding: '10px 16px 12px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontFamily: 'var(--font-mono)',
            fontSize: '10.5px',
            marginBottom: '5px'
          }}>
            <span style={{ color: 'var(--text-muted)' }}>PROGRESSO DE NÍVEL</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
              {displayXp.toLocaleString()} / {(rank.max_xp + 1).toLocaleString()} XP ({rank.pct}%)
            </span>
          </div>

          <div style={{
            height: '4px',
            backgroundColor: 'var(--bg-surface-sunken)',
            borderRadius: '2px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${rank.pct}%`,
              height: '100%',
              backgroundColor: 'var(--copper-signature)',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>

        {/* SUB-BLOCO DE CADÊNCIA DIÁRIA (INTEGRADO NA CREDENCIAL) */}
        {streakEnabled && streak && (
          <div style={{
            padding: '10px 16px 12px',
            borderTop: '1px dashed var(--border-subtle)',
            backgroundColor: 'var(--bg-surface-sunken)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '6px'
            }}>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                color: 'var(--text-muted)',
                letterSpacing: '0.05em',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                <IconCadencePulse size={12} />
                CADÊNCIA DIÁRIA
              </span>

              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '9.5px',
                padding: '1px 5px',
                borderRadius: '2px',
                backgroundColor: streak.tolerance_used ? 'rgba(184, 115, 51, 0.12)' : 'rgba(46, 125, 50, 0.12)',
                color: streak.tolerance_used ? 'var(--copper-signature)' : 'var(--status-pass)',
                border: `1px solid ${streak.tolerance_used ? 'rgba(184, 115, 51, 0.3)' : 'rgba(46, 125, 50, 0.3)'}`
              }}>
                {streak.tolerance_used ? 'Tolerância em uso' : 'Tolerância pronta'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{
                  display: 'inline-block',
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: streak.is_active_today ? 'var(--status-pass)' : 'var(--text-muted)'
                }} />
                <span style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  color: 'var(--text-primary)'
                }}>
                  {streak.current_streak} {streak.current_streak === 1 ? 'dia' : 'dias'} de constância
                </span>
              </div>

              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)' }}>
                Recorde: {streak.longest_streak}d
              </span>
            </div>
          </div>
        )}
      </section>

      {/* =========================================================================
          CAMADA 2: TRABALHO ATIVO // OPERAÇÕES FORENSES
          (Bug Ledger de alta densidade + Rotas com trilho vertical)
         ========================================================================= */}
      <section aria-label="Trabalho Ativo" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* 2.1 DOSSIÊ DE ANOMALIAS (BUG LEDGER SHEET) */}
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-strong)',
          borderTop: '3px solid var(--status-bug)',
          boxShadow: 'var(--shadow-subtle)'
        }}>
          <div style={{
            padding: '10px 14px',
            borderBottom: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-surface-raised)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <IconFault size={13} style={{ color: 'var(--status-bug)' }} />
              <h3 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '13.5px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                margin: 0
              }}>
                Dossiê de Evidências
              </h3>
            </div>

            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              backgroundColor: 'var(--status-bug-bg)',
              color: 'var(--status-bug)',
              padding: '1px 6px',
              borderRadius: 'var(--radius-xs)',
              fontWeight: 700,
              border: '1px solid var(--status-bug)'
            }}>
              {evidences.length} CONFIRMADAS
            </span>
          </div>

          <div style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {evidences.length === 0 ? (
              <div style={{
                fontSize: '11.5px',
                color: 'var(--text-muted)',
                fontStyle: 'italic',
                padding: '8px 4px',
                fontFamily: 'var(--font-mono)'
              }}>
                Nenhum bug registrado nesta sessão ainda.
              </div>
            ) : (
              evidences.map((evi) => (
                <div
                  key={evi.code}
                  style={{
                    padding: '7px 10px',
                    backgroundColor: 'var(--bg-surface-sunken)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-xs)',
                    fontSize: '12px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      fontSize: '10.5px',
                      color: 'var(--copper-signature)'
                    }}>
                      § {evi.code}
                    </span>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '9.5px',
                      color: 'var(--status-bug)',
                      fontWeight: 600
                    }}>
                      CONFIRMADO
                    </span>
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '11.5px', lineHeight: 1.35 }}>
                    {evi.title}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 2.2 ROTAS OPERACIONAIS (TRILHAS EM FOCO COM TRILHO VERTICAL) */}
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          padding: '14px 16px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: '12px',
            borderBottom: '1px solid var(--border-subtle)',
            paddingBottom: '6px'
          }}>
            <h3 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '13.5px',
              fontWeight: 600,
              color: 'var(--text-primary)',
              margin: 0
            }}>
              Trilhas em Foco
            </h3>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9.5px', color: 'var(--text-muted)' }}>
              EM INVESTIGAÇÃO
            </span>
          </div>

          {/* TRILHO VERTICAL DE PROGRESSÃO */}
          <div style={{
            position: 'relative',
            paddingLeft: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            {/* Linha vertical conectora */}
            <div style={{
              position: 'absolute',
              left: '4px',
              top: '12px',
              bottom: '12px',
              width: '1.5px',
              backgroundColor: 'var(--border-strong)'
            }} />

            {activeAndNextTracks.map(t => {
              const isActive = t.number === activeTrackNumber;
              return (
                <button
                  key={t.id}
                  onClick={() => onSelectTrack(t)}
                  style={{
                    position: 'relative',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '6px 10px',
                    backgroundColor: isActive ? 'var(--bg-surface-sunken)' : 'transparent',
                    border: `1px solid ${isActive ? 'var(--copper-signature)' : 'transparent'}`,
                    borderRadius: 'var(--radius-xs)',
                    color: isActive ? 'var(--copper-signature)' : 'var(--text-secondary)',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '12.5px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {/* Ponto de ancoragem no trilho */}
                  <span style={{
                    position: 'absolute',
                    left: '-16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    backgroundColor: isActive ? 'var(--copper-signature)' : 'var(--border-strong)',
                    border: '1.5px solid var(--bg-surface)'
                  }} />

                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                      {String(t.number).padStart(2, '0')}
                    </strong>
                    <span style={{ fontWeight: isActive ? 600 : 400 }}>{t.name}</span>
                  </span>

                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '9.5px',
                    color: isActive ? 'var(--copper-signature)' : 'var(--text-muted)'
                  }}>
                    {isActive ? '● ATIVA' : 'DISPONÍVEL'}
                  </span>
                </button>
              );
            })}
          </div>

          {/* TRILHAS BLOQUEADAS RECOLHÍVEIS */}
          {lockedTracks.length > 0 && (
            <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)' }}>
              <button
                type="button"
                onClick={() => setShowLockedTracks(!showLockedTracks)}
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '4px 2px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10.5px',
                  color: 'var(--text-muted)',
                  cursor: 'pointer'
                }}
              >
                <span>Trilhas em Desbloqueio ({lockedTracks.length})</span>
                <span>{showLockedTracks ? '▲' : '▼'}</span>
              </button>

              {showLockedTracks && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
                  {lockedTracks.map(t => (
                    <div
                      key={t.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '4px 8px',
                        fontSize: '11.5px',
                        color: 'var(--text-muted)',
                        fontFamily: 'var(--font-sans)',
                        opacity: 0.75
                      }}
                    >
                      <span>{String(t.number).padStart(2, '0')}. {t.name}</span>
                      <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '9.5px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <IconSecurityLatch size={10} />
                        NÍVEL {t.number}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* =========================================================================
          CAMADA 3: UTILITÁRIOS & ARQUIVO // PRATELEIRA TÉCNICA DE RODAPÉ
          (Gatilhos compactos com ícones técnicos mono-linha, sem caixas empilhadas)
         ========================================================================= */}
      <nav
        aria-label="Prateleira de Utilitários"
        style={{
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}
      >
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '6px'
        }}>
          <button
            type="button"
            onClick={() => setIsSkillTreeOpen(true)}
            style={{
              padding: '7px 10px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-xs)',
              fontFamily: 'var(--font-mono)',
              fontSize: '10.5px',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-strong)';
              e.currentTarget.style.backgroundColor = 'var(--bg-surface-sunken)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
              e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
            }}
          >
            <IconMatrix size={13} style={{ color: 'var(--copper-signature)' }} />
            <span>Matriz de Trilhas</span>
          </button>

          <button
            type="button"
            onClick={() => setIsBadgesOpen(true)}
            style={{
              padding: '7px 10px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-xs)',
              fontFamily: 'var(--font-mono)',
              fontSize: '10.5px',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-strong)';
              e.currentTarget.style.backgroundColor = 'var(--bg-surface-sunken)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
              e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
            }}
          >
            <IconBadge size={13} style={{ color: 'var(--status-pass)' }} />
            <span>Distintivos</span>
          </button>
        </div>

        {/* AJUSTES E PRIVACIDADE DO ANALISTA */}
        <button
          type="button"
          onClick={() => setIsSettingsOpen(true)}
          style={{
            padding: '7px 10px',
            backgroundColor: 'transparent',
            border: '1px dashed var(--border-subtle)',
            borderRadius: 'var(--radius-xs)',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
            fontSize: '10.5px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--text-primary)';
            e.currentTarget.style.borderColor = 'var(--border-strong)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-muted)';
            e.currentTarget.style.borderColor = 'var(--border-subtle)';
          }}
        >
          <IconSettings size={12} />
          <span>Configurações & Privacidade</span>
        </button>
      </nav>

      {/* MODAIS DE SUPORTE */}
      <SkillTreeModal
        isOpen={isSkillTreeOpen}
        onClose={() => setIsSkillTreeOpen(false)}
        onSelectTrack={(num) => {
          const target = tracks.find(t => t.number === num);
          if (target) onSelectTrack(target);
        }}
      />

      <BadgeDossierModal
        isOpen={isBadgesOpen}
        onClose={() => setIsBadgesOpen(false)}
      />

      <GamificationSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        streakEnabled={streakEnabled}
        onToggleStreak={(newState) => {
          if (profile) {
            setProfile({ ...profile, streak_enabled: newState });
          }
          fetchProfile();
        }}
      />
    </aside>
  );
};
