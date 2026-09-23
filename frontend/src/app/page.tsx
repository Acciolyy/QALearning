'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Track, ProfileData } from '../types/curriculum';
import { useTheme } from '../lib/theme/ThemeContext';
import { API_BASE_URL } from '../lib/config';
import { AuditTopBar } from '../components/AuditTopBar';
import { AnalystSidebar } from '../components/AnalystSidebar';
import {
  IconArrowRight,
  IconSecurityLatch,
  IconAuditShield,
  IconCheck,
  IconMatrix,
  IconViewfinder
} from '../components/TechnicalIcons';

export default function HubPanoramaPage() {
  const router = useRouter();
  const { isDarkMode, toggleTheme } = useTheme();
  const [sessionSeed] = useState<string>('#481029');
  const [tracks, setTracks] = useState<Track[]>([]);
  const [profile, setProfile] = useState<ProfileData | null>(null);

  // Carrega catálogo oficial de trilhas da API
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/v1/curriculum/tracks/`)
      .then(res => res.json())
      .then(data => {
        const results = data.results || data;
        if (Array.isArray(results) && results.length > 0) {
          setTracks(results);
        }
      })
      .catch(() => {});
  }, []);

  // Carrega perfil oficial com XP, tópico ativo e progresso por trilha da API
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/v1/gamification/profile/`)
      .then(res => res.json())
      .then(data => {
        if (data.callsign) {
          setProfile(data);
        }
      })
      .catch(() => {});
  }, []);

  // Totais consolidados derivados estritamente do backend
  const telemetry = useMemo(() => {
    const totalTracks = tracks.length;
    const availableTracksCount = tracks.filter(t => t.status === 'available').length;
    const frozenTracksCount = tracks.filter(t => t.status === 'frozen' || Boolean(t.is_frozen)).length;
    const inConstructionCount = tracks.filter(t => t.status === 'in_construction').length;

    let totalCatalogTopics = 0;
    let totalCompletedTopics = 0;

    if (profile?.tracks_progress) {
      for (const stat of Object.values(profile.tracks_progress)) {
        totalCatalogTopics += stat.total_topics;
        totalCompletedTopics += stat.completed_topics;
      }
    } else {
      totalCatalogTopics = tracks.reduce((acc, t) => acc + (t.total_topics || 0), 0);
      totalCompletedTopics = profile?.completed_topics ? Object.keys(profile.completed_topics).length : 0;
    }

    const globalPercentage = totalCatalogTopics > 0
      ? Math.round((totalCompletedTopics / totalCatalogTopics) * 100)
      : 0;

    return {
      totalTracks,
      availableTracksCount,
      frozenTracksCount,
      inConstructionCount,
      totalCatalogTopics,
      totalCompletedTopics,
      globalPercentage
    };
  }, [tracks, profile]);

  const displayXp = profile ? profile.total_xp : 0;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-app)' }}>
      <AuditTopBar
        currentTrackName="MESA GERAL // HUB PANORÂMICO"
        currentModuleName="MATRIZ INTEGRADA DE CAPACITAÇÃO"
        sessionSeed={sessionSeed}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
        onNavigateHub={() => {}}
      />

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 340px',
        gap: '32px',
        maxWidth: '1400px',
        width: '100%',
        margin: '0 auto',
        padding: '32px 24px 64px',
        flexGrow: 1
      }}>
        <main style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* BANNER DO BUREAU DE INSPEÇÃO & TELEMETRIA CONSOLIDADA */}
          <section
            aria-label="Painel de Telemetria do Hub"
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-strong)',
              borderTop: '3px solid var(--copper-signature)',
              borderRadius: 'var(--radius-sm)',
              padding: '24px 28px',
              boxShadow: 'var(--shadow-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--copper-signature)' }}>
                <IconMatrix size={16} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em' }}>
                  BUREAU DE INSPEÇÃO // MATRIZ DE CAPACITAÇÃO FORENSE
                </span>
              </div>
              <h1 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '26px',
                fontWeight: 700,
                color: 'var(--text-primary)',
                margin: '0 0 10px',
                lineHeight: 1.25
              }}>
                Visão Panorâmica de Trilhas & Certificação
              </h1>
              <p style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '13.5px',
                color: 'var(--text-secondary)',
                lineHeight: 1.5,
                margin: 0,
                maxWidth: '780px'
              }}>
                Mapa integrado das 15 frentes de auditoria e engenharia de qualidade de software. Selecione uma trilha disponível para investigar casos no laboratório sandbox ou acompanhar o status de homologação de cada especialidade técnica.
              </p>
            </div>

            {/* CHAPA TABULAR DE TELEMETRIA GLOBAL */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '12px',
              backgroundColor: 'var(--bg-surface-sunken)',
              border: '1px solid var(--border-strong)',
              borderRadius: 'var(--radius-xs)',
              padding: '12px 16px'
            }}>
              <div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9.5px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  TRILHAS LIBERADAS
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {telemetry.availableTracksCount.toLocaleString('pt-BR')} <span style={{ fontSize: '11.5px', fontWeight: 400, color: 'var(--text-muted)' }}>/ {telemetry.totalTracks.toLocaleString('pt-BR')}</span>
                </span>
              </div>

              <div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9.5px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  TÓPICOS HOMOLOGADOS
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '16px', fontWeight: 700, color: 'var(--status-pass)' }}>
                  {telemetry.totalCompletedTopics.toLocaleString('pt-BR')} <span style={{ fontSize: '11.5px', fontWeight: 400, color: 'var(--text-muted)' }}>/ {telemetry.totalCatalogTopics.toLocaleString('pt-BR')}</span>
                </span>
              </div>

              <div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9.5px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  TAXA DE APROVAÇÃO
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {telemetry.globalPercentage.toLocaleString('pt-BR')}%
                </span>
              </div>

              <div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9.5px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  EXPERIÊNCIA DO ANALISTA
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '16px', fontWeight: 700, color: 'var(--copper-signature)' }}>
                  {displayXp.toLocaleString('pt-BR')} XP
                </span>
              </div>
            </div>
          </section>

          {/* GRID PANORÂMICO DAS 15 TRILHAS */}
          <section aria-label="Catálogo das 15 Trilhas">
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: '16px',
              borderBottom: '1px solid var(--border-strong)',
              paddingBottom: '8px'
            }}>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '16px',
                fontWeight: 700,
                color: 'var(--text-primary)',
                margin: 0
              }}>
                Catálogo de Trilhas Forenses (15 Frentes)
              </h2>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10.5px', color: 'var(--text-secondary)' }}>
                9 DISPONÍVEIS · 2 CONGELADAS (ADR-0013) · 4 EM CONSTRUÇÃO
              </span>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '16px'
            }}>
              {tracks.map(track => {
                // Correção 3: Estado "ativa" derivado comparando track.slug com active_track_slug
                const isActive = Boolean(
                  profile?.active_track_slug
                    ? track.slug === profile.active_track_slug
                    : track.number === (profile?.active_track_number ?? 1)
                );
                const isFrozen = track.status === 'frozen' || Boolean(track.is_frozen);
                const isInConstruction = track.status === 'in_construction';

                // Progresso estrito derivado do backend
                const progressStat = profile?.tracks_progress?.[track.slug];
                const totalTopics = progressStat ? progressStat.total_topics : (track.total_topics || 0);
                const completedTopics = progressStat ? progressStat.completed_topics : 0;
                const progressPercent = progressStat ? progressStat.progress_percent : 0;

                const isInteractive = !isFrozen && !isInConstruction;

                return (
                  <article
                    key={track.id}
                    style={{
                      backgroundColor: isInteractive ? 'var(--bg-surface)' : 'var(--bg-surface-sunken)',
                      border: `1px solid ${isActive ? 'var(--copper-signature)' : 'var(--border-strong)'}`,
                      borderTop: isActive ? '3px solid var(--copper-signature)' : '1px solid var(--border-strong)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '16px 18px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '14px',
                      boxShadow: 'var(--shadow-subtle)',
                      transition: 'border-color 0.15s ease'
                    }}
                  >
                    <div>
                      {/* CABEÇALHO DO CARD */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '11px',
                          fontWeight: 700,
                          color: isActive ? 'var(--copper-signature)' : 'var(--text-muted)'
                        }}>
                          TRILHA {String(track.number).padStart(2, '0')}
                        </span>

                        {/* BADGES OFICIAIS DOS 4 ESTADOS */}
                        <span style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '9px',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: 'var(--radius-xs)',
                          border: `1px solid ${
                            isActive
                              ? 'var(--copper-signature)'
                              : isFrozen
                              ? 'var(--border-strong)'
                              : isInConstruction
                              ? 'var(--border-strong)'
                              : 'var(--border-strong)'
                          }`,
                          backgroundColor: isActive ? 'var(--bg-surface-sunken)' : 'transparent',
                          color: isActive
                            ? 'var(--copper-signature)'
                            : isFrozen
                            ? 'var(--text-secondary)'
                            : isInConstruction
                            ? 'var(--text-muted)'
                            : 'var(--text-secondary)'
                        }}>
                          {isActive
                            ? '● ATIVA'
                            : isFrozen
                            ? 'CONGELADA (ADR-0013)'
                            : isInConstruction
                            ? 'EM CONSTRUÇÃO'
                            : 'DISPONÍVEL'}
                        </span>
                      </div>

                      {/* TÍTULO & CATEGORIA */}
                      <h3 style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '17px',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        margin: '0 0 4px',
                        lineHeight: 1.3
                      }}>
                        {track.name}
                      </h3>

                      <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '10px',
                        color: 'var(--text-muted)',
                        display: 'block',
                        marginBottom: '8px',
                        textTransform: 'uppercase'
                      }}>
                        {track.category}
                      </span>

                      <p style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: '12.5px',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.45,
                        margin: 0
                      }}>
                        {track.description}
                      </p>
                    </div>

                    {/* SEÇÃO DE PROGRESSO E AÇÃO */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '10px', borderTop: '1px solid var(--border-strong)' }}>
                      {/* MÉTRICAS DE PROGRESSO */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Progresso da Trilha:</span>
                        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                          {isFrozen || isInConstruction
                            ? '— / — tópicos'
                            : `${completedTopics.toLocaleString('pt-BR')} / ${totalTopics.toLocaleString('pt-BR')} tópicos (${progressPercent.toLocaleString('pt-BR')}%)`}
                        </span>
                      </div>

                      {/* RÉGUA MECÂNICA DE PROGRESSO */}
                      {(() => {
                        const progressWidth = isInteractive ? progressPercent : 0;
                        const barColor = progressPercent === 100 ? 'var(--status-pass)' : 'var(--copper-signature)';
                        return (
                          <div style={{
                            width: '100%',
                            height: '4px',
                            backgroundColor: 'var(--bg-surface-sunken)',
                            borderRadius: '2px',
                            overflow: 'hidden',
                            border: '1px solid var(--border-subtle)'
                          }}>
                            <div style={{
                              height: '100%',
                              width: `${progressWidth}%`,
                              backgroundColor: barColor,
                              transition: 'width 0.3s ease'
                            }} />
                          </div>
                        );
                      })()}

                      {/* GATILHO DE NAVEGAÇÃO OU BLOQUEIO */}
                      {isActive ? (
                        <button
                          type="button"
                          onClick={() => router.push(`/trilha/${track.slug}`)}
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            padding: '8px 12px',
                            backgroundColor: 'var(--accent-command)',
                            color: 'var(--accent-command-contrast)',
                            border: 'none',
                            borderRadius: 'var(--radius-xs)',
                            fontFamily: 'var(--font-sans)',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <IconViewfinder size={13} />
                          <span>Continuar Investigação Ativa</span>
                          <IconArrowRight size={13} />
                        </button>
                      ) : isInteractive ? (
                        <button
                          type="button"
                          onClick={() => router.push(`/trilha/${track.slug}`)}
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            padding: '8px 12px',
                            backgroundColor: 'var(--bg-surface-sunken)',
                            color: 'var(--text-primary)',
                            border: '1px solid var(--border-strong)',
                            borderRadius: 'var(--radius-xs)',
                            fontFamily: 'var(--font-sans)',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <span>Acessar Mesa de Investigação</span>
                          <IconArrowRight size={13} />
                        </button>
                      ) : isFrozen ? (
                        <div style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          padding: '7px 12px',
                          backgroundColor: 'transparent',
                          color: 'var(--text-secondary)',
                          border: '1px dashed var(--border-strong)',
                          borderRadius: 'var(--radius-xs)',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '10.5px',
                          cursor: 'not-allowed'
                        }}>
                          <IconSecurityLatch size={12} />
                          <span>Congelada · Rede Isolada (ADR-0013)</span>
                        </div>
                      ) : (
                        <div style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          padding: '7px 12px',
                          backgroundColor: 'transparent',
                          color: 'var(--text-muted)',
                          border: '1px dashed var(--border-strong)',
                          borderRadius: 'var(--radius-xs)',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '10.5px',
                          cursor: 'not-allowed'
                        }}>
                          <IconAuditShield size={12} />
                          <span>Em Construção · Laboratório Futuro</span>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </main>

        {/* SIDEBAR COM HIDE_TRACK_LIST={TRUE} */}
        <AnalystSidebar
          tracks={tracks}
          hideTrackList={true}
          evidences={[]}
        />
      </div>
    </div>
  );
}
