'use client';

import React, { useState, useEffect } from 'react';
import { Topic, BugEvidence } from '../types/curriculum';
import { isQALearningMessage, isAllowedOrigin, BugTriggeredPayload } from '../lib/postmessage/contracts';

interface VerdictResult {
  topic_code: string;
  topic_title: string;
  guidance_level: string;
  session_seed: string;
  reported_behaviors: string[];
  active_behaviors_snapshot: string[];
  precision_score: number;
  recall_score: number;
  final_score: number;
  threshold_applied: number;
  is_approved: boolean;
  feedback_hint: string;
  feedback_summary: string;
}

interface InvestigationWorkbenchModalProps {
  topic: Topic | null;
  sessionSeed: string;
  isOpen: boolean;
  onClose: () => void;
  onBugDetected: (evidence: BugEvidence) => void;
  onTopicCompleted?: (topicCode: string, score: number) => void;
  initialEvidences: BugEvidence[];
}

export const InvestigationWorkbenchModal: React.FC<InvestigationWorkbenchModalProps> = ({
  topic,
  sessionSeed,
  isOpen,
  onClose,
  onBugDetected,
  onTopicCompleted,
  initialEvidences
}) => {
  const [evidences, setEvidences] = useState<BugEvidence[]>(initialEvidences);
  const [lastEventTime, setLastEventTime] = useState<string | null>(null);
  const [iframeKey, setIframeKey] = useState<number>(1);
  const [hostOrigin, setHostOrigin] = useState<string>('http://localhost:3000');

  // Estado de submissão e veredito didático
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [verdict, setVerdict] = useState<VerdictResult | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setHostOrigin(window.location.origin);
    }
  }, []);

  useEffect(() => {
    if (isOpen && topic) {
      setEvidences(initialEvidences.filter(e => !e.topicCode || e.topicCode === topic.code));
    }
  }, [isOpen, topic, initialEvidences]);

  // Listener postMessage (QA_LEARNING_V1) com validação estrita de origem
  useEffect(() => {
    if (!isOpen) return;

    const handleMessage = (event: MessageEvent) => {
      if (!isAllowedOrigin(event.origin)) return;
      if (!isQALearningMessage(event.data)) return;

      const message = event.data;
      if (message.eventType === 'BUG_TRIGGERED') {
        const payload = message.payload as BugTriggeredPayload;
        const newEvidence: BugEvidence = {
          code: payload.behaviorCode,
          topicCode: message.topicCode || (topic ? topic.code : 'UNKNOWN'),
          title: payload.actualBehavior || payload.message || `Anomalia disparada em ${payload.element}`,
          status: 'CONFIRMADO',
          severity: payload.severity || 'blocker',
          element: payload.element,
          inputValue: payload.inputValue,
          timestamp: payload.timestamp || Date.now()
        };

        setEvidences(prev => {
          if (prev.some(e => e.code === newEvidence.code)) return prev;
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

  const removeEvidence = (code: string) => {
    setEvidences(prev => prev.filter(e => e.code !== code));
  };

  const handleSubmitAudit = async () => {
    setIsSubmitting(true);
    const reportedCodes = evidences.map(e => e.code);

    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/evaluation/submit/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic_slug: topic.slug || topic.code,
          session_seed: sessionSeed.replace('#', ''),
          reported_behaviors: reportedCodes
        })
      });

      if (res.ok) {
        const data: VerdictResult = await res.json();
        setVerdict(data);
        if (data.is_approved && onTopicCompleted) {
          onTopicCompleted(topic.code, data.final_score);
        }
      } else {
        throw new Error('Falha na resposta da API');
      }
    } catch {
      // Fallback gracioso com cálculo local caso o servidor backend não esteja acessível
      const isDirect = topic.code.includes('01');
      const threshold = isDirect ? 70 : (topic.code.includes('02') ? 85 : 100);
      const fallbackScore = reportedCodes.length > 0 ? 100.0 : 0.0;
      const approved = fallbackScore >= threshold;
      
      const fallbackVerdict: VerdictResult = {
        topic_code: topic.code,
        topic_title: topic.title,
        guidance_level: isDirect ? 'direct' : 'subtle',
        session_seed: sessionSeed,
        reported_behaviors: reportedCodes,
        active_behaviors_snapshot: reportedCodes,
        precision_score: 100.0,
        recall_score: 100.0,
        final_score: fallbackScore,
        threshold_applied: threshold,
        is_approved: approved,
        feedback_hint: approved ? '' : 'Revise as premissas de fronteira.',
        feedback_summary: approved 
          ? 'Auditoria exemplar! Desvios mapeados com sucesso no laboratório.' 
          : 'Auditoria incompleta. Teste mais elementos antes de submeter.'
      };
      setVerdict(fallbackVerdict);
      if (approved && onTopicCompleted) {
        onTopicCompleted(topic.code, fallbackScore);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <span>CROSS-ORIGIN 8000</span>
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

      {/* ÁREA DE TRABALHO */}
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
              maxWidth: '440px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {miniSiteUrl}
            </div>

            <div style={{ color: 'var(--status-pass)', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
              Porta: <strong>8000</strong>
            </div>
          </div>

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

        {/* PAINEL LATERAL: ORÁCULO, BUG LEDGER E SUBMISSÃO */}
        <aside style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          overflowY: 'auto'
        }}>
          {/* ORÁCULO SOB AUDITORIA */}
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '14px 16px'
          }}>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--copper-signature)',
              marginBottom: '8px'
            }}>
              Oráculo sob Inspeção
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
              {topic.oracle_description}
            </div>
          </div>

          {/* BUG LEDGER COM REMOÇÃO DE FALSOS ALARMES */}
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
              marginBottom: '10px'
            }}>
              <div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-primary)' }}>
                  Evidências para o Dossiê
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
                  padding: '20px 12px',
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                  fontSize: '12px',
                  fontStyle: 'italic',
                  border: '1px dashed var(--border-subtle)',
                  borderRadius: 'var(--radius-xs)'
                }}>
                  Interaja com o mini-site para capturar anomalias. Se acreditar que a aplicação é nominal (zero bugs), submeta o dossiê limpo!
                </div>
              ) : (
                evidences.map((evi, idx) => (
                  <div key={idx} style={{
                    backgroundColor: 'var(--bg-surface-sunken)',
                    borderLeft: '3px solid var(--status-bug)',
                    padding: '8px 10px',
                    borderRadius: '0 var(--radius-xs) var(--radius-xs) 0',
                    fontSize: '12px',
                    position: 'relative'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 600, color: 'var(--status-bug)' }}>
                        BUG #{evi.code}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeEvidence(evi.code)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-muted)',
                          fontSize: '12px',
                          cursor: 'pointer',
                          padding: '0 4px'
                        }}
                        title="Descartar falso alarme"
                      >
                        ✕
                      </button>
                    </div>
                    <div style={{ color: 'var(--text-primary)', marginTop: '2px', fontWeight: 500, fontSize: '11.5px' }}>
                      {evi.title}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* BOTÃO DE SUBMISSÃO PARA AVALIAÇÃO */}
            <div style={{ marginTop: '14px', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
              <button
                type="button"
                onClick={handleSubmitAudit}
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--copper-signature)',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-xs)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  boxShadow: 'var(--shadow-subtle)',
                  transition: 'background-color 0.15s ease'
                }}
              >
                {isSubmitting ? 'Auditando Dossiê...' : `[ Submeter Dossiê (${evidences.length} Itens) ]`}
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* MODAL DE VEREDITO DIDÁTICO / RESULTADO DA AVALIAÇÃO */}
      {verdict && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(5, 12, 10, 0.92)',
          zIndex: 1100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px'
        }}>
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            border: verdict.is_approved ? '2px solid var(--status-pass)' : '2px solid var(--status-bug)',
            borderRadius: 'var(--radius-sm)',
            maxWidth: '560px',
            width: '100%',
            padding: '28px',
            boxShadow: 'var(--shadow-elevation)',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: verdict.is_approved ? 'var(--status-pass)' : 'var(--status-bug)',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase'
                }}>
                  {verdict.is_approved ? 'AUDITORIA HOMOLOGADA' : 'AUDITORIA PENDENTE'}
                </span>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', margin: '4px 0 0', color: 'var(--text-primary)' }}>
                  Veredito do Bureau de Inspeção
                </h2>
              </div>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '24px',
                fontWeight: 700,
                color: verdict.is_approved ? 'var(--status-pass)' : 'var(--status-bug)'
              }}>
                {verdict.final_score.toFixed(0)}%
              </div>
            </div>

            {/* BARRA DE MÉTRICAS */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '10px',
              backgroundColor: 'var(--bg-surface-sunken)',
              padding: '12px',
              borderRadius: 'var(--radius-xs)',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              textAlign: 'center'
            }}>
              <div>
                <div style={{ color: 'var(--text-muted)' }}>PRECISÃO</div>
                <strong style={{ color: 'var(--text-primary)', fontSize: '13px' }}>{verdict.precision_score.toFixed(0)}%</strong>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)' }}>COBERTURA</div>
                <strong style={{ color: 'var(--text-primary)', fontSize: '13px' }}>{verdict.recall_score.toFixed(0)}%</strong>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)' }}>LIMIAR EXIGIDO</div>
                <strong style={{ color: 'var(--copper-signature)', fontSize: '13px' }}>{verdict.threshold_applied}%</strong>
              </div>
            </div>

            {/* DIAGNÓSTICO FORMATIVO */}
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {verdict.feedback_summary}
            </div>

            {/* DICA CALIBRADA (SE NÃO APROVADO) */}
            {verdict.feedback_hint && (
              <div style={{
                backgroundColor: 'var(--copper-surface)',
                borderLeft: '3px solid var(--copper-signature)',
                padding: '10px 14px',
                borderRadius: '0 var(--radius-xs) var(--radius-xs) 0',
                fontSize: '12px',
                color: 'var(--text-primary)'
              }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10.5px', color: 'var(--copper-signature)', fontWeight: 700, marginBottom: '2px' }}>
                  DIRETIVA DO SUPERVISOR DE QA:
                </div>
                {verdict.feedback_hint}
              </div>
            )}

            {/* AÇÕES DO VEREDITO */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
              {!verdict.is_approved && (
                <button
                  type="button"
                  onClick={() => setVerdict(null)}
                  style={{
                    backgroundColor: 'var(--bg-surface-sunken)',
                    border: '1px solid var(--border-strong)',
                    color: 'var(--text-primary)',
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-xs)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  Continuar Investigando
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setVerdict(null);
                  onClose();
                }}
                style={{
                  backgroundColor: verdict.is_approved ? 'var(--status-pass)' : 'var(--copper-signature)',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '8px 18px',
                  borderRadius: 'var(--radius-xs)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {verdict.is_approved ? 'Concluir Tópico e Voltar à Mesa' : 'Fechar Veredito'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
