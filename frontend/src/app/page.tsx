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
  { id: 1, number: 1, name: 'Testes Manuais', slug: 'testes-manuais', category: 'foundations', description: 'Exploratório, oráculos e heurísticas.', mini_site_route: '/mini-sites/vault-commerce/checkout/', order: 1 },
  { id: 2, number: 2, name: 'Bug Reports', slug: 'bug-reports', category: 'foundations', description: 'Escrita técnica com evidências e severidade.', mini_site_route: '/mini-sites/ledger-desk/', order: 2 },
  { id: 3, number: 3, name: 'Testes de API', slug: 'testes-api', category: 'protocols', description: 'REST, status codes e contratos.', mini_site_route: '/mini-sites/faulty-api/', order: 3 },
  { id: 4, number: 4, name: 'Testes de Funcionalidade', slug: 'testes-funcionalidade', category: 'foundations', description: 'Fluxos de negócio ponta a ponta.', mini_site_route: '/mini-sites/biz-flows/', order: 4 },
  { id: 5, number: 5, name: 'Testes de Regressão', slug: 'testes-regressao', category: 'foundations', description: 'Comparação de comportamento entre versões.', mini_site_route: '/mini-sites/regression-diff/', order: 5 },
  { id: 6, number: 6, name: 'Caixa Branca', slug: 'caixa-branca', category: 'structure', description: 'Caminhos lógicos e cobertura.', mini_site_route: '/mini-sites/white-box/', order: 6 },
  { id: 7, number: 7, name: 'Caixa Preta', slug: 'caixa-preta', category: 'structure', description: 'Auditoria externa sem acesso ao código.', mini_site_route: '/mini-sites/black-box/', order: 7 },
  { id: 8, number: 8, name: 'Testes Automatizados E2E', slug: 'testes-automatizados-e2e', category: 'automation', description: 'Scripts com Playwright.', mini_site_route: '/mini-sites/automation-gym/', order: 8 },
  { id: 9, number: 9, name: 'Testes Unitários', slug: 'testes-unitarios', category: 'structure', description: 'Captura de falhas lógicas sutis.', mini_site_route: '/mini-sites/unit-arena/', order: 9 },
  { id: 10, number: 10, name: 'CI/CD para QA', slug: 'cicd-para-qa', category: 'automation', description: 'Pipelines e gates de qualidade.', mini_site_route: '/mini-sites/pipeline-sim/', order: 10 },
  { id: 11, number: 11, name: 'Testes de Performance', slug: 'testes-performance', category: 'specialties', description: 'Telemetria de latência e carga.', mini_site_route: '/mini-sites/perf-dashboard/', order: 11 },
  { id: 12, number: 12, name: 'Testes de Acessibilidade (WCAG)', slug: 'testes-acessibilidade-wcag', category: 'specialties', description: 'Barreiras reais de teclado e contraste.', mini_site_route: '/mini-sites/a11y-barriers/', order: 12 },
  { id: 13, number: 13, name: 'Testes de Segurança (Nível QA)', slug: 'testes-seguranca', category: 'protocols', description: 'Sanitização e exposição de dados.', mini_site_route: '/mini-sites/sec-vault/', order: 13 },
  { id: 14, number: 14, name: 'Mobile Testing', slug: 'mobile-testing', category: 'specialties', description: 'Contexto mobile e interrupções.', mini_site_route: '/mini-sites/mobile-view/', order: 14 },
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
      { id: 1, code: 'QA-MAN-011', title: 'Roteiro Exploratório em Cadastro', slug: 'roteiro-exploratorio-cadastro', target_element: 'form#checkout-form', oracle_description: 'Todos os campos com asterisco são obrigatórios e exigem preenchimento substantivo.', investigation_scope: 'Investigue se o formulário bloqueia envios incompletos e se exibe mensagens amigáveis.', xp_reward: 60, order: 1 },
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
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(INITIAL_MODULES[0].topics[1]);
  const [activeTrack, setActiveTrack] = useState<Track>(INITIAL_TRACKS[0]);
  const [isLabOpen, setIsLabOpen] = useState<boolean>(false);
  const [isBriefingOpen, setIsBriefingOpen] = useState<boolean>(false);

  // Registro de tópicos completados com seus scores
  const [xp, setXp] = useState<number>(1420);
  const [completedTopics, setCompletedTopics] = useState<Record<string, number>>({
    'QA-MAN-011': 100
  });

  const [evidences, setEvidences] = useState<BugEvidence[]>([
    { code: 'VAL-AGE-001', topicCode: 'QA-MAN-012', title: 'Idade 17 anos aceita sem bloqueio no checkout.', status: 'CONFIRMADO', timestamp: Date.now() - 120000 },
    { code: 'SAN-WSP-004', topicCode: 'QA-MAN-011', title: 'Campo Nome aceita espaços vazios e avança.', status: 'CONFIRMADO', timestamp: Date.now() - 60000 },
  ]);

  useEffect(() => {
    document.documentElement.setAttribute('data-mode', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const handleOpenTopic = (topic: Topic) => {
    setSelectedTopic(topic);
    setIsBriefingOpen(true);
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
    setXp(prev => prev + 75);
  };

  const currentActiveTopic = selectedTopic || INITIAL_MODULES[0].topics[1];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AuditTopBar
        currentTrackName={`${activeTrack.number.toString().padStart(2, '0')}. ${activeTrack.name.toUpperCase()}`}
        currentModuleName="TRILHA 01: TESTES MANUAIS (7 TÓPICOS)"
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
            caseCode={`DOSSIÊ #${currentActiveTopic.code}`}
            levelLabel={`NÍVEL 01 // ${currentActiveTopic.title.toUpperCase()}`}
            title={`${currentActiveTopic.title} no Vault Commerce`}
            scenario={currentActiveTopic.investigation_scope}
            criteria={[
              { code: '§ 1.1', text: currentActiveTopic.oracle_description },
              { code: '§ 1.2', text: 'Respeitar idempotência e sanitização conforme os requisitos de conformidade.' },
              { code: '§ 1.3', text: 'Não gerar duplicidade de transações nem estados incoerentes de pedido.' },
            ]}
            mappedCount={evidences.length}
            totalCount={3}
            xpReward={currentActiveTopic.xp_reward}
            onEnterLab={() => handleEnterLab(currentActiveTopic)}
          />

          {/* AS 3 FRENTES DE INVESTIGAÇÃO (7 TÓPICOS) */}
          <ModuleFrentes
            modules={INITIAL_MODULES}
            completedTopics={completedTopics}
            onOpenBriefing={(topic) => handleOpenTopic(topic)}
          />
        </main>

        <AnalystSidebar
          tracks={INITIAL_TRACKS}
          activeTrackNumber={activeTrack.number}
          onSelectTrack={(track) => setActiveTrack(track)}
          evidences={evidences}
          xp={xp}
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
        initialEvidences={evidences.filter(e => !e.topicCode || e.topicCode === currentActiveTopic.code)}
      />
    </div>
  );
}
