import { useEffect, useMemo, useState } from "react";
import { hasSupabaseEnv } from "./lib/supabase";
import { getCurrentSession, signInWithPassword, signOut } from "./services/auth";
import { deleteClient, listClients, upsertClient } from "./services/clients";

const BRAND = {
  name: "Jaqueline Monteiro",
  subtitle: "Energia Coerente",
};

const MAIN_TABS = [
  { key: "dashboard", label: "Início" },
  { key: "clientes", label: "Clientes" },
  { key: "atendimentos", label: "Atendimentos" },
  { key: "financeiro", label: "Financeiro" },
];

const METHOD_TABS = [
  { key: "overview", label: "Visão geral" },
  { key: "protocolos", label: "Protocolos" },
];

const METHOD_CATALOG = [
  { slug: "aka", nome: "AKA", resumo: "Metodo salvo para futura estruturacao." },
  { slug: "radiestesia", nome: "Radiestesia", resumo: "Abriga TGR, FRT e UNE." },
  { slug: "pendulo-hebreu", nome: "Pendulo Hebreu", resumo: "Metodo salvo para futura estruturacao." },
  { slug: "interface-venusiana", nome: "Interface Venusiana", resumo: "Metodo salvo para futura estruturacao." },
  { slug: "alquimia-das-rosas", nome: "Alquimia das Rosas", resumo: "Metodo salvo para futura estruturacao." },
  { slug: "ascensao-estelar", nome: "Ascensao Estelar", resumo: "Metodo salvo para futura estruturacao." },
  { slug: "circulo-reconectivo", nome: "Circulo Reconectivo", resumo: "Metodo salvo para futura estruturacao." },
  { slug: "money-reiki", nome: "Money Reiki", resumo: "Metodo salvo para futura estruturacao." },
];

const RADIOESTHESIA_METHODS = [
  { slug: "tgr", nome: "TGR", resumo: "Protocolos e graficos." },
  { slug: "frt", nome: "FRT", resumo: "Metodo salvo para futura estruturacao." },
  { slug: "une", nome: "UNE", resumo: "Metodo salvo para futura estruturacao." },
];

const STATUS_OPTIONS = ["Novo contato", "Aguardando inicio", "Em atendimento", "Aguardando devolutiva", "Concluido"];
const PAYMENT_OPTIONS = ["Pendente", "Parcial", "Pago"];

const TGR_PROTOCOLS = [
  { slug: "relacoes", nome: "Relacoes", resumo: "Leitura profunda de vinculos, interferencias e padroes relacionais." },
  { slug: "limpeza-protecao", nome: "Limpeza e Protecao", resumo: "Identificacao de sobrecargas, interferencias e camadas de protecao." },
  { slug: "prosperidade", nome: "Prosperidade", resumo: "Mapeamento de bloqueios e organizacao de campos ligados a fluxo e realizacao." },
];

const PROTOCOL_OPTIONS = TGR_PROTOCOLS.map((item) => item.nome);

const TGR_GRAPHIC_GROUPS = [
  {
    slug: "despertar",
    nome: "Despertar",
    graficos: [
      "Antahkarana",
      "Cosmos 2000",
      "Cruz Atlante",
      "Energia Divina",
      "Fiat Lux",
      "Grafico dos Mestres",
      "Cubo de Metatron",
      "Prosperador",
      "Prosperidade Divina",
      "Selo Misterioso do Sol",
      "Sorte e Sucesso",
      "Vortex",
    ],
  },
  {
    slug: "harmonia",
    nome: "Harmonia",
    graficos: [
      "Desembaracador",
      "Desembaracador de Relacionamentos",
      "Desembaracador Material",
      "Vesica Piscis",
      "Justica Divina",
    ],
  },
  {
    slug: "protecao",
    nome: "Protecao",
    graficos: ["9 Circulos", "7 Circulos / Iave", "Psicoprotetor", "Tetragrammaton"],
  },
  {
    slug: "psicoemocionais",
    nome: "Psicoemocionais",
    graficos: [
      "Abertura",
      "Aceitar e Soltar",
      "Amor ao Proximo",
      "Amor Universal",
      "Confiar com Alegria",
      "Coragem",
      "Dependencia e Vicios",
      "Desilusao Amorosa",
      "Forca de Vontade",
      "Mundo Interior",
      "Positividade",
      "Pureza Interior",
      "Nervos",
    ],
  },
  {
    slug: "vitalidade",
    nome: "Vitalidade",
    graficos: [
      "Archine",
      "Captador de Energia Solar",
      "Cruz de Sao Mauro",
      "Magnetismo Vital e Curativo",
      "Relaxamento",
      "Forcas Universais",
    ],
  },
  {
    slug: "limpeza",
    nome: "Limpeza",
    graficos: [
      "Corte Energetico",
      "Cruz Ansata",
      "Guedes II",
      "Keiti",
      "Limpeza e Recarga",
      "Nenas",
      "Scap",
      "Yoshua",
    ],
  },
];

const CHAKRA_OPTIONS = [
  "Coronario",
  "Frontal",
  "Laringeo",
  "Cardiaco",
  "Plexo Solar",
  "Sacral",
  "Basico",
];

const RELATION_TYPES = ["Amorosa", "Familiar", "Profissional", "Amizade", "Convivio", "Outro"];
const GRAPHIC_CONTEXT_OPTIONS = ["Relacoes", "Prosperidade e Dinheiro", "Limpeza e Protecao Energetica"];
const PENDING_ACTION_OPTIONS = ["Dar feedback", "Terminar de analisar", "Montar os graficos"];
const CHECKLIST_OPTIONS = [
  { key: "analiseBasica", label: "Análise básica geral" },
  { key: "analiseTgr", label: "Analise TGR" },
  { key: "montagemGraficos", label: "Montagem dos gráficos" },
  { key: "feedback", label: "Feedback" },
  { key: "desmontagemGraficos", label: "Desmontagem dos gráficos" },
];

const CLIENT_DETAIL_TABS = [
  { key: "resumo", label: "Resumo" },
  { key: "ficha", label: "Ficha" },
  { key: "checklist", label: "Checklist" },
  { key: "devolutiva", label: "Devolutiva" },
];

const TGR_FLOW_STAGES = [
  { key: "leitura", label: "Leitura" },
  { key: "graficos", label: "Gráficos" },
  { key: "sintese", label: "Síntese" },
];

const PROTOCOL_GRAPHIC_DEFAULTS = {
  relacoes: { group: "harmonia", context: "Relacoes" },
  "limpeza-protecao": { group: "limpeza", context: "Limpeza e Protecao Energetica" },
  prosperidade: { group: "despertar", context: "Prosperidade e Dinheiro" },
};

const emptyRelacoesForm = {
  tipoRelacao: "Amorosa",
  pessoaVinculada: "",
  objetivoLeitura: "",
  observacaoInicial: "",
  campoMentalResultado: "",
  campoEmocionalResultado: "",
  tipoVinculoResultado: "",
  interferenciasIdentificadas: "",
  padraoRelacional: "",
  nivelHarmoniaRelacional: "",
  chakrasEmHarmonia: [],
  chakrasEmDesequilibrio: [],
  leituraChakrasPercentuais: {},
  leituraChakras: "",
  observacoesChakras: "",
  leituraGraficos: "",
  graficosSelecionados: [],
  contextoGraficos: {},
  tempoAtivacaoGraficos: {},
  sinteseGraficos: "",
  intervencaoIndicada: "",
  orientacaoTerapeutica: "",
  focoProximosDias: "",
  observacoesFinais: "",
  conclusaoAnalitica: "",
};

const emptyProtocolSupportForm = {
  objetivoLeitura: "",
  observacaoInicial: "",
  leituraPrincipal: "",
  pontosObservados: "",
  graficosSelecionados: [],
  contextoGraficos: {},
  tempoAtivacaoGraficos: {},
  leituraGraficos: "",
  sinteseGraficos: "",
  intervencaoIndicada: "",
  orientacaoTerapeutica: "",
  focoProximosDias: "",
  observacoesFinais: "",
  conclusaoAnalitica: "",
};

function cloneProtocolForms(source = {}) {
  return {
    relacoes: {
      ...emptyRelacoesForm,
      ...(source.relacoes || {}),
      graficosSelecionados: [...(source.relacoes?.graficosSelecionados || [])],
      contextoGraficos: { ...(source.relacoes?.contextoGraficos || {}) },
      tempoAtivacaoGraficos: { ...(source.relacoes?.tempoAtivacaoGraficos || {}) },
      leituraChakrasPercentuais: { ...(source.relacoes?.leituraChakrasPercentuais || {}) },
      chakrasEmHarmonia: [...(source.relacoes?.chakrasEmHarmonia || [])],
      chakrasEmDesequilibrio: [...(source.relacoes?.chakrasEmDesequilibrio || [])],
    },
    "limpeza-protecao": {
      ...emptyProtocolSupportForm,
      ...(source["limpeza-protecao"] || {}),
      graficosSelecionados: [...(source["limpeza-protecao"]?.graficosSelecionados || [])],
      contextoGraficos: { ...(source["limpeza-protecao"]?.contextoGraficos || {}) },
      tempoAtivacaoGraficos: { ...(source["limpeza-protecao"]?.tempoAtivacaoGraficos || {}) },
    },
    prosperidade: {
      ...emptyProtocolSupportForm,
      ...(source.prosperidade || {}),
      graficosSelecionados: [...(source.prosperidade?.graficosSelecionados || [])],
      contextoGraficos: { ...(source.prosperidade?.contextoGraficos || {}) },
      tempoAtivacaoGraficos: { ...(source.prosperidade?.tempoAtivacaoGraficos || {}) },
    },
  };
}


const THEME = {
  bg: "#f6f1e8",
  panel: "#fbf7f1",
  line: "#d8c7b5",
  text: "#3e3128",
  muted: "#7d6a5b",
  terracotta: "#b76e4d",
  terracottaSoft: "#ead6ca",
  green: "#6e7f5f",
  greenSoft: "#dde4d6",
  beige: "#efe4d2",
  sand: "#c9ab8a",
  shadow: "0 18px 40px rgba(79, 54, 39, 0.08)",
  protocolRelacoes: "#6f8f73",
  protocolRelacoesSoft: "#e4efe3",
  protocolLimpeza: "#b26b4f",
  protocolLimpezaSoft: "#f4e2d8",
  protocolProsperidade: "#9b7a3e",
  protocolProsperidadeSoft: "#f2e8cf",
};

const emptyClient = {
  id: "",
  nome: "",
  whatsapp: "",
  email: "",
  analyses: [],
  currentAnalysisId: "",
  dataInicio: "",
  protocolosUsados: [],
  queixaPrincipal: "",
  objetivo: "",
  diagnosticoEnergetico: "",
  causasIdentificadas: "",
  areasAfetadas: "",
  intervencoesRealizadas: "",
  observacoes: "",
  status: "Novo contato",
  bovis: "",
  hawkins: "",
  corposSutis: {
    atmico: "",
    budico: "",
    mentalSuperior: "",
    mentalInferior: "",
    astral: "",
    duploEterico: "",
    fisico: "",
  },
  chakras: {
    coronario: "",
    frontal: "",
    laringeo: "",
    cardiaco: "",
    plexoSolar: "",
    umbilical: "",
    basico: "",
  },
  funcoes: {
    respiratoria: "",
    nutritiva: "",
    digestiva: "",
    circulatoria: "",
    relacional: "",
    reprodutiva: "",
    estruturante: "",
    evolutiva: "",
    excretora: "",
  },
  campos: {
    energetico: "",
    mental: "",
    vital: "",
    emocional: "",
    espiritual: "",
    fisico: "",
  },
  aura: {
    protecao: "",
    tamanho: "",
    corExcesso: "",
    corFalta: "",
  },
  evolucao: "",
  valor: "",
  statusPagamento: "Pendente",
  devolutivaFinal: "",
  proximosPassos: "",
};

const emptyAnalysis = {
  id: "",
  title: "",
  dataInicio: "",
  protocolosUsados: [],
  queixaPrincipal: "",
  objetivo: "",
  diagnosticoEnergetico: "",
  causasIdentificadas: "",
  areasAfetadas: "",
  intervencoesRealizadas: "",
  observacoes: "",
  status: "Em atendimento",
  bovis: "",
  hawkins: "",
  corposSutis: {
    atmico: "",
    budico: "",
    mentalSuperior: "",
    mentalInferior: "",
    astral: "",
    duploEterico: "",
    fisico: "",
  },
  chakras: {
    coronario: "",
    frontal: "",
    laringeo: "",
    cardiaco: "",
    plexoSolar: "",
    umbilical: "",
    basico: "",
  },
  funcoes: {
    respiratoria: "",
    nutritiva: "",
    digestiva: "",
    circulatoria: "",
    relacional: "",
    reprodutiva: "",
    estruturante: "",
    evolutiva: "",
    excretora: "",
  },
  campos: {
    energetico: "",
    mental: "",
    vital: "",
    emocional: "",
    espiritual: "",
    fisico: "",
  },
  aura: {
    protecao: "",
    tamanho: "",
    corExcesso: "",
    corFalta: "",
  },
  evolucao: "",
  valor: "",
  statusPagamento: "Pendente",
  devolutivaFinal: "",
  proximosPassos: "",
  pendingActions: [],
  checklist: {
    analiseBasica: false,
    analiseTgr: false,
    montagemGraficos: false,
    feedback: false,
    desmontagemGraficos: false,
  },
  protocolForms: cloneProtocolForms(),
};

const sampleClients = [
  {
    ...emptyClient,
    id: "ec-1",
    nome: "Marina Costa",
    whatsapp: "(11) 98765-4321",
    email: "marina@email.com",
    dataInicio: "2026-03-10",
    protocolosUsados: ["Relacoes", "Limpeza e Protecao"],
    queixaPrincipal: "Cansaco constante e sensacao de travamento emocional.",
    objetivo: "Retomar clareza, vitalidade e estabilidade nas relacoes.",
    diagnosticoEnergetico: "Sobrecarga no campo emocional e dispersao de energia.",
    causasIdentificadas: "Acumulo de estresse, limites fragilizados e rotina desalinhada.",
    areasAfetadas: "Emocional, mental e relacional.",
    intervencoesRealizadas: "Limpeza inicial, harmonizacao progressiva e reorientacao de foco.",
    observacoes: "Cliente responsiva e com boa percepcao do processo.",
    status: "Em atendimento",
    evolucao: "Mais centrada e com menos oscilacao desde o dia 6.",
    valor: "480",
    statusPagamento: "Pago",
    devolutivaFinal: "",
    proximosPassos: "Reforcar rotina de descanso e observar gatilhos de drenagem.",
  },
  {
    ...emptyClient,
    id: "ec-2",
    nome: "Renata Araujo",
    whatsapp: "(21) 99888-1122",
    dataInicio: "2026-03-16",
    protocolosUsados: ["Relacoes"],
    queixaPrincipal: "Ansiedade intensa antes de reunioes importantes.",
    objetivo: "Regular a resposta emocional e sustentar presenca.",
    diagnosticoEnergetico: "Ativacao excessiva do mental e pouca ancoragem corporal.",
    causasIdentificadas: "Sobrecarga de demandas e autoexigencia elevada.",
    areasAfetadas: "Mental e emocional.",
    intervencoesRealizadas: "Ajuste inicial e ancoragem energetica de curto prazo.",
    observacoes: "Aguardar retorno apos os primeiros 3 dias.",
    status: "Aguardando inicio",
    evolucao: "",
    valor: "180",
    statusPagamento: "Pendente",
    devolutivaFinal: "",
    proximosPassos: "",
  },
];

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  border: `1px solid ${THEME.line}`,
  borderRadius: 16,
  padding: "14px 15px",
  fontSize: 15,
  lineHeight: 1.5,
  color: THEME.text,
  background: "#fffdfa",
  outline: "none",
};

const labelStyle = {
  display: "block",
  marginBottom: 7,
  fontSize: 12,
  fontWeight: 800,
  color: THEME.muted,
  letterSpacing: 0.8,
  textTransform: "uppercase",
};

function generateId() {
  return `ec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

function getProtocolTheme(protocol) {
  const value = String(protocol || "").toLowerCase();

  if (value.includes("limpeza")) {
    return {
      color: THEME.protocolLimpeza,
      soft: THEME.protocolLimpezaSoft,
    };
  }

  if (value.includes("prosperidade")) {
    return {
      color: THEME.protocolProsperidade,
      soft: THEME.protocolProsperidadeSoft,
    };
  }

  return {
    color: THEME.protocolRelacoes,
    soft: THEME.protocolRelacoesSoft,
  };
}

function cloneStructuredSection(section, fallback) {
  return {
    ...fallback,
    ...(section || {}),
  };
}

function buildAnalysisDraft(source = {}, overrides = {}) {
  return {
    ...emptyAnalysis,
    ...source,
    ...overrides,
    id: overrides.id || source.id || generateId(),
    title: overrides.title || source.title || "",
    dataInicio: overrides.dataInicio || source.dataInicio || getTodayDate(),
    protocolosUsados: [...(overrides.protocolosUsados || source.protocolosUsados || [])],
    corposSutis: cloneStructuredSection(overrides.corposSutis || source.corposSutis, emptyAnalysis.corposSutis),
    chakras: cloneStructuredSection(overrides.chakras || source.chakras, emptyAnalysis.chakras),
    funcoes: cloneStructuredSection(overrides.funcoes || source.funcoes, emptyAnalysis.funcoes),
    campos: cloneStructuredSection(overrides.campos || source.campos, emptyAnalysis.campos),
    aura: cloneStructuredSection(overrides.aura || source.aura, emptyAnalysis.aura),
    pendingActions: [...(overrides.pendingActions || source.pendingActions || [])],
    checklist: {
      ...emptyAnalysis.checklist,
      ...(source.checklist || {}),
      ...(overrides.checklist || {}),
    },
    protocolForms: cloneProtocolForms(overrides.protocolForms || source.protocolForms),
  };
}

function extractAnalysisFromClient(client = {}, overrides = {}) {
  return buildAnalysisDraft(
    {
      id: overrides.id || client.currentAnalysisId || client.id,
      title: overrides.title || client.title || "",
      dataInicio: client.dataInicio,
      protocolosUsados: client.protocolosUsados,
      queixaPrincipal: client.queixaPrincipal,
      objetivo: client.objetivo,
      diagnosticoEnergetico: client.diagnosticoEnergetico,
      causasIdentificadas: client.causasIdentificadas,
      areasAfetadas: client.areasAfetadas,
      intervencoesRealizadas: client.intervencoesRealizadas,
      observacoes: client.observacoes,
      status: client.status,
      bovis: client.bovis,
      hawkins: client.hawkins,
      corposSutis: client.corposSutis,
      chakras: client.chakras,
      funcoes: client.funcoes,
      campos: client.campos,
      aura: client.aura,
      evolucao: client.evolucao,
      valor: client.valor,
      statusPagamento: client.statusPagamento,
      devolutivaFinal: client.devolutivaFinal,
      proximosPassos: client.proximosPassos,
      pendingActions: client.pendingActions,
      checklist: client.checklist,
      protocolForms: client.protocolForms,
    },
    overrides
  );
}

function applyAnalysisToClient(client, analysis) {
  const mergedAnalysis = buildAnalysisDraft(analysis);
  return {
    ...client,
    currentAnalysisId: mergedAnalysis.id,
    dataInicio: mergedAnalysis.dataInicio,
    protocolosUsados: [...(mergedAnalysis.protocolosUsados || [])],
    queixaPrincipal: mergedAnalysis.queixaPrincipal,
    objetivo: mergedAnalysis.objetivo,
    diagnosticoEnergetico: mergedAnalysis.diagnosticoEnergetico,
    causasIdentificadas: mergedAnalysis.causasIdentificadas,
    areasAfetadas: mergedAnalysis.areasAfetadas,
    intervencoesRealizadas: mergedAnalysis.intervencoesRealizadas,
    observacoes: mergedAnalysis.observacoes,
    status: mergedAnalysis.status,
    bovis: mergedAnalysis.bovis,
    hawkins: mergedAnalysis.hawkins,
    corposSutis: cloneStructuredSection(mergedAnalysis.corposSutis, emptyAnalysis.corposSutis),
    chakras: cloneStructuredSection(mergedAnalysis.chakras, emptyAnalysis.chakras),
    funcoes: cloneStructuredSection(mergedAnalysis.funcoes, emptyAnalysis.funcoes),
    campos: cloneStructuredSection(mergedAnalysis.campos, emptyAnalysis.campos),
    aura: cloneStructuredSection(mergedAnalysis.aura, emptyAnalysis.aura),
    evolucao: mergedAnalysis.evolucao,
    valor: mergedAnalysis.valor,
    statusPagamento: mergedAnalysis.statusPagamento,
    devolutivaFinal: mergedAnalysis.devolutivaFinal,
    proximosPassos: mergedAnalysis.proximosPassos,
    pendingActions: [...(mergedAnalysis.pendingActions || [])],
    checklist: {
      ...emptyAnalysis.checklist,
      ...(mergedAnalysis.checklist || {}),
    },
    protocolForms: cloneProtocolForms(mergedAnalysis.protocolForms),
  };
}

function normalizeClientRecord(client = {}) {
  const rawAnalyses = Array.isArray(client.analyses) && client.analyses.length
    ? client.analyses.map((analysis) => buildAnalysisDraft(analysis))
    : [extractAnalysisFromClient(client, { id: client.currentAnalysisId || client.id || generateId(), dataInicio: client.dataInicio || getTodayDate() })];

  const currentAnalysisId = rawAnalyses.some((analysis) => analysis.id === client.currentAnalysisId)
    ? client.currentAnalysisId
    : rawAnalyses[0].id;

  const currentSnapshot = extractAnalysisFromClient(client, { id: currentAnalysisId });
  const analyses = rawAnalyses.map((analysis) => (
    analysis.id === currentAnalysisId
      ? buildAnalysisDraft(analysis, currentSnapshot)
      : analysis
  ));
  const activeAnalysis = analyses.find((analysis) => analysis.id === currentAnalysisId) || analyses[0];

  return applyAnalysisToClient(
    {
      ...emptyClient,
      ...client,
      analyses,
      currentAnalysisId,
    },
    activeAnalysis
  );
}

function formatCurrency(value) {
  const amount = Number(String(value || "0").replace(",", "."));
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number.isFinite(amount) ? amount : 0);
}

function formatDate(value) {
  if (!value) return "Sem data";
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

function formatFullDate(value) {
  if (!value) return "Sem data";
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("pt-BR");
}

function buildAttendanceDateOptions(client) {
  const analyses = Array.isArray(client?.analyses) ? client.analyses : [];
  return analyses
    .filter((analysis) => analysis?.id)
    .sort((a, b) => String(b.dataInicio || "").localeCompare(String(a.dataInicio || "")))
    .map((analysis) => ({
      value: analysis.id,
      label: `${formatFullDate(analysis.dataInicio)}${analysis.id === client.currentAnalysisId ? " · Analise atual" : ""}${analysis.status ? ` · ${analysis.status}` : ""}`,
    }));
}

function getDaysSinceStart(startDate) {
  if (!startDate) return 1;
  const start = new Date(`${startDate}T12:00:00`);
  const today = new Date();
  start.setHours(12, 0, 0, 0);
  today.setHours(12, 0, 0, 0);
  const diff = Math.floor((today.getTime() - start.getTime()) / 86400000) + 1;
  return Math.max(1, diff);
}

function getStatusTone(status) {
  const tones = {
    "Novo contato": { bg: "#f1ece4", color: "#6f5846" },
    "Aguardando inicio": { bg: "#efe4d2", color: "#8b5e3d" },
    "Em atendimento": { bg: "#dde4d6", color: "#536549" },
    "Aguardando devolutiva": { bg: "#ead6ca", color: "#8b5438" },
    Concluido: { bg: "#e7efe2", color: "#4e6446" },
  };
  return tones[status] || { bg: THEME.beige, color: THEME.text };
}

function buildFinalSummary(client) {
  const parts = [
    client.devolutivaFinal,
    client.diagnosticoEnergetico ? `Diagnostico observado: ${client.diagnosticoEnergetico}.` : "",
    client.causasIdentificadas ? `Causas identificadas: ${client.causasIdentificadas}.` : "",
    client.intervencoesRealizadas ? `Intervencoes realizadas: ${client.intervencoesRealizadas}.` : "",
    client.evolucao ? `Evolucao percebida: ${client.evolucao}.` : "",
    client.proximosPassos ? `Orientacao final: ${client.proximosPassos}.` : "",
  ].filter(Boolean);
  return parts.length ? parts.join(" ") : "Ainda sem devolutiva registrada.";
}

function formatFilledEntries(entries = [], prefix = "") {
  return entries
    .filter(([, value]) => String(value || "").trim())
    .map(([label, value]) => `${prefix}${label}: ${String(value).trim()}`);
}

function appendGeneratedText(currentValue, generatedValue) {
  const current = String(currentValue || "").trim();
  const generated = String(generatedValue || "").trim();
  if (!generated) return currentValue || "";
  if (!current) return generated;
  if (current.includes(generated)) return current;
  return `${current}\n\n${generated}`;
}

function buildInitialReadingLines(client) {
  const lines = [];

  if (client.bovis) lines.push(`Bovis: ${client.bovis}`);
  if (client.hawkins) lines.push(`Hawkins: ${client.hawkins}`);

  lines.push(
    ...formatFilledEntries([
      ["Corpo atmico", client.corposSutis?.atmico],
      ["Corpo budico", client.corposSutis?.budico],
      ["Corpo mental superior", client.corposSutis?.mentalSuperior],
      ["Corpo mental inferior", client.corposSutis?.mentalInferior],
      ["Corpo astral", client.corposSutis?.astral],
      ["Corpo duplo eterico", client.corposSutis?.duploEterico],
      ["Corpo fisico", client.corposSutis?.fisico],
      ["Chakra coronario", client.chakras?.coronario],
      ["Chakra frontal", client.chakras?.frontal],
      ["Chakra laringeo", client.chakras?.laringeo],
      ["Chakra cardiaco", client.chakras?.cardiaco],
      ["Chakra plexo solar", client.chakras?.plexoSolar],
      ["Chakra umbilical", client.chakras?.umbilical],
      ["Chakra basico", client.chakras?.basico],
      ["Funcao respiratoria", client.funcoes?.respiratoria],
      ["Funcao nutritiva", client.funcoes?.nutritiva],
      ["Funcao digestiva", client.funcoes?.digestiva],
      ["Funcao circulatoria", client.funcoes?.circulatoria],
      ["Funcao relacional", client.funcoes?.relacional],
      ["Funcao reprodutiva", client.funcoes?.reprodutiva],
      ["Funcao estruturante", client.funcoes?.estruturante],
      ["Funcao evolutiva", client.funcoes?.evolutiva],
      ["Funcao excretora", client.funcoes?.excretora],
      ["Campo energetico", client.campos?.energetico],
      ["Campo mental", client.campos?.mental],
      ["Campo vital", client.campos?.vital],
      ["Campo emocional", client.campos?.emocional],
      ["Campo espiritual", client.campos?.espiritual],
      ["Campo fisico", client.campos?.fisico],
      ["Aura - protecao", client.aura?.protecao],
      ["Aura - tamanho", client.aura?.tamanho],
      ["Aura - cor excesso", client.aura?.corExcesso],
      ["Aura - cor falta", client.aura?.corFalta],
    ])
  );

  return lines;
}

function buildDiagnosticSuggestion(client) {
  const protocols = getValidProtocols(client.protocolosUsados);
  const lines = [];
  if (client.bovis || client.hawkins) {
    lines.push(`Leitura inicial registrada com ${[client.bovis ? `Bovis ${client.bovis}` : "", client.hawkins ? `Hawkins ${client.hawkins}` : ""].filter(Boolean).join(" e ")}.`);
  }
  if (protocols.length) {
    lines.push(`Protocolos em uso nesta analise: ${protocols.join(", ")}.`);
  }
  if (client.queixaPrincipal) {
    lines.push(`Queixa principal em observacao: ${client.queixaPrincipal}.`);
  }
  if (client.objetivo) {
    lines.push(`Objetivo terapeutico declarado: ${client.objetivo}.`);
  }
  const readingCount = buildInitialReadingLines(client).length;
  if (readingCount) {
    lines.push("Leitura inicial preenchida para apoiar o fechamento diagnostico dos campos alterados.");
  }
  return lines.join(" ");
}

function buildCausesSuggestion(client) {
  return buildInitialReadingLines(client).join("\n");
}

function buildAreasSuggestion(client) {
  const sections = [
    ["Corpos sutis", Object.values(client.corposSutis || {}).some((value) => String(value || "").trim())],
    ["Chakras", Object.values(client.chakras || {}).some((value) => String(value || "").trim())],
    ["Funcoes", Object.values(client.funcoes || {}).some((value) => String(value || "").trim())],
    ["Campos", Object.values(client.campos || {}).some((value) => String(value || "").trim())],
    ["Aura", Object.values(client.aura || {}).some((value) => String(value || "").trim())],
  ]
    .filter(([, active]) => active)
    .map(([label]) => label);

  return sections.join("\n");
}

function buildInterventionsSuggestion(client) {
  const protocols = getValidProtocols(client.protocolosUsados);
  const lines = ["Metodo: TGR"];
  if (protocols.length) lines.push(`Protocolos: ${protocols.join(", ")}`);
  return lines.join("\n");
}

function inferProtocolSlug(client) {
  const text = `${client.queixaPrincipal || ""} ${client.objetivo || ""} ${client.diagnosticoEnergetico || ""}`.toLowerCase();
  if (text.includes("relac")) return "relacoes";
  if (text.includes("protec") || text.includes("limpeza")) return "limpeza-protecao";
  if (text.includes("prosper") || text.includes("abundan") || text.includes("dinheir")) return "prosperidade";
  return "relacoes";
}

function findProtocolName(slug) {
  return TGR_PROTOCOLS.find((item) => item.slug === slug)?.nome || "Relacoes";
}

function getValidProtocols(protocols = []) {
  return (Array.isArray(protocols) ? protocols : []).filter((protocol) =>
    PROTOCOL_OPTIONS.includes(protocol)
  );
}

function formatProtocols(client) {
  const validProtocols = getValidProtocols(client.protocolosUsados);
  return validProtocols.length ? validProtocols.join(", ") : findProtocolName(client.protocolSlug);
}

function getAnalysisRecord(client, analysisId = client?.currentAnalysisId) {
  const analyses = Array.isArray(client?.analyses) ? client.analyses : [];
  return analyses.find((item) => item.id === analysisId) || extractAnalysisFromClient(client || {});
}

function getActiveGraphicsFromAnalysis(analysis) {
  const protocolForms = cloneProtocolForms(analysis?.protocolForms);
  return TGR_PROTOCOLS.flatMap((protocol) => {
    const form = protocol.slug === "relacoes" ? protocolForms.relacoes : protocolForms[protocol.slug];
    return (form?.graficosSelecionados || []).map((graphic) => ({
      protocol: protocol.nome,
      nome: graphic,
      contexto: form?.contextoGraficos?.[graphic] || "",
      tempo: form?.tempoAtivacaoGraficos?.[graphic] || "",
    }));
  });
}

function getActiveGraphicsByProtocol(client) {
  const analysis = getAnalysisRecord(client);
  return getActiveGraphicsFromAnalysis(analysis);
}

function findProtocolSlugByName(name) {
  const match = TGR_PROTOCOLS.find((item) => item.nome.toLowerCase() === String(name || "").toLowerCase());
  return match?.slug || "relacoes";
}

function getLatestAnalysis(client) {
  const analyses = Array.isArray(client?.analyses) ? client.analyses : [];
  return analyses
    .filter((analysis) => analysis?.id)
    .slice()
    .sort((a, b) => String(b.dataInicio || "").localeCompare(String(a.dataInicio || "")))[0] || getAnalysisRecord(client);
}

  function getNextAction(client) {
  const analysis = getAnalysisRecord(client);
  const protocols = getValidProtocols(analysis?.protocolosUsados);
  const activeGraphics = getActiveGraphicsFromAnalysis(analysis);
  const pendingActions = analysis?.pendingActions || [];

  if (pendingActions.length) return pendingActions[0];
  if (!protocols.length) return "Escolher protocolo no TGR";
  if (!activeGraphics.length) return "Adicionar graficos aos protocolos";
  if (client?.status === "Aguardando devolutiva") return "Preparar devolutiva final";
  if (client?.status === "Concluido") return "Iniciar nova analise ou revisar historico";
  if (client?.statusPagamento !== "Pago") return "Conferir pagamento e acompanhar evolucao";
  return "Acompanhar graficos ativos e registrar conduta";
}

function formatPendingActions(actions = []) {
  return actions.length ? actions.join(", ") : "Sem pendencias marcadas";
}

function buildAnalysisHistoryCards(client) {
  const analyses = Array.isArray(client?.analyses) ? client.analyses : [];
  return analyses
    .filter((analysis) => analysis?.id)
    .slice()
    .sort((a, b) => String(b.dataInicio || "").localeCompare(String(a.dataInicio || "")))
    .map((analysis) => {
      const graphics = getActiveGraphicsFromAnalysis(analysis);
      const protocols = getValidProtocols(analysis.protocolosUsados);
      return {
        id: analysis.id,
        dateLabel: formatFullDate(analysis.dataInicio),
        isCurrent: analysis.id === client.currentAnalysisId,
        status: analysis.status || "Em atendimento",
        protocolLabel: protocols.length ? protocols.join(", ") : "Sem protocolo",
        graphicsCount: graphics.length,
      };
    });
}

function serializeFormState(value) {
  return JSON.stringify(value || {});
}

const primaryButtonStyle = {
  border: "none",
  borderRadius: 18,
  background: THEME.text,
  color: "#fff",
  padding: "13px 20px",
  cursor: "pointer",
  fontWeight: 800,
  fontSize: 14,
};

const secondaryButtonStyle = {
  border: `1px solid ${THEME.line}`,
  borderRadius: 16,
  background: "#fffdfa",
  color: THEME.text,
  padding: "11px 15px",
  cursor: "pointer",
  fontWeight: 800,
  fontSize: 14,
};

function App() {
  const [clients, setClients] = useState([]);
  const [mainTab, setMainTab] = useState("dashboard");
  const [selectedId, setSelectedId] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [mobile, setMobile] = useState(() => window.innerWidth < 920);
  const [draftClient, setDraftClient] = useState(() => ({ ...emptyClient, id: generateId() }));
  const [appMode, setAppMode] = useState(hasSupabaseEnv ? "supabase" : "local");
  const [authReady, setAuthReady] = useState(false);
  const [user, setUser] = useState(null);
  const [authForm, setAuthForm] = useState({ email: "", password: "" });
  const [authError, setAuthError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uiMessage, setUiMessage] = useState("");
  const [activeMethod, setActiveMethod] = useState("radiestesia");
  const [activeSubmethod, setActiveSubmethod] = useState("tgr");
  const [activeMethodTab, setActiveMethodTab] = useState("overview");
  const [activeTgrProtocol, setActiveTgrProtocol] = useState("relacoes");
  const [relacoesForm, setRelacoesForm] = useState(emptyRelacoesForm);
  const [protocolSupportForms, setProtocolSupportForms] = useState({});
  const [relacoesContext, setRelacoesContext] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      try {
        const authState = await getCurrentSession();
        if (!mounted) return;
        setAppMode(authState.mode);
        setUser(authState.user);

        const clientsState = await listClients(sampleClients);
        if (!mounted) return;
        setAppMode(clientsState.mode);
        setClients(clientsState.data);
      } catch {
        if (!mounted) return;
        setAppMode(hasSupabaseEnv ? "supabase" : "local");
        setClients(hasSupabaseEnv ? [] : sampleClients);
        setUiMessage(hasSupabaseEnv ? "Nao foi possivel carregar os clientes salvos. Revise a conexao com o banco." : "Nao foi possivel carregar os clientes locais.");
      } finally {
        if (!mounted) return;
        setAuthReady(true);
      }
    }

    bootstrap();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const onResize = () => setMobile(window.innerWidth < 920);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const clientsWithProgress = useMemo(
    () =>
      clients.map((item) => {
        const client = normalizeClientRecord(item);
        const computedDay = client.dataInicio ? getDaysSinceStart(client.dataInicio) : 1;
        return {
          ...client,
          diasAtendimento: computedDay,
          methodSlug: "tgr",
          protocolSlug: inferProtocolSlug(client),
        };
      }),
    [clients]
  );

  const appointments = useMemo(
    () =>
      clientsWithProgress.map((client) => ({
        id: client.id,
        clientId: client.id,
        title: client.nome,
        methodSlug: client.methodSlug,
        protocolSlug: client.protocolSlug,
        status: client.status,
        dataInicio: client.dataInicio,
        diasAtendimento: client.diasAtendimento,
        queixaPrincipal: client.queixaPrincipal,
        objetivo: client.objetivo,
        valor: client.valor,
        statusPagamento: client.statusPagamento,
      })),
    [clientsWithProgress]
  );

  const filteredClients = useMemo(() => {
    return clientsWithProgress
      .filter((client) => {
        const matchesStatus = statusFilter === "Todos" || client.status === statusFilter;
        const haystack = [client.nome, client.whatsapp, client.email, client.queixaPrincipal, client.objetivo].join(" ").toLowerCase();
        const matchesSearch = !search || haystack.includes(search.toLowerCase());
        return matchesStatus && matchesSearch;
      })
      .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  }, [clientsWithProgress, search, statusFilter]);

  const selectedClient =
    filteredClients.find((client) => client.id === selectedId) ||
    clientsWithProgress.find((client) => client.id === selectedId) ||
    null;
  const selectedAnalysis = selectedClient ? getAnalysisRecord(selectedClient) : null;
  const clientFocusMode =
    (mainTab === "clientes" && Boolean(selectedId)) ||
    (mainTab === "metodos" && Boolean(relacoesContext?.clientId || selectedId)) ||
    (mainTab === "devolutivas" && Boolean(selectedId));

  useEffect(() => {
    if (!selectedClient) {
      setRelacoesForm(emptyRelacoesForm);
      setProtocolSupportForms({});
      return;
    }

    const activeAnalysis = selectedClient.analyses?.find((analysis) => analysis.id === selectedClient.currentAnalysisId) || extractAnalysisFromClient(selectedClient);
    const protocolForms = cloneProtocolForms(activeAnalysis.protocolForms);
    setRelacoesForm(protocolForms.relacoes);
    setProtocolSupportForms({
      "limpeza-protecao": protocolForms["limpeza-protecao"],
      prosperidade: protocolForms.prosperidade,
    });
  }, [selectedClient?.id, selectedClient?.currentAnalysisId]);

  const selectedAnalysisSignature = useMemo(
    () => serializeFormState(selectedAnalysis?.protocolForms),
    [selectedAnalysis?.id, selectedAnalysis?.protocolForms]
  );

  const protocolDirtyState = useMemo(() => {
    if (!selectedAnalysis) {
      return {
        relacoes: false,
        "limpeza-protecao": false,
        prosperidade: false,
      };
    }

    const savedForms = cloneProtocolForms(selectedAnalysis.protocolForms);
    return {
      relacoes: serializeFormState(savedForms.relacoes) !== serializeFormState(relacoesForm),
      "limpeza-protecao": serializeFormState(savedForms["limpeza-protecao"]) !== serializeFormState(protocolSupportForms["limpeza-protecao"] || emptyProtocolSupportForm),
      prosperidade: serializeFormState(savedForms.prosperidade) !== serializeFormState(protocolSupportForms.prosperidade || emptyProtocolSupportForm),
    };
  }, [selectedAnalysis?.id, selectedAnalysisSignature, relacoesForm, protocolSupportForms]);

  const hasUnsavedProtocolChanges = Object.values(protocolDirtyState).some(Boolean);

  useEffect(() => {
    if (!hasUnsavedProtocolChanges) return undefined;

    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedProtocolChanges]);

  const metrics = useMemo(() => {
    const active = clientsWithProgress.filter((client) => client.status === "Em atendimento").length;
    const pendingFeedback = clientsWithProgress.filter((client) => client.status === "Aguardando devolutiva").length;
    const pendingPayment = clientsWithProgress.filter((client) => client.statusPagamento !== "Pago").length;
    const monthlyRevenue = clientsWithProgress.reduce((total, client) => total + Number(client.valor || 0), 0);
    return { active, pendingFeedback, pendingPayment, monthlyRevenue };
  }, [clientsWithProgress]);

  async function persistClientRecord(payload, options = {}) {
    setSaving(true);
    if (!options.keepMessage) setUiMessage("");
    const record = normalizeClientRecord(payload);

    try {
      const response = await upsertClient(record, clients);
      if (response.all) setClients(response.all);
      else {
        setClients((current) => {
          const exists = current.some((item) => item.id === record.id);
          if (exists) return current.map((item) => (item.id === record.id ? record : item));
          return [record, ...current];
        });
      }
      setSelectedId(record.id);
      if (options.resetDraft) setDraftClient({ ...emptyClient, id: generateId() });
      if (options.goToClients) setMainTab("clientes");
      if (options.successMessage) setUiMessage(options.successMessage);
      return record;
    } catch (error) {
      setUiMessage(error?.message || options.errorMessage || "Nao foi possivel salvar o atendimento.");
      return null;
    } finally {
      setSaving(false);
    }
  }

  async function saveClient(payload) {
    await persistClientRecord(payload, {
      resetDraft: true,
      goToClients: true,
      successMessage: "Atendimento salvo com sucesso.",
    });
  }

  async function removeClient(id) {
    setUiMessage("");
    try {
      const response = await deleteClient(id, clients);
      if (response.all) setClients(response.all);
      else setClients((current) => current.filter((item) => item.id !== id));
      if (selectedId === id) setSelectedId("");
      setUiMessage("Atendimento removido.");
    } catch (error) {
      setUiMessage(error?.message || "Nao foi possivel remover o atendimento.");
    }
  }

  async function finalizeClient(id) {
    const currentClient = clients.find((item) => item.id === id);
    if (!currentClient) return;
    const normalized = normalizeClientRecord(currentClient);
    const finalizedAnalysis = buildAnalysisDraft(
      normalized.analyses.find((analysis) => analysis.id === normalized.currentAnalysisId),
      { status: "Concluido" }
    );

    await persistClientRecord({
      ...normalized,
      analyses: normalized.analyses.map((analysis) => (analysis.id === finalizedAnalysis.id ? finalizedAnalysis : analysis)),
      currentAnalysisId: finalizedAnalysis.id,
      status: "Concluido",
    }, { successMessage: "Analise finalizada." });
    setUiMessage("Analise finalizada.");
  }

  async function switchClientAnalysis(clientId, analysisId) {
    if (selectedClient?.id === clientId && !confirmUnsavedNavigation("outra analise")) return;
    const currentClient = clients.find((item) => item.id === clientId);
    if (!currentClient) return;
    const normalized = normalizeClientRecord(currentClient);
    const selectedAnalysis = normalized.analyses.find((analysis) => analysis.id === analysisId);
    if (!selectedAnalysis) return;

    await persistClientRecord({
      ...applyAnalysisToClient(normalized, selectedAnalysis),
      analyses: normalized.analyses,
      currentAnalysisId: selectedAnalysis.id,
    }, { keepMessage: true });
  }

  async function createNewAnalysis(clientId) {
    const currentClient = clients.find((item) => item.id === clientId);
    if (!currentClient) return;
    const normalized = normalizeClientRecord(currentClient);
    const newAnalysis = buildAnalysisDraft({
      title: "",
      dataInicio: getTodayDate(),
      status: "Em atendimento",
      statusPagamento: "Pendente",
    });

    await persistClientRecord({
      ...applyAnalysisToClient(normalized, newAnalysis),
      analyses: [newAnalysis, ...normalized.analyses],
      currentAnalysisId: newAnalysis.id,
    }, { successMessage: "Nova analise iniciada." });
    setUiMessage("Nova analise iniciada.");
  }

  function startNewClient() {
    setDraftClient({ ...emptyClient, id: generateId() });
    setSelectedId("__new__");
    setMainTab("clientes");
  }

  async function createClientAndOpenTgr(payload) {
    const record = await persistClientRecord(payload, {
      resetDraft: true,
      successMessage: "Cliente salvo. TGR aberto.",
    });

    if (!record) return;
    setActiveMethod("radiestesia");
    setActiveSubmethod("tgr");
    setActiveMethodTab("protocolos");
    setActiveTgrProtocol("");
    setRelacoesContext({
      clientId: record.id,
      clientName: record.nome,
      protocolName: "",
    });
    setMainTab("metodos");
  }

  async function toggleClientProtocol(clientId, protocolName) {
    const currentClient = clients.find((item) => item.id === clientId);
    if (!currentClient) return;
    const normalized = normalizeClientRecord(currentClient);
    const currentAnalysis = normalized.analyses.find((analysis) => analysis.id === normalized.currentAnalysisId);
    if (!currentAnalysis) return;

    const currentProtocols = getValidProtocols(currentAnalysis.protocolosUsados);
    const nextProtocols = currentProtocols.includes(protocolName)
      ? currentProtocols.filter((protocol) => protocol !== protocolName)
      : [...currentProtocols, protocolName];

    const updatedAnalysis = buildAnalysisDraft(currentAnalysis, {
      protocolosUsados: nextProtocols,
    });

    await persistClientRecord({
      ...applyAnalysisToClient(normalized, updatedAnalysis),
      analyses: normalized.analyses.map((analysis) => (analysis.id === updatedAnalysis.id ? updatedAnalysis : analysis)),
      currentAnalysisId: updatedAnalysis.id,
    }, { keepMessage: true });

    if (!nextProtocols.length) {
      setActiveTgrProtocol("");
    } else if (!nextProtocols.includes(findProtocolName(activeTgrProtocol))) {
      setActiveTgrProtocol(findProtocolSlugByName(nextProtocols[0]));
    }
  }

  async function saveProtocolToClient(protocolSlug, formData) {
    if (!relacoesContext?.clientId) return;
    const currentClient = clients.find((item) => item.id === relacoesContext.clientId);
    if (!currentClient) return;
    const normalized = normalizeClientRecord(currentClient);
    const currentAnalysis = normalized.analyses.find((analysis) => analysis.id === normalized.currentAnalysisId);
    if (!currentAnalysis) return;

    const protocolName = findProtocolName(protocolSlug);
    const updatedAnalysis = buildAnalysisDraft(currentAnalysis, {
      protocolosUsados: Array.from(new Set([...(currentAnalysis.protocolosUsados || []), protocolName])),
      protocolForms: {
        ...cloneProtocolForms(currentAnalysis.protocolForms),
        [protocolSlug]: protocolSlug === "relacoes"
          ? {
            ...emptyRelacoesForm,
            ...formData,
            graficosSelecionados: [...(formData.graficosSelecionados || [])],
            contextoGraficos: { ...(formData.contextoGraficos || {}) },
            tempoAtivacaoGraficos: { ...(formData.tempoAtivacaoGraficos || {}) },
            leituraChakrasPercentuais: { ...(formData.leituraChakrasPercentuais || {}) },
            chakrasEmHarmonia: [...(formData.chakrasEmHarmonia || [])],
            chakrasEmDesequilibrio: [...(formData.chakrasEmDesequilibrio || [])],
          }
          : {
            ...emptyProtocolSupportForm,
            ...formData,
            graficosSelecionados: [...(formData.graficosSelecionados || [])],
            contextoGraficos: { ...(formData.contextoGraficos || {}) },
            tempoAtivacaoGraficos: { ...(formData.tempoAtivacaoGraficos || {}) },
          },
      },
    });

    await persistClientRecord({
      ...applyAnalysisToClient(normalized, updatedAnalysis),
      analyses: normalized.analyses.map((analysis) => (analysis.id === updatedAnalysis.id ? updatedAnalysis : analysis)),
      currentAnalysisId: updatedAnalysis.id,
    }, { successMessage: `Protocolo ${protocolName} salvo na analise.` });

    setUiMessage(`Protocolo ${protocolName} salvo na analise.`);
  }

  async function updateClientAnalysisFields(clientId, updates, successMessage = "") {
    const currentClient = clients.find((item) => item.id === clientId);
    if (!currentClient) return;
    const normalized = normalizeClientRecord(currentClient);
    const currentAnalysis = normalized.analyses.find((analysis) => analysis.id === normalized.currentAnalysisId);
    if (!currentAnalysis) return;

    const updatedAnalysis = buildAnalysisDraft(currentAnalysis, updates);
    await persistClientRecord({
      ...applyAnalysisToClient(normalized, updatedAnalysis),
      analyses: normalized.analyses.map((analysis) => (analysis.id === updatedAnalysis.id ? updatedAnalysis : analysis)),
      currentAnalysisId: updatedAnalysis.id,
    }, { keepMessage: !successMessage, successMessage });

    if (successMessage) setUiMessage(successMessage);
  }

  function confirmUnsavedNavigation(destinationLabel = "continuar") {
    if (!(mainTab === "metodos" && hasUnsavedProtocolChanges)) return true;
    return window.confirm(`Ha alteracoes nao salvas no TGR. Deseja sair para ${destinationLabel} mesmo assim?`);
  }

  function openTgrWorkspace() {
    setActiveMethod("radiestesia");
    setActiveSubmethod("tgr");
    setActiveMethodTab("protocolos");
    setMainTab("metodos");
  }

  function handleTabChange(nextTab) {
    if (!confirmUnsavedNavigation(nextTab)) return;
    if (nextTab === "metodos") {
      openTgrWorkspace();
      return;
    }
    if (nextTab === "clientes") {
      setSelectedId("");
      setRelacoesContext(null);
    }
    setMainTab(nextTab);
  }

  function openProtocolForClient(client, protocolName = "") {
    if (!client) return;
    const protocolSlug = protocolName ? findProtocolSlugByName(protocolName) : "";
    const normalizedClient = normalizeClientRecord(client);
    const currentAnalysis = normalizedClient.analyses.find((analysis) => analysis.id === normalizedClient.currentAnalysisId) || extractAnalysisFromClient(normalizedClient);
    const protocolForms = cloneProtocolForms(currentAnalysis.protocolForms);
    openTgrWorkspace();
    setActiveTgrProtocol(protocolSlug);
    setRelacoesContext({
      clientId: client.id,
      clientName: client.nome,
      protocolName,
    });
    setRelacoesForm({
      ...protocolForms.relacoes,
      objetivoLeitura: protocolForms.relacoes.objetivoLeitura || client.objetivo || "",
      observacaoInicial: protocolForms.relacoes.observacaoInicial || client.queixaPrincipal || "",
      conclusaoAnalitica: protocolForms.relacoes.conclusaoAnalitica || client.diagnosticoEnergetico || "",
    });
    setProtocolSupportForms((current) => ({
      ...current,
      ...(protocolSlug ? {
        [protocolSlug]: {
          ...emptyProtocolSupportForm,
          ...(protocolForms[protocolSlug] || current[protocolSlug] || {}),
          objetivoLeitura: protocolForms[protocolSlug]?.objetivoLeitura || current[protocolSlug]?.objetivoLeitura || client.objetivo || "",
          observacaoInicial: protocolForms[protocolSlug]?.observacaoInicial || current[protocolSlug]?.observacaoInicial || client.queixaPrincipal || "",
          conclusaoAnalitica: protocolForms[protocolSlug]?.conclusaoAnalitica || current[protocolSlug]?.conclusaoAnalitica || client.diagnosticoEnergetico || "",
        },
      } : {}),
    }));
  }

  async function handleLogin(event) {
    event.preventDefault();
    setAuthError("");
    try {
      const sessionState = await signInWithPassword(authForm);
      setAppMode(sessionState.mode);
      setUser(sessionState.user);
      const clientsState = await listClients(sampleClients);
      setClients(clientsState.data);
    } catch (error) {
      setAuthError(error?.message || "Nao foi possivel entrar.");
    }
  }

  async function handleLogout() {
    await signOut();
    setUser(null);
  }

  if (!authReady) {
    return (
      <Shell>
        <Panel>
          <div style={{ fontSize: 18, fontWeight: 800 }}>Carregando</div>
        </Panel>
      </Shell>
    );
  }

  if (appMode === "supabase" && !user) {
    return (
      <Shell>
        <div style={{ maxWidth: 460, margin: "0 auto", padding: "24px 14px" }}>
          <Panel>
            <div style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>{BRAND.name}</div>
            <div style={{ color: THEME.terracotta, fontWeight: 700, marginBottom: 18 }}>{BRAND.subtitle}</div>
            <form onSubmit={handleLogin} style={{ display: "grid", gap: 12 }}>
              <Field label="Email">
                <input value={authForm.email} onChange={(event) => setAuthForm((current) => ({ ...current, email: event.target.value }))} style={inputStyle} />
              </Field>
              <Field label="Senha">
                <input type="password" value={authForm.password} onChange={(event) => setAuthForm((current) => ({ ...current, password: event.target.value }))} style={inputStyle} />
              </Field>
              {authError ? <div style={{ color: "#a54f3b", fontSize: 13 }}>{authError}</div> : null}
              <button type="submit" style={primaryButtonStyle}>Entrar</button>
            </form>
          </Panel>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <Header user={user} onLogout={handleLogout} mobile={mobile} />
      <div style={{ maxWidth: 1220, margin: "0 auto", padding: mobile ? "18px 14px 40px" : "24px 24px 48px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap", marginBottom: 16 }}>
          <button
            type="button"
            onClick={() => {
              if (!confirmUnsavedNavigation("o início")) return;
              setSelectedId("");
              setRelacoesContext(null);
              setMainTab("dashboard");
            }}
            style={mainTab === "dashboard" && !clientFocusMode ? primaryButtonStyle : secondaryButtonStyle}
          >
            Início
          </button>
          {clientFocusMode ? (
            <div style={{ color: THEME.muted, fontSize: 13, lineHeight: 1.5 }}>
              Volte ao início quando quiser sair do atendimento em foco sem se perder na navegação.
            </div>
          ) : null}
        </div>
        {!clientFocusMode ? <TopMetrics metrics={metrics} mobile={mobile} /> : null}
        {!clientFocusMode ? (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16, marginBottom: 18 }}>
            {MAIN_TABS.filter((tab) => tab.key !== "dashboard").map((tab) => (
              <TabButton key={tab.key} active={mainTab === tab.key} onClick={() => handleTabChange(tab.key)} label={tab.label} />
            ))}
          </div>
        ) : (
          <Panel style={{ marginTop: 10, marginBottom: 18, padding: "14px 16px" }}>
            <div style={{ display: "grid", gap: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ fontSize: 18, fontWeight: 800 }}>
                  {selectedClient?.nome || relacoesContext?.clientName || "Atendimento em foco"}
                </div>
                <div style={{ color: THEME.muted, fontSize: 13 }}>
                  Navegação reduzida para manter o atendimento mais seguro e direto.
                </div>
              </div>
              <div style={{ display: "none", gap: 8, flexWrap: "wrap" }}>
                <button type="button" onClick={() => setMainTab("clientes")} style={secondaryButtonStyle}>Prontuário</button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveMethod("radiestesia");
                    setActiveSubmethod("tgr");
                    setActiveMethodTab("protocolos");
                    setMainTab("metodos");
                  }}
                  style={secondaryButtonStyle}
                >
                  TGR
                </button>
                <button type="button" onClick={() => setMainTab("devolutivas")} style={secondaryButtonStyle}>Devolutiva</button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedId("");
                    setRelacoesContext(null);
                    setMainTab("dashboard");
                  }}
                  style={primaryButtonStyle}
                >
                  Menu central
                </button>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <StagePill label="Prontuario" active={mainTab === "clientes"} />
                <StagePill label="TGR" active={mainTab === "metodos"} />
                <StagePill label="Devolutiva" active={mainTab === "devolutivas"} />
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button type="button" onClick={() => { if (!confirmUnsavedNavigation("o prontuario")) return; setMainTab("clientes"); }} style={mainTab === "clientes" ? primaryButtonStyle : secondaryButtonStyle}>Prontuario</button>
                <button type="button" onClick={() => openTgrWorkspace()} style={mainTab === "metodos" ? primaryButtonStyle : secondaryButtonStyle}>TGR</button>
                <button type="button" onClick={() => { if (!confirmUnsavedNavigation("a devolutiva")) return; setMainTab("devolutivas"); }} style={mainTab === "devolutivas" ? primaryButtonStyle : secondaryButtonStyle}>Devolutiva</button>
                <button
                  type="button"
                  onClick={() => {
                    if (!confirmUnsavedNavigation("o menu central")) return;
                    setSelectedId("");
                    setRelacoesContext(null);
                    setMainTab("dashboard");
                  }}
                  style={secondaryButtonStyle}
                >
                  Voltar ao menu
                </button>
              </div>
            </div>
          </Panel>
        )}
        {uiMessage ? (
          <div style={{ marginBottom: 16 }}>
            <Panel style={{ padding: "12px 16px", background: "#fff8ef" }}>
              <div style={{ color: THEME.text, fontWeight: 700 }}>{uiMessage}</div>
            </Panel>
          </div>
        ) : null}
        <MainContent
          mainTab={mainTab}
          mobile={mobile}
          metrics={metrics}
          clients={clientsWithProgress}
          appointments={appointments}
          filteredClients={filteredClients}
          selectedClient={selectedClient}
          draftClient={draftClient}
          search={search}
          setSearch={setSearch}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          setSelectedId={setSelectedId}
          saveClient={saveClient}
          saveClientAndOpenTgr={createClientAndOpenTgr}
          removeClient={removeClient}
          finalizeClient={finalizeClient}
          switchClientAnalysis={switchClientAnalysis}
          createNewAnalysis={createNewAnalysis}
          updateClientAnalysisFields={updateClientAnalysisFields}
          saving={saving}
          activeMethod={activeMethod}
          setActiveMethod={setActiveMethod}
          activeSubmethod={activeSubmethod}
          setActiveSubmethod={setActiveSubmethod}
          activeMethodTab={activeMethodTab}
          setActiveMethodTab={setActiveMethodTab}
          activeTgrProtocol={activeTgrProtocol}
          setActiveTgrProtocol={setActiveTgrProtocol}
          relacoesForm={relacoesForm}
          setRelacoesForm={setRelacoesForm}
          protocolSupportForms={protocolSupportForms}
          setProtocolSupportForms={setProtocolSupportForms}
          relacoesContext={relacoesContext}
          protocolDirtyState={protocolDirtyState}
          hasUnsavedProtocolChanges={hasUnsavedProtocolChanges}
          clientDetailOpen={mainTab === "clientes" && Boolean(selectedClient)}
          isCreatingClient={mainTab === "clientes" && selectedId === "__new__"}
          toggleClientProtocol={toggleClientProtocol}
          saveProtocolToClient={saveProtocolToClient}
          setMainTab={setMainTab}
          startNewClient={startNewClient}
          openProtocolForClient={openProtocolForClient}
        />
      </div>
    </Shell>
  );
}

function MainContent(props) {
  const {
    mainTab,
    mobile,
    metrics,
    clients,
    appointments,
    filteredClients,
    selectedClient,
    draftClient,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    setSelectedId,
    saveClient,
    saveClientAndOpenTgr,
    removeClient,
    finalizeClient,
    switchClientAnalysis,
    createNewAnalysis,
    updateClientAnalysisFields,
    saving,
    activeMethod,
    setActiveMethod,
    activeSubmethod,
    setActiveSubmethod,
    activeMethodTab,
    setActiveMethodTab,
    activeTgrProtocol,
    setActiveTgrProtocol,
    relacoesForm,
    setRelacoesForm,
    protocolSupportForms,
    setProtocolSupportForms,
    relacoesContext,
    protocolDirtyState,
    hasUnsavedProtocolChanges,
    toggleClientProtocol,
    saveProtocolToClient,
    clientDetailOpen,
    isCreatingClient,
    setMainTab,
    startNewClient,
    openProtocolForClient,
  } = props;

  if (mainTab === "dashboard") {
    return (
      <DashboardView
        clients={clients}
        appointments={appointments}
        metrics={metrics}
        mobile={mobile}
        onNewClient={startNewClient}
        onOpenClientsList={() => {
          setSelectedId("");
          setRelacoesContext(null);
          setMainTab("clientes");
        }}
        onOpenClient={(id) => {
          setSelectedId(id);
          setMainTab("clientes");
        }}
      />
    );
  }

  if (mainTab === "clientes") {
    return (
        <ClientsView
          clients={filteredClients}
          selectedClient={selectedClient}
          draftClient={draftClient}
          search={search}
          setSearch={setSearch}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          setSelectedId={setSelectedId}
          saveClient={saveClient}
          saveClientAndOpenTgr={saveClientAndOpenTgr}
          removeClient={removeClient}
          finalizeClient={finalizeClient}
          switchClientAnalysis={switchClientAnalysis}
          createNewAnalysis={createNewAnalysis}
          updateClientAnalysisFields={updateClientAnalysisFields}
          saving={saving}
          mobile={mobile}
          clientDetailOpen={clientDetailOpen}
          isCreatingClient={isCreatingClient}
          openProtocolForClient={openProtocolForClient}
          startNewClient={startNewClient}
          openFeedbackForClient={() => setMainTab("devolutivas")}
          onBackToList={() => setSelectedId("")}
        />
    );
  }

  if (mainTab === "atendimentos") {
    return (
      <AppointmentsView
        appointments={appointments}
        clients={clients}
        mobile={mobile}
        onOpenClient={(id) => {
          setSelectedId(id);
          setMainTab("clientes");
        }}
      />
    );
  }

  if (mainTab === "metodos") {
    return (
      <MethodsView
        activeMethod={activeMethod}
        setActiveMethod={setActiveMethod}
        activeSubmethod={activeSubmethod}
        setActiveSubmethod={setActiveSubmethod}
        activeMethodTab={activeMethodTab}
        setActiveMethodTab={setActiveMethodTab}
        activeTgrProtocol={activeTgrProtocol}
        setActiveTgrProtocol={setActiveTgrProtocol}
        relacoesForm={relacoesForm}
        setRelacoesForm={setRelacoesForm}
        protocolSupportForms={protocolSupportForms}
        setProtocolSupportForms={setProtocolSupportForms}
        relacoesContext={relacoesContext}
        protocolDirtyState={protocolDirtyState}
        hasUnsavedProtocolChanges={hasUnsavedProtocolChanges}
        selectedClient={selectedClient}
        toggleClientProtocol={toggleClientProtocol}
        saveProtocolToClient={saveProtocolToClient}
        appointments={appointments}
        mobile={mobile}
      />
    );
  }

  if (mainTab === "devolutivas") return <FeedbacksView clients={clients} mobile={mobile} selectedClient={selectedClient} />;
  return <FinancialView clients={clients} mobile={mobile} />;
}

function Header({ user, onLogout, mobile }) {
  return (
    <header style={{ borderBottom: `1px solid ${THEME.line}`, background: "rgba(251,247,241,0.92)", backdropFilter: "blur(10px)", position: "sticky", top: 0, zIndex: 5 }}>
      <div style={{ maxWidth: 1220, margin: "0 auto", padding: mobile ? "14px 14px" : "18px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: mobile ? 24 : 32, fontWeight: 800, letterSpacing: 0.1 }}>{BRAND.name}</div>
            <div style={{ color: THEME.terracotta, fontSize: 14, fontWeight: 800, letterSpacing: 1.3, textTransform: "uppercase" }}>{BRAND.subtitle}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ color: THEME.muted, fontSize: 14 }}>{user?.email}</span>
            <button type="button" onClick={onLogout} style={secondaryButtonStyle}>Sair</button>
          </div>
        </div>
      </div>
    </header>
  );
}

function TopMetrics({ metrics, mobile }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 12 }}>
      <MetricTile label="Em andamento" value={metrics.active} accent={THEME.green} />
      <MetricTile label="Devolutivas" value={metrics.pendingFeedback} accent={THEME.terracotta} />
      <MetricTile label="Financeiro" value={metrics.pendingPayment} accent={THEME.text} />
      <MetricTile label="Receita" value={formatCurrency(metrics.monthlyRevenue)} accent={THEME.sand} />
    </div>
  );
}

function DashboardView({ clients, appointments, metrics, mobile, onOpenClient, onNewClient, onOpenClientsList }) {
  const pendingClients = clients
    .filter((client) => (getAnalysisRecord(client)?.pendingActions || []).length > 0)
    .slice()
    .sort((a, b) => String(getLatestAnalysis(b)?.dataInicio || "").localeCompare(String(getLatestAnalysis(a)?.dataInicio || "")));
  const allClients = clients
    .slice()
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <section style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr", gap: 18 }}>
        <Panel>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap", marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Mesa de trabalho</div>
              <div style={{ color: THEME.muted }}>Acesso rapido ao que precisa acao hoje.</div>
            </div>
            <button type="button" onClick={onNewClient} style={primaryButtonStyle}>Novo cliente</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "repeat(2, 1fr)", gap: 12 }}>
            <CommandCardButton title="Todos os clientes" text={`${clients.length} prontuarios cadastrados`} onClick={onOpenClientsList} primary disabled={!clients.length} />
            <CommandCardButton title="Pendencias" text={pendingClients.length ? `${pendingClients.length} cliente(s) com acao marcada manualmente` : "Nenhuma pendencia manual marcada"} onClick={() => pendingClients[0] && onOpenClient(pendingClients[0].id)} disabled={!pendingClients.length} />
          </div>
        </Panel>
      </section>

      <section style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: 18 }}>
        <Panel>
          <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 14 }}>Todos os clientes</div>
          <div style={{ display: "grid", gap: 12 }}>
            {allClients.length ? allClients.map((client) => (
              <button key={client.id} type="button" onClick={() => onOpenClient(client.id)} style={{ border: `1px solid ${THEME.line}`, background: "#fffdfa", borderRadius: 18, padding: "14px 16px", textAlign: "left", cursor: "pointer" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 800 }}>{client.nome}</div>
                    <div style={{ color: THEME.muted, fontSize: 13 }}>{formatProtocols(client)} - TGR</div>
                  </div>
                  <StatusBadge status={client.status} />
                </div>
                <div style={{ color: THEME.muted, fontSize: 13, marginTop: 10 }}>{getNextAction(client)}</div>
              </button>
            )) : <div style={{ color: THEME.muted }}>Nenhum cliente cadastrado.</div>}
          </div>
        </Panel>

        <Panel>
          <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 14 }}>Pendencias</div>
          <div style={{ display: "grid", gap: 12 }}>
            {pendingClients.length ? pendingClients.map((client) => (
              <button key={client.id} type="button" onClick={() => onOpenClient(client.id)} style={{ border: `1px solid ${THEME.line}`, background: "#fffdfa", borderRadius: 18, padding: "14px 16px", textAlign: "left", cursor: "pointer" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                  <div style={{ fontWeight: 800 }}>{client.nome}</div>
                  <StatusBadge status={client.status} />
                </div>
                <div style={{ color: THEME.muted, fontSize: 13, marginTop: 6 }}>{formatPendingActions(getAnalysisRecord(client)?.pendingActions || [])}</div>
                <div style={{ color: THEME.muted, fontSize: 12, marginTop: 8 }}>
                  Ultima analise: {getLatestAnalysis(client)?.dataInicio ? formatFullDate(getLatestAnalysis(client).dataInicio) : "Sem data"}
                </div>
              </button>
            )) : <div style={{ color: THEME.muted }}>Nenhuma pendencia marcada manualmente.</div>}
          </div>
        </Panel>
      </section>
    </div>
  );
}

function ClientsView({ clients, selectedClient, draftClient, search, setSearch, statusFilter, setStatusFilter, setSelectedId, saveClient, saveClientAndOpenTgr, removeClient, finalizeClient, switchClientAnalysis, createNewAnalysis, updateClientAnalysisFields, saving, mobile, clientDetailOpen, isCreatingClient, openProtocolForClient, startNewClient, openFeedbackForClient, onBackToList }) {
  const [clientDetailTab, setClientDetailTab] = useState("resumo");

  useEffect(() => {
    if (selectedClient?.id) setClientDetailTab("resumo");
  }, [selectedClient?.id, selectedClient?.currentAnalysisId]);

  if (clientDetailOpen && selectedClient) {
    return (
      <section style={{ display: "grid", gap: 18 }}>
        <ClientHeader
          client={selectedClient}
          onDelete={removeClient}
          onFinalize={finalizeClient}
          onSelectAnalysis={switchClientAnalysis}
          onNewAnalysis={createNewAnalysis}
          onOpenProtocol={(protocol) => openProtocolForClient(selectedClient, protocol)}
          onOpenFeedback={openFeedbackForClient}
          onBack={onBackToList}
        />
        <Panel>
          <div style={{ display: "grid", gap: 12 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>Navegação da cliente</div>
              <div style={{ color: THEME.muted, lineHeight: 1.6 }}>Use estas abas para não se perder no prontuário. O TGR continua na etapa própria do atendimento.</div>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {CLIENT_DETAIL_TABS.map((tab) => (
                <TabButton key={tab.key} active={clientDetailTab === tab.key} onClick={() => setClientDetailTab(tab.key)} label={tab.label} />
              ))}
            </div>
          </div>
        </Panel>
        {clientDetailTab === "resumo" ? (
          <ClientJourney client={selectedClient} mobile={mobile} onSelectAnalysis={switchClientAnalysis} />
        ) : null}
        {clientDetailTab === "ficha" ? (
          <ClientRecord client={selectedClient} onSave={saveClient} mobile={mobile} saving={saving} />
        ) : null}
        {clientDetailTab === "checklist" ? (
          <ClientChecklistPanel
            client={selectedClient}
            onToggleChecklist={(key, checked) =>
              updateClientAnalysisFields(selectedClient.id, {
                checklist: {
                  ...(getAnalysisRecord(selectedClient)?.checklist || emptyAnalysis.checklist),
                  [key]: checked,
                },
              }, "Checklist atualizada.")
            }
            onTogglePendingAction={(action) => {
              const currentActions = getAnalysisRecord(selectedClient)?.pendingActions || [];
              const nextActions = currentActions.includes(action)
                ? currentActions.filter((item) => item !== action)
                : [...currentActions, action];
              return updateClientAnalysisFields(selectedClient.id, { pendingActions: nextActions }, "Pendências atualizadas.");
            }}
          />
        ) : null}
        {clientDetailTab === "devolutiva" ? <FinalFeedback client={selectedClient} /> : null}
      </section>
    );
  }

  if (isCreatingClient) {
    return (
      <section style={{ display: "grid", gap: 18 }}>
        <Panel>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Novo cliente</div>
              <div style={{ color: THEME.muted }}>Preencha a ficha inicial para criar o prontuário.</div>
            </div>
            <button type="button" onClick={onBackToList} style={secondaryButtonStyle}>Voltar para clientes</button>
          </div>
        </Panel>
        <ClientRecord client={draftClient} onSave={saveClient} onSaveAndOpenTgr={saveClientAndOpenTgr} mobile={mobile} saving={saving} />
      </section>
    );
  }

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <Panel>
        <div style={{ display: "grid", gap: 10 }}>
          <div style={{ fontSize: 22, fontWeight: 800 }}>Clientes</div>
          <div style={{ color: THEME.muted, lineHeight: 1.6 }}>Escolha uma cliente para abrir o prontuário em modo focado.</div>
        </div>
        <div style={{ marginTop: 14 }}>
          <button type="button" onClick={startNewClient} style={primaryButtonStyle}>Novo cliente</button>
        </div>
      </Panel>

      <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "340px minmax(0, 1fr)", gap: 18 }}>
        <aside style={{ display: "grid", gap: 14, alignSelf: "start" }}>
        <Panel>
          <div style={{ display: "grid", gap: 10 }}>
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar cliente, queixa ou objetivo" style={inputStyle} />
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {["Todos", ...STATUS_OPTIONS].map((status) => (
                <PillButton key={status} active={statusFilter === status} onClick={() => setStatusFilter(status)} label={status} />
              ))}
            </div>
          </div>
        </Panel>

        <Panel>
          <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>Clientes</div>
          <div style={{ display: "grid", gap: 12 }}>
            {clients.length ? clients.map((client) => (
              <ClientListCard key={client.id} client={client} active={selectedClient?.id === client.id} onClick={() => setSelectedId(client.id)} />
            )) : <div style={{ color: THEME.muted, textAlign: "center", padding: "12px 0" }}>Nenhum cliente encontrado.</div>}
          </div>
        </Panel>
        </aside>

        <section style={{ display: "grid", gap: 18 }}>
          <Panel>
            <div style={{ display: "grid", placeItems: "center", minHeight: 320, textAlign: "center", gap: 10 }}>
              <div style={{ fontSize: 22, fontWeight: 800 }}>Nenhum prontuário aberto</div>
              <div style={{ color: THEME.muted, maxWidth: 420, lineHeight: 1.7 }}>
                Selecione uma cliente na lista para abrir a análise em uma tela focada, sem menus paralelos competindo pela navegação.
              </div>
            </div>
          </Panel>
        </section>
      </div>
    </div>
  );
}

function AppointmentsView({ appointments, clients, mobile, onOpenClient }) {
  return (
    <div style={{ display: "grid", gap: 18 }}>
      <Panel>
        <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 14 }}>Atendimentos</div>
        <div style={{ display: "grid", gap: 12 }}>
          {appointments.map((appointment) => {
            const client = clients.find((item) => item.id === appointment.clientId);
            return (
              <div key={appointment.id} style={{ border: `1px solid ${THEME.line}`, background: "#fffdfa", borderRadius: 20, padding: "16px 18px", display: "grid", gridTemplateColumns: mobile ? "1fr" : "1.2fr 0.8fr auto", gap: 12, alignItems: "center" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                    <div style={{ fontWeight: 800 }}>{appointment.title}</div>
                    <StatusBadge status={appointment.status} />
                  </div>
                  <div style={{ color: THEME.muted, fontSize: 13 }}>{client?.whatsapp || "Contato nao informado"}</div>
                </div>
                <div>
                  <div style={{ ...labelStyle, marginBottom: 4 }}>Metodo / protocolo</div>
                  <div style={{ fontWeight: 700 }}>TGR - {(client?.protocolosUsados || []).join(", ") || findProtocolName(appointment.protocolSlug)}</div>
                </div>
                <button type="button" onClick={() => onOpenClient(appointment.clientId)} style={secondaryButtonStyle}>Abrir cliente</button>
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}

function MethodsView({ activeMethod, setActiveMethod, activeSubmethod, setActiveSubmethod, activeMethodTab, setActiveMethodTab, activeTgrProtocol, setActiveTgrProtocol, relacoesForm, setRelacoesForm, protocolSupportForms, setProtocolSupportForms, relacoesContext, selectedClient, toggleClientProtocol, saveProtocolToClient, appointments, mobile, protocolDirtyState, hasUnsavedProtocolChanges }) {
  const tgrAppointmentCount = appointments.filter((appointment) => appointment.methodSlug === "tgr").length;
  const selectedMethod = METHOD_CATALOG.find((item) => item.slug === activeMethod) || METHOD_CATALOG[0];
  const selectedSubmethod = RADIOESTHESIA_METHODS.find((item) => item.slug === activeSubmethod) || RADIOESTHESIA_METHODS[0];
  const focusedClient = selectedClient || (relacoesContext ? { nome: relacoesContext.clientName } : null);
  const focusMode = Boolean(focusedClient);

  if (focusMode) {
    return (
      <section style={{ display: "grid", gap: 18 }}>
        <Panel>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>TGR</div>
              <div style={{ color: THEME.muted }}>Atendimento em foco de {focusedClient.nome}.</div>
            </div>
            <div style={{ color: THEME.green, fontWeight: 800 }}>{tgrAppointmentCount} atendimentos usando TGR</div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16 }}>
            {METHOD_TABS.map((tab) => (
              <PillButton key={tab.key} active={activeMethodTab === tab.key} onClick={() => setActiveMethodTab(tab.key)} label={tab.label} />
            ))}
          </div>
        </Panel>

        {activeMethodTab === "overview" && <MethodOverview appointments={appointments} mobile={mobile} />}
        {activeMethodTab === "protocolos" && (
          <TgrProtocolsView
            mobile={mobile}
            activeProtocol={activeTgrProtocol}
            setActiveProtocol={setActiveTgrProtocol}
            relacoesForm={relacoesForm}
            setRelacoesForm={setRelacoesForm}
            protocolSupportForms={protocolSupportForms}
            setProtocolSupportForms={setProtocolSupportForms}
            relacoesContext={relacoesContext}
            selectedClient={selectedClient}
            protocolDirtyState={protocolDirtyState}
            hasUnsavedProtocolChanges={hasUnsavedProtocolChanges}
            toggleClientProtocol={toggleClientProtocol}
            saveProtocolToClient={saveProtocolToClient}
          />
        )}
      </section>
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "260px minmax(0, 1fr)", gap: 18 }}>
      <aside style={{ display: "grid", gap: 14, alignSelf: "start" }}>
        <Panel>
          <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>Metodos</div>
          <div style={{ display: "grid", gap: 10 }}>
            {METHOD_CATALOG.map((method) => (
              <button key={method.slug} type="button" onClick={() => setActiveMethod(method.slug)} style={{ border: `1px solid ${activeMethod === method.slug ? THEME.green : THEME.line}`, background: activeMethod === method.slug ? "#f7fbf4" : "#fffdfa", borderRadius: 18, padding: "14px 16px", textAlign: "left", cursor: "pointer" }}>
                <div style={{ fontWeight: 800, marginBottom: 4 }}>{method.nome}</div>
                <div style={{ color: THEME.muted, fontSize: 13 }}>{method.resumo}</div>
              </button>
            ))}
          </div>
        </Panel>

        {activeMethod === "radiestesia" ? (
          <Panel>
            <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>Radiestesia</div>
            <div style={{ display: "grid", gap: 10 }}>
              {RADIOESTHESIA_METHODS.map((method) => (
                <button key={method.slug} type="button" onClick={() => setActiveSubmethod(method.slug)} style={{ border: `1px solid ${activeSubmethod === method.slug ? THEME.green : THEME.line}`, background: activeSubmethod === method.slug ? "#f7fbf4" : "#fffdfa", borderRadius: 18, padding: "14px 16px", textAlign: "left", cursor: "pointer" }}>
                  <div style={{ fontWeight: 800, marginBottom: 4 }}>{method.nome}</div>
                  <div style={{ color: THEME.muted, fontSize: 13 }}>{method.resumo}</div>
                </button>
              ))}
            </div>
          </Panel>
        ) : null}
      </aside>

      <section style={{ display: "grid", gap: 18 }}>
        {activeMethod !== "radiestesia" ? (
          <Panel>
            <div style={{ display: "grid", gap: 8 }}>
              <div style={{ fontSize: 22, fontWeight: 800 }}>{selectedMethod.nome}</div>
              <div style={{ color: THEME.muted, lineHeight: 1.7 }}>Este metodo ja esta reservado na estrutura do prontuario e sera detalhado quando entrarmos no conteudo dele.</div>
            </div>
          </Panel>
        ) : (
          <>
            <Panel>
              <div style={{ display: "grid", gap: 14 }}>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Radiestesia</div>
                  <div style={{ color: THEME.muted }}>TGR, FRT e UNE ficam separados como menus proprios.</div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "repeat(3, 1fr)", gap: 12 }}>
                  {RADIOESTHESIA_METHODS.map((method) => (
                    <button
                      key={method.slug}
                      type="button"
                      onClick={() => setActiveSubmethod(method.slug)}
                      style={{
                        border: `1px solid ${activeSubmethod === method.slug ? THEME.green : THEME.line}`,
                        background: activeSubmethod === method.slug ? "#f7fbf4" : "#fffdfa",
                        borderRadius: 18,
                        padding: "14px 16px",
                        textAlign: "left",
                        cursor: "pointer",
                      }}
                    >
                      <div style={{ fontWeight: 800, marginBottom: 4 }}>{method.nome}</div>
                      <div style={{ color: THEME.muted, fontSize: 13 }}>{method.resumo}</div>
                    </button>
                  ))}
                </div>
              </div>
            </Panel>

            {activeSubmethod !== "tgr" ? (
              <Panel>
                <div style={{ display: "grid", gap: 8 }}>
                  <div style={{ fontSize: 22, fontWeight: 800 }}>{selectedSubmethod.nome}</div>
                  <div style={{ color: THEME.muted, lineHeight: 1.7 }}>Este metodo de Radiestesia ja esta separado no sistema e fica pronto para receber o conteudo proprio quando voce quiser subir.</div>
                </div>
              </Panel>
            ) : (
              <>
            <Panel>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Radiestesia - TGR</div>
                  <div style={{ color: THEME.muted }}>Protocolos e graficos.</div>
                </div>
                <div style={{ color: THEME.green, fontWeight: 800 }}>{tgrAppointmentCount} atendimentos usando TGR</div>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16 }}>
                {METHOD_TABS.map((tab) => (
                  <PillButton key={tab.key} active={activeMethodTab === tab.key} onClick={() => setActiveMethodTab(tab.key)} label={tab.label} />
                ))}
              </div>
            </Panel>

            {activeMethodTab === "overview" && <MethodOverview appointments={appointments} mobile={mobile} />}
            {activeMethodTab === "protocolos" && (
              <TgrProtocolsView
                mobile={mobile}
                activeProtocol={activeTgrProtocol}
                setActiveProtocol={setActiveTgrProtocol}
                relacoesForm={relacoesForm}
                setRelacoesForm={setRelacoesForm}
                protocolSupportForms={protocolSupportForms}
                setProtocolSupportForms={setProtocolSupportForms}
                relacoesContext={relacoesContext}
                selectedClient={selectedClient}
                protocolDirtyState={protocolDirtyState}
                hasUnsavedProtocolChanges={hasUnsavedProtocolChanges}
                toggleClientProtocol={toggleClientProtocol}
                saveProtocolToClient={saveProtocolToClient}
              />
            )}
              </>
            )}
          </>
        )}
      </section>
    </div>
  );
}

function MethodOverview({ appointments, mobile }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "repeat(3, 1fr)", gap: 18 }}>
      <Panel>
        <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 12 }}>Protocolos</div>
        <div style={{ color: THEME.muted, lineHeight: 1.65 }}>Cada protocolo deve ser modelado com objetivo, etapas, leitura inicial, graficos usados e conduta terapeutica.</div>
      </Panel>
      <Panel>
        <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 12 }}>Ferramentas</div>
        <div style={{ color: THEME.muted, lineHeight: 1.65 }}>Os graficos sao escolhidos dentro de cada protocolo, junto do contexto de uso e do tempo ativo no atendimento.</div>
      </Panel>
      <Panel>
        <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 12 }}>Uso atual</div>
        <div style={{ color: THEME.muted, lineHeight: 1.65 }}>{appointments.length} atendimentos estao prontos para consumir o TGR como metodo principal.</div>
      </Panel>
    </div>
  );
}

function TgrProtocolsView({ mobile, activeProtocol, setActiveProtocol, relacoesForm, setRelacoesForm, protocolSupportForms, setProtocolSupportForms, relacoesContext, selectedClient, toggleClientProtocol, saveProtocolToClient, protocolDirtyState, hasUnsavedProtocolChanges }) {
  const validProtocols = getValidProtocols(selectedClient?.protocolosUsados);
  const selectedProtocol = TGR_PROTOCOLS.find((item) => item.slug === activeProtocol && validProtocols.includes(item.nome)) || null;
  const supportForm = selectedProtocol ? (protocolSupportForms[selectedProtocol.slug] || emptyProtocolSupportForm) : emptyProtocolSupportForm;
  const activeProtocolDirty = selectedProtocol ? Boolean(protocolDirtyState?.[selectedProtocol.slug]) : false;
  const selectedProtocolTheme = getProtocolTheme(selectedProtocol?.slug || selectedProtocol?.nome);

  function handleProtocolChoice(protocol) {
    const isActive = validProtocols.includes(protocol.nome);
    if (!isActive && selectedClient) toggleClientProtocol(selectedClient.id, protocol.nome);
    setActiveProtocol(protocol.slug);
  }

  return (
    <div style={{ display: "grid", gap: 18 }}>
      {selectedClient ? (
        <Panel>
          <div style={{ display: "grid", gap: 12 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>Protocolos desta análise</div>
              <div style={{ color: THEME.muted, lineHeight: 1.6 }}>Escolha o protocolo neste bloco principal. Se ele ainda não estiver ativo, entra na análise automaticamente.</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr 1fr", gap: 12 }}>
              {TGR_PROTOCOLS.map((protocol) => {
                const isActive = validProtocols.includes(protocol.nome);
                const isSelected = selectedProtocol?.slug === protocol.slug;
                const protocolTheme = getProtocolTheme(protocol.slug);
                return (
                  <button
                    key={protocol.slug}
                    type="button"
                    onClick={() => handleProtocolChoice(protocol)}
                    style={{
                      border: `1px solid ${isSelected ? protocolTheme.color : isActive ? protocolTheme.soft : THEME.line}`,
                      background: isSelected ? protocolTheme.soft : "#fffdfa",
                      borderRadius: 20,
                      padding: "15px 16px",
                      textAlign: "left",
                      cursor: "pointer",
                      display: "grid",
                      gap: 8,
                      boxShadow: isSelected ? "0 12px 24px rgba(62,49,40,0.08)" : "none",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                      <div style={{ fontWeight: 800, fontSize: 16, color: isSelected ? protocolTheme.color : THEME.text }}>{protocol.nome}</div>
                      <span style={{ fontSize: 11, fontWeight: 800, color: isActive ? protocolTheme.color : THEME.muted }}>
                        {isSelected ? "ABERTO" : isActive ? "ATIVO" : "ADICIONAR"}
                      </span>
                    </div>
                    <div style={{ color: THEME.muted, fontSize: 14, lineHeight: 1.6 }}>{protocol.resumo}</div>
                  </button>
                );
              })}
            </div>
            {validProtocols.length ? (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {validProtocols.map((protocol) => (
                  <PillButton key={protocol} active={selectedProtocol?.nome === protocol} onClick={() => setActiveProtocol(findProtocolSlugByName(protocol))} label={protocol} />
                ))}
              </div>
            ) : null}
            <div style={{ color: THEME.muted, fontSize: 13 }}>
              {selectedProtocol ? <>Protocolo aberto agora: <strong style={{ color: THEME.text }}>{selectedProtocol.nome}</strong></> : "Nenhum protocolo aberto ainda. Escolha um card acima para continuar."}
            </div>
            {hasUnsavedProtocolChanges ? (
              <div style={{ border: `1px solid ${selectedProtocolTheme.color}`, background: selectedProtocolTheme.soft, borderRadius: 18, padding: "12px 14px", color: selectedProtocolTheme.color, display: "grid", gap: 4 }}>
                <div style={{ fontWeight: 800 }}>Há alterações não salvas</div>
                <div style={{ fontSize: 13, lineHeight: 1.6 }}>Salve o protocolo atual antes de trocar de análise ou sair do TGR.</div>
              </div>
            ) : null}
          </div>
        </Panel>
      ) : null}
      {!selectedProtocol ? (
        <Panel>
          <div style={{ display: "grid", gap: 8 }}>
            <div style={{ fontSize: 18, fontWeight: 800 }}>Escolha um protocolo para preencher</div>
            <div style={{ color: THEME.muted, lineHeight: 1.6 }}>
              Selecione entre Relações, Limpeza e Proteção ou Prosperidade para começar a preencher a análise.
            </div>
          </div>
        </Panel>
      ) : selectedProtocol.slug === "relacoes" ? (
        <RelacoesProtocolView mobile={mobile} form={relacoesForm} setForm={setRelacoesForm} context={relacoesContext} currentProtocolName={selectedProtocol.nome} onSave={() => saveProtocolToClient("relacoes", relacoesForm)} isDirty={activeProtocolDirty} />
      ) : (
        <GenericProtocolView
          mobile={mobile}
          protocol={selectedProtocol}
          form={supportForm}
          setForm={(updater) =>
            setProtocolSupportForms((current) => ({
              ...current,
              [selectedProtocol.slug]: typeof updater === "function"
                ? updater(current[selectedProtocol.slug] || emptyProtocolSupportForm)
                : updater,
            }))
          }
          context={relacoesContext}
          currentProtocolName={selectedProtocol.nome}
          onSave={() => saveProtocolToClient(selectedProtocol.slug, supportForm)}
          isDirty={activeProtocolDirty}
        />
      )}
    </div>
  );
}

function RelacoesProtocolView({ mobile, form, setForm, context, currentProtocolName, onSave, isDirty }) {
  const [activeGraphicGroup, setActiveGraphicGroup] = useState(TGR_GRAPHIC_GROUPS[0].slug);
  const [expandedGraphicConfigs, setExpandedGraphicConfigs] = useState({});
  const [activeStage, setActiveStage] = useState("leitura");
  const currentGraphicGroup = TGR_GRAPHIC_GROUPS.find((item) => item.slug === activeGraphicGroup) || TGR_GRAPHIC_GROUPS[0];
  const protocolTheme = getProtocolTheme("relacoes");

  useEffect(() => {
    setActiveStage("leitura");
    setExpandedGraphicConfigs({});
  }, [currentProtocolName]);

  function setField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function toggleGraphic(graphic) {
    setForm((current) => {
      const values = current.graficosSelecionados || [];
      const exists = values.includes(graphic);
      return {
        ...current,
        graficosSelecionados: exists ? values.filter((item) => item !== graphic) : [...values, graphic],
      };
    });
  }

  function setGraphicDuration(graphic, value) {
    setForm((current) => ({
      ...current,
      tempoAtivacaoGraficos: {
        ...(current.tempoAtivacaoGraficos || {}),
        [graphic]: value,
      },
    }));
  }

  function setGraphicContext(graphic, value) {
    setForm((current) => ({
      ...current,
      contextoGraficos: {
        ...(current.contextoGraficos || {}),
        [graphic]: value,
      },
    }));
  }

  function toggleGraphicConfig(graphic) {
    setExpandedGraphicConfigs((current) => ({
      ...current,
      [graphic]: !current[graphic],
    }));
  }

  return (
    <Panel>
      <div style={{ display: "grid", gap: 18 }}>
        <div style={{ border: `1px solid ${protocolTheme.color}`, background: protocolTheme.soft, borderRadius: 20, padding: "16px 18px" }}>
          <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 4, color: protocolTheme.color }}>Relações</div>
          <div style={{ color: THEME.text, lineHeight: 1.65 }}>Preencha este protocolo por etapas. Assim a leitura fica mais clara e você não perde o fio da análise.</div>
        </div>

        {context ? (
          <div style={{ border: `1px solid ${THEME.green}`, background: "#f7fbf4", borderRadius: 18, padding: "14px 16px", display: "grid", gap: 4 }}>
            <div style={{ fontWeight: 800 }}>Atendimento vinculado</div>
            <div style={{ color: THEME.muted }}>{context.clientName}</div>
            <div style={{ color: THEME.muted, fontSize: 13 }}>Protocolo aberto agora: {currentProtocolName || context.protocolName}</div>
          </div>
        ) : null}

        <ProtocolSaveBar
          title="Salvar protocolo"
          text={isDirty ? "Você fez alterações neste protocolo. Salve para registrar no prontuário." : "Use este botão para garantir que o protocolo fique salvo no prontuário da análise."}
          onSave={onSave}
          dirty={isDirty}
        />

        <ProtocolStageTabs activeStage={activeStage} onChange={setActiveStage} />

        {activeStage === "leitura" ? (
          <div style={{ display: "grid", gap: 18 }}>
            <SectionTitle title="Cabeçalho da leitura" />
            <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: 12 }}>
              <Field label="Tipo de relação">
                <select value={form.tipoRelacao} onChange={(event) => setField("tipoRelacao", event.target.value)} style={inputStyle}>
                  {RELATION_TYPES.map((item) => <option key={item}>{item}</option>)}
                </select>
              </Field>
              <Field label="Pessoa vinculada">
                <input value={form.pessoaVinculada} onChange={(event) => setField("pessoaVinculada", event.target.value)} style={inputStyle} />
              </Field>
              <Field label="Objetivo da leitura">
                <textarea value={form.objetivoLeitura} onChange={(event) => setField("objetivoLeitura", event.target.value)} style={inputStyle} />
              </Field>
              <Field label="Observação inicial">
                <textarea value={form.observacaoInicial} onChange={(event) => setField("observacaoInicial", event.target.value)} style={inputStyle} />
              </Field>
            </div>

            <SectionTitle title="Leitura principal" />
            <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: 12 }}>
              <Field label="Campo mental">
                <textarea value={form.campoMentalResultado} onChange={(event) => setField("campoMentalResultado", event.target.value)} style={inputStyle} />
              </Field>
              <Field label="Campo emocional">
                <textarea value={form.campoEmocionalResultado} onChange={(event) => setField("campoEmocionalResultado", event.target.value)} style={inputStyle} />
              </Field>
              <Field label="Tipo de vínculo">
                <textarea value={form.tipoVinculoResultado} onChange={(event) => setField("tipoVinculoResultado", event.target.value)} style={inputStyle} />
              </Field>
              <Field label="Interferências identificadas">
                <textarea value={form.interferenciasIdentificadas} onChange={(event) => setField("interferenciasIdentificadas", event.target.value)} style={inputStyle} />
              </Field>
              <Field label="Padrão relacional">
                <textarea value={form.padraoRelacional} onChange={(event) => setField("padraoRelacional", event.target.value)} style={inputStyle} />
              </Field>
              <Field label="Nível de harmonia relacional">
                <textarea value={form.nivelHarmoniaRelacional} onChange={(event) => setField("nivelHarmoniaRelacional", event.target.value)} style={inputStyle} />
              </Field>
            </div>
          </div>
        ) : null}

        {activeStage === "graficos" ? (
          <div style={{ display: "grid", gap: 16 }}>
            <SectionTitle title="Gráficos usados" />
            <div style={{ display: "grid", gap: 14 }}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {TGR_GRAPHIC_GROUPS.map((group) => (
                  <PillButton key={group.slug} active={currentGraphicGroup.slug === group.slug} onClick={() => setActiveGraphicGroup(group.slug)} label={group.nome} />
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: 10 }}>
                {currentGraphicGroup.graficos.map((graphic) => (
                  <button
                    key={graphic}
                    type="button"
                    onClick={() => toggleGraphic(graphic)}
                    style={{
                      border: `1px solid ${(form.graficosSelecionados || []).includes(graphic) ? THEME.green : THEME.line}`,
                      background: (form.graficosSelecionados || []).includes(graphic) ? "#f7fbf4" : "#fffdfa",
                      borderRadius: 16,
                      padding: "12px 14px",
                      textAlign: "left",
                      cursor: "pointer",
                      fontWeight: 700,
                      color: (form.graficosSelecionados || []).includes(graphic) ? THEME.green : THEME.text,
                    }}
                  >
                    {graphic}
                  </button>
                ))}
              </div>
            </div>
            {(form.graficosSelecionados || []).length ? (
              <div style={{ display: "grid", gap: 10 }}>
                <div style={{ ...labelStyle, marginBottom: 0 }}>Configuração dos gráficos selecionados</div>
                {(form.graficosSelecionados || []).map((graphic) => (
                  <div key={graphic} style={{ border: `1px solid ${THEME.line}`, borderRadius: 16, padding: "12px 14px", background: "#fffdfa", display: "grid", gap: 10 }}>
                    <button type="button" onClick={() => toggleGraphicConfig(graphic)} style={{ border: "none", background: "transparent", padding: 0, display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", fontWeight: 700, color: THEME.text }}>
                      <span>{graphic}</span>
                      <span style={{ color: THEME.muted, fontSize: 13 }}>{expandedGraphicConfigs[graphic] ? "Ocultar" : "Configurar"}</span>
                    </button>
                    {expandedGraphicConfigs[graphic] ? (
                      <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 220px", gap: 10, alignItems: "center" }}>
                        <select value={form.contextoGraficos?.[graphic] || "Relacoes"} onChange={(event) => setGraphicContext(graphic, event.target.value)} style={inputStyle}>
                          {GRAPHIC_CONTEXT_OPTIONS.map((option) => <option key={option}>{option}</option>)}
                        </select>
                        <input
                          value={form.tempoAtivacaoGraficos?.[graphic] || ""}
                          onChange={(event) => setGraphicDuration(graphic, event.target.value)}
                          style={inputStyle}
                          placeholder="Ex.: 7 dias, contínuo"
                        />
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : null}
            <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: 12 }}>
              <Field label="Leitura dos gráficos">
                <textarea value={form.leituraGraficos} onChange={(event) => setField("leituraGraficos", event.target.value)} style={inputStyle} />
              </Field>
              <Field label="Síntese dos gráficos">
                <textarea value={form.sinteseGraficos} onChange={(event) => setField("sinteseGraficos", event.target.value)} style={inputStyle} />
              </Field>
            </div>
          </div>
        ) : null}

        {activeStage === "sintese" ? (
          <div style={{ display: "grid", gap: 16 }}>
            <SectionTitle title="Síntese e conduta" />
            <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: 12 }}>
              <Field label="Intervenção indicada">
                <textarea value={form.intervencaoIndicada} onChange={(event) => setField("intervencaoIndicada", event.target.value)} style={inputStyle} />
              </Field>
              <Field label="Orientação terapêutica">
                <textarea value={form.orientacaoTerapeutica} onChange={(event) => setField("orientacaoTerapeutica", event.target.value)} style={inputStyle} />
              </Field>
              <Field label="Foco dos próximos dias">
                <textarea value={form.focoProximosDias} onChange={(event) => setField("focoProximosDias", event.target.value)} style={inputStyle} />
              </Field>
              <Field label="Conclusão analítica">
                <textarea value={form.conclusaoAnalitica} onChange={(event) => setField("conclusaoAnalitica", event.target.value)} style={inputStyle} />
              </Field>
              <Field label="Observações finais">
                <textarea value={form.observacoesFinais} onChange={(event) => setField("observacoesFinais", event.target.value)} style={inputStyle} />
              </Field>
            </div>
          </div>
        ) : null}

        <ProtocolSaveBar
          title="Concluir este protocolo"
          text={isDirty ? "Ainda há alterações pendentes. Salve antes de sair ou trocar de protocolo." : "Protocolo pronto. Se fizer novos ajustes, salve novamente."}
          onSave={onSave}
          dirty={isDirty}
        />
      </div>
    </Panel>
  );
}

function GenericProtocolView({ mobile, protocol, form, setForm, context, currentProtocolName, onSave, isDirty }) {
  const defaultGraphicConfig = PROTOCOL_GRAPHIC_DEFAULTS[protocol.slug] || { group: TGR_GRAPHIC_GROUPS[0].slug, context: protocol.nome };
  const [activeGraphicGroup, setActiveGraphicGroup] = useState(defaultGraphicConfig.group);
  const [expandedGraphicConfigs, setExpandedGraphicConfigs] = useState({});
  const [activeStage, setActiveStage] = useState("leitura");
  const currentGraphicGroup = TGR_GRAPHIC_GROUPS.find((item) => item.slug === activeGraphicGroup) || TGR_GRAPHIC_GROUPS[0];
  const protocolTheme = getProtocolTheme(protocol.slug);

  useEffect(() => {
    setActiveGraphicGroup(defaultGraphicConfig.group);
    setExpandedGraphicConfigs({});
    setActiveStage("leitura");
  }, [protocol.slug, defaultGraphicConfig.group]);

  function setField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function toggleGraphic(graphic) {
    setForm((current) => {
      const values = current.graficosSelecionados || [];
      const exists = values.includes(graphic);
      return {
        ...current,
        graficosSelecionados: exists ? values.filter((item) => item !== graphic) : [...values, graphic],
      };
    });
  }

  function setGraphicDuration(graphic, value) {
    setForm((current) => ({
      ...current,
      tempoAtivacaoGraficos: {
        ...(current.tempoAtivacaoGraficos || {}),
        [graphic]: value,
      },
    }));
  }

  function setGraphicContext(graphic, value) {
    setForm((current) => ({
      ...current,
      contextoGraficos: {
        ...(current.contextoGraficos || {}),
        [graphic]: value,
      },
    }));
  }

  function toggleGraphicConfig(graphic) {
    setExpandedGraphicConfigs((current) => ({
      ...current,
      [graphic]: !current[graphic],
    }));
  }

  return (
    <Panel>
      <div style={{ display: "grid", gap: 18 }}>
        <div style={{ border: `1px solid ${protocolTheme.color}`, background: protocolTheme.soft, borderRadius: 20, padding: "16px 18px" }}>
          <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 4, color: protocolTheme.color }}>{protocol.nome}</div>
          <div style={{ color: THEME.text, lineHeight: 1.65 }}>{protocol.resumo}</div>
        </div>

        {context ? (
          <div style={{ border: `1px solid ${THEME.green}`, background: "#f7fbf4", borderRadius: 18, padding: "14px 16px", display: "grid", gap: 4 }}>
            <div style={{ fontWeight: 800 }}>Atendimento vinculado</div>
            <div style={{ color: THEME.muted }}>{context.clientName}</div>
            <div style={{ color: THEME.muted, fontSize: 13 }}>Protocolo aberto agora: {currentProtocolName || context.protocolName}</div>
          </div>
        ) : null}

        <ProtocolSaveBar
          title="Salvar protocolo"
          text={isDirty ? "Você fez alterações neste protocolo. Salve para registrar no prontuário." : "Use este botão para garantir que o protocolo fique salvo no prontuário da análise."}
          onSave={onSave}
          dirty={isDirty}
        />

        <ProtocolStageTabs activeStage={activeStage} onChange={setActiveStage} />

        {activeStage === "leitura" ? (
          <div style={{ display: "grid", gap: 18 }}>
            <SectionTitle title="Cabeçalho da leitura" />
            <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: 12 }}>
              <Field label="Objetivo da leitura">
                <textarea value={form.objetivoLeitura} onChange={(event) => setField("objetivoLeitura", event.target.value)} style={inputStyle} />
              </Field>
              <Field label="Observação inicial">
                <textarea value={form.observacaoInicial} onChange={(event) => setField("observacaoInicial", event.target.value)} style={inputStyle} />
              </Field>
            </div>

            <SectionTitle title="Leitura principal" />
            <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: 12 }}>
              <Field label="Leitura principal">
                <textarea value={form.leituraPrincipal} onChange={(event) => setField("leituraPrincipal", event.target.value)} style={inputStyle} />
              </Field>
              <Field label="Pontos observados">
                <textarea value={form.pontosObservados} onChange={(event) => setField("pontosObservados", event.target.value)} style={inputStyle} />
              </Field>
            </div>
          </div>
        ) : null}

        {activeStage === "graficos" ? (
          <div style={{ display: "grid", gap: 16 }}>
            <SectionTitle title="Gráficos usados" />
            <div style={{ display: "grid", gap: 14 }}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {TGR_GRAPHIC_GROUPS.map((group) => (
                  <PillButton key={group.slug} active={currentGraphicGroup.slug === group.slug} onClick={() => setActiveGraphicGroup(group.slug)} label={group.nome} />
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: 10 }}>
                {currentGraphicGroup.graficos.map((graphic) => (
                  <button
                    key={graphic}
                    type="button"
                    onClick={() => toggleGraphic(graphic)}
                    style={{
                      border: `1px solid ${(form.graficosSelecionados || []).includes(graphic) ? THEME.green : THEME.line}`,
                      background: (form.graficosSelecionados || []).includes(graphic) ? "#f7fbf4" : "#fffdfa",
                      borderRadius: 16,
                      padding: "12px 14px",
                      textAlign: "left",
                      cursor: "pointer",
                      fontWeight: 700,
                      color: (form.graficosSelecionados || []).includes(graphic) ? THEME.green : THEME.text,
                    }}
                  >
                    {graphic}
                  </button>
                ))}
              </div>
            </div>

            {(form.graficosSelecionados || []).length ? (
              <div style={{ display: "grid", gap: 10 }}>
                <div style={{ ...labelStyle, marginBottom: 0 }}>Configuração dos gráficos selecionados</div>
                {(form.graficosSelecionados || []).map((graphic) => (
                  <div key={graphic} style={{ border: `1px solid ${THEME.line}`, borderRadius: 16, padding: "12px 14px", background: "#fffdfa", display: "grid", gap: 10 }}>
                    <button type="button" onClick={() => toggleGraphicConfig(graphic)} style={{ border: "none", background: "transparent", padding: 0, display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", fontWeight: 700, color: THEME.text }}>
                      <span>{graphic}</span>
                      <span style={{ color: THEME.muted, fontSize: 13 }}>{expandedGraphicConfigs[graphic] ? "Ocultar" : "Configurar"}</span>
                    </button>
                    {expandedGraphicConfigs[graphic] ? (
                      <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 220px", gap: 10, alignItems: "center" }}>
                        <select value={form.contextoGraficos?.[graphic] || defaultGraphicConfig.context} onChange={(event) => setGraphicContext(graphic, event.target.value)} style={inputStyle}>
                          {[defaultGraphicConfig.context, ...GRAPHIC_CONTEXT_OPTIONS.filter((option) => option !== defaultGraphicConfig.context)].map((option) => <option key={option}>{option}</option>)}
                        </select>
                        <input
                          value={form.tempoAtivacaoGraficos?.[graphic] || ""}
                          onChange={(event) => setGraphicDuration(graphic, event.target.value)}
                          style={inputStyle}
                          placeholder="Ex.: 7 dias, contínuo"
                        />
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : null}

            <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: 12 }}>
              <Field label="Leitura dos gráficos">
                <textarea value={form.leituraGraficos} onChange={(event) => setField("leituraGraficos", event.target.value)} style={inputStyle} />
              </Field>
              <Field label="Síntese dos gráficos">
                <textarea value={form.sinteseGraficos} onChange={(event) => setField("sinteseGraficos", event.target.value)} style={inputStyle} />
              </Field>
            </div>
          </div>
        ) : null}

        {activeStage === "sintese" ? (
          <div style={{ display: "grid", gap: 16 }}>
            <SectionTitle title="Síntese e conduta" />
            <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: 12 }}>
              <Field label="Intervenção indicada">
                <textarea value={form.intervencaoIndicada} onChange={(event) => setField("intervencaoIndicada", event.target.value)} style={inputStyle} />
              </Field>
              <Field label="Orientação terapêutica">
                <textarea value={form.orientacaoTerapeutica} onChange={(event) => setField("orientacaoTerapeutica", event.target.value)} style={inputStyle} />
              </Field>
              <Field label="Foco dos próximos dias">
                <textarea value={form.focoProximosDias} onChange={(event) => setField("focoProximosDias", event.target.value)} style={inputStyle} />
              </Field>
              <Field label="Conclusão analítica">
                <textarea value={form.conclusaoAnalitica} onChange={(event) => setField("conclusaoAnalitica", event.target.value)} style={inputStyle} />
              </Field>
              <Field label="Observações finais">
                <textarea value={form.observacoesFinais} onChange={(event) => setField("observacoesFinais", event.target.value)} style={inputStyle} />
              </Field>
            </div>
          </div>
        ) : null}

        <ProtocolSaveBar
          title="Concluir este protocolo"
          text={isDirty ? "Ainda há alterações pendentes. Salve antes de sair ou trocar de protocolo." : "Protocolo pronto. Se fizer novos ajustes, salve novamente."}
          onSave={onSave}
          dirty={isDirty}
        />
      </div>
    </Panel>
  );
}

function MethodCatalog({ title, items, mobile, activeSlug, onSelect }) {
  return (
    <Panel>
      <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 14 }}>{title}</div>
      <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: 12 }}>
        {items.map((item) => (
          <button
            key={item.slug || item.nome}
            type="button"
            onClick={onSelect ? () => onSelect(item.slug) : undefined}
            style={{
              border: `1px solid ${activeSlug === item.slug ? THEME.green : THEME.line}`,
              background: activeSlug === item.slug ? "#f7fbf4" : "#fffdfa",
              borderRadius: 18,
              padding: "14px 16px",
              textAlign: "left",
              cursor: onSelect ? "pointer" : "default",
            }}
          >
            <div style={{ fontWeight: 800, marginBottom: title === "Protocolos TGR" ? 0 : 6 }}>{item.nome}</div>
            {title !== "Protocolos TGR" ? <div style={{ color: THEME.muted, lineHeight: 1.6 }}>{item.resumo || item.tema || item.tipo || `${(item.graficos || []).length} opcoes`}</div> : null}
          </button>
        ))}
      </div>
    </Panel>
  );
}

function FeedbacksView({ clients, mobile, selectedClient }) {
  if (selectedClient) {
    return (
      <div style={{ display: "grid", gap: 18 }}>
        <Panel>
          <div style={{ display: "grid", gap: 8 }}>
            <div style={{ fontSize: 22, fontWeight: 800 }}>Devolutiva da cliente</div>
            <div style={{ color: THEME.muted }}>Modo focado para {selectedClient.nome}.</div>
          </div>
        </Panel>
        <FinalFeedback client={selectedClient} />
      </div>
    );
  }

  const pending = clients.filter((client) => client.status === "Aguardando devolutiva");
  const completed = clients.filter((client) => client.status === "Concluido");

  return (
    <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: 18 }}>
      <Panel>
        <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 14 }}>Pendentes</div>
        <div style={{ display: "grid", gap: 12 }}>
          {pending.length ? pending.map((client) => <FeedbackCard key={client.id} client={client} />) : <div style={{ color: THEME.muted }}>Nenhuma devolutiva pendente.</div>}
        </div>
      </Panel>
      <Panel>
        <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 14 }}>Concluidas</div>
        <div style={{ display: "grid", gap: 12 }}>
          {completed.length ? completed.map((client) => <FeedbackCard key={client.id} client={client} />) : <div style={{ color: THEME.muted }}>Nenhuma devolutiva concluida.</div>}
        </div>
      </Panel>
    </div>
  );
}

function FinancialView({ clients, mobile }) {
  const paid = clients.filter((client) => client.statusPagamento === "Pago");
  const pending = clients.filter((client) => client.statusPagamento !== "Pago");
  const paidTotal = paid.reduce((sum, client) => sum + Number(client.valor || 0), 0);
  const pendingTotal = pending.reduce((sum, client) => sum + Number(client.valor || 0), 0);

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 12 }}>
        <MetricTile label="Recebido" value={formatCurrency(paidTotal)} accent={THEME.green} />
        <MetricTile label="A receber" value={formatCurrency(pendingTotal)} accent={THEME.terracotta} />
        <MetricTile label="Pagos" value={paid.length} accent={THEME.text} />
        <MetricTile label="Pendentes" value={pending.length} accent={THEME.sand} />
      </div>

      <Panel>
        <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 14 }}>Financeiro por atendimento</div>
        <div style={{ display: "grid", gap: 12 }}>
          {clients.map((client) => (
            <div key={client.id} style={{ border: `1px solid ${THEME.line}`, background: "#fffdfa", borderRadius: 18, padding: "14px 16px", display: "grid", gridTemplateColumns: mobile ? "1fr" : "1.2fr .8fr auto", gap: 12, alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 800 }}>{client.nome}</div>
                <div style={{ color: THEME.muted, fontSize: 13 }}>{formatProtocols(client)} - TGR</div>
              </div>
              <div style={{ fontWeight: 700 }}>{formatCurrency(client.valor)}</div>
              <StatusBadge status={client.statusPagamento === "Pago" ? "Concluido" : "Aguardando inicio"} />
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function ClientHeader({ client, onDelete, onFinalize, onSelectAnalysis, onNewAnalysis, onOpenProtocol, onOpenFeedback, onBack }) {
  const currentAnalysis = getAnalysisRecord(client);
  const validProtocols = getValidProtocols(currentAnalysis.protocolosUsados);
  const attendanceDateOptions = buildAttendanceDateOptions(client);
  const activeGraphics = getActiveGraphicsFromAnalysis(currentAnalysis);
  const latestAnalysis = getLatestAnalysis(client);
  const nextAction = getNextAction(client);

  return (
    <Panel>
      <div style={{ display: "grid", gap: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
          <div>
            {onBack ? <button type="button" onClick={onBack} style={{ ...secondaryButtonStyle, marginBottom: 12 }}>Voltar para clientes</button> : null}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginBottom: 10 }}>
              <div style={{ fontSize: 24, fontWeight: 800 }}>{client.nome}</div>
              <StatusBadge status={client.status} />
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, color: THEME.muted, fontSize: 14 }}>
              <span>{client.whatsapp || "Contato nao informado"}</span>
              <span>{client.email || "Sem email"}</span>
              <span>TGR - {formatProtocols(client)}</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button type="button" onClick={() => onNewAnalysis(client.id)} style={secondaryButtonStyle}>Nova analise</button>
            <button type="button" onClick={() => onFinalize(client.id)} disabled={client.status === "Concluido"} style={{ ...secondaryButtonStyle, opacity: client.status === "Concluido" ? 0.65 : 1, cursor: client.status === "Concluido" ? "default" : "pointer" }}>
              Finalizar analise
            </button>
            <details style={{ position: "relative" }}>
              <summary style={{ ...secondaryButtonStyle, listStyle: "none", cursor: "pointer" }}>Mais acoes</summary>
              <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", minWidth: 180, zIndex: 4, border: `1px solid ${THEME.line}`, background: "#fffdfa", borderRadius: 16, padding: 10, boxShadow: THEME.shadow, display: "grid", gap: 8 }}>
                <button type="button" onClick={() => onDelete(client.id)} style={{ ...secondaryButtonStyle, color: "#8a4f38", background: "#fff7f4", width: "100%" }}>Remover cliente</button>
              </div>
            </details>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
          <InfoCard label="Protocolos ativos" value={validProtocols.length ? validProtocols.join(", ") : "Nenhum protocolo"} />
          <InfoCard label="Status" value={client.status} />
          <InfoCard label="Graficos ativos" value={activeGraphics.length ? `${activeGraphics.length} em uso` : "Nenhum grafico"} />
          <InfoCard label="Última análise" value={latestAnalysis?.dataInicio ? formatFullDate(latestAnalysis.dataInicio) : "Sem data"} />
          <InfoCard label="Próxima ação" value={nextAction} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
          <CommandCardButton title="Abrir TGR" text="Entrar no protocolo da analise atual." onClick={() => onOpenProtocol(validProtocols[0] || "")} primary />
          <CommandCardButton title="Nova analise" text="Criar uma nova data sem perder o historico." onClick={() => onNewAnalysis(client.id)} />
          <CommandCardButton title="Finalizar analise" text="Encerrar a analise atual quando concluir a etapa." onClick={() => onFinalize(client.id)} disabled={client.status === "Concluido"} />
          <CommandCardButton title="Ver devolutiva" text="Abrir a devolutiva guiada desta cliente." onClick={onOpenFeedback} />
        </div>

        <div style={{ display: "grid", gap: 8 }}>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(220px, 280px) 1fr", gap: 12, alignItems: "end" }}>
            <Field label="Atendimentos por data">
              <select value={client.currentAnalysisId || attendanceDateOptions[0]?.value || ""} onChange={(event) => onSelectAnalysis(client.id, event.target.value)} style={inputStyle}>
                {attendanceDateOptions.map((item) => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>
            </Field>
            <div style={{ color: THEME.muted, fontSize: 13, lineHeight: 1.5 }}>
              Use esta lista para localizar a analise pela data. Quando o prontuario tiver mais atendimentos, eles aparecerao aqui.
            </div>
          </div>
          <div style={{ ...labelStyle, marginBottom: 0 }}>Protocolos da analise</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {validProtocols.length ? validProtocols.map((protocol) => (
              <PillButton key={protocol} active onClick={() => onOpenProtocol(protocol)} label={protocol} />
            )) : <span style={{ color: THEME.muted, fontSize: 14 }}>Nenhum protocolo selecionado ainda.</span>}
          </div>
          {activeGraphics.length ? (
            <>
              <div style={{ ...labelStyle, marginBottom: 0 }}>Graficos ativos nesta analise</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {activeGraphics.map((item) => (
                  <span key={`${item.protocol}-${item.nome}`} style={{ border: `1px solid ${THEME.line}`, borderRadius: 999, padding: "8px 12px", background: "#fffdfa", fontSize: 12, fontWeight: 700, color: THEME.text }}>
                    {item.nome} · {item.protocol}
                  </span>
                ))}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </Panel>
  );
}

function ClientJourney({ client, mobile, onSelectAnalysis }) {
  const currentAnalysis = getAnalysisRecord(client);
  const validProtocols = getValidProtocols(currentAnalysis.protocolosUsados);
  const activeGraphics = getActiveGraphicsFromAnalysis(currentAnalysis);
  const attendanceHistory = buildAnalysisHistoryCards(client);

  return (
    <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1.1fr 0.9fr", gap: 18 }}>
      <Panel>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap", marginBottom: 14 }}>
          <div style={{ fontSize: 18, fontWeight: 800 }}>Resumo da análise</div>
          <div style={{ color: THEME.terracotta, fontWeight: 800 }}>{client.diasAtendimento} dias desde o inicio</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "repeat(4, 1fr)", gap: 12, marginTop: 16 }}>
          <InfoCard label="Metodo" value="TGR" />
          <InfoCard label="Protocolos" value={validProtocols.length ? validProtocols.join(", ") : "Nenhum protocolo"} />
          <InfoCard label="Inicio" value={formatDate(client.dataInicio)} />
          <InfoCard label="Pagamento" value={client.statusPagamento} />
          <InfoCard label="Status" value={client.status} />
          <InfoCard label="Graficos ativos" value={activeGraphics.length ? String(activeGraphics.length) : "0"} />
          <InfoCard label="Queixa" value={client.queixaPrincipal || "Nao registrada"} />
          <InfoCard label="Objetivo" value={client.objetivo || "Nao registrado"} />
        </div>
        {activeGraphics.length ? (
          <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
            <div style={{ ...labelStyle, marginBottom: 0 }}>Graficos ativos por protocolo</div>
            {activeGraphics.map((item) => (
              <div key={`${item.protocol}-${item.nome}-${item.contexto}-${item.tempo}`} style={{ border: `1px solid ${THEME.line}`, borderRadius: 16, padding: "12px 14px", background: "#fffdfa", display: "grid", gridTemplateColumns: mobile ? "1fr" : "1.1fr .9fr .8fr", gap: 10 }}>
                <div><strong>{item.nome}</strong> <span style={{ color: THEME.muted }}>· {item.protocol}</span></div>
                <div style={{ color: THEME.muted }}>{item.contexto || "Sem contexto"}</div>
                <div style={{ color: THEME.muted }}>{item.tempo || "Sem tempo"}</div>
              </div>
            ))}
          </div>
        ) : null}
      </Panel>

      <Panel>
        <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 14 }}>Histórico por data</div>
        <div style={{ display: "grid", gap: 10 }}>
          {attendanceHistory.map((item) => (
            <button key={item.id} type="button" onClick={() => onSelectAnalysis(client.id, item.id)} style={{ border: `1px solid ${item.isCurrent ? THEME.green : THEME.line}`, background: item.isCurrent ? "#f7fbf4" : "#fffdfa", borderRadius: 16, padding: "12px 14px", textAlign: "left", cursor: "pointer", display: "grid", gap: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ fontWeight: 800 }}>{item.dateLabel}</div>
                <StatusBadge status={item.status} />
              </div>
              <div style={{ color: THEME.muted, fontSize: 13 }}>{item.protocolLabel}</div>
              <div style={{ color: THEME.muted, fontSize: 12 }}>
                {item.graphicsCount ? `${item.graphicsCount} graficos ativos` : "Sem graficos registrados"}
              </div>
            </button>
          ))}
        </div>
        <div style={{ color: THEME.muted, fontSize: 13, lineHeight: 1.6, marginTop: 14 }}>
          Cada data representa uma analise diferente dentro do prontuario desta cliente.
        </div>
      </Panel>
    </div>
  );
}

function ClientChecklistPanel({ client, onToggleChecklist, onTogglePendingAction }) {
  const analysis = getAnalysisRecord(client);
  const checklist = analysis?.checklist || emptyAnalysis.checklist;
  const pendingActions = analysis?.pendingActions || [];

  return (
    <Panel>
      <div style={{ display: "grid", gap: 18 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>Checklist do atendimento</div>
          <div style={{ color: THEME.muted, lineHeight: 1.6 }}>Marque o que já foi feito nesta análise e selecione apenas as pendências que você quer ver no dashboard.</div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
          {CHECKLIST_OPTIONS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => onToggleChecklist(item.key, !Boolean(checklist[item.key]))}
              style={{
                border: `1px solid ${checklist[item.key] ? THEME.green : THEME.line}`,
                borderRadius: 16,
                padding: "13px 14px",
                background: checklist[item.key] ? "#f7fbf4" : "#fffdfa",
                display: "flex",
                gap: 10,
                alignItems: "center",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 6,
                  border: `1px solid ${checklist[item.key] ? THEME.green : THEME.line}`,
                  background: checklist[item.key] ? THEME.greenSoft : "#fff",
                  display: "inline-grid",
                  placeItems: "center",
                  color: THEME.green,
                  fontSize: 12,
                  fontWeight: 800,
                  flexShrink: 0,
                }}
              >
                {checklist[item.key] ? "✓" : ""}
              </span>
              <span style={{ fontWeight: 700 }}>{item.label}</span>
            </button>
          ))}
        </div>

        <div style={{ display: "grid", gap: 10 }}>
          <div style={{ ...labelStyle, marginBottom: 0 }}>Pendências visíveis no dashboard</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {PENDING_ACTION_OPTIONS.map((action) => (
              <PillButton key={action} active={pendingActions.includes(action)} onClick={() => onTogglePendingAction(action)} label={action} />
            ))}
          </div>
          <div style={{ color: THEME.muted, fontSize: 13 }}>
            {pendingActions.length ? `Pendências marcadas: ${pendingActions.join(", ")}` : "Nenhuma pendência marcada para aparecer no dashboard."}
          </div>
        </div>
      </div>
    </Panel>
  );
}

function ClientRecord({ client, onSave, onSaveAndOpenTgr, mobile, saving = false }) {
  const [form, setForm] = useState(client);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    setForm(client);
    setFormError("");
  }, [client]);

  function setField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function setNestedField(section, key, value) {
    setForm((current) => ({
      ...current,
      [section]: {
        ...(current[section] || {}),
        [key]: value,
      },
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!form.nome.trim()) return setFormError("Informe o nome da cliente para salvar o atendimento.");
    if (!form.whatsapp.trim()) return setFormError("Informe o WhatsApp principal para manter o contato organizado.");
    if (!form.dataInicio) return setFormError("Defina a data de inicio para acompanhar a duracao do atendimento.");
    setFormError("");
    onSave({ ...form, id: form.id || generateId() });
  }

  function handleSaveAndOpenTgr() {
    if (!form.nome.trim()) return setFormError("Informe o nome da cliente para salvar o atendimento.");
    if (!form.whatsapp.trim()) return setFormError("Informe o WhatsApp principal para manter o contato organizado.");
    if (!form.dataInicio) return setFormError("Defina a data de inicio para acompanhar a duracao do atendimento.");
    setFormError("");
    onSaveAndOpenTgr?.({ ...form, id: form.id || generateId() });
  }

  function applyGeneratedField(field, generator) {
    const generated = generator(form);
    setField(field, appendGeneratedText(form[field], generated));
  }

  return (
    <Panel>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ fontSize: 18, fontWeight: 800 }}>Ficha do atendimento</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {onSaveAndOpenTgr ? (
              <button type="button" onClick={handleSaveAndOpenTgr} disabled={saving} style={{ ...secondaryButtonStyle, opacity: saving ? 0.7 : 1, cursor: saving ? "wait" : "pointer" }}>
                {saving ? "Salvando..." : "Salvar e abrir TGR"}
              </button>
            ) : null}
            <button type="submit" disabled={saving} style={{ ...primaryButtonStyle, opacity: saving ? 0.7 : 1, cursor: saving ? "wait" : "pointer" }}>{saving ? "Salvando..." : "Salvar"}</button>
          </div>
        </div>
        {formError ? <div style={{ border: `1px solid ${THEME.terracotta}`, background: "#fff5f1", borderRadius: 16, padding: "12px 14px", color: "#8a4f38", fontWeight: 700 }}>{formError}</div> : null}
        <SectionTitle title="Cliente e metodo" />
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: 12 }}>
          <Field label="Nome"><input value={form.nome} onChange={(event) => setField("nome", event.target.value)} style={inputStyle} /></Field>
          <Field label="WhatsApp"><input value={form.whatsapp} onChange={(event) => setField("whatsapp", event.target.value)} style={inputStyle} /></Field>
          <Field label="Email"><input value={form.email} onChange={(event) => setField("email", event.target.value)} style={inputStyle} /></Field>
          <Field label="Data de inicio"><input type="date" value={form.dataInicio} onChange={(event) => setField("dataInicio", event.target.value)} style={inputStyle} /></Field>
          <Field label="Metodo"><input value="TGR" readOnly style={{ ...inputStyle, background: "#f4efe8" }} /></Field>
          <Field label="Protocolos usados">
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {PROTOCOL_OPTIONS.map((item) => (
                <PillButton
                  key={item}
                  active={(form.protocolosUsados || []).includes(item)}
                  onClick={() =>
                    setField(
                      "protocolosUsados",
                      (form.protocolosUsados || []).includes(item)
                        ? form.protocolosUsados.filter((protocol) => protocol !== item)
                        : [...(form.protocolosUsados || []), item]
                    )
                  }
                  label={item}
                />
              ))}
            </div>
          </Field>
        </div>
        <SectionTitle title="Direcao do atendimento" />
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: 12 }}>
          <Field label="Status"><select value={form.status} onChange={(event) => setField("status", event.target.value)} style={inputStyle}>{STATUS_OPTIONS.map((item) => <option key={item}>{item}</option>)}</select></Field>
          <Field label="Dias desde o inicio"><input value={form.dataInicio ? getDaysSinceStart(form.dataInicio) : ""} readOnly style={{ ...inputStyle, background: "#f4efe8" }} /></Field>
          <Field label="Queixa principal"><textarea value={form.queixaPrincipal} onChange={(event) => setField("queixaPrincipal", event.target.value)} style={inputStyle} /></Field>
          <Field label="Objetivo"><textarea value={form.objetivo} onChange={(event) => setField("objetivo", event.target.value)} style={inputStyle} /></Field>
        </div>
        <SectionTitle title="Leitura e intervencao" />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button type="button" onClick={() => applyGeneratedField("diagnosticoEnergetico", buildDiagnosticSuggestion)} style={secondaryButtonStyle}>Preencher diagnostico base</button>
          <button type="button" onClick={() => applyGeneratedField("causasIdentificadas", buildCausesSuggestion)} style={secondaryButtonStyle}>Puxar leitura para causas</button>
          <button type="button" onClick={() => applyGeneratedField("areasAfetadas", buildAreasSuggestion)} style={secondaryButtonStyle}>Listar areas afetadas</button>
          <button type="button" onClick={() => applyGeneratedField("intervencoesRealizadas", buildInterventionsSuggestion)} style={secondaryButtonStyle}>Montar intervencoes base</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: 12 }}>
          <Field label="Diagnostico energetico"><textarea value={form.diagnosticoEnergetico} onChange={(event) => setField("diagnosticoEnergetico", event.target.value)} style={inputStyle} /></Field>
          <Field label="Causas identificadas"><textarea value={form.causasIdentificadas} onChange={(event) => setField("causasIdentificadas", event.target.value)} style={inputStyle} /></Field>
          <Field label="Areas afetadas"><textarea value={form.areasAfetadas} onChange={(event) => setField("areasAfetadas", event.target.value)} style={inputStyle} /></Field>
          <Field label="Intervencoes realizadas"><textarea value={form.intervencoesRealizadas} onChange={(event) => setField("intervencoesRealizadas", event.target.value)} style={inputStyle} /></Field>
          <Field label="Evolucao"><textarea value={form.evolucao} onChange={(event) => setField("evolucao", event.target.value)} style={inputStyle} /></Field>
          <Field label="Observacoes"><textarea value={form.observacoes} onChange={(event) => setField("observacoes", event.target.value)} style={inputStyle} /></Field>
        </div>
        <SectionTitle title="Leitura inicial" />
        <div style={{ display: "grid", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: 12 }}>
            <Field label="Bovis"><input value={form.bovis || ""} onChange={(event) => setField("bovis", event.target.value)} style={inputStyle} /></Field>
            <Field label="Hawkins"><input value={form.hawkins || ""} onChange={(event) => setField("hawkins", event.target.value)} style={inputStyle} /></Field>
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            <div style={{ ...labelStyle, marginBottom: 0 }}>Corpos sutis</div>
            <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: 12 }}>
              <Field label="Corpo atmico"><input value={form.corposSutis?.atmico || ""} onChange={(event) => setNestedField("corposSutis", "atmico", event.target.value)} style={inputStyle} /></Field>
              <Field label="Corpo budico"><input value={form.corposSutis?.budico || ""} onChange={(event) => setNestedField("corposSutis", "budico", event.target.value)} style={inputStyle} /></Field>
              <Field label="Corpo mental superior"><input value={form.corposSutis?.mentalSuperior || ""} onChange={(event) => setNestedField("corposSutis", "mentalSuperior", event.target.value)} style={inputStyle} /></Field>
              <Field label="Corpo mental inferior"><input value={form.corposSutis?.mentalInferior || ""} onChange={(event) => setNestedField("corposSutis", "mentalInferior", event.target.value)} style={inputStyle} /></Field>
              <Field label="Corpo astral"><input value={form.corposSutis?.astral || ""} onChange={(event) => setNestedField("corposSutis", "astral", event.target.value)} style={inputStyle} /></Field>
              <Field label="Corpo duplo eterico"><input value={form.corposSutis?.duploEterico || ""} onChange={(event) => setNestedField("corposSutis", "duploEterico", event.target.value)} style={inputStyle} /></Field>
              <Field label="Corpo fisico"><input value={form.corposSutis?.fisico || ""} onChange={(event) => setNestedField("corposSutis", "fisico", event.target.value)} style={inputStyle} /></Field>
            </div>
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            <div style={{ ...labelStyle, marginBottom: 0 }}>Chakras</div>
            <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: 12 }}>
              <Field label="Chakra coronario"><input value={form.chakras?.coronario || ""} onChange={(event) => setNestedField("chakras", "coronario", event.target.value)} style={inputStyle} /></Field>
              <Field label="Chakra frontal"><input value={form.chakras?.frontal || ""} onChange={(event) => setNestedField("chakras", "frontal", event.target.value)} style={inputStyle} /></Field>
              <Field label="Chakra laringeo"><input value={form.chakras?.laringeo || ""} onChange={(event) => setNestedField("chakras", "laringeo", event.target.value)} style={inputStyle} /></Field>
              <Field label="Chakra cardiaco"><input value={form.chakras?.cardiaco || ""} onChange={(event) => setNestedField("chakras", "cardiaco", event.target.value)} style={inputStyle} /></Field>
              <Field label="Chakra plexo solar"><input value={form.chakras?.plexoSolar || ""} onChange={(event) => setNestedField("chakras", "plexoSolar", event.target.value)} style={inputStyle} /></Field>
              <Field label="Chakra umbilical"><input value={form.chakras?.umbilical || ""} onChange={(event) => setNestedField("chakras", "umbilical", event.target.value)} style={inputStyle} /></Field>
              <Field label="Chakra basico"><input value={form.chakras?.basico || ""} onChange={(event) => setNestedField("chakras", "basico", event.target.value)} style={inputStyle} /></Field>
            </div>
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            <div style={{ ...labelStyle, marginBottom: 0 }}>Funcoes</div>
            <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr 1fr", gap: 12 }}>
              <Field label="Funcao respiratoria"><input value={form.funcoes?.respiratoria || ""} onChange={(event) => setNestedField("funcoes", "respiratoria", event.target.value)} style={inputStyle} /></Field>
              <Field label="Funcao nutritiva"><input value={form.funcoes?.nutritiva || ""} onChange={(event) => setNestedField("funcoes", "nutritiva", event.target.value)} style={inputStyle} /></Field>
              <Field label="Funcao digestiva"><input value={form.funcoes?.digestiva || ""} onChange={(event) => setNestedField("funcoes", "digestiva", event.target.value)} style={inputStyle} /></Field>
              <Field label="Funcao circulatoria"><input value={form.funcoes?.circulatoria || ""} onChange={(event) => setNestedField("funcoes", "circulatoria", event.target.value)} style={inputStyle} /></Field>
              <Field label="Funcao relacional"><input value={form.funcoes?.relacional || ""} onChange={(event) => setNestedField("funcoes", "relacional", event.target.value)} style={inputStyle} /></Field>
              <Field label="Funcao reprodutiva"><input value={form.funcoes?.reprodutiva || ""} onChange={(event) => setNestedField("funcoes", "reprodutiva", event.target.value)} style={inputStyle} /></Field>
              <Field label="Funcao estruturante"><input value={form.funcoes?.estruturante || ""} onChange={(event) => setNestedField("funcoes", "estruturante", event.target.value)} style={inputStyle} /></Field>
              <Field label="Funcao evolutiva"><input value={form.funcoes?.evolutiva || ""} onChange={(event) => setNestedField("funcoes", "evolutiva", event.target.value)} style={inputStyle} /></Field>
              <Field label="Funcao excretora"><input value={form.funcoes?.excretora || ""} onChange={(event) => setNestedField("funcoes", "excretora", event.target.value)} style={inputStyle} /></Field>
            </div>
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            <div style={{ ...labelStyle, marginBottom: 0 }}>Campos</div>
            <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr 1fr", gap: 12 }}>
              <Field label="Campo energetico"><input value={form.campos?.energetico || ""} onChange={(event) => setNestedField("campos", "energetico", event.target.value)} style={inputStyle} /></Field>
              <Field label="Campo mental"><input value={form.campos?.mental || ""} onChange={(event) => setNestedField("campos", "mental", event.target.value)} style={inputStyle} /></Field>
              <Field label="Campo vital"><input value={form.campos?.vital || ""} onChange={(event) => setNestedField("campos", "vital", event.target.value)} style={inputStyle} /></Field>
              <Field label="Campo emocional"><input value={form.campos?.emocional || ""} onChange={(event) => setNestedField("campos", "emocional", event.target.value)} style={inputStyle} /></Field>
              <Field label="Campo espiritual"><input value={form.campos?.espiritual || ""} onChange={(event) => setNestedField("campos", "espiritual", event.target.value)} style={inputStyle} /></Field>
              <Field label="Campo fisico"><input value={form.campos?.fisico || ""} onChange={(event) => setNestedField("campos", "fisico", event.target.value)} style={inputStyle} /></Field>
            </div>
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            <div style={{ ...labelStyle, marginBottom: 0 }}>Aura</div>
            <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: 12 }}>
              <Field label="Protecao"><input value={form.aura?.protecao || ""} onChange={(event) => setNestedField("aura", "protecao", event.target.value)} style={inputStyle} /></Field>
              <Field label="Tamanho"><input value={form.aura?.tamanho || ""} onChange={(event) => setNestedField("aura", "tamanho", event.target.value)} style={inputStyle} /></Field>
              <Field label="Cor excesso"><input value={form.aura?.corExcesso || ""} onChange={(event) => setNestedField("aura", "corExcesso", event.target.value)} style={inputStyle} /></Field>
              <Field label="Cor falta"><input value={form.aura?.corFalta || ""} onChange={(event) => setNestedField("aura", "corFalta", event.target.value)} style={inputStyle} /></Field>
            </div>
          </div>
        </div>
        <SectionTitle title="Financeiro e devolutiva" />
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr 1fr", gap: 12 }}>
          <Field label="Valor"><input value={form.valor} onChange={(event) => setField("valor", event.target.value.replace(/[^\d,.]/g, ""))} style={inputStyle} placeholder="Ex.: 480,00" /></Field>
          <Field label="Status do pagamento"><select value={form.statusPagamento} onChange={(event) => setField("statusPagamento", event.target.value)} style={inputStyle}>{PAYMENT_OPTIONS.map((item) => <option key={item}>{item}</option>)}</select></Field>
          <Field label="Protocolos selecionados"><input value={(form.protocolosUsados || []).join(", ")} readOnly style={{ ...inputStyle, background: "#f4efe8" }} /></Field>
        </div>
        <div style={{ display: "grid", gap: 12 }}>
          <Field label="Devolutiva final"><textarea value={form.devolutivaFinal} onChange={(event) => setField("devolutivaFinal", event.target.value)} style={inputStyle} /></Field>
          <Field label="Proximos passos"><textarea value={form.proximosPassos} onChange={(event) => setField("proximosPassos", event.target.value)} style={inputStyle} /></Field>
        </div>
      </form>
    </Panel>
  );
}

function FinalFeedback({ client }) {
  const currentAnalysis = getAnalysisRecord(client);
  const activeGraphics = getActiveGraphicsFromAnalysis(currentAnalysis);
  const protocolLabel = getValidProtocols(currentAnalysis.protocolosUsados).join(", ");
  const generatedSummary = buildFinalSummary(client);
  return (
    <Panel>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
        <div style={{ fontSize: 18, fontWeight: 800 }}>Devolutiva final</div>
        <div style={{ color: THEME.green, fontWeight: 800 }}>{client.statusPagamento === "Pago" ? "Pagamento regularizado" : "Pagamento em aberto"}</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 12 }}>
        <InfoCard label="Analise" value={currentAnalysis?.dataInicio ? formatFullDate(currentAnalysis.dataInicio) : "Sem data"} />
        <InfoCard label="Protocolos" value={protocolLabel || "Sem protocolo"} />
        <InfoCard label="Graficos" value={activeGraphics.length ? `${activeGraphics.length} ativos` : "Nenhum"} />
        <InfoCard label="Status" value={client.status} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
        <SummaryBlock title="Sintese" text={client.devolutivaFinal || client.diagnosticoEnergetico || "Ainda sem sintese registrada."} />
        <SummaryBlock title="Causas" text={client.causasIdentificadas || "Sem causas registradas."} />
        <SummaryBlock title="Intervencoes" text={client.intervencoesRealizadas || (activeGraphics.length ? activeGraphics.map((item) => `${item.nome} - ${item.protocol}`).join(", ") : "Sem intervencoes registradas.")} />
        <SummaryBlock title="Orientacao final" text={client.proximosPassos || "Sem orientacoes finais definidas."} />
        <SummaryBlock title="Texto consolidado" text={generatedSummary} />
      </div>
    </Panel>
  );
}

function FeedbackCard({ client }) {
  return (
    <div style={{ border: `1px solid ${THEME.line}`, borderRadius: 18, background: "#fffdfa", padding: "14px 16px" }}>
      <div style={{ fontWeight: 800, marginBottom: 4 }}>{client.nome}</div>
      <div style={{ color: THEME.muted, fontSize: 13 }}>{formatProtocols(client)} - TGR</div>
    </div>
  );
}

function Shell({ children }) {
  return (
    <div style={{ minHeight: "100vh", background: `radial-gradient(circle at top left, #fffaf3 0%, ${THEME.bg} 48%, #efe4d4 100%)`, color: THEME.text, fontFamily: "'Segoe UI Variable Display', 'Segoe UI', 'Trebuchet MS', sans-serif" }}>
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; background: ${THEME.bg}; }
        button, input, textarea, select { font: inherit; }
        textarea { min-height: 118px; resize: vertical; }
      `}</style>
      {children}
    </div>
  );
}

function Panel({ children, style }) {
  return <section style={{ background: "rgba(255,253,249,0.95)", border: `1px solid ${THEME.line}`, borderRadius: 26, padding: 20, boxShadow: THEME.shadow, ...style }}>{children}</section>;
}

function Field({ label, children }) {
  return (
    <label>
      <span style={labelStyle}>{label}</span>
      {children}
    </label>
  );
}

function ActionTile({ title, text }) {
  return (
    <div style={{ border: `1px solid ${THEME.line}`, borderRadius: 18, padding: "15px 16px", background: "#fffdfa" }}>
      <div style={{ fontWeight: 800, marginBottom: 6 }}>{title}</div>
      <div style={{ color: THEME.muted, lineHeight: 1.65 }}>{text}</div>
    </div>
  );
}

function TabButton({ active, onClick, label }) {
  return <button type="button" onClick={onClick} style={{ border: `1px solid ${active ? THEME.text : THEME.line}`, background: active ? THEME.text : "#fffdfa", color: active ? "#fff" : THEME.muted, padding: "11px 16px", borderRadius: 999, cursor: "pointer", fontWeight: 800, fontSize: 14 }}>{label}</button>;
}

function StagePill({ label, active }) {
  return <span style={{ border: `1px solid ${active ? THEME.green : THEME.line}`, background: active ? THEME.greenSoft : "#fffdfa", color: active ? THEME.green : THEME.muted, borderRadius: 999, padding: "9px 13px", fontWeight: 800, fontSize: 13 }}>{label}</span>;
}

function PillButton({ active, onClick, label }) {
  return <button type="button" onClick={onClick} style={{ border: `1px solid ${active ? THEME.green : THEME.line}`, background: active ? THEME.greenSoft : "#fffdfa", color: active ? THEME.green : THEME.muted, borderRadius: 999, padding: "9px 13px", cursor: "pointer", fontWeight: 800, fontSize: 13 }}>{label}</button>;
}

function MetricTile({ label, value, accent }) {
  return (
    <div style={{ background: "#fffdfa", border: `1px solid ${THEME.line}`, borderRadius: 18, padding: "16px 14px" }}>
      <div style={{ color: accent, fontSize: 24, fontWeight: 800, marginBottom: 5 }}>{value}</div>
      <div style={{ color: THEME.muted, fontSize: 12, textTransform: "uppercase", letterSpacing: 0.8, fontWeight: 800 }}>{label}</div>
    </div>
  );
}

function StatusBadge({ status }) {
  const tone = getStatusTone(status);
  return <span style={{ background: tone.bg, color: tone.color, borderRadius: 999, padding: "7px 10px", fontSize: 12, fontWeight: 700 }}>{status}</span>;
}

function InfoCard({ label, value }) {
  return (
    <div style={{ border: `1px solid ${THEME.line}`, borderRadius: 16, padding: "13px 14px", background: "#fffdfa" }}>
      <div style={{ ...labelStyle, marginBottom: 5 }}>{label}</div>
      <div style={{ fontWeight: 800, fontSize: 15, lineHeight: 1.45 }}>{value}</div>
    </div>
  );
}

function CommandCardButton({ title, text, onClick, primary = false, disabled = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        border: `1px solid ${primary ? THEME.text : THEME.line}`,
        borderRadius: 20,
        padding: "16px 18px",
        background: primary ? THEME.text : "#fffdfa",
        color: primary ? "#fff" : THEME.text,
        textAlign: "left",
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.6 : 1,
        display: "grid",
        gap: 7,
      }}
    >
      <span style={{ fontWeight: 800, fontSize: 16 }}>{title}</span>
      <span style={{ color: primary ? "rgba(255,255,255,0.82)" : THEME.muted, lineHeight: 1.6, fontSize: 14 }}>{text}</span>
    </button>
  );
}

function ClientListCard({ client, active, onClick }) {
  return (
    <button type="button" onClick={onClick} style={{ border: `1px solid ${active ? THEME.green : THEME.line}`, background: active ? "#f7fbf4" : "#fffdfa", borderRadius: 20, padding: "14px 15px", textAlign: "left", cursor: "pointer", boxShadow: active ? "0 14px 30px rgba(110,127,95,0.12)" : "none" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
        <div style={{ fontWeight: 800 }}>{client.nome}</div>
        <StatusBadge status={client.status} />
      </div>
      <div style={{ color: THEME.muted, fontSize: 13, marginTop: 6 }}>TGR - {formatProtocols(client)}</div>
      <div style={{ color: THEME.muted, fontSize: 12, marginTop: 10 }}>{client.diasAtendimento} dias desde o inicio</div>
    </button>
  );
}

function SummaryBlock({ title, text }) {
  return (
    <div style={{ border: `1px solid ${THEME.line}`, borderRadius: 18, padding: "15px 16px", background: "#fffdfa" }}>
      <div style={{ fontWeight: 800, marginBottom: 6 }}>{title}</div>
      <div style={{ color: THEME.muted, lineHeight: 1.65 }}>{text}</div>
    </div>
  );
}

function ProtocolSaveBar({ title, text, onSave, dirty }) {
  return (
    <div style={{ border: `1px solid ${dirty ? THEME.terracotta : THEME.green}`, background: dirty ? "#fff8f2" : "#f7fbf4", borderRadius: 18, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
      <div style={{ display: "grid", gap: 4 }}>
        <div style={{ fontWeight: 800 }}>{title}</div>
        <div style={{ color: THEME.muted, fontSize: 13, lineHeight: 1.6 }}>{text}</div>
      </div>
      <button type="button" onClick={onSave} style={primaryButtonStyle}>
        {dirty ? "Salvar alteracoes" : "Salvar protocolo"}
      </button>
    </div>
  );
}

function ProtocolStageTabs({ activeStage, onChange }) {
  return (
    <div style={{ display: "grid", gap: 10 }}>
      <div style={{ ...labelStyle, marginBottom: 0 }}>Etapas do protocolo</div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {TGR_FLOW_STAGES.map((stage) => (
          <button
            key={stage.key}
            type="button"
            onClick={() => onChange(stage.key)}
            style={{
              border: `1px solid ${activeStage === stage.key ? THEME.green : THEME.line}`,
              background: activeStage === stage.key ? THEME.greenSoft : "#fffdfa",
              color: activeStage === stage.key ? THEME.green : THEME.muted,
              borderRadius: 999,
              padding: "9px 14px",
              cursor: "pointer",
              fontWeight: 800,
              fontSize: 12,
            }}
          >
            {stage.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function SectionTitle({ title }) {
  return <div style={{ fontSize: 12, fontWeight: 800, color: THEME.terracotta, textTransform: "uppercase", letterSpacing: 1, paddingTop: 4 }}>{title}</div>;
}

export default App;
