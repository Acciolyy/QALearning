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

  // Derivação 100% dinâmica a partir do backend (Track.status e Track.is_frozen)
  const activeAndNextTracks = tracks.filter(t => t.status !== 'in_construction');
  const inConstructionTracks = tracks.filter(t => t.status === 'in_construction');

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
  const targetTierXp = nextTier ? nextTier.min : currentTier.max + 1;

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
        return <IconBolt size={13} style={{ color: 'var(--copper-signature)' }} />;
      case 'PERFECT_BUG_REPORT':
        return <IconDocumentAudit size={13} style={{ color: 'var(--status-pass)' }} />;
      case 'RAREST_BUG_DISCOVERED':
        return <IconFault size={13} style={{ color: 'var(--status-bug)' }} />;
      case 'ZERO_FALSE_POSITIVES':
        return <IconScale size={13} style={{ color: 'var(--status-pass)' }} />;
      case 'SEVEN_DAY_HABIT':
        return <IconChronometer size={13} style={{ color: 'var(--copper-signature)' }} />;
      case 'CHIEF_AUDITOR':
        return <IconMedal size={13} style={{ color: 'var(--copper-signature)' }} />;
      case 'TENACIOUS_DEBUGGER':
        return <IconCodeInspector size={13} style={{ color: 'var(--text-secondary)' }} />;
      case 'METHODICAL_EXPLORATION':
        return <IconMatrix size={13} style={{ color: 'var(--text-secondary)' }} />;
      default:
        return <IconCertificate size={13} style={{ color: 'var(--copper-signature)' }} />;
    }
  };

  const getRarityConfig = (rarity: string) => {
    switch (rarity) {
      case 'notable':
        return { label: 'NOTÁVEL', color: 'var(--copper-signature)', border: 'rgba(184, 115, 51, 0.5)' };
      case 'rare':
        return { label: 'RARO', color: '#2563eb', border: 'rgba(37, 99, 235, 0.5)' };
      case 'chief_inspector':
        return { label: 'INSPETOR', color: '#b45309', border: 'rgba(180, 83, 9, 0.6)' };
      default:
        return { label: 'COMUM', color: 'var(--text-secondary)', border: 'var(--border-strong)' };
    }
  };

  const formatDate = (isoStr?: string | null) => {
    if (!isoStr) return '';
    try {
      const d = new Date(isoStr);
      return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
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
        gap: '12px'
      }}
    >
      {/* =========================================================================
          CAMADA 1: CREDENCIAL DE SERVIÇO & CADÊNCIA (UNIFICADA E COMPACTA)
          (Identidade, matrícula, régua micrométrica e régua semanal em bloco único)
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
        {/* FAIXA 1.1: CABEÇALHO DO CRACHÁ & MATRÍCULA */}
        <div style={{
          padding: '10px 14px 8px',
          borderBottom: '1px solid var(--border-strong)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'var(--bg-surface-raised)'
        }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div style={{
              width: '26px',
              height: '26px',
              backgroundColor: 'var(--bg-surface-sunken)',
              border: '1px solid var(--border-strong)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              fontSize: '10px',
              color: 'var(--copper-signature)',
              letterSpacing: '0.04em'
            }}>
              QA
            </div>

            <div>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 600,
                fontSize: '13.5px',
                color: 'var(--text-primary)',
                lineHeight: 1.15
              }}>
                {callsign}
              </div>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '9.5px',
                color: 'var(--text-secondary)',
                letterSpacing: '0.02em',
                fontWeight: 600
              }}>
                NÍVEL {String(currentTier.level).padStart(2, '0')} · {currentTier.short.toUpperCase()}
              </div>
            </div>
          </div>

          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '9.5px',
            color: 'var(--copper-signature)',
            border: '1px solid var(--border-strong)',
            padding: '1px 5px',
            borderRadius: '2px',
            backgroundColor: 'var(--bg-surface-sunken)',
            fontWeight: 700,
            letterSpacing: '0.03em'
          }}>
            {analystId}
          </span>
        </div>

        {/* FAIXA 1.2: RÉGUA DE PATAMARES (CALIBRE MICROMÉTRICO COMPACTO) */}
        <div style={{ padding: '8px 14px 8px', borderBottom: '1px solid var(--border-strong)' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            fontFamily: 'var(--font-mono)',
            fontSize: '9.5px',
            marginBottom: '4px'
          }}>
            <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>
              {displayXp.toLocaleString('pt-BR')} / {targetTierXp.toLocaleString('pt-BR')} XP
            </span>
            {nextTier && (
              <span style={{ color: 'var(--copper-signature)', fontWeight: 600 }}>
                Faltam {xpToNext} XP para {nextTier.short} ({tierProgressPct}%)
              </span>
            )}
          </div>

          {/* Calibre visual com entalhes de precisão */}
          <div style={{
            position: 'relative',
            height: '4px',
            backgroundColor: 'var(--bg-surface-sunken)',
            border: '1px solid var(--border-strong)',
            borderRadius: '1px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${tierProgressPct}%`,
              height: '100%',
              backgroundColor: 'var(--copper-signature)',
              transition: 'width 0.4s ease'
            }} />
          </div>
        </div>

        {/* FAIXA 1.3: CADÊNCIA TÉCNICA & GRADE SEMANAL (MATRIZ DE HÁBITO) */}
        {streakEnabled && (
          <div style={{
            padding: '8px 14px 10px',
            backgroundColor: 'var(--bg-surface-raised)'
          }}>
            {/* Cálculos determinísticos da janela de cadência */}
            {(() => {
              const dow = currentDayOfWeek === 0 ? 7 : currentDayOfWeek;
              const daysInWeekAudited = Math.min(streak.current_streak, dow);
              const priorAuditedDays = Math.max(0, streak.current_streak - daysInWeekAudited);

              return (
                <>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '6px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px' }}>
                      <span style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: streak.is_active_today ? 'var(--status-pass)' : 'var(--copper-signature)',
                        display: 'inline-block'
                      }} />
                      <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '10.5px',
                        fontWeight: 700,
                        color: 'var(--text-primary)'
                      }}>
                        {streak.current_streak} {streak.current_streak === 1 ? 'DIA AUDITADO' : 'DIAS CONSECUTIVOS'}
                      </span>
                    </div>

                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '8.5px',
                      padding: '1px 5px',
                      borderRadius: '2px',
                      backgroundColor: streak.tolerance_used ? 'rgba(184, 115, 51, 0.14)' : 'rgba(36, 107, 70, 0.14)',
                      color: streak.tolerance_used ? 'var(--copper-signature)' : 'var(--status-pass)',
                      border: `1px solid ${streak.tolerance_used ? 'var(--copper-signature)' : 'var(--status-pass)'}`,
                      fontWeight: 600
                    }}>
                      {streak.tolerance_used ? 'Tolerância em uso' : 'Tolerância pronta'}
                    </span>
                  </div>

                  {/* Grade Semanal com Coluna Adicional do Recorte Anterior (8 Colunas quando há dias anteriores) */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: priorAuditedDays > 0 ? 'repeat(8, 1fr)' : 'repeat(7, 1fr)',
                    gap: '3px',
                    textAlign: 'center'
                  }}>
                    {priorAuditedDays > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'center' }}>
                        <span style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '8px',
                          color: 'var(--text-secondary)',
                          fontWeight: 700
                        }}>
                          ANT.
                        </span>
                        <div style={{
                          width: '100%',
                          height: '18px',
                          backgroundColor: 'rgba(36, 107, 70, 0.15)',
                          border: '1px solid var(--status-pass)',
                          borderRadius: '1px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }} title={`Dia anterior homologado (${priorAuditedDays} dia(s) na semana anterior)`}>
                          <IconCheck size={9} style={{ color: 'var(--status-pass)' }} />
                        </div>
                      </div>
                    )}

                    {WEEK_DAYS.map((day) => {
                      const dayOffsetFromToday = (day.dayIndex === 0 ? 7 : day.dayIndex) - dow;
                      const isPastOrToday = dayOffsetFromToday <= 0;
                      const isToday = dayOffsetFromToday === 0;
                      const wasAudited = isPastOrToday && Math.abs(dayOffsetFromToday) < streak.current_streak;

                      return (
                        <div key={day.label} style={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'center' }}>
                          <span style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '8px',
                            color: isToday ? 'var(--copper-signature)' : 'var(--text-secondary)',
                            fontWeight: isToday ? 700 : 600
                          }}>
                            {day.label}
                          </span>

                          <div style={{
                            width: '100%',
                            height: '18px',
                            backgroundColor: wasAudited
                              ? 'rgba(36, 107, 70, 0.15)'
                              : 'var(--bg-surface-sunken)',
                            border: wasAudited
                              ? '1px solid var(--status-pass)'
                              : isToday
                              ? '1.5px solid var(--copper-signature)'
                              : '1px solid var(--border-strong)',
                            borderRadius: '1px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            {wasAudited ? (
                              <IconCheck size={9} style={{ color: 'var(--status-pass)' }} />
                            ) : isToday ? (
                              <span style={{
                                width: '4px',
                                height: '4px',
                                borderRadius: '50%',
                                backgroundColor: 'var(--copper-signature)'
                              }} />
                            ) : (
                              <span style={{
                                width: '2.5px',
                                height: '2.5px',
                                borderRadius: '50%',
                                backgroundColor: 'var(--border-strong)'
                              }} />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              );
            })()}
          </div>
        )}
      </section>

      {/* =========================================================================
          CAMADA 2: SELOS DE HOMOLOGAÇÃO (GRADE COMPACTA 2 COLUNAS)
          (Exibe selos reais obtidos na API em cards compactos lado a lado)
         ========================================================================= */}
      <section
        aria-label="Selos de Homologação"
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-strong)',
          borderTop: '2px solid var(--copper-signature)',
          boxShadow: 'var(--shadow-subtle)'
        }}
      >
        <div style={{
          padding: '7px 12px',
          borderBottom: '1px solid var(--border-strong)',
          backgroundColor: 'var(--bg-surface-raised)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <IconCertificate size={12} style={{ color: 'var(--copper-signature)' }} />
            <h3 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--text-primary)',
              margin: 0
            }}>
              Selos de Homologação
            </h3>
          </div>

          <button
            type="button"
            onClick={() => setIsBadgesOpen(true)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
              fontSize: '9px',
              color: 'var(--copper-signature)',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '3px'
            }}
          >
            <span>{unlockedBadgesCount} / {badges.length || 8} SELOS</span>
            <IconArrowRight size={8} />
          </button>
        </div>

        {/* Grade compacta de 2 colunas para os selos */}
        <div style={{ padding: '6px 8px' }}>
          {unlockedBadges.length === 0 ? (
            <div style={{
              fontSize: '10.5px',
              color: 'var(--text-secondary)',
              fontStyle: 'italic',
              padding: '6px 4px',
              fontFamily: 'var(--font-mono)',
              textAlign: 'center'
            }}>
              Nenhum distintivo homologado nesta sessão.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
              {unlockedBadges.slice(0, 2).map((badge) => {
                const rarityConfig = getRarityConfig(badge.rarity);
                return (
                  <div
                    key={badge.id}
                    onClick={() => setIsBadgesOpen(true)}
                    style={{
                      padding: '5px 7px',
                      backgroundColor: 'var(--bg-surface-sunken)',
                      border: '1px solid var(--border-strong)',
                      borderRadius: '2px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '3px',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {renderBadgeIcon(badge.code)}
                        <span style={{
                          fontFamily: 'var(--font-sans)',
                          fontSize: '10.5px',
                          fontWeight: 700,
                          color: 'var(--text-primary)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: '90px'
                        }}>
                          {badge.name.replace(' Homologada', '').replace(' Homologado', '')}
                        </span>
                      </div>

                      <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '9px',
                        color: 'var(--copper-signature)',
                        fontWeight: 700
                      }}>
                        +{badge.xp_reward}
                      </span>
                    </div>

                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '8.5px',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--text-secondary)'
                    }}>
                      <span style={{
                        color: rarityConfig.color,
                        border: `1px solid ${rarityConfig.border}`,
                        padding: '0 3px',
                        borderRadius: '2px',
                        fontSize: '8px',
                        fontWeight: 600
                      }}>
                        {rarityConfig.label}
                      </span>
                      <span>{badge.awarded_at ? formatDate(badge.awarded_at) : 'OK'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
      {/* =========================================================================
          CAMADA 3: TRABALHO ATIVO // OPERAÇÕES FORENSES (FOCO OPERACIONAL)
          (Bug Ledger Sheet com alto contraste + Trilhas operacionais com trilho vertical)
         ========================================================================= */}
      <section aria-label="Trabalho Ativo" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {/* 3.1 DOSSIÊ DE EVIDÊNCIAS (BUG LEDGER SHEET) */}
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-strong)',
          borderTop: '3px solid var(--status-bug)',
          boxShadow: 'var(--shadow-subtle)'
        }}>
          <div style={{
            padding: '8px 12px',
            borderBottom: '1px solid var(--border-strong)',
            backgroundColor: 'var(--bg-surface-raised)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <IconFault size={13} style={{ color: 'var(--status-bug)' }} />
              <h3 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '12.5px',
                fontWeight: 700,
                color: 'var(--text-primary)',
                margin: 0
              }}>
                Dossiê de Evidências
              </h3>
            </div>

            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '9px',
              backgroundColor: 'var(--status-bug-bg)',
              color: 'var(--status-bug)',
              padding: '1px 5px',
              borderRadius: 'var(--radius-xs)',
              fontWeight: 700,
              border: '1px solid var(--status-bug)'
            }}>
              {evidences.length} CONFIRMADAS
            </span>
          </div>

          <div style={{ padding: '6px 8px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {evidences.length === 0 ? (
              <div style={{
                fontSize: '11px',
                color: 'var(--text-secondary)',
                fontStyle: 'italic',
                padding: '6px 4px',
                fontFamily: 'var(--font-mono)'
              }}>
                Nenhum bug registrado nesta sessão ainda.
              </div>
            ) : (
              evidences.map((evi) => (
                <div
                  key={evi.code}
                  style={{
                    padding: '6px 8px',
                    backgroundColor: 'var(--bg-surface-sunken)',
                    border: '1px solid var(--border-strong)',
                    borderRadius: 'var(--radius-xs)',
                    fontSize: '11.5px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      fontSize: '10px',
                      color: 'var(--copper-signature)'
                    }}>
                      § {evi.code}
                    </span>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '9px',
                      color: 'var(--status-bug)',
                      fontWeight: 700
                    }}>
                      CONFIRMADO
                    </span>
                  </div>
                  <div style={{ color: 'var(--text-primary)', fontSize: '11px', lineHeight: 1.35, fontWeight: 500 }}>
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
          border: '1px solid var(--border-strong)',
          borderTop: '2px solid var(--border-strong)',
          padding: '10px 14px',
          boxShadow: 'var(--shadow-subtle)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: '10px',
            borderBottom: '1px solid var(--border-strong)',
            paddingBottom: '5px'
          }}>
            <h3 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '12.5px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              margin: 0
            }}>
              Trilhas em Foco
            </h3>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-secondary)', fontWeight: 600 }}>
              EM INVESTIGAÇÃO
            </span>
          </div>

          {/* TRILHO VERTICAL DE PROGRESSÃO */}
          <div style={{
            position: 'relative',
            paddingLeft: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}>
            <div style={{
              position: 'absolute',
              left: '3px',
              top: '10px',
              bottom: '10px',
              width: '1.5px',
              backgroundColor: 'var(--border-strong)'
            }} />

            {activeAndNextTracks.map(t => {
              const isActive = t.number === activeTrackNumber;
              const isFrozen = Boolean(t.is_frozen || t.status === 'frozen');

              return (
                <button
                  key={t.id}
                  type="button"
                  disabled={isFrozen}
                  onClick={() => {
                    if (!isFrozen) onSelectTrack(t);
                  }}
                  title={isFrozen ? 'Trilha congelada para auditoria de rede dedicada (ADR-0013)' : undefined}
                  style={{
                    position: 'relative',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '5px 8px',
                    backgroundColor: isActive ? 'var(--bg-surface-sunken)' : 'transparent',
                    border: `1px solid ${isActive ? 'var(--copper-signature)' : 'transparent'}`,
                    borderRadius: 'var(--radius-xs)',
                    color: isFrozen ? 'var(--text-secondary)' : (isActive ? 'var(--copper-signature)' : 'var(--text-primary)'),
                    fontFamily: 'var(--font-sans)',
                    fontSize: '12px',
                    cursor: isFrozen ? 'not-allowed' : 'pointer',
                    opacity: isFrozen ? 0.72 : 1,
                    textAlign: 'left',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span style={{
                    position: 'absolute',
                    left: '-14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: isFrozen ? 'var(--border-strong)' : (isActive ? 'var(--copper-signature)' : 'var(--border-strong)'),
                    border: '1px solid var(--bg-surface)'
                  }} />

                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '10.5px' }}>
                      {String(t.number).padStart(2, '0')}
                    </strong>
                    <span style={{ fontWeight: isActive ? 700 : 500 }}>{t.name}</span>
                  </span>

                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '9px',
                    fontWeight: 600,
                    color: isFrozen ? 'var(--text-secondary)' : (isActive ? 'var(--copper-signature)' : 'var(--text-secondary)'),
                    border: isFrozen ? '1px solid var(--border-strong)' : 'none',
                    padding: isFrozen ? '1px 5px' : '0',
                    borderRadius: isFrozen ? '2px' : '0',
                    backgroundColor: isFrozen ? 'var(--bg-surface-sunken)' : 'transparent'
                  }}>
                    {isFrozen ? 'CONGELADA' : (isActive ? '● ATIVA' : 'DISPONÍVEL')}
                  </span>
                </button>
              );
            })}
          </div>

          {/* TRILHAS EM CONSTRUÇÃO RECOLHÍVEIS */}
          {inConstructionTracks.length > 0 && (
            <div style={{ marginTop: '8px', paddingTop: '6px', borderTop: '1px solid var(--border-strong)' }}>
              <button
                type="button"
                onClick={() => setShowLockedTracks(!showLockedTracks)}
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '3px 2px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '9.5px',
                  color: 'var(--text-secondary)',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <span>Trilhas em construção ({inConstructionTracks.length})</span>
                <span>{showLockedTracks ? '▲' : '▼'}</span>
              </button>

              {showLockedTracks && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '4px' }}>
                  {inConstructionTracks.map(t => (
                    <div
                      key={t.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '3px 6px',
                        fontSize: '11px',
                        color: 'var(--text-secondary)',
                        fontFamily: 'var(--font-sans)',
                        opacity: 0.85
                      }}
                    >
                      <span>{String(t.number).padStart(2, '0')}. {t.name}</span>
                      <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '8.5px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px',
                        fontWeight: 600,
                        color: 'var(--text-secondary)',
                        padding: '1px 5px',
                        borderRadius: '2px',
                        backgroundColor: 'var(--bg-surface-sunken)',
                        border: '1px solid var(--border-strong)'
                      }}>
                        EM CONSTRUÇÃO
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
          (Gatilhos compactos com ícones técnicos mono-linha e contornos fortes)
         ========================================================================= */}
      <nav
        aria-label="Prateleira de Utilitários"
        style={{
          borderTop: '1px solid var(--border-strong)',
          paddingTop: '8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '5px'
        }}
      >
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '5px'
        }}>
          <button
            type="button"
            onClick={() => setIsSkillTreeOpen(true)}
            style={{
              padding: '6px 8px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-strong)',
              borderRadius: 'var(--radius-xs)',
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              fontWeight: 600,
              color: 'var(--text-primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--copper-signature)';
              e.currentTarget.style.backgroundColor = 'var(--bg-surface-sunken)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-strong)';
              e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
            }}
          >
            <IconMatrix size={12} style={{ color: 'var(--copper-signature)' }} />
            <span>Matriz Geral</span>
          </button>

          <button
            type="button"
            onClick={() => setIsBadgesOpen(true)}
            style={{
              padding: '6px 8px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-strong)',
              borderRadius: 'var(--radius-xs)',
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              fontWeight: 600,
              color: 'var(--text-primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--copper-signature)';
              e.currentTarget.style.backgroundColor = 'var(--bg-surface-sunken)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-strong)';
              e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
            }}
          >
            <IconCertificate size={12} style={{ color: 'var(--status-pass)' }} />
            <span>Dossiê Selos</span>
          </button>
        </div>

        {/* AJUSTES E PRIVACIDADE DO ANALISTA */}
        <button
          type="button"
          onClick={() => setIsSettingsOpen(true)}
          style={{
            padding: '6px 8px',
            backgroundColor: 'transparent',
            border: '1px dashed var(--border-strong)',
            borderRadius: 'var(--radius-xs)',
            color: 'var(--text-secondary)',
            fontWeight: 600,
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--text-primary)';
            e.currentTarget.style.borderColor = 'var(--copper-signature)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-secondary)';
            e.currentTarget.style.borderColor = 'var(--border-strong)';
          }}
        >
          <IconSettings size={11} />
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
