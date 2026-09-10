'use client';

import React, { useState } from 'react';

interface GamificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  streakEnabled: boolean;
  onToggleStreak: (newState: boolean) => void;
}

export const GamificationSettingsModal: React.FC<GamificationSettingsModalProps> = ({
  isOpen,
  onClose,
  streakEnabled,
  onToggleStreak
}) => {
  const [isToggling, setIsToggling] = useState(false);

  if (!isOpen) return null;

  const handleToggle = async () => {
    setIsToggling(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/gamification/profile/toggle-streak/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !streakEnabled })
      });
      if (res.ok) {
        const data = await res.json();
        onToggleStreak(data.streak_enabled);
      }
    } catch {
      onToggleStreak(!streakEnabled);
    } finally {
      setIsToggling(false);
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
        maxWidth: '540px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
        overflow: 'hidden'
      }}>
        {/* CABEÇALHO */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-surface-sunken)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--copper-signature)', letterSpacing: '0.08em' }}>
              CONFIGURAÇÕES DO ANALISTA // PRIVACIDADE & HÁBITO
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', margin: '4px 0 0 0' }}>
              Parâmetros de Sequência e Gamificação
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

        {/* CONTEÚDO */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{
            backgroundColor: 'var(--bg-surface-sunken)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xs)',
            padding: '18px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                Mecanismo de Sequência de Prática (Streak)
              </div>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12.5px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                Mede constância diária com tolerância de 1 dia a cada 7 dias corridos. Quando desativado, o contador de sequência é totalmente omitido da interface e não é processado pela plataforma.
              </p>
            </div>

            <button
              onClick={handleToggle}
              disabled={isToggling}
              style={{
                padding: '8px 16px',
                backgroundColor: streakEnabled ? 'rgba(46, 125, 50, 0.2)' : 'rgba(100, 100, 100, 0.2)',
                border: `1px solid ${streakEnabled ? 'var(--status-pass)' : 'var(--border-subtle)'}`,
                color: streakEnabled ? 'var(--status-pass)' : 'var(--text-muted)',
                borderRadius: 'var(--radius-xs)',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {isToggling ? 'Salvando...' : (streakEnabled ? '✓ ATIVADO' : '✕ DESLIGADO')}
            </button>
          </div>

          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: 'var(--text-muted)',
            lineHeight: 1.5,
            padding: '12px',
            backgroundColor: 'rgba(20, 25, 22, 0.5)',
            border: '1px dashed var(--border-subtle)',
            borderRadius: 'var(--radius-xs)'
          }}>
            § DIRETRIZ ANTI-ANSIEDADE: A plataforma não utiliza notificações de urgência nem punições por quebra de sequência. O progresso técnico e os distintivos conquistados são permanentes e independentes do streak.
          </div>
        </div>

        {/* RODAPÉ */}
        <div style={{
          padding: '14px 24px',
          borderTop: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-surface-sunken)',
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 20px',
              backgroundColor: 'var(--copper-signature)',
              border: 'none',
              borderRadius: 'var(--radius-xs)',
              color: '#0d1310',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Concluir Ajustes
          </button>
        </div>
      </div>
    </div>
  );
};
