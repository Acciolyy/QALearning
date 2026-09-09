'use client';

import React, { useState } from 'react';
import { Track } from '../types/curriculum';

interface AnalystSidebarProps {
  tracks: Track[];
  activeTrackNumber: number;
  onSelectTrack: (track: Track) => void;
  evidences?: Array<{ code: string; title: string; status: string }>;
}

export const AnalystSidebar: React.FC<AnalystSidebarProps> = ({
  tracks,
  activeTrackNumber,
  onSelectTrack,
  evidences = [
    { code: 'VAL-AGE-001', title: 'Idade 17 anos aceita sem bloqueio no checkout.', status: 'CONFIRMADO' },
    { code: 'SAN-WSP-004', title: 'Campo Nome aceita 5 espaços vazios e avança.', status: 'CONFIRMADO' },
  ],
}) => {
  const [showLockedTracks, setShowLockedTracks] = useState(false);

  // Separação em trilhas ativas/disponíveis vs bloqueadas
  const activeAndNextTracks = tracks.filter(t => t.number <= 3);
  const lockedTracks = tracks.filter(t => t.number > 3);

  return (
    <aside style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* IDENTIFICAÇÃO DO ANALISTA COMPACTA */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-sm)',
        padding: '14px 18px',
        boxShadow: 'var(--shadow-subtle)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-xs)',
              backgroundColor: 'var(--bg-surface-sunken)',
              border: '1px solid var(--border-strong)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              fontSize: '13px',
              color: 'var(--copper-signature)'
            }}>
              QA
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                Thiago Accioly
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
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
          <strong style={{ color: 'var(--text-primary)' }}>1.420 / 2.000 XP (68%)</strong>
        </div>
        <div style={{ height: '4px', backgroundColor: 'var(--bg-surface-sunken)', borderRadius: '2px', overflow: 'hidden', marginTop: '6px' }}>
          <div style={{ width: '68%', height: '100%', backgroundColor: 'var(--copper-signature)' }}></div>
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
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '11.5px',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: 'var(--text-muted)',
          marginBottom: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Evidências da Sessão</span>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10.5px',
            backgroundColor: 'var(--status-bug-bg)',
            color: 'var(--status-bug)',
            border: '1px solid var(--status-bug)',
            padding: '2px 6px',
            borderRadius: 'var(--radius-xs)',
            fontWeight: 600
          }}>
            {evidences.length} CONFIRMADAS
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {evidences.map((evi, idx) => (
            <div key={idx} style={{
              backgroundColor: 'var(--bg-surface-sunken)',
              borderLeft: '3px solid var(--status-bug)',
              padding: '8px 10px',
              borderRadius: '0 var(--radius-xs) var(--radius-xs) 0',
              fontSize: '12px'
            }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 600, color: 'var(--status-bug)', display: 'flex', justifyContent: 'space-between' }}>
                <span>BUG #{evi.code}</span>
                <span style={{ fontSize: '10px' }}>{evi.status}</span>
              </div>
              <div style={{ color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.35 }}>
                {evi.title}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RADAR DE TRILHAS — DISCRETO E PROGRESSIVO */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-sm)',
        padding: '16px 18px',
        boxShadow: 'var(--shadow-subtle)'
      }}>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '11.5px',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: 'var(--text-muted)',
          marginBottom: '12px',
          display: 'flex',
          justifyContent: 'space-between'
        }}>
          <span>Trilhas em Foco</span>
          <span style={{ color: 'var(--copper-signature)' }}>FASE ATIVA</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
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
                  padding: '7px 10px',
                  borderRadius: 'var(--radius-xs)',
                  border: isActive ? '1px solid var(--border-strong)' : '1px solid transparent',
                  backgroundColor: isActive ? 'var(--bg-surface-sunken)' : 'transparent',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontFamily: 'var(--font-sans)',
                  fontWeight: isActive ? 600 : 400
                }}
              >
                <span>{track.name}</span>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  color: isActive ? 'var(--copper-signature)' : 'var(--text-muted)'
                }}>
                  {isActive ? '● ATIVA' : 'DISPONÍVEL'}
                </span>
              </button>
            );
          })}

          {/* Seção discreta de trilhas em desbloqueio */}
          <div style={{ marginTop: '8px', borderTop: '1px dashed var(--border-subtle)', paddingTop: '8px' }}>
            <button
              type="button"
              onClick={() => setShowLockedTracks(prev => !prev)}
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                cursor: 'pointer',
                padding: '4px 0'
              }}
            >
              <span>Trilhas em Desbloqueio ({lockedTracks.length})</span>
              <span>{showLockedTracks ? '▲' : '▼'}</span>
            </button>

            {showLockedTracks && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
                {lockedTracks.map(track => (
                  <div key={track.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '12px',
                    color: 'var(--text-muted)',
                    padding: '4px 6px'
                  }}>
                    <span>{track.name}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px' }}>BLOQUEADA</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};
