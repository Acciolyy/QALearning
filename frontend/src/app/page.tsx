'use client';

import React, { useState, useEffect } from 'react';
import { Track, Module, Topic, BugEvidence } from '../types/curriculum';
import { AuditTopBar } from '../components/AuditTopBar';
import { CaseHeroDossier } from '../components/CaseHeroDossier';
import { ModuleFrentes } from '../components/ModuleFrentes';
import { AnalystSidebar } from '../components/AnalystSidebar';
import { BriefingModal } from '../components/BriefingModal';
import { InvestigationWorkbenchModal } from '../components/InvestigationWorkbenchModal';

const INITIAL_TRACKS: Track[] = [
  { id: 0, number: 0, name: 'Fundamentos de QA', slug: 'fundamentos-qa', category: 'foundations', description: 'Onboarding guiado, anatomia web e oráculos de teste.', mini_site_route: '/mini-sites/vault-commerce/checkout/', order: 0, status: 'available', is_frozen: false },
  { id: 1, number: 1, name: 'Testes Manuais', slug: 'testes-manuais', category: 'foundations', description: 'Exploratório, oráculos e heurísticas.', mini_site_route: '/mini-sites/vault-commerce/checkout/', order: 1, status: 'available', is_frozen: false },
  { id: 2, number: 2, name: 'Bug Reports', slug: 'bug-reports', category: 'foundations', description: 'Escrita técnica com evidências e severidade.', mini_site_route: '/mini-sites/vault-commerce/checkout/', order: 2, status: 'available', is_frozen: false },
  { id: 3, number: 3, name: 'Testes de API', slug: 'testes-api', category: 'protocols', description: 'REST, status codes e contratos.', mini_site_route: '/mini-sites/faulty-api/', order: 3, status: 'frozen', is_frozen: true },
  { id: 4, number: 4, name: 'Testes de Funcionalidade', slug: 'testes-funcionalidade', category: 'foundations', description: 'Fluxos de negócio ponta a ponta.', mini_site_route: '/mini-sites/vault-commerce/checkout/', order: 4, status: 'available', is_frozen: false },
  { id: 5, number: 5, name: 'Testes de Regressão', slug: 'testes-regressao', category: 'foundations', description: 'Comparação de comportamento entre versões.', mini_site_route: '/mini-sites/vault-commerce/checkout/', order: 5, status: 'available', is_frozen: false },
  { id: 6, number: 6, name: 'Caixa Branca', slug: 'caixa-branca', category: 'structure', description: 'Caminhos lógicos e cobertura.', mini_site_route: '/mini-sites/vault-commerce/checkout/', order: 6, status: 'available', is_frozen: false },
  { id: 7, number: 7, name: 'Caixa Preta', slug: 'caixa-preta', category: 'structure', description: 'Auditoria externa sem acesso ao código.', mini_site_route: '/mini-sites/vault-commerce/checkout/', order: 7, status: 'available', is_frozen: false },
  { id: 8, number: 8, name: 'Testes Automatizados E2E', slug: 'testes-automatizados-e2e', category: 'automation', description: 'Scripts com Playwright.', mini_site_route: '/mini-sites/vault-commerce/checkout/', order: 8, status: 'frozen', is_frozen: true },
  { id: 9, number: 9, name: 'Testes Unitários', slug: 'testes-unitarios', category: 'structure', description: 'Captura de falhas lógicas sutis.', mini_site_route: '/mini-sites/unit-arena/', order: 9, status: 'in_construction', is_frozen: false },
  { id: 10, number: 10, name: 'CI/CD para QA', slug: 'cicd-para-qa', category: 'automation', description: 'Pipelines e gates de qualidade.', mini_site_route: '/mini-sites/pipeline-sim/', order: 10, status: 'in_construction', is_frozen: false },
  { id: 11, number: 11, name: 'Testes de Performance', slug: 'testes-performance', category: 'specialties', description: 'Telemetria de latência e carga.', mini_site_route: '/mini-sites/perf-dashboard/', order: 11, status: 'in_construction', is_frozen: false },
  { id: 12, number: 12, name: 'Testes de Acessibilidade (WCAG)', slug: 'testes-acessibilidade-wcag', category: 'specialties', description: 'Barreiras reais de teclado e contraste.', mini_site_route: '/mini-sites/vault-commerce/checkout/', order: 12, status: 'available', is_frozen: false },
  { id: 13, number: 13, name: 'Testes de Segurança (Nível QA)', slug: 'testes-seguranca', category: 'protocols', description: 'Sanitização e exposição de dados.', mini_site_route: '/mini-sites/sec-vault/', order: 13, status: 'in_construction', is_frozen: false },
  { id: 14, number: 14, name: 'Mobile Testing', slug: 'mobile-testing', category: 'specialties', description: 'Contexto mobile e interrupções.', mini_site_route: '/mini-sites/vault-commerce/checkout/', order: 14, status: 'available', is_frozen: false },
];

const INITIAL_MODULES: Module[] = [
  {
    id: 1,
    number: 1,
    title: 'Fundamentos e Roteiros Exploratórios',
    guidance_level: 'direct',
    description: 'Mapeamento inicial de anomalias com pistas contextuais diretas (Aprovação: >= 70%).',
    order: 1,
    topics: [
      { id: 1, code: 'QA-MAN-011', title: 'Roteiro Exploratório em Cadastro', slug: 'roteiro-exploratorio-cadastro', target_element: 'form#registration-form', oracle_description: 'Todos os campos com asterisco são obrigatórios e exigem preenchimento substantivo.', investigation_scope: 'Investigue se o formulário bloqueia envios incompletos e se exibe mensagens amigáveis.', xp_reward: 60, order: 1 },
      { id: 2, code: 'QA-MAN-012', title: 'Limites e Particionamento de Idade', slug: 'limites-idade-cadastro', target_element: 'input#user-age', oracle_description: 'Idade mínima 18 anos, máxima 120 anos. Fora desse intervalo deve bloquear com mensagem acessível.', investigation_scope: 'Audite os valores limite no campo de idade sob valores: 17, 18, 120 e números negativos.', xp_reward: 75, order: 2 },
      { id: 3, code: 'QA-MAN-013', title: 'Máscaras de Entrada e Formatação', slug: 'mascaras-entrada-formatacao', target_element: 'input#tax-id', oracle_description: 'Sanitização de pontuação e caracteres colados via clipboard.', investigation_scope: 'Teste a colagem de textos alfanuméricos e caracteres pontuados no documento.', xp_reward: 80, order: 3 },
    ]
  },
  {
    id: 2,
    number: 2,
    title: 'Integridade de Dados e Máquina de Estados',
    guidance_level: 'subtle',
    description: 'Concorrência, idempotência e transições de estado com pistas sutis (Aprovação: >= 85%).',
    order: 2,
    topics: [
      { id: 4, code: 'QA-MAN-021', title: 'Concorrência e Duplo Envio no Checkout', slug: 'concorrencia-duplo-envio', target_element: 'button#submit-order', oracle_description: 'O botão de finalizar deve ser desabilitado no primeiro clique para prevenir cobrança concorrente.', investigation_scope: 'Simule cliques rápidos na confirmação para auditar race conditions na API.', xp_reward: 90, order: 1 },
      { id: 5, code: 'QA-MAN-022', title: 'Máquina de Estados e Transições de Pedido', slug: 'maquina-estados-pedido', target_element: 'select#payment-method', oracle_description: 'Transições válidas: Pendente -> Pago | Cancelado. Cancelado não pode ressuscitar sem novo checkout.', investigation_scope: 'Teste a alteração de dados após simular expiração ou cancelamento no gateway.', xp_reward: 95, order: 2 },
    ]
  },
  {
    id: 3,
    number: 3,
    title: 'Auditoria Autônoma de Regressão',
    guidance_level: 'autonomous',
    description: 'Auditoria integral de regressão sem pistas sob a release V2.1 (Aprovação: 100%).',
    order: 3,
    topics: [
      { id: 6, code: 'QA-MAN-031', title: 'Regressão de Cálculo e Valores no Checkout', slug: 'regressao-calculo-valores', target_element: 'aside.card', oracle_description: 'Cupons e fretes devem respeitar a integridade matemática exata (Subtotal - Desconto + Frete).', investigation_scope: 'Audite os valores finais após aplicação de cupons combinados com taxas de entrega.', xp_reward: 120, order: 1 },
      { id: 7, code: 'QA-MAN-032', title: 'Regressão de Fluxos e Máquina de Estados', slug: 'regressao-fluxos-estados', target_element: 'window', oracle_description: 'Navegação Voltar do navegador após confirmação não pode reabrir o mesmo carrinho com o mesmo ID.', investigation_scope: 'Realize testes de navegação errática e persistência de sessão após compras confirmadas.', xp_reward: 130, order: 2 },
    ]
  }
];

export default function InvestigationDeskPage() {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [sessionSeed] = useState<string>('#481029');
  const [tracks, setTracks] = useState<Track[]>(INITIAL_TRACKS);
  const [activeTrack, setActiveTrack] = useState<Track>(INITIAL_TRACKS[1]); // Default Trilha 01
  const [modules, setModules] = useState<Module[]>(INITIAL_MODULES);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(INITIAL_MODULES[0].topics[0]);
  const [isLabOpen, setIsLabOpen] = useState<boolean>(false);
  const [isBriefingOpen, setIsBriefingOpen] = useState<boolean>(false);

  // Progresso do AnalystProfile e submissões homologadas vindos do backend Django
  const [completedTopics, setCompletedTopics] = useState<Record<string, number>>({});
  const [backendActiveTopicCode, setBackendActiveTopicCode] = useState<string>('QA-MAN-011');

  const [evidences, setEvidences] = useState<BugEvidence[]>([
    { code: 'VAL-AGE-001', topicCode: 'QA-MAN-012', title: 'Idade 17 anos aceita sem bloqueio no checkout.', status: 'CONFIRMADO', timestamp: Date.now() - 120000 },
    { code: 'SAN-WSP-004', title: 'Campo Nome aceita espaços vazios e avança.', status: 'CONFIRMADO', timestamp: Date.now() - 60000 },
  ]);

  useEffect(() => {
    document.documentElement.setAttribute('data-mode', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Carrega perfil oficial com XP, tópico ativo e tópicos homologados da API
  const refreshProfile = () => {
    fetch('http://127.0.0.1:8000/api/v1/gamification/profile/')
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
    fetch('http://127.0.0.1:8000/api/v1/curriculum/tracks/')
      .then(res => res.json())
      .then(data => {
        const results = data.results || data;
        if (Array.isArray(results) && results.length > 0) {
          setTracks(results);
        }
      })
      .catch(() => {});
  }, []);

  // Carrega dinamicamente módulos e tópicos da trilha ativa selecionada
  useEffect(() => {
    if (!activeTrack?.slug) return;
    fetch(`http://127.0.0.1:8000/api/v1/curriculum/tracks/${activeTrack.slug}/`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (data.modules && data.modules.length > 0) {
          setModules(data.modules);
          // Procura tópico ativo do backend nesta trilha, ou seleciona o primeiro
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
  }, [activeTrack?.slug, backendActiveTopicCode]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const handleOpenTopic = (topic: Topic) => {
    setSelectedTopic(topic);
    setIsBriefingOpen(true);
    // Sincroniza tópico ativo no backend do AnalystProfile exclusivamente se houver mudança de tópico
    if (backendActiveTopicCode !== topic.code) {
      setBackendActiveTopicCode(topic.code);
      fetch('http://127.0.0.1:8000/api/v1/gamification/profile/', {
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

  const currentActiveTopic = selectedTopic || (modules[0]?.topics?.[0] ?? INITIAL_MODULES[0].topics[0]);

  const totalTopicsCount = modules.reduce((acc, m) => acc + (m.topics?.length || 0), 0);

  const dossierCriteria = currentActiveTopic.oracle_criteria && currentActiveTopic.oracle_criteria.length > 0
    ? currentActiveTopic.oracle_criteria.map(c => ({ code: c.code, text: c.rule }))
    : [
        { code: '§ 1.1', text: currentActiveTopic.oracle_description },
        { code: '§ 1.2', text: 'Respeitar integridade comportamental conforme as especificações do oráculo.' },
        { code: '§ 1.3', text: 'Não admitir desvios silenciosos ou estados inconsistentes de aplicação.' },
      ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AuditTopBar
        currentTrackName={`${activeTrack.number.toString().padStart(2, '0')}. ${activeTrack.name.toUpperCase()}`}
        currentModuleName={`TRILHA ${activeTrack.number.toString().padStart(2, '0')}: ${activeTrack.name.toUpperCase()} (${totalTopicsCount} TÓPICOS)`}
        sessionSeed={sessionSeed}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
        onNavigateHub={() => alert('Navegando para a visão panorâmica do Hub')}
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
          {/* DOSSIÊ DO CASO EM DESTAQUE DINÂMICO */}
          <CaseHeroDossier
            caseCode={`DOSSIÊ § ${currentActiveTopic.code}`}
            levelLabel={`NÍVEL ${activeTrack.number.toString().padStart(2, '0')} // ${currentActiveTopic.title.toUpperCase()}`}
            title={`${currentActiveTopic.title} no Vault Commerce`}
            scenario={currentActiveTopic.investigation_scope}
            targetElement={currentActiveTopic.target_element}
            criteria={dossierCriteria}
            mappedCount={evidences.length}
            totalCount={3}
            xpReward={currentActiveTopic.xp_reward}
            onEnterLab={() => handleEnterLab(currentActiveTopic)}
            isModalOpen={isLabOpen || isBriefingOpen}
          />

          {/* AS 3 FRENTES DE INVESTIGAÇÃO */}
          <ModuleFrentes
            modules={modules}
            completedTopics={completedTopics}
            activeTopicCode={currentActiveTopic?.code}
            onOpenBriefing={(topic) => handleOpenTopic(topic)}
          />
        </main>

        <AnalystSidebar
          tracks={tracks}
          activeTrackNumber={activeTrack.number}
          onSelectTrack={(track) => setActiveTrack(track)}
          evidences={evidences}
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
      <InvestigationWorkbenchModal
        topic={currentActiveTopic}
        sessionSeed={sessionSeed}
        isOpen={isLabOpen}
        onClose={() => setIsLabOpen(false)}
        onBugDetected={handleBugDetected}
        onTopicCompleted={handleTopicCompleted}
        initialEvidences={evidences}
      />
    </div>
  );
}
