'use client';

import React, { useState } from 'react';
import { Track } from '../types/curriculum';

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
  xp = 1420,
}) => {
  const [showLockedTracks, setShowLockedTracks] = useState(false);

  // Separação em trilhas ativas/disponíveis vs bloqueadas
  const activeAndNextTracks = tracks.filter(t => t.number <= 3);
  const lockedTracks = tracks.filter(t => t.number > 3);
  const pct = Math.min(Math.round((xp / 2000) * 100), 100);

  return (
    <aside style={{
      width: '320px',
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    }}>
      {/* IDENTIFICAÇÃO DO ANALISTA COMPACTA & PROGRESSO */}
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
                Thiago Accioly
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10.5px', color: 'var(--text-muted)' }}>
                NÍVEL 04 · ANALISTA JR. II
              </div>
            </div>
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--copper-signature)' }}>
            QA::ID-842
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-secondary)' }}>
          <span>PROGRESSO</span>
          <strong style={{ color: 'var(--text-primary)' }}>{xp.toLocaleString()} / 2.000 XP ({pct}%)</strong>
        </div>
        <div style={{ height: '4px', backgroundColor: 'var(--bg-surface-sunken)', borderRadius: '2px', overflow: 'hidden', marginTop: '6px' }}>
          <div style={{ width: `${pct}%`, height: '100%', backgroundColor: 'var(--copper-signature)', transition: 'width 0.3s ease' }}></div>
        </div>
      </div>

      {/* BUG LEDGER / EVIDÊNCIAS DA SESSÃO (EM DESTAQUE) */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-strong)',
        borderTop: '3px solid var(--status-bug)',
        borderRadius: 'var(--radius-sm)',
        padding: '18px 20px',
        boxShadow: 'var(--shadow-subtle)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
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

      {/* RADAR DE TRILHAS: PROGRESSIVO E ERGONÔMICO */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-sm)',
        padding: '18px 20px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
            Trilhas em Foco
          </h3>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10.5px', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
            FASE ATIVA
          </span>
        </div>

        {/* TRILHAS DISPONÍVEIS AGORA */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
          {activeAndNextTracks.map((track) => {
            const isActive = track.number === activeTrackNumber;
            return (
              <button
                key={track.id}
                type="button"
                onClick={() => onSelectTrack(track)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 12px',
                  backgroundColor: isActive ? 'var(--bg-surface-sunken)' : 'transparent',
                  border: isActive ? '1px solid var(--border-strong)' : '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-xs)',
                  color: 'var(--text-primary)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: isActive ? 'var(--copper-signature)' : 'var(--text-muted)'
                  }}>
                    {track.number.toString().padStart(2, '0')}
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: isActive ? 600 : 400 }}>
                    {track.name}
                  </span>
                </div>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  color: isActive ? 'var(--status-pass)' : 'var(--text-muted)',
                  fontWeight: 600
                }}>
                  {isActive ? '● ATIVA' : 'DISPONÍVEL'}
                </span>
              </button>
            );
          })}
        </div>

        {/* ACCORDION DISCRETO PARA TRILHAS BLOQUEADAS */}
        <div style={{ borderTop: '1px dashed var(--border-subtle)', paddingTop: '10px' }}>
          <button
            type="button"
            onClick={() => setShowLockedTracks(!showLockedTracks)}
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'none',
              border: 'none',
              padding: '6px 0',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <span>Trilhas em Desbloqueio ({lockedTracks.length})</span>
            <span>{showLockedTracks ? '▲' : '▼'}</span>
          </button>

          {showLockedTracks && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px' }}>
              {lockedTracks.map((t) => (
                <div
                  key={t.id}
                  style={{
                    padding: '6px 8px',
                    fontSize: '12px',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    opacity: 0.6
                  }}
                >
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px' }}>🔒</span>
                  <span>{t.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
