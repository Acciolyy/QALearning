'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Track } from '../types/curriculum';
import { SkillTreeModal } from './SkillTreeModal';
import { BadgeDossierModal } from './BadgeDossierModal';
import { GamificationSettingsModal } from './GamificationSettingsModal';

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

  // Separação em trilhas ativas/disponíveis vs bloqueadas
  const activeAndNextTracks = tracks.filter(t => t.number <= 3);
  const lockedTracks = tracks.filter(t => t.number > 3);

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
    <aside style={{
      width: '320px',
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }}>
      {/* 1. IDENTIFICAÇÃO DO ANALISTA COMPACTA & PROGRESSO DE CARREIRA */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-sm)',
        padding: '14px 18px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-xs)',
              backgroundColor: 'var(--bg-surface-sunken)',
              border: '1px solid var(--copper-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              color: 'var(--copper-signature)',
              fontSize: '13px'
            }}>
              QA
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)', lineHeight: 1.2 }}>
                {callsign}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10.5px', color: 'var(--text-muted)' }}>
                NÍVEL {String(rank.level).padStart(2, '0')} · {rank.title.toUpperCase()}
              </div>
            </div>
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--copper-signature)' }}>
            {analystId}
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-secondary)' }}>
          <span>PROGRESSO</span>
          <strong style={{ color: 'var(--text-primary)' }}>{displayXp.toLocaleString()} / {rank.max_xp + 1} XP ({rank.pct}%)</strong>
        </div>
        <div style={{ height: '4px', backgroundColor: 'var(--bg-surface-sunken)', borderRadius: '2px', overflow: 'hidden', marginTop: '6px' }}>
          <div style={{ width: `${rank.pct}%`, height: '100%', backgroundColor: 'var(--copper-signature)', transition: 'width 0.3s ease' }}></div>
        </div>
      </div>

      {/* 2. WIDGET DISCRETO DE SEQUÊNCIA DE PRÁTICA (STREAK) - OMITIDO SE DESLIGADO */}
      {streakEnabled && streak && (
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)',
          padding: '12px 18px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10.5px', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
              SEQUÊNCIA DE PRÁTICA
            </span>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              padding: '1px 6px',
              borderRadius: '2px',
              backgroundColor: streak.tolerance_used ? 'rgba(184, 115, 51, 0.12)' : 'rgba(46, 125, 50, 0.12)',
              color: streak.tolerance_used ? 'var(--copper-signature)' : 'var(--status-pass)',
              border: `1px solid ${streak.tolerance_used ? 'rgba(184, 115, 51, 0.3)' : 'rgba(46, 125, 50, 0.3)'}`
            }}>
              {streak.tolerance_used ? 'Tolerância semanal em uso' : 'Tolerância semanal disponível'}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                display: 'inline-block',
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: streak.is_active_today ? 'var(--status-pass)' : 'var(--text-muted)'
              }} />
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {streak.current_streak} {streak.current_streak === 1 ? 'dia' : 'dias'} de constância
              </span>
            </div>

            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10.5px', color: 'var(--text-muted)' }}>
              Recorde: {streak.longest_streak}d
            </span>
          </div>
        </div>
      )}

      {/* 3. BOTÕES DE ACESSO RÁPIDO À GAMIFICAÇÃO */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '8px'
      }}>
        <button
          onClick={() => setIsSkillTreeOpen(true)}
          style={{
            padding: '8px 10px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xs)',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          <span>🗺️</span>
          <span>Matriz de Trilhas</span>
        </button>

        <button
          onClick={() => setIsBadgesOpen(true)}
          style={{
            padding: '8px 10px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xs)',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: 'var(--copper-signature)',
            cursor: 'pointer',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          <span>🎖️</span>
          <span>Distintivos</span>
        </button>
      </div>

      {/* 4. BUG LEDGER / EVIDÊNCIAS DA SESSÃO (EM DESTAQUE) */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-strong)',
        borderTop: '3px solid var(--status-bug)',
        borderRadius: 'var(--radius-sm)',
        padding: '16px 18px',
        boxShadow: 'var(--shadow-subtle)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
            Evidências da Sessão
          </h3>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10.5px',
            backgroundColor: 'var(--status-bug-bg)',
            color: 'var(--status-bug)',
            padding: '2px 7px',
            borderRadius: 'var(--radius-xs)',
            fontWeight: 700,
            border: '1px solid var(--status-bug)'
          }}>
            {evidences.length} CONFIRMADAS
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {evidences.length === 0 ? (
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic', padding: '10px 0' }}>
              Nenhum bug reportado nesta sessão ainda.
            </div>
          ) : (
            evidences.map((evi) => (
              <div
                key={evi.code}
                style={{
                  padding: '9px 12px',
                  backgroundColor: 'var(--bg-surface-sunken)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-xs)',
                  fontSize: '12.5px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '11px', color: 'var(--copper-signature)' }}>
                    BUG #{evi.code}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--status-bug)' }}>
                    CONFIRMADO
                  </span>
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '12px', lineHeight: 1.35 }}>
                  {evi.title}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 5. TRILHAS EM FOCO */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-sm)',
        padding: '16px 18px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
            Trilhas em Foco
          </h3>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)' }}>
            FASE ATIVA
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {activeAndNextTracks.map(t => {
            const isActive = t.number === activeTrackNumber;
            return (
              <button
                key={t.id}
                onClick={() => onSelectTrack(t)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 12px',
                  backgroundColor: isActive ? 'var(--bg-surface-sunken)' : 'transparent',
                  border: `1px solid ${isActive ? 'var(--copper-signature)' : 'transparent'}`,
                  borderRadius: 'var(--radius-xs)',
                  color: isActive ? 'var(--copper-signature)' : 'var(--text-secondary)',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '13px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>{String(t.number).padStart(2, '0')}</strong>
                  <span>{t.name}</span>
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: isActive ? 'var(--copper-signature)' : 'var(--text-muted)' }}>
                  {isActive ? '● ATIVA' : 'DISPONÍVEL'}
                </span>
              </button>
            );
          })}
        </div>

        {/* TRILHAS BLOQUEADAS RECOLHÍVEIS */}
        {lockedTracks.length > 0 && (
          <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)' }}>
            <button
              onClick={() => setShowLockedTracks(!showLockedTracks)}
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '6px 4px',
                backgroundColor: 'transparent',
                border: 'none',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
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
                      padding: '6px 10px',
                      fontSize: '12px',
                      color: 'var(--text-muted)',
                      fontFamily: 'var(--font-sans)',
                      opacity: 0.7
                    }}
                  >
                    <span>{String(t.number).padStart(2, '0')}. {t.name}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px' }}>🔒 NÍVEL {t.number}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 6. BOTÃO DE PREFERÊNCIAS / CONFIGURAÇÕES */}
      <button
        onClick={() => setIsSettingsOpen(true)}
        style={{
          padding: '8px 12px',
          backgroundColor: 'transparent',
          border: '1px dashed var(--border-subtle)',
          borderRadius: 'var(--radius-xs)',
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}
      >
        <span>⚙️</span>
        <span>Configurações & Privacidade do Analista</span>
      </button>

      {/* MODAIS */}
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
