'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Track, Module, Topic, BugEvidence } from '../../../types/curriculum';
import { useTheme } from '../../../lib/theme/ThemeContext';
import { API_BASE_URL } from '../../../lib/config';
import { AuditTopBar } from '../../../components/AuditTopBar';
import { CaseHeroDossier } from '../../../components/CaseHeroDossier';
import { ModuleFrentes } from '../../../components/ModuleFrentes';
import { AnalystSidebar } from '../../../components/AnalystSidebar';
import { BriefingModal } from '../../../components/BriefingModal';
import { InvestigationWorkbenchModal } from '../../../components/InvestigationWorkbenchModal';
import { IconSecurityLatch, IconArrowRight, IconFault, IconAuditShield } from '../../../components/TechnicalIcons';

export default function TrackInvestigationDeskPage() {
  const params = useParams();
  const router = useRouter();
  const slug = (params?.slug as string) || '';

  const { isDarkMode, toggleTheme } = useTheme();
  const [sessionSeed] = useState<string>('#481029');
  const [tracks, setTracks] = useState<Track[]>([]);
  const [tracksLoaded, setTracksLoaded] = useState<boolean>(false);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [isLabOpen, setIsLabOpen] = useState<boolean>(false);
  const [isBriefingOpen, setIsBriefingOpen] = useState<boolean>(false);

  // Progresso do AnalystProfile e submissões homologadas vindos do backend Django
  const [completedTopics, setCompletedTopics] = useState<Record<string, number>>({});
  const [backendActiveTopicCode, setBackendActiveTopicCode] = useState<string>('');

  const [evidences, setEvidences] = useState<BugEvidence[]>([
    { code: 'VAL-AGE-001', topicCode: 'QA-MAN-012', title: 'Idade 17 anos aceita sem bloqueio no checkout.', status: 'CONFIRMADO', timestamp: Date.now() - 120000 },
    { code: 'SAN-WSP-004', title: 'Campo Nome aceita espaços vazios e avança.', status: 'CONFIRMADO', timestamp: Date.now() - 60000 },
  ]);



  // Carrega perfil oficial com XP, tópico ativo e tópicos homologados da API
  const refreshProfile = () => {
    fetch(`${API_BASE_URL}/api/v1/gamification/profile/`)
      .then(res => res.json())
      .then(data => {
        if (data.completed_topics) {
          setCompletedTopics(data.completed_topics);
        }
        if (data.active_topic_code) {
          setBackendActiveTopicCode(data.active_topic_code);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    refreshProfile();
  }, []);

  // Carrega lista oficial de trilhas da API
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/v1/curriculum/tracks/`)
      .then(res => res.json())
      .then(data => {
        const results = data.results || data;
        if (Array.isArray(results) && results.length > 0) {
          setTracks(results);
          const match = results.find((t: Track) => t.slug === slug);
          if (match) setCurrentTrack(match);
        }
        setTracksLoaded(true);
      })
      .catch(() => {
        setTracksLoaded(true);
      });
  }, [slug]);

  // Carrega dinamicamente módulos e tópicos da trilha ativa selecionada
  useEffect(() => {
    if (!slug || !tracksLoaded || !currentTrack) return;
    if (currentTrack.status === 'frozen' || currentTrack.is_frozen || currentTrack.status === 'in_construction') return;
    fetch(`${API_BASE_URL}/api/v1/curriculum/tracks/${slug}/`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (data.modules && data.modules.length > 0) {
          setModules(data.modules);
          let foundActive: Topic | null = null;
          for (const m of data.modules) {
            const match = m.topics?.find((t: Topic) => t.code === backendActiveTopicCode);
            if (match) {
              foundActive = match;
              break;
            }
          }
          setSelectedTopic(foundActive || data.modules[0]?.topics?.[0] || null);
        }
      })
      .catch(err => {
        console.warn('Falha ao carregar módulos da trilha via API:', err);
      });
  }, [slug, tracksLoaded, currentTrack, backendActiveTopicCode]);



  const handleOpenTopic = (topic: Topic) => {
    setSelectedTopic(topic);
    setIsBriefingOpen(true);
    if (backendActiveTopicCode !== topic.code) {
      setBackendActiveTopicCode(topic.code);
      fetch(`${API_BASE_URL}/api/v1/gamification/profile/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active_topic_code: topic.code })
      }).catch(err => {
        console.warn('Falha ao persistir tópico ativo via PATCH:', err);
      });
    }
  };

  const handleEnterLab = (topic?: Topic) => {
    if (topic) setSelectedTopic(topic);
    setIsBriefingOpen(false);
    setIsLabOpen(true);
  };

  const handleBugDetected = (newEvidence: BugEvidence) => {
    setEvidences(prev => {
      if (prev.some(e => e.code === newEvidence.code)) return prev;
      return [newEvidence, ...prev];
    });
  };

  const handleTopicCompleted = (topicCode: string, score: number) => {
    setCompletedTopics(prev => ({ ...prev, [topicCode]: score }));
    refreshProfile();
  };

  // 1. ESTADO: TRILHA NÃO LOCALIZADA NO CATÁLOGO (§ 404)
  if (tracksLoaded && (!currentTrack || tracks.length === 0 || !tracks.some(t => t.slug === slug))) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-app)' }}>
        <AuditTopBar
          currentTrackName="REGISTRO NÃO LOCALIZADO"
          currentModuleName="CÓDIGO INEXISTENTE (§ 404)"
          sessionSeed={sessionSeed}
          isDarkMode={isDarkMode}
          onToggleTheme={toggleTheme}
          onNavigateHub={() => router.push('/')}
        />
        <main style={{
          maxWidth: '800px',
          width: '100%',
          margin: '64px auto',
          padding: '0 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <div style={{
            width: '100%',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-strong)',
            borderTop: '3px solid var(--status-bug)',
            borderRadius: 'var(--radius-sm)',
            padding: '32px',
            boxShadow: 'var(--shadow-subtle)',
            textAlign: 'center'
          }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--status-bug)' }}>
              <IconFault size={24} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em' }}>
                § 404 // REGISTRO DE TRILHA NÃO LOCALIZADO
              </span>
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 12px' }}>
              Trilha Não Localizada no Catálogo Forense
            </h1>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 24px' }}>
              O identificador de trilha <strong>&ldquo;{slug}&rdquo;</strong> não consta nos registros oficiais da matriz curricular do laboratório. Verifique a URL ou retorne à visão panorâmica do Hub para selecionar uma trilha disponível.
            </p>
            <button
              type="button"
              onClick={() => router.push('/')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                backgroundColor: 'var(--accent-command)',
                color: 'var(--accent-command-contrast)',
                border: 'none',
                borderRadius: 'var(--radius-xs)',
                fontFamily: 'var(--font-sans)',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <span>Retornar à Visão Panorâmica do Hub</span>
              <IconArrowRight size={14} />
            </button>
          </div>
        </main>
      </div>
    );
  }

  // 2. ESTADO: TRILHA CONGELADA (ADR-0013: REDE ISOLADA)
  if (currentTrack && (currentTrack.status === 'frozen' || currentTrack.is_frozen)) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-app)' }}>
        <AuditTopBar
          currentTrackName={`TRILHA ${String(currentTrack.number).padStart(2, '0')}: ${currentTrack.name.toUpperCase()}`}
          currentModuleName="INTERDIÇÃO TÉCNICA // ADR-0013"
          sessionSeed={sessionSeed}
          isDarkMode={isDarkMode}
          onToggleTheme={toggleTheme}
          onNavigateHub={() => router.push('/')}
        />
        <main style={{
          maxWidth: '820px',
          width: '100%',
          margin: '64px auto',
          padding: '0 24px'
        }}>
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-strong)',
            borderTop: '3px solid var(--border-strong)',
            borderRadius: 'var(--radius-sm)',
            padding: '36px',
            boxShadow: 'var(--shadow-subtle)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', color: 'var(--text-secondary)' }}>
              <IconSecurityLatch size={22} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11.5px', fontWeight: 700, letterSpacing: '0.08em' }}>
                INTERDIÇÃO TÉCNICA // AUDITORIA DE REDE DEDICADA (ADR-0013)
              </span>
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 14px' }}>
              Trilha {String(currentTrack.number).padStart(2, '0')}: {currentTrack.name} — Acesso Bloqueado
            </h1>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 20px' }}>
              Conforme a Decisão Arquitetural <strong>ADR-0013</strong>, esta trilha requer infraestrutura de rede isolada e está temporariamente congelada. A bancada forense não pode ser inicializada para este tópico.
            </p>
            <div style={{
              backgroundColor: 'var(--bg-surface-sunken)',
              border: '1px solid var(--border-strong)',
              borderRadius: 'var(--radius-xs)',
              padding: '14px',
              marginBottom: '24px',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--text-muted)',
              lineHeight: 1.5
            }}>
              ESTADO REGISTRADO NO BANCO: <strong>FROZEN</strong><br />
              CLASSIFICAÇÃO: {currentTrack.category.toUpperCase()}<br />
              ROTA RESTRITA: {currentTrack.mini_site_route}
            </div>
            <button
              type="button"
              onClick={() => router.push('/')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                backgroundColor: 'var(--accent-command)',
                color: 'var(--accent-command-contrast)',
                border: 'none',
                borderRadius: 'var(--radius-xs)',
                fontFamily: 'var(--font-sans)',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <span>Retornar ao Hub Panorâmico</span>
              <IconArrowRight size={14} />
            </button>
          </div>
        </main>
      </div>
    );
  }

  // 3. ESTADO: TRILHA EM CONSTRUÇÃO
  if (currentTrack && currentTrack.status === 'in_construction') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-app)' }}>
        <AuditTopBar
          currentTrackName={`TRILHA ${String(currentTrack.number).padStart(2, '0')}: ${currentTrack.name.toUpperCase()}`}
          currentModuleName="ESPECIALIDADE TÉCNICA EM CONSTRUÇÃO"
          sessionSeed={sessionSeed}
          isDarkMode={isDarkMode}
          onToggleTheme={toggleTheme}
          onNavigateHub={() => router.push('/')}
        />
        <main style={{
          maxWidth: '820px',
          width: '100%',
          margin: '64px auto',
          padding: '0 24px'
        }}>
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-strong)',
            borderTop: '3px solid var(--border-strong)',
            borderRadius: 'var(--radius-sm)',
            padding: '36px',
            boxShadow: 'var(--shadow-subtle)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', color: 'var(--text-secondary)' }}>
              <IconAuditShield size={22} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11.5px', fontWeight: 700, letterSpacing: '0.08em' }}>
                ESPECIALIDADE TÉCNICA EM CONSTRUÇÃO
              </span>
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 14px' }}>
              Trilha {String(currentTrack.number).padStart(2, '0')}: {currentTrack.name} — Em Desenvolvimento
            </h1>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 20px' }}>
              Esta frente de especialização técnica está em fase de modelagem e testes preliminares. Os laboratórios de auditoria e casos forenses serão liberados em releases posteriores.
            </p>
            <button
              type="button"
              onClick={() => router.push('/')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                backgroundColor: 'var(--accent-command)',
                color: 'var(--accent-command-contrast)',
                border: 'none',
                borderRadius: 'var(--radius-xs)',
                fontFamily: 'var(--font-sans)',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <span>Retornar ao Hub Panorâmico</span>
              <IconArrowRight size={14} />
            </button>
          </div>
        </main>
      </div>
    );
  }

  // 4. ESTADO NOMINAL: MESA DE INVESTIGAÇÃO ATIVA
  const activeTrackNumber = currentTrack ? currentTrack.number : 1;
  const currentActiveTopic = selectedTopic || (modules[0]?.topics?.[0] ?? null);
  const isCurrentTopicHomologated = Boolean(currentActiveTopic && completedTopics[currentActiveTopic.code]);
  const currentTopicScore = currentActiveTopic ? (completedTopics[currentActiveTopic.code] || 0) : 0;
  const totalTopicsCount = modules.reduce((acc, m) => acc + (m.topics?.length || 0), 0);

  const dossierCriteria = currentActiveTopic?.oracle_criteria && currentActiveTopic.oracle_criteria.length > 0
    ? currentActiveTopic.oracle_criteria.map(c => ({ code: c.code, text: c.rule }))
    : [
        { code: '§ 1.1', text: currentActiveTopic?.oracle_description || 'Critério de integridade sob auditoria.' },
        { code: '§ 1.2', text: 'Respeitar integridade comportamental conforme as especificações do oráculo.' },
        { code: '§ 1.3', text: 'Não admitir desvios silenciosos ou estados inconsistentes de aplicação.' },
      ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AuditTopBar
        currentTrackName={currentTrack ? `${String(currentTrack.number).padStart(2, '0')}. ${currentTrack.name.toUpperCase()}` : 'MESA DE INVESTIGAÇÃO'}
        currentModuleName={currentTrack ? `TRILHA ${String(currentTrack.number).padStart(2, '0')}: ${currentTrack.name.toUpperCase()} (${totalTopicsCount} TÓPICOS)` : 'AUDITORIA FORENSE'}
        sessionSeed={sessionSeed}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
        onNavigateHub={() => router.push('/')}
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
        <main style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
          {currentActiveTopic ? (
            <CaseHeroDossier
              caseCode={`DOSSIÊ § ${currentActiveTopic.code}`}
              levelLabel={`NÍVEL ${String(activeTrackNumber).padStart(2, '0')} // ${currentActiveTopic.title.toUpperCase()}`}
              title={`${currentActiveTopic.title} no Vault Commerce`}
              scenario={currentActiveTopic.investigation_scope}
              targetElement={currentActiveTopic.target_element}
              criteria={dossierCriteria}
              mappedCount={evidences.length}
              totalCount={3}
              xpReward={currentActiveTopic.xp_reward}
              onEnterLab={() => handleEnterLab(currentActiveTopic)}
              isModalOpen={isLabOpen || isBriefingOpen}
              isHomologated={isCurrentTopicHomologated}
              homologatedScore={currentTopicScore}
            />
          ) : (
            <div style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-strong)',
              borderRadius: 'var(--radius-sm)',
              padding: '24px',
              color: 'var(--text-secondary)'
            }}>
              Carregando dossiê forense da trilha...
            </div>
          )}

          {/* AS FRENTES DE INVESTIGAÇÃO DA TRILHA */}
          <ModuleFrentes
            modules={modules}
            completedTopics={completedTopics}
            activeTopicCode={currentActiveTopic?.code}
            onOpenBriefing={(topic) => handleOpenTopic(topic)}
          />
        </main>

        <AnalystSidebar
          tracks={tracks}
          activeTrackNumber={activeTrackNumber}
          onSelectTrack={(track) => router.push(`/trilha/${track.slug}`)}
          evidences={evidences}
          hideTrackList={false}
        />
      </div>

      {/* MODAL DE BRIEFING PEDAGÓGICO */}
      <BriefingModal
        topic={isBriefingOpen ? currentActiveTopic : null}
        sessionSeed={sessionSeed}
        onClose={() => setIsBriefingOpen(false)}
        onEnterLab={(topic) => handleEnterLab(topic)}
      />

      {/* WORKBENCH INTERATIVO DE LABORATÓRIO */}
      {currentActiveTopic && (
        <InvestigationWorkbenchModal
          topic={currentActiveTopic}
          sessionSeed={sessionSeed}
          isOpen={isLabOpen}
          onClose={() => setIsLabOpen(false)}
          onBugDetected={handleBugDetected}
          onTopicCompleted={handleTopicCompleted}
          initialEvidences={evidences}
        />
      )}
    </div>
  );
}
