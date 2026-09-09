'use client';

import React from 'react';

interface AuditTopBarProps {
  currentTrackName?: string;
  currentModuleName?: string;
  sessionSeed: string;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onNavigateHub: () => void;
}

export const AuditTopBar: React.FC<AuditTopBarProps> = ({
  currentTrackName = 'TRILHA 01: TESTES MANUAIS',
  currentModuleName = 'MÓDULO 01: FRONTEIRAS',
  sessionSeed,
  isDarkMode,
  onToggleTheme,
  onNavigateHub,
}) => {
  return (
    <header className="audit-topbar" style={{
      backgroundColor: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border-strong)',
      padding: '10px 24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <nav aria-label="Rastreamento de Auditoria" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-mono)', fontSize: '12.5px' }}>
        <button
          type="button"
          onClick={onNavigateHub}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '2px 4px',
            fontFamily: 'var(--font-mono)',
            fontSize: '12.5px'
          }}
        >
          MESA GERAL
        </button>
        <span style={{ color: 'var(--border-strong)', userSelect: 'none' }}>//</span>
        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{currentTrackName}</span>
        {currentModuleName && (
          <>
            <span style={{ color: 'var(--border-strong)', userSelect: 'none' }}>//</span>
            <span style={{ color: 'var(--text-secondary)' }}>{currentModuleName}</span>
          </>
        )}
      </nav>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '11.5px',
          backgroundColor: 'var(--bg-surface-sunken)',
          border: '1px solid var(--border-subtle)',
          padding: '3px 8px',
          borderRadius: 'var(--radius-xs)',
          color: 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--copper-signature)' }}></span>
          <span>SEED ACTIVA: <strong style={{ color: 'var(--text-primary)' }}>{sessionSeed}</strong></span>
        </div>

        <button
          type="button"
          onClick={onToggleTheme}
          style={{
            backgroundColor: 'var(--bg-surface-sunken)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-secondary)',
            fontFamily: 'var(--font-mono)',
            fontSize: '11.5px',
            padding: '4px 10px',
            borderRadius: 'var(--radius-xs)',
            cursor: 'pointer'
          }}
        >
          MODO: {isDarkMode ? 'NOITE CONÍFERA' : 'CARTÃO KRAFT'}
        </button>
      </div>
    </header>
  );
};
