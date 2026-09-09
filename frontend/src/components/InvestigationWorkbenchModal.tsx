'use client';

import React, { useState, useEffect } from 'react';
import { Topic, BugEvidence } from '../types/curriculum';
import { isQALearningMessage, isAllowedOrigin, BugTriggeredPayload } from '../lib/postmessage/contracts';

interface InvestigationWorkbenchModalProps {
  topic: Topic | null;
  sessionSeed: string;
  isOpen: boolean;
  onClose: () => void;
  onBugDetected: (evidence: BugEvidence) => void;
  initialEvidences: BugEvidence[];
}

export const InvestigationWorkbenchModal: React.FC<InvestigationWorkbenchModalProps> = ({
  topic,
  sessionSeed,
  isOpen,
  onClose,
  onBugDetected,
  initialEvidences
}) => {
  const [evidences, setEvidences] = useState<BugEvidence[]>(initialEvidences);
  const [lastEventTime, setLastEventTime] = useState<string | null>(null);
  const [iframeKey, setIframeKey] = useState<number>(1);
  const [hostOrigin, setHostOrigin] = useState<string>('http://localhost:3000');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setHostOrigin(window.location.origin);
    }
  }, []);

  // Sincroniza evidências iniciais
  useEffect(() => {
    setEvidences(initialEvidences);
  }, [initialEvidences]);

  // Listener do protocolo postMessage (QA_LEARNING_V1) com validação estrita de origem
  useEffect(() => {
    if (!isOpen) return;

    const handleMessage = (event: MessageEvent) => {
      // 1. Defesa Cross-Origin: validação estrita do remetente
      if (!isAllowedOrigin(event.origin)) {
        return;
      }

      // 2. Validação estrutural do protocolo QA_LEARNING_V1
      if (!isQALearningMessage(event.data)) return;

      const message = event.data;
      if (message.eventType === 'BUG_TRIGGERED') {
        const payload = message.payload as BugTriggeredPayload;
        const newEvidence: BugEvidence = {
          code: payload.behaviorCode,
          title: payload.actualBehavior || payload.message || `Anomalia disparada em ${payload.element}`,
          status: 'CONFIRMADO',
          severity: payload.severity || 'blocker',
          element: payload.element,
          inputValue: payload.inputValue,
          timestamp: payload.timestamp || Date.now()
        };

        setEvidences(prev => {
          if (prev.some(e => e.code === newEvidence.code)) {
            return prev;
          }
          return [newEvidence, ...prev];
        });

        setLastEventTime(new Date().toLocaleTimeString());
        onBugDetected(newEvidence);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [isOpen, onBugDetected]);

  if (!isOpen || !topic) return null;

  const miniSitesBase = process.env.NEXT_PUBLIC_MINI_SITES_ORIGIN || 'http://127.0.0.1:8000';
  const miniSiteUrl = `${miniSitesBase}/mini-sites/vault-commerce/checkout/?seed=${sessionSeed.replace('#', '')}&topic=${topic.code}&hub_origin=${encodeURIComponent(hostOrigin)}`;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(5, 12, 10, 0.88)',
      backdropFilter: 'blur(8px)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      padding: '16px 24px 24px',
      color: 'var(--text-primary)'
    }}>
      {/* HEADER DO WORKBENCH */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: '14px',
        borderBottom: '1px solid var(--border-subtle)',
        marginBottom: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            backgroundColor: 'var(--copper-surface)',
            color: 'var(--copper-signature)',
            border: '1px solid var(--copper-border)',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            fontWeight: 700,
            padding: '3px 8px',
            borderRadius: 'var(--radius-xs)'
          }}>
            LABORATÓRIO PRÁTICO // {topic.code}
          </div>
          <div>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '18px',
              fontWeight: 600,
              color: 'var(--text-primary)',
              margin: 0
            }}>
              {topic.title}
            </h1>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontFamily: 'var(--font-mono)',
            fontSize: '11.5px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            padding: '4px 10px',
            borderRadius: 'var(--radius-xs)',
            color: 'var(--text-secondary)'
          }}>
            <span style={{ color: 'var(--status-pass)' }}>●</span>
            <span>ISOLAMENTO CROSS-ORIGIN</span>
            <span style={{ color: 'var(--border-strong)' }}>|</span>
            <span>SEED: <strong>{sessionSeed}</strong></span>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              backgroundColor: 'var(--bg-surface-sunken)',
              border: '1px solid var(--border-strong)',
              color: 'var(--text-primary)',
              padding: '6px 14px',
              borderRadius: 'var(--radius-xs)',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            ← Voltar à Mesa
          </button>
        </div>
      </header>

      {/* ÁREA DE TRABALHO: IFRAME SANDBOXED + TELEMETRIA / BUG LEDGER */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 380px',
        gap: '20px',
        flexGrow: 1,
        minHeight: 0
      }}>
        {/* VIEWPORT DO MINI-SITE */}
        <section style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-strong)',
          borderRadius: 'var(--radius-sm)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {/* BARRA DO NAVEGADOR EMBUTIDO */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 12px',
            backgroundColor: 'var(--bg-surface-sunken)',
            borderBottom: '1px solid var(--border-subtle)',
            fontFamily: 'var(--font-mono)',
            fontSize: '11.5px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
              <button
                type="button"
                onClick={() => setIframeKey(k => k + 1)}
                style={{
                  background: 'none',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-secondary)',
                  borderRadius: '3px',
                  padding: '2px 8px',
                  cursor: 'pointer',
                  fontSize: '11px'
                }}
                title="Recarregar aplicação de teste"
              >
                ↻ Recarregar
              </button>
              <span>Ambiente: <strong>Sandboxed Cross-Origin</strong></span>
            </div>

            <div style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              padding: '3px 12px',
              borderRadius: '3px',
              color: 'var(--text-muted)',
              fontSize: '11px',
              maxWidth: '480px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {miniSiteUrl}
            </div>

            <div style={{ color: 'var(--status-pass)', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
              Porta: <strong>8000</strong> (Segura)
            </div>
          </div>

          {/* O IFRAME (ISOLAMENTO CROSS-ORIGIN GARANTIDO) */}
          <iframe
            key={iframeKey}
            src={miniSiteUrl}
            title={`Mini-site de testes: ${topic.title}`}
            sandbox="allow-scripts allow-forms allow-same-origin"
            style={{
              width: '100%',
              flexGrow: 1,
              border: 'none',
              backgroundColor: '#0C1014'
            }}
          />
        </section>

        {/* PAINEL LATERAL: CRITÉRIOS DE ORÁCULO E BUG LEDGER EM TEMPO REAL */}
        <aside style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          overflowY: 'auto'
        }}>
          {/* ORÁCULO SOB AUDITORIA */}
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '16px'
          }}>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--copper-signature)',
              marginBottom: '10px'
            }}>
              Oráculo sob Inspeção
            </div>
            <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: '12px' }}>
              {topic.oracle_description}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: 'var(--text-primary)',
                backgroundColor: 'var(--bg-surface-sunken)',
                padding: '6px 8px',
                borderRadius: 'var(--radius-xs)',
                borderLeft: '2px solid var(--copper-signature)'
              }}>
                § 1.1 Idades entre 18 e 120 aceitas; fora deste intervalo deve bloquear.
              </div>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: 'var(--text-primary)',
                backgroundColor: 'var(--bg-surface-sunken)',
                padding: '6px 8px',
                borderRadius: 'var(--radius-xs)',
                borderLeft: '2px solid var(--copper-signature)'
              }}>
                § 1.2 Campos obrigatórios rejeitam espaços vazios puros.
              </div>
            </div>
          </div>

          {/* BUG LEDGER / EVIDÊNCIAS CONFIRMADAS */}
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-strong)',
            borderTop: '3px solid var(--status-bug)',
            borderRadius: 'var(--radius-sm)',
            padding: '16px',
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px'
            }}>
              <div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-primary)' }}>
                  Bug Ledger (Tempo Real)
                </span>
                {lastEventTime && (
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)' }}>
                    Último disparo às {lastEventTime}
                  </div>
                )}
              </div>
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
                {evidences.length} CAPTURADOS
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1, overflowY: 'auto' }}>
              {evidences.length === 0 ? (
                <div style={{
                  padding: '24px 12px',
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                  fontSize: '12px',
                  fontStyle: 'italic',
                  border: '1px dashed var(--border-subtle)',
                  borderRadius: 'var(--radius-xs)'
                }}>
                  Nenhum desvio detectado ainda. Submeta valores de teste no formulário para acionar anomalias.
                </div>
              ) : (
                evidences.map((evi, idx) => (
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
                    <div style={{ color: 'var(--text-primary)', marginTop: '3px', fontWeight: 500 }}>
                      {evi.title}
                    </div>
                    {evi.element && (
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10.5px', color: 'var(--text-muted)', marginTop: '3px' }}>
                        Alvo: <code>{evi.element}</code>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div style={{ marginTop: '14px', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
              <button
                type="button"
                onClick={() => alert(`Preparando Bug Report formal com as ${evidences.length} evidências capturadas para a Fase 3.`)}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--copper-signature)',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-xs)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                + Gerar Bug Report da Sessão
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
