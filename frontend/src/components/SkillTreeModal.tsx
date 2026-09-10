'use client';

import React, { useEffect, useState } from 'react';

interface TrackNode {
  track_id: number;
  track_number: number;
  name: string;
  slug: string;
  category: string;
  total_topics: number;
  completed_topics: number;
  earned_xp: number;
  status: string; // HOMOLOGADO, ATIVA, DISPONIVEL, BLOQUEADO
}

interface SkillTreeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTrack?: (trackNumber: number) => void;
}

export const SkillTreeModal: React.FC<SkillTreeModalProps> = ({ isOpen, onClose, onSelectTrack }) => {
  const [tracks, setTracks] = useState<TrackNode[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch('http://127.0.0.1:8000/api/v1/gamification/skill-tree/')
        .then(res => res.json())
        .then(data => {
          if (data.tracks) setTracks(data.tracks);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const categories = [
    { key: 'foundations', title: 'Fundações & Inspeção Manual', desc: 'Processos centrais, oráculos de teste e fronteiras' },
    { key: 'structure', title: 'Estrutura & Lógica Interna', desc: 'Máquinas de estado, integridade de dados e regressão' },
    { key: 'protocols', title: 'Protocolos & Conectividade', desc: 'REST APIs, contratos e fluxos síncronos/assíncronos' },
    { key: 'automation', title: 'Automação & Engenharia', desc: 'Harnesses sandboxed, Playwright e pipelines de verificação' },
    { key: 'specialties', title: 'Especialidades Técnicas', desc: 'Segurança, acessibilidade e auditorias avançadas' },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'HOMOLOGADO':
        return { text: 'HOMOLOGADO', color: 'var(--status-pass)', bg: 'rgba(46, 125, 50, 0.15)', border: 'var(--status-pass)' };
      case 'ATIVA':
        return { text: 'ATIVA EM INVESTIGAÇÃO', color: 'var(--copper-signature)', bg: 'rgba(184, 115, 51, 0.15)', border: 'var(--copper-signature)' };
      case 'DISPONIVEL':
        return { text: 'DISPONÍVEL', color: 'var(--text-secondary)', bg: 'var(--bg-surface-sunken)', border: 'var(--border-subtle)' };
      default:
        return { text: 'BLOQUEADO', color: 'var(--text-muted)', bg: 'var(--bg-surface-sunken)', border: 'transparent' };
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
        maxWidth: '1080px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
        overflow: 'hidden'
      }}>
        {/* CABEÇALHO BLUEPRINT */}
        <div style={{
          padding: '20px 28px',
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-surface-sunken)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--copper-signature)', letterSpacing: '0.08em' }}>
              CARTA DE HABILITAÇÃO // MATRIZ DE COMPETÊNCIAS DO ANALISTA
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', margin: '4px 0 0 0' }}>
              Mapa de Progressão das 15 Trilhas Técnicas
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

        {/* CONTEÚDO EM GRID ESQUEMÁTICA */}
        <div style={{ padding: '28px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {loading ? (
            <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>
              Carregando cartografia técnica...
            </div>
          ) : (
            categories.map(cat => {
              const catTracks = tracks.filter(t => t.category === cat.key);
              if (catTracks.length === 0) return null;

              return (
                <div key={cat.key} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                      {cat.title}
                    </h3>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
                      // {cat.desc}
                    </span>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
                    gap: '16px'
                  }}>
                    {catTracks.map(t => {
                      const badge = getStatusBadge(t.status);
                      return (
                        <div
                          key={t.track_id}
                          onClick={() => {
                            if (t.status !== 'BLOQUEADO' && onSelectTrack) {
                              onSelectTrack(t.track_number);
                              onClose();
                            }
                          }}
                          style={{
                            backgroundColor: 'var(--bg-surface-sunken)',
                            border: `1px solid ${t.status === 'ATIVA' ? 'var(--copper-signature)' : 'var(--border-subtle)'}`,
                            borderRadius: 'var(--radius-xs)',
                            padding: '16px',
                            cursor: t.status !== 'BLOQUEADO' ? 'pointer' : 'default',
                            opacity: t.status === 'BLOQUEADO' ? 0.6 : 1,
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--copper-signature)', fontWeight: 700 }}>
                              TRILHA {String(t.track_number).padStart(2, '0')}
                            </span>
                            <span style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '10px',
                              padding: '2px 8px',
                              borderRadius: '3px',
                              backgroundColor: badge.bg,
                              color: badge.color,
                              border: `1px solid ${badge.border}`,
                              fontWeight: 600
                            }}>
                              {badge.text}
                            </span>
                          </div>

                          <div style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                            {t.name}
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', paddingTop: '8px', borderTop: '1px dashed var(--border-subtle)' }}>
                            <span>Tópicos: {t.completed_topics} / {t.total_topics}</span>
                            <span style={{ color: 'var(--text-secondary)' }}>+{t.earned_xp} XP</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* RODAPÉ INFORMATIVO */}
        <div style={{
          padding: '14px 28px',
          borderTop: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-surface-sunken)',
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          color: 'var(--text-muted)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>CADA NÓ HOMOLOGADO CONFERE QUALIFICAÇÃO PROFISSIONAL PARA AUDITORIAS AVANÇADAS</span>
          <span style={{ color: 'var(--copper-signature)' }}>QALEARNING // FIELD MANUAL</span>
        </div>
      </div>
    </div>
  );
};
