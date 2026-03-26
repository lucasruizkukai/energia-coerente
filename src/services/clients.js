import { readLocalClients, writeLocalClients } from "../lib/local-db";
import { hasSupabaseEnv, supabase } from "../lib/supabase";

const TABLE_NAME = "clients";

export async function listClients(fallback = []) {
  if (!hasSupabaseEnv || !supabase) {
    return { mode: "local", data: readLocalClients(fallback) };
  }

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return { mode: "supabase", data: (data || []).map(mapRowToClient) };
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
  const protocolosUsados = String(row.tipo_sessao || "")
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);

  return {
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
    observacoes: row.observacoes || "",
    status: row.status || "",
    evolucao: row.evolucao || "",
    valor: row.valor?.toString() || "",
    statusPagamento: row.status_pagamento || "",
    devolutivaFinal: row.devolutiva_final || "",
    proximosPassos: row.proximos_passos || "",
  };
}

function mapClientToRow(client) {
  const protocolosUsados = Array.isArray(client.protocolosUsados) ? client.protocolosUsados : [];
  const diaProcesso = client.dataInicio
    ? Math.max(1, Math.floor((new Date().setHours(12, 0, 0, 0) - new Date(`${client.dataInicio}T12:00:00`).getTime()) / 86400000) + 1)
    : 1;
  return {
    id: client.id,
    nome: client.nome,
    whatsapp: client.whatsapp,
    email: client.email || null,
    data_inicio: client.dataInicio || null,
    tipo_sessao: protocolosUsados.join(" | "),
    queixa_principal: client.queixaPrincipal,
    objetivo: client.objetivo,
    diagnostico_energetico: client.diagnosticoEnergetico,
    causas_identificadas: client.causasIdentificadas,
    areas_afetadas: client.areasAfetadas,
    intervencoes_realizadas: client.intervencoesRealizadas,
    observacoes: client.observacoes,
    status: client.status,
    dia_processo: diaProcesso,
    evolucao: client.evolucao,
    valor: client.valor ? Number(String(client.valor).replace(",", ".")) : null,
    status_pagamento: client.statusPagamento,
    devolutiva_final: client.devolutivaFinal,
    proximos_passos: client.proximosPassos,
  };
}
