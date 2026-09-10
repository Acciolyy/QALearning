'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  IconArrowRight,
  IconCheck,
  IconChronometer,
  IconCertificate,
  IconBolt,
  IconMedal,
  IconDocumentAudit,
  IconScale,
  IconCodeInspector,
  IconCrosshairTouch
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

interface BadgeItem {
  id: number;
  code: string;
  name: string;
  category: string;
  description: string;
  icon_symbol: string;
  rarity: 'common' | 'notable' | 'rare' | 'chief_inspector' | string;
  xp_reward: number;
  is_unlocked: boolean;
  awarded_at?: string | null;
  evidence?: { topic?: string; [key: string]: unknown } | null;
}

interface AnalystSidebarProps {
  tracks: Track[];
  activeTrackNumber: number;
  onSelectTrack: (track: Track) => void;
  evidences?: Array<{ code: string; title: string; status: string }>;
  xp?: number;
}

const LEVEL_TIERS = [
  { level: 1, title: 'Trainee de QA', short: 'Trainee', min: 0, max: 499 },
  { level: 2, title: 'Analista de QA Jr. I', short: 'Jr. I', min: 500, max: 999 },
  { level: 3, title: 'Analista de QA Jr. II', short: 'Jr. II', min: 1000, max: 1999 },
  { level: 4, title: 'Analista de QA Pleno I', short: 'Pleno I', min: 2000, max: 3499 },
  { level: 5, title: 'Analista de QA Pleno II', short: 'Pleno II', min: 3500, max: 4999 },
  { level: 6, title: 'Especialista de Qualidade', short: 'Especialista', min: 5000, max: 999999 }
];

const WEEK_DAYS = [
  { label: 'SEG', dayIndex: 1 },
  { label: 'TER', dayIndex: 2 },
  { label: 'QUA', dayIndex: 3 },
  { label: 'QUI', dayIndex: 4 },
  { label: 'SEX', dayIndex: 5 },
  { label: 'SÁB', dayIndex: 6 },
  { label: 'DOM', dayIndex: 0 }
];
export const AnalystSidebar: React.FC<AnalystSidebarProps> = ({
  tracks,
  activeTrackNumber,
  onSelectTrack,
  evidences = [
    { code: 'VAL-AGE-001', title: 'Idade 17 anos aceita sem bloqueio no checkout.', status: 'CONFIRMADO' },
    { code: 'SAN-WSP-004', title: 'Campo Nome aceita 5 espaços vazios e avança.', status: 'CONFIRMADO' }
  ],
  xp: externalXp
}) => {
  const [showLockedTracks, setShowLockedTracks] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [badges, setBadges] = useState<BadgeItem[]>([]);
  const [unlockedBadgesCount, setUnlockedBadgesCount] = useState<number>(0);

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

  const fetchBadges = useCallback(() => {
    fetch('http://127.0.0.1:8000/api/v1/gamification/badges/')
      .then(res => res.json())
      .then(data => {
        if (data.badges) {
          setBadges(data.badges);
          setUnlockedBadgesCount(data.unlocked_count || 0);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchProfile();
    fetchBadges();
  }, [fetchProfile, fetchBadges, externalXp]);

  const inFocusNumbers = [0, 1, 2, 3, 4, 5, 6, 7, 12, 14];
  const activeAndNextTracks = tracks.filter(t => inFocusNumbers.includes(t.number));
  const lockedTracks = tracks.filter(t => !inFocusNumbers.includes(t.number));

  const displayXp = externalXp !== undefined ? externalXp : (profile ? profile.total_xp : 1435);

  const currentTier = useMemo(() => {
    return LEVEL_TIERS.find(t => displayXp >= t.min && displayXp <= t.max) || LEVEL_TIERS[2];
  }, [displayXp]);

  const nextTier = useMemo(() => {
    return LEVEL_TIERS.find(t => t.level === currentTier.level + 1) || null;
  }, [currentTier]);

  const tierSpan = currentTier.max - currentTier.min + 1;
  const xpInTier = displayXp - currentTier.min;
  const tierProgressPct = Math.min(100, Math.max(0, Math.round((xpInTier / tierSpan) * 100)));
  const xpToNext = nextTier ? Math.max(0, nextTier.min - displayXp) : 0;

  const callsign = profile?.callsign || 'Thiago Accioly';
  const analystId = profile?.analyst_id || 'QA::ID-842';
  const streak = profile?.streak || {
    enabled: true,
    current_streak: 5,
    longest_streak: 5,
    tolerance_used: true,
    last_practice_date: '2026-09-10',
    is_active_today: true,
    scope: 'global'
  };
  const streakEnabled = profile ? profile.streak_enabled : true;

  const unlockedBadges = useMemo(() => {
    return badges.filter(b => b.is_unlocked);
  }, [badges]);

  const renderBadgeIcon = (code: string) => {
    switch (code) {
      case 'FIRST_AUTOMATION_HOMOLOGATED':
        return <IconBolt size={14} style={{ color: 'var(--copper-signature)' }} />;
      case 'PERFECT_BUG_REPORT':
        return <IconDocumentAudit size={14} style={{ color: 'var(--status-pass)' }} />;
      case 'RAREST_BUG_DISCOVERED':
        return <IconFault size={14} style={{ color: 'var(--status-bug)' }} />;
      case 'ZERO_FALSE_POSITIVES':
        return <IconScale size={14} style={{ color: 'var(--status-pass)' }} />;
      case 'SEVEN_DAY_HABIT':
        return <IconChronometer size={14} style={{ color: 'var(--copper-signature)' }} />;
      case 'CHIEF_AUDITOR':
        return <IconMedal size={14} style={{ color: 'var(--copper-signature)' }} />;
      case 'TENACIOUS_DEBUGGER':
        return <IconCodeInspector size={14} style={{ color: 'var(--text-secondary)' }} />;
      case 'METHODICAL_EXPLORATION':
        return <IconMatrix size={14} style={{ color: 'var(--text-secondary)' }} />;
      default:
        return <IconCertificate size={14} style={{ color: 'var(--copper-signature)' }} />;
    }
  };

  const getRarityConfig = (rarity: string) => {
    switch (rarity) {
      case 'notable':
        return { label: 'NOTÁVEL', color: 'var(--copper-signature)', border: 'rgba(184, 115, 51, 0.4)' };
      case 'rare':
        return { label: 'RARO', color: '#3b82f6', border: 'rgba(59, 130, 246, 0.4)' };
      case 'chief_inspector':
        return { label: 'INSPETOR-CHEFE', color: '#e0a96d', border: 'rgba(224, 169, 109, 0.5)' };
      default:
        return { label: 'COMUM', color: 'var(--text-muted)', border: 'var(--border-subtle)' };
    }
  };

  const formatDate = (isoStr?: string | null) => {
    if (!isoStr) return '';
    try {
      const d = new Date(isoStr);
      return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    } catch {
      return isoStr.split('T')[0] || '';
    }
  };

  const currentDayOfWeek = new Date().getDay();
  return (
    <aside
      aria-label="Painel Lateral do Analista"
      style={{
        width: '320px',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}
    >
      {/* =========================================================================
          CAMADA 1: CREDENCIAL DE SERVIÇO DO ANALISTA (VARIANTE B FORENSE)
          (Chapa de identificação, matrícula institucional e régua de patamares)
         ========================================================================= */}
      <section
        aria-label="Credencial do Inspetor"
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-strong)',
          borderTop: '3px solid var(--copper-signature)',
          boxShadow: 'var(--shadow-subtle)',
          position: 'relative'
        }}
      >
        {/* CABEÇALHO DO CRACHÁ / MATRÍCULA TÉCNICA */}
        <div style={{
          padding: '14px 16px 12px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          backgroundColor: 'var(--bg-surface-raised)'
        }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{
              width: '32px',
              height: '32px',
              backgroundColor: 'var(--bg-surface-sunken)',
              border: '1px solid var(--border-strong)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              fontSize: '11px',
              color: 'var(--copper-signature)',
              letterSpacing: '0.04em',
              boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.2)'
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
                letterSpacing: '0.02em',
                marginTop: '2px'
              }}>
                NÍVEL {String(currentTier.level).padStart(2, '0')} · {currentTier.title.toUpperCase()}
              </div>
            </div>
          </div>

          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            color: 'var(--copper-signature)',
            border: '1px solid var(--border-subtle)',
            padding: '2px 6px',
            borderRadius: '2px',
            backgroundColor: 'var(--bg-surface-sunken)',
            fontWeight: 600,
            letterSpacing: '0.03em'
          }}>
            {analystId}
          </span>
        </div>

        {/* RÉGUA DE PATAMARES (CALIBRE MICROMÉTRICO) */}
        <div style={{ padding: '14px 16px 14px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            marginBottom: '6px'
          }}>
            <span style={{ color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
              RÉGUA DE PATAMARES
            </span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
              {displayXp.toLocaleString()} / {(nextTier ? nextTier.min : currentTier.max + 1).toLocaleString()} XP
            </span>
          </div>

          {/* Calibre visual com entalhes de precisão */}
          <div style={{
            position: 'relative',
            height: '6px',
            backgroundColor: 'var(--bg-surface-sunken)',
            border: '1px solid var(--border-strong)',
            borderRadius: '1px',
            overflow: 'hidden',
            marginBottom: '8px'
          }}>
            <div style={{
              width: `${tierProgressPct}%`,
              height: '100%',
              backgroundColor: 'var(--copper-signature)',
              transition: 'width 0.4s ease'
            }} />
          </div>

          {/* Entalhes e marcas da escala */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontFamily: 'var(--font-mono)',
            fontSize: '9px',
            color: 'var(--text-muted)',
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '4px',
            marginBottom: '10px'
          }}>
            <span>{currentTier.short} ({currentTier.min} XP)</span>
            <span>{nextTier ? `${nextTier.short} (${nextTier.min} XP)` : 'Teto de Carreira'}</span>
          </div>

          {/* Destaque de meta: "Faltam X XP para o patamar Y" */}
          {nextTier && (
            <div style={{
              backgroundColor: 'var(--bg-surface-sunken)',
              border: '1px solid var(--border-subtle)',
              padding: '6px 10px',
              borderRadius: '2px',
              fontFamily: 'var(--font-mono)',
              fontSize: '10.5px',
              color: 'var(--text-secondary)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span>
                Faltam <strong style={{ color: 'var(--copper-signature)' }}>{xpToNext} XP</strong> para o patamar {nextTier.short}
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: '9.5px' }}>
                {tierProgressPct}%
              </span>
            </div>
          )}
        </div>

        {/* =========================================================================
            RELÓGIO MECÂNICO DE CADÊNCIA DIÁRIA
            (Contador numérico de constância + grade semanal com 7 dias)
           ========================================================================= */}
        {streakEnabled && (
          <div style={{
            padding: '12px 16px 14px',
            borderTop: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-surface-raised)'
          }}>
            {/* Linha de status da trava de tolerância */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '10px'
            }}>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '9.5px',
                color: 'var(--text-muted)',
                letterSpacing: '0.05em',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                <IconChronometer size={12} style={{ color: 'var(--copper-signature)' }} />
                CADÊNCIA TÉCNICA
              </span>

              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '9px',
                padding: '1px 6px',
                borderRadius: '2px',
                backgroundColor: streak.tolerance_used ? 'rgba(184, 115, 51, 0.12)' : 'rgba(46, 125, 50, 0.12)',
                color: streak.tolerance_used ? 'var(--copper-signature)' : 'var(--status-pass)',
                border: `1px solid ${streak.tolerance_used ? 'rgba(184, 115, 51, 0.35)' : 'rgba(46, 125, 50, 0.35)'}`
              }}>
                {streak.tolerance_used ? 'Trava de Tolerância: Em Uso' : 'Trava de Tolerância: Pronta'}
              </span>
            </div>

            {/* Destaque numérico: "X DIAS CONSECUTIVOS AUDITADOS" */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '22px',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  lineHeight: 1
                }}>
                  {streak.current_streak}
                </span>
                <span style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  letterSpacing: '0.02em'
                }}>
                  {streak.current_streak === 1 ? 'DIA AUDITADO' : 'DIAS CONSECUTIVOS AUDITADOS'}
                </span>
              </div>

              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)' }}>
                Recorde: {streak.longest_streak}d
              </span>
            </div>

            {/* Grade Semanal de 7 Dias (Matriz de Hábito) */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '4px',
              textAlign: 'center'
            }}>
              {WEEK_DAYS.map((day) => {
                const dayOffsetFromToday = (day.dayIndex === 0 ? 7 : day.dayIndex) - (currentDayOfWeek === 0 ? 7 : currentDayOfWeek);
                const isPastOrToday = dayOffsetFromToday <= 0;
                const isToday = dayOffsetFromToday === 0;
                const wasAudited = isPastOrToday && Math.abs(dayOffsetFromToday) < streak.current_streak;

                return (
                  <div
                    key={day.label}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '8.5px',
                      color: isToday ? 'var(--copper-signature)' : 'var(--text-muted)',
                      fontWeight: isToday ? 700 : 400
                    }}>
                      {day.label}
                    </span>

                    <div style={{
                      width: '100%',
                      height: '26px',
                      backgroundColor: wasAudited
                        ? 'rgba(46, 125, 50, 0.12)'
                        : isToday
                        ? 'var(--bg-surface-sunken)'
                        : 'var(--bg-surface-sunken)',
                      border: wasAudited
                        ? '1px solid rgba(46, 125, 50, 0.4)'
                        : isToday
                        ? '1px solid var(--copper-signature)'
                        : '1px solid var(--border-subtle)',
                      borderRadius: '2px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.15s ease'
                    }}>
                      {wasAudited ? (
                        <IconCheck size={11} style={{ color: 'var(--status-pass)' }} />
                      ) : isToday ? (
                        <span style={{
                          width: '5px',
                          height: '5px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--copper-signature)'
                        }} />
                      ) : (
                        <span style={{
                          width: '3px',
                          height: '3px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--border-strong)'
                        }} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* =========================================================================
          CAMADA 2: QUADRO DE SELOS DE HOMOLOGAÇÃO (DISTINTIVOS REAIS)
          (Exibe selos reais obtidos na API com categoria, raridade e data)
         ========================================================================= */}
      <section
        aria-label="Selos de Homologação"
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-strong)',
          boxShadow: 'var(--shadow-subtle)'
        }}
      >
        <div style={{
          padding: '10px 14px',
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-surface-raised)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <IconCertificate size={13} style={{ color: 'var(--copper-signature)' }} />
            <h3 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--text-primary)',
              margin: 0
            }}>
              Selos de Homologação
            </h3>
          </div>

          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '9.5px',
            color: 'var(--copper-signature)',
            backgroundColor: 'var(--bg-surface-sunken)',
            padding: '1px 6px',
            borderRadius: '2px',
            fontWeight: 600,
            border: '1px solid var(--border-subtle)'
          }}>
            {unlockedBadgesCount} / {badges.length || 8} SELOS
          </span>
        </div>

        {/* Lista compacta de distintivos homologados */}
        <div style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {unlockedBadges.length === 0 ? (
            <div style={{
              fontSize: '11px',
              color: 'var(--text-muted)',
              fontStyle: 'italic',
              padding: '10px 6px',
              fontFamily: 'var(--font-mono)',
              textAlign: 'center'
            }}>
              Nenhum distintivo homologado nesta sessão.
            </div>
          ) : (
            unlockedBadges.slice(0, 3).map((badge) => {
              const rarityConfig = getRarityConfig(badge.rarity);
              return (
                <div
                  key={badge.id}
                  style={{
                    padding: '8px 10px',
                    backgroundColor: 'var(--bg-surface-sunken)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '2px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{
                        width: '20px',
                        height: '20px',
                        backgroundColor: 'var(--bg-surface)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '2px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {renderBadgeIcon(badge.code)}
                      </div>
                      <span style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: 'var(--text-primary)'
                      }}>
                        {badge.name}
                      </span>
                    </div>

                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '9.5px',
                      color: 'var(--copper-signature)',
                      fontWeight: 700
                    }}>
                      +{badge.xp_reward} XP
                    </span>
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '9.5px',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-muted)',
                    paddingTop: '2px'
                  }}>
                    <span style={{
                      color: rarityConfig.color,
                      border: `1px solid ${rarityConfig.border}`,
                      padding: '0 4px',
                      borderRadius: '2px',
                      fontSize: '8.5px'
                    }}>
                      {rarityConfig.label}
                    </span>

                    <span>
                      {badge.awarded_at ? formatDate(badge.awarded_at) : 'HOMOLOGADO'}
                    </span>
                  </div>
                </div>
              );
            })
          )}

          {/* Botão de abrir dossiê completo de distintivos */}
          <button
            type="button"
            onClick={() => setIsBadgesOpen(true)}
            style={{
              marginTop: '4px',
              padding: '6px 8px',
              backgroundColor: 'transparent',
              border: '1px dashed var(--border-subtle)',
              borderRadius: '2px',
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              color: 'var(--copper-signature)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--copper-signature)';
              e.currentTarget.style.backgroundColor = 'var(--bg-surface-sunken)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <span>Ver Dossiê Completo de Selos ({unlockedBadgesCount}/{badges.length || 8})</span>
            <IconArrowRight size={10} />
          </button>
        </div>
      </section>
      {/* =========================================================================
          CAMADA 3: TRABALHO ATIVO // OPERAÇÕES FORENSES
          (Bug Ledger Sheet de alta densidade + Rotas operacionais de trilha)
         ========================================================================= */}
      <section aria-label="Trabalho Ativo" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* 3.1 DOSSIÊ DE EVIDÊNCIAS (BUG LEDGER SHEET) */}
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
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                margin: 0
              }}>
                Dossiê de Evidências
              </h3>
            </div>

            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '9.5px',
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

        {/* 3.2 ROTAS OPERACIONAIS (TRILHAS EM FOCO COM TRILHO VERTICAL) */}
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
              fontSize: '13px',
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
          CAMADA 4: UTILITÁRIOS & ARQUIVO // PRATELEIRA TÉCNICA DE RODAPÉ
          (Gatilhos compactos com ícones técnicos mono-linha)
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
            <span>Matriz Geral</span>
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
            <IconCertificate size={13} style={{ color: 'var(--status-pass)' }} />
            <span>Dossiê Selos</span>
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
          <span>Preferências & Cadência</span>
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
