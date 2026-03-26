import { readLocalClients, writeLocalClients } from "../lib/local-db";
import { hasSupabaseEnv, supabase } from "../lib/supabase";

const TABLE_NAME = "clients";
const ANALYSES_MARKER = "\n\n[EC_ANALYSES]";
const ANALYSIS_DEFAULTS = {
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
  corposSutis: {},
  chakras: {},
  funcoes: {},
  campos: {},
  aura: {},
  evolucao: "",
  valor: "",
  statusPagamento: "Pendente",
  devolutivaFinal: "",
  proximosPassos: "",
};

export async function listClients(fallback = []) {
  if (!hasSupabaseEnv || !supabase) {
    return { mode: "local", data: readLocalClients(fallback) };
  }

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return {
    mode: "supabase",
    data: (data || []).map((row) => {
      try {
        return mapRowToClient(row);
      } catch {
        return mapRowToClientFallback(row);
      }
    }),
  };
}

export async function upsertClient(client, currentClients = []) {
  if (!hasSupabaseEnv || !supabase) {
    const exists = currentClients.some((item) => item.id === client.id);
    const nextClients = exists ? currentClients.map((item) => (item.id === client.id ? client : item)) : [client, ...currentClients];
    writeLocalClients(nextClients);
    return { mode: "local", data: client, all: nextClients };
  }

  const payload = mapClientToRow(client);
  const { data, error } = await supabase.from(TABLE_NAME).upsert(payload).select().single();
  if (error) throw error;
  return { mode: "supabase", data: mapRowToClient(data) };
}

export async function deleteClient(id, currentClients = []) {
  if (!hasSupabaseEnv || !supabase) {
    const nextClients = currentClients.filter((item) => item.id !== id);
    writeLocalClients(nextClients);
    return { mode: "local", all: nextClients };
  }

  const { error } = await supabase.from(TABLE_NAME).delete().eq("id", id);
  if (error) throw error;
  return { mode: "supabase" };
}

function mapRowToClient(row) {
  const parsedObservacoes = splitObservacoesPayload(row.observacoes || "");
  const protocolosUsados = String(row.tipo_sessao || "")
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);

  const baseClient = {
    id: row.id,
    nome: row.nome || "",
    whatsapp: row.whatsapp || "",
    email: row.email || "",
    dataInicio: row.data_inicio || "",
    protocolosUsados,
    queixaPrincipal: row.queixa_principal || "",
    objetivo: row.objetivo || "",
    diagnosticoEnergetico: row.diagnostico_energetico || "",
    causasIdentificadas: row.causas_identificadas || "",
    areasAfetadas: row.areas_afetadas || "",
    intervencoesRealizadas: row.intervencoes_realizadas || "",
    observacoes: parsedObservacoes.visibleText,
    status: row.status || "",
    evolucao: row.evolucao || "",
    valor: row.valor?.toString() || "",
    statusPagamento: row.status_pagamento || "",
    devolutivaFinal: row.devolutiva_final || "",
    proximosPassos: row.proximos_passos || "",
  };

  return normalizeClientAnalyses({
    ...baseClient,
    analyses: parsedObservacoes.metadata?.analyses || [],
    currentAnalysisId: parsedObservacoes.metadata?.currentAnalysisId || "",
  });
}

function mapClientToRow(client) {
  const normalizedClient = normalizeClientAnalyses(client);
  const activeAnalysis = getActiveAnalysis(normalizedClient);
  const protocolosUsados = Array.isArray(activeAnalysis.protocolosUsados) ? activeAnalysis.protocolosUsados : [];
  const diaProcesso = activeAnalysis.dataInicio
    ? Math.max(1, Math.floor((new Date().setHours(12, 0, 0, 0) - new Date(`${activeAnalysis.dataInicio}T12:00:00`).getTime()) / 86400000) + 1)
    : 1;

  return {
    id: normalizedClient.id,
    nome: normalizedClient.nome,
    whatsapp: normalizedClient.whatsapp,
    email: normalizedClient.email || null,
    data_inicio: activeAnalysis.dataInicio || null,
    tipo_sessao: protocolosUsados.join(" | "),
    queixa_principal: activeAnalysis.queixaPrincipal,
    objetivo: activeAnalysis.objetivo,
    diagnostico_energetico: activeAnalysis.diagnosticoEnergetico,
    causas_identificadas: activeAnalysis.causasIdentificadas,
    areas_afetadas: activeAnalysis.areasAfetadas,
    intervencoes_realizadas: activeAnalysis.intervencoesRealizadas,
    observacoes: joinObservacoesPayload(activeAnalysis.observacoes, {
      currentAnalysisId: normalizedClient.currentAnalysisId,
      analyses: normalizedClient.analyses,
    }),
    status: activeAnalysis.status,
    dia_processo: diaProcesso,
    evolucao: activeAnalysis.evolucao,
    valor: activeAnalysis.valor ? Number(String(activeAnalysis.valor).replace(",", ".")) : null,
    status_pagamento: activeAnalysis.statusPagamento,
    devolutiva_final: activeAnalysis.devolutivaFinal,
    proximos_passos: activeAnalysis.proximosPassos,
  };
}

function mapRowToClientFallback(row) {
  const protocolosUsados = String(row?.tipo_sessao || "")
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);

  return normalizeClientAnalyses({
    id: row?.id || "",
    nome: row?.nome || "",
    whatsapp: row?.whatsapp || "",
    email: row?.email || "",
    dataInicio: row?.data_inicio || "",
    protocolosUsados,
    queixaPrincipal: row?.queixa_principal || "",
    objetivo: row?.objetivo || "",
    diagnosticoEnergetico: row?.diagnostico_energetico || "",
    causasIdentificadas: row?.causas_identificadas || "",
    areasAfetadas: row?.areas_afetadas || "",
    intervencoesRealizadas: row?.intervencoes_realizadas || "",
    observacoes: row?.observacoes || "",
    status: row?.status || "Em atendimento",
    evolucao: row?.evolucao || "",
    valor: row?.valor?.toString() || "",
    statusPagamento: row?.status_pagamento || "Pendente",
    devolutivaFinal: row?.devolutiva_final || "",
    proximosPassos: row?.proximos_passos || "",
  });
}

function splitObservacoesPayload(value) {
  const raw = String(value || "");
  const markerIndex = raw.indexOf(ANALYSES_MARKER);
  if (markerIndex === -1) return { visibleText: raw, metadata: null };

  const visibleText = raw.slice(0, markerIndex).trimEnd();
  const metadataText = raw.slice(markerIndex + ANALYSES_MARKER.length);
  try {
    return { visibleText, metadata: JSON.parse(metadataText) };
  } catch {
    return { visibleText: raw, metadata: null };
  }
}

function joinObservacoesPayload(visibleText, metadata) {
  return `${String(visibleText || "").trimEnd()}${ANALYSES_MARKER}${JSON.stringify(metadata)}`;
}

function buildAnalysisFromSource(source = {}, overrides = {}) {
  return {
    ...ANALYSIS_DEFAULTS,
    ...source,
    ...overrides,
    protocolosUsados: [...(overrides.protocolosUsados || source.protocolosUsados || [])],
    corposSutis: { ...(source.corposSutis || {}), ...(overrides.corposSutis || {}) },
    chakras: { ...(source.chakras || {}), ...(overrides.chakras || {}) },
    funcoes: { ...(source.funcoes || {}), ...(overrides.funcoes || {}) },
    campos: { ...(source.campos || {}), ...(overrides.campos || {}) },
    aura: { ...(source.aura || {}), ...(overrides.aura || {}) },
  };
}

function extractAnalysisFromClient(client = {}, overrides = {}) {
  return buildAnalysisFromSource(
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
    },
    overrides
  );
}

function getActiveAnalysis(client) {
  return client.analyses?.find((analysis) => analysis.id === client.currentAnalysisId) || client.analyses?.[0] || extractAnalysisFromClient(client);
}

function normalizeClientAnalyses(client = {}) {
  const analyses = Array.isArray(client.analyses) && client.analyses.length
    ? client.analyses.map((analysis) => buildAnalysisFromSource(analysis))
    : [extractAnalysisFromClient(client, { id: client.currentAnalysisId || client.id })];

  const currentAnalysisId = analyses.some((analysis) => analysis.id === client.currentAnalysisId)
    ? client.currentAnalysisId
    : analyses[0]?.id;

  const currentSnapshot = extractAnalysisFromClient(client, { id: currentAnalysisId });
  const syncedAnalyses = analyses.map((analysis) => (
    analysis.id === currentAnalysisId
      ? buildAnalysisFromSource(analysis, currentSnapshot)
      : analysis
  ));
  const activeAnalysis = syncedAnalyses.find((analysis) => analysis.id === currentAnalysisId) || syncedAnalyses[0];

  return {
    ...client,
    analyses: syncedAnalyses,
    currentAnalysisId,
    dataInicio: activeAnalysis.dataInicio,
    protocolosUsados: activeAnalysis.protocolosUsados,
    queixaPrincipal: activeAnalysis.queixaPrincipal,
    objetivo: activeAnalysis.objetivo,
    diagnosticoEnergetico: activeAnalysis.diagnosticoEnergetico,
    causasIdentificadas: activeAnalysis.causasIdentificadas,
    areasAfetadas: activeAnalysis.areasAfetadas,
    intervencoesRealizadas: activeAnalysis.intervencoesRealizadas,
    observacoes: activeAnalysis.observacoes,
    status: activeAnalysis.status,
    bovis: activeAnalysis.bovis,
    hawkins: activeAnalysis.hawkins,
    corposSutis: activeAnalysis.corposSutis,
    chakras: activeAnalysis.chakras,
    funcoes: activeAnalysis.funcoes,
    campos: activeAnalysis.campos,
    aura: activeAnalysis.aura,
    evolucao: activeAnalysis.evolucao,
    valor: activeAnalysis.valor,
    statusPagamento: activeAnalysis.statusPagamento,
    devolutivaFinal: activeAnalysis.devolutivaFinal,
    proximosPassos: activeAnalysis.proximosPassos,
  };
}
