'use client';

import React from 'react';
import { Track } from '../types/curriculum';

interface AnalystSidebarProps {
  tracks: Track[];
  activeTrackNumber: number;
  onSelectTrack: (track: Track) => void;
}

export const AnalystSidebar: React.FC<AnalystSidebarProps> = ({
  tracks,
  activeTrackNumber,
  onSelectTrack,
}) => {
  return (
    <aside style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* IDENTIFICAÇÃO DO ANALISTA */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-sm)',
        padding: '20px',
        boxShadow: 'var(--shadow-subtle)'
      }}>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '11.5px',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: 'var(--text-muted)',
          marginBottom: '16px',
          display: 'flex',
          justifyContent: 'space-between'
        }}>
          <span>Identificação do Analista</span>
          <span style={{ color: 'var(--copper-signature)' }}>QA::ID-842</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: 'var(--radius-xs)',
            backgroundColor: 'var(--bg-surface-sunken)',
            border: '1px solid var(--border-strong)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            fontSize: '15px',
            color: 'var(--copper-signature)'
          }}>
            QA
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Thiago Accioly
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Nível 04 // Analista Jr. II
            </div>
          </div>
        </div>

        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
          <span>PROGRESSO DE CARREIRA</span>
          <strong style={{ color: 'var(--text-primary)' }}>68% (1.420 / 2.000 XP)</strong>
        </div>
        <div style={{ height: '5px', backgroundColor: 'var(--bg-surface-sunken)', borderRadius: '2px', overflow: 'hidden', marginTop: '8px' }}>
          <div style={{ width: '68%', height: '100%', backgroundColor: 'var(--copper-signature)' }}></div>
        </div>
      </div>

      {/* RADAR DE TRILHAS */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-sm)',
        padding: '20px',
        boxShadow: 'var(--shadow-subtle)'
      }}>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '11.5px',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: 'var(--text-muted)',
          marginBottom: '16px',
          display: 'flex',
          justifyContent: 'space-between'
        }}>
          <span>Radar de Trilhas de QA</span>
          <span>1 / 15 ATIVA</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {tracks.map((track) => {
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
                  padding: '6px 8px',
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
                <span>{track.number.toString().padStart(2, '0')}. {track.name}</span>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  color: isActive ? 'var(--copper-signature)' : 'var(--text-muted)'
                }}>
                  {isActive ? '● ATIVA' : '○ 0%'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* BUG LEDGER */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-sm)',
        padding: '20px',
        boxShadow: 'var(--shadow-subtle)'
      }}>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '11.5px',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: 'var(--text-muted)',
          marginBottom: '14px',
          display: 'flex',
          justifyContent: 'space-between'
        }}>
          <span>Evidências Mapeadas</span>
          <span style={{ color: 'var(--status-bug)' }}>2 REGISTRADAS</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{
            backgroundColor: 'var(--bg-surface-sunken)',
            borderLeft: '3px solid var(--status-bug)',
            padding: '8px 12px',
            borderRadius: '0 var(--radius-xs) var(--radius-xs) 0',
            fontSize: '12.5px'
          }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 600, color: 'var(--status-bug)', display: 'flex', justifyContent: 'space-between' }}>
              <span>BUG #VAL-AGE-001</span>
              <span>CONFIRMADO</span>
            </div>
            <div style={{ color: 'var(--text-secondary)', marginTop: '3px', lineHeight: 1.4 }}>
              Idade 17 anos aceita sem bloqueio no checkout.
            </div>
          </div>

          <div style={{
            backgroundColor: 'var(--bg-surface-sunken)',
            borderLeft: '3px solid var(--status-bug)',
            padding: '8px 12px',
            borderRadius: '0 var(--radius-xs) var(--radius-xs) 0',
            fontSize: '12.5px'
          }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 600, color: 'var(--status-bug)', display: 'flex', justifyContent: 'space-between' }}>
              <span>BUG #SAN-WSP-004</span>
              <span>CONFIRMADO</span>
            </div>
            <div style={{ color: 'var(--text-secondary)', marginTop: '3px', lineHeight: 1.4 }}>
              Campo Nome aceita espaços vazios e avança.
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
