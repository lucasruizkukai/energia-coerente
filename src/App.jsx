import { useEffect, useMemo, useState } from "react";
import { hasSupabaseEnv } from "./lib/supabase";
import { getCurrentSession, signInWithPassword, signOut } from "./services/auth";
import { deleteClient, listClients, upsertClient } from "./services/clients";

const BRAND = {
  name: "Jaqueline Monteiro",
  subtitle: "Energia Coerente",
};

const SESSION_TYPES = ["Mini Harmonizacao", "Sessao Essencial", "Sessao Profunda"];
const STATUS_OPTIONS = ["Novo contato", "Aguardando inicio", "Em atendimento", "Aguardando devolutiva", "Concluido"];
const PAYMENT_OPTIONS = ["Pendente", "Parcial", "Pago"];
const PROCESS_STAGES = [
  { key: "intake", label: "Acolhimento", days: "Dia 1-3" },
  { key: "diagnosis", label: "Diagnostico", days: "Dia 4-7" },
  { key: "intervention", label: "Intervencoes", days: "Dia 8-17" },
  { key: "closure", label: "Devolutiva", days: "Dia 18-21" },
];
const SESSION_DETAILS = {
  "Mini Harmonizacao": "Atendimento mais objetivo para reorganizacao inicial e alivio pontual.",
  "Sessao Essencial": "Processo intermediario para reorganizar padroes centrais com acompanhamento estruturado.",
  "Sessao Profunda": "Jornada mais completa para casos que pedem leitura ampla e intervencao gradual.",
};

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
};

const emptyClient = {
  id: "",
  nome: "",
  whatsapp: "",
  email: "",
  dataInicio: "",
  tipoSessao: "Sessao Essencial",
  queixaPrincipal: "",
  objetivo: "",
  diagnosticoEnergetico: "",
  causasIdentificadas: "",
  areasAfetadas: "",
  intervencoesRealizadas: "",
  observacoes: "",
  status: "Novo contato",
  diaProcesso: 1,
  evolucao: "",
  valor: "",
  statusPagamento: "Pendente",
  devolutivaFinal: "",
  proximosPassos: "",
};

const sampleClients = [
  {
    ...emptyClient,
    id: "ec-1",
    nome: "Marina Costa",
    whatsapp: "(11) 98765-4321",
    email: "marina@email.com",
    dataInicio: "2026-03-10",
    tipoSessao: "Sessao Profunda",
    queixaPrincipal: "Cansaco constante e sensacao de travamento emocional.",
    objetivo: "Retomar clareza, vitalidade e estabilidade nas relacoes.",
    diagnosticoEnergetico: "Sobrecarga no campo emocional e dispersao de energia.",
    causasIdentificadas: "Acumulo de estresse, limites fragilizados e rotina desalinhada.",
    areasAfetadas: "Emocional, mental e relacional.",
    intervencoesRealizadas: "Limpeza inicial, harmonizacao progressiva e reorientacao de foco.",
    observacoes: "Cliente responsiva, acompanha bem o processo e relata percepcao sutil diaria.",
    status: "Em atendimento",
    diaProcesso: 9,
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
    tipoSessao: "Mini Harmonizacao",
    queixaPrincipal: "Ansiedade intensa antes de reunioes importantes.",
    objetivo: "Regular a resposta emocional e sustentar presenca.",
    diagnosticoEnergetico: "Ativacao excessiva do mental e pouca ancoragem corporal.",
    causasIdentificadas: "Sobrecarga de demandas e autoexigencia elevada.",
    areasAfetadas: "Mental e emocional.",
    intervencoesRealizadas: "Ajuste inicial e ancoragem energetica de curto prazo.",
    observacoes: "Entrou hoje; aguardar retorno apos os primeiros 3 dias.",
    status: "Aguardando inicio",
    diaProcesso: 1,
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
  padding: "13px 14px",
  fontSize: 14,
  color: THEME.text,
  background: "#fffdfa",
  outline: "none",
};

const labelStyle = {
  display: "block",
  marginBottom: 6,
  fontSize: 11,
  fontWeight: 700,
  color: THEME.muted,
  letterSpacing: 0.8,
  textTransform: "uppercase",
};

function generateId() {
  return `ec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
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

function getProcessDay(startDate) {
  if (!startDate) return 1;
  const start = new Date(`${startDate}T12:00:00`);
  const today = new Date();
  start.setHours(12, 0, 0, 0);
  today.setHours(12, 0, 0, 0);
  const diff = Math.floor((today.getTime() - start.getTime()) / 86400000) + 1;
  return Math.max(1, Math.min(21, diff));
}

function getStageFromDay(day) {
  if (day <= 3) return PROCESS_STAGES[0];
  if (day <= 7) return PROCESS_STAGES[1];
  if (day <= 17) return PROCESS_STAGES[2];
  return PROCESS_STAGES[3];
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

function App() {
  const [clients, setClients] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedId, setSelectedId] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [mobile, setMobile] = useState(() => window.innerWidth < 840);
  const [draftClient, setDraftClient] = useState(() => ({ ...emptyClient, id: generateId() }));
  const [appMode, setAppMode] = useState(hasSupabaseEnv ? "supabase" : "local");
  const [authReady, setAuthReady] = useState(false);
  const [user, setUser] = useState(null);
  const [authForm, setAuthForm] = useState({ email: "", password: "" });
  const [authError, setAuthError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uiMessage, setUiMessage] = useState("");

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
        setAppMode("local");
        setClients(sampleClients);
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
    const onResize = () => setMobile(window.innerWidth < 840);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const clientsWithProgress = useMemo(
    () =>
      clients.map((client) => {
        const computedDay = client.dataInicio ? getProcessDay(client.dataInicio) : Number(client.diaProcesso || 1);
        return { ...client, diaProcesso: computedDay, etapaAtual: getStageFromDay(computedDay) };
      }),
    [clients]
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
    filteredClients[0] ||
    clientsWithProgress[0] ||
    null;

  useEffect(() => {
    if (!selectedId && clientsWithProgress[0]?.id) setSelectedId(clientsWithProgress[0].id);
  }, [selectedId, clientsWithProgress]);

  const metrics = useMemo(() => {
    const active = clientsWithProgress.filter((client) => client.status === "Em atendimento").length;
    const pendingFeedback = clientsWithProgress.filter((client) => client.status === "Aguardando devolutiva").length;
    const pendingPayment = clientsWithProgress.filter((client) => client.statusPagamento !== "Pago").length;
    const monthlyRevenue = clientsWithProgress.reduce((total, client) => total + Number(client.valor || 0), 0);
    return { active, pendingFeedback, pendingPayment, monthlyRevenue };
  }, [clientsWithProgress]);

  async function saveClient(payload) {
    setSaving(true);
    setUiMessage("");
    const record = {
      ...payload,
      diaProcesso: payload.dataInicio ? getProcessDay(payload.dataInicio) : Number(payload.diaProcesso || 1),
    };

    try {
      const response = await upsertClient(record, clients);
      if (response.mode === "local" && response.all) {
        setClients(response.all);
      } else {
        setClients((current) => {
          const exists = current.some((item) => item.id === record.id);
          if (exists) return current.map((item) => (item.id === record.id ? record : item));
          return [record, ...current];
        });
      }
      setSelectedId(record.id);
      setDraftClient({ ...emptyClient, id: generateId() });
      setActiveTab("clientes");
      setUiMessage("Atendimento salvo com sucesso.");
    } catch (error) {
      setUiMessage(error?.message || "Nao foi possivel salvar o atendimento.");
    } finally {
      setSaving(false);
    }
  }

  async function removeClient(id) {
    setUiMessage("");
    try {
      const response = await deleteClient(id, clients);
      if (response.mode === "local" && response.all) setClients(response.all);
      else setClients((current) => current.filter((item) => item.id !== id));
      if (selectedId === id) setSelectedId("");
      setUiMessage("Atendimento removido.");
    } catch (error) {
      setUiMessage(error?.message || "Nao foi possivel remover o atendimento.");
    }
  }

  const contentWidth = { maxWidth: 1220, margin: "0 auto", padding: mobile ? "18px 14px 36px" : "26px 24px 48px" };

  function handleTabChange(nextTab) {
    if (nextTab === "novo") setDraftClient({ ...emptyClient, id: generateId() });
    setActiveTab(nextTab);
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
      setUiMessage("Login realizado com sucesso.");
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
          <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>Carregando</div>
        </Panel>
      </Shell>
    );
  }

  if (appMode === "supabase" && !user) {
    return (
      <Shell>
        <div style={{ maxWidth: 460, margin: "0 auto" }}>
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
              <button type="submit" style={{ border: "none", borderRadius: 16, background: THEME.text, color: "#fff", padding: "12px 18px", cursor: "pointer", fontWeight: 700 }}>
                Entrar
              </button>
            </form>
          </Panel>
        </div>
      </Shell>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(180deg, #f8f4ee 0%, ${THEME.bg} 56%, #f4ede2 100%)`, color: THEME.text, fontFamily: "'Segoe UI', sans-serif" }}>
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; background: ${THEME.bg}; }
        button, input, textarea, select { font: inherit; }
        textarea { min-height: 108px; resize: vertical; }
      `}</style>

      <header style={{ borderBottom: `1px solid ${THEME.line}`, background: "rgba(251,247,241,0.92)", backdropFilter: "blur(10px)", position: "sticky", top: 0, zIndex: 5 }}>
        <div style={{ ...contentWidth, paddingTop: mobile ? 14 : 18, paddingBottom: mobile ? 14 : 18 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: mobile ? 22 : 28, fontWeight: 800, letterSpacing: 0.2 }}>{BRAND.name}</div>
              <div style={{ color: THEME.terracotta, fontSize: 13, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase" }}>{BRAND.subtitle}</div>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", width: mobile ? "100%" : "auto" }}>
              <StatCard label="Em atendimento" value={metrics.active} />
              <StatCard label="Devolutivas" value={metrics.pendingFeedback} tone="terracotta" />
              <StatCard label="Financeiro" value={metrics.pendingPayment} />
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, alignItems: "center", flexWrap: "wrap", marginTop: 14 }}>
            {user ? (
              <>
                <span style={{ color: THEME.muted, fontSize: 13 }}>{user.email}</span>
                {appMode === "supabase" ? (
                  <button type="button" onClick={handleLogout} style={{ border: `1px solid ${THEME.line}`, background: "#fffdfa", borderRadius: 999, padding: "8px 12px", cursor: "pointer", fontWeight: 700 }}>
                    Sair
                  </button>
                ) : null}
              </>
            ) : null}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
            {[
              ["dashboard", "Dashboard"],
              ["clientes", "Clientes"],
              ["novo", "Novo cadastro"],
            ].map(([key, label]) => (
              <TabButton key={key} active={activeTab === key} onClick={() => handleTabChange(key)} label={label} />
            ))}
          </div>
        </div>
      </header>

      <main style={contentWidth}>
        {uiMessage ? (
          <div style={{ marginBottom: 16 }}>
            <Panel style={{ padding: "12px 16px", background: "#fff8ef" }}>
              <div style={{ color: THEME.text, fontWeight: 700 }}>{uiMessage}</div>
            </Panel>
          </div>
        ) : null}
        {activeTab === "dashboard" && <Dashboard clients={clientsWithProgress} metrics={metrics} mobile={mobile} onOpenClient={(id) => { setSelectedId(id); setActiveTab("clientes"); }} />}

        {activeTab === "clientes" && (
          <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "360px minmax(0, 1fr)", gap: 18 }}>
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

              <div style={{ display: "grid", gap: 12 }}>
                {filteredClients.map((client) => (
                  <ClientListCard key={client.id} client={client} active={selectedClient?.id === client.id} onClick={() => setSelectedId(client.id)} />
                ))}
                {!filteredClients.length && (
                  <Panel>
                    <div style={{ color: THEME.muted, textAlign: "center", padding: "16px 8px" }}>Nenhum cliente encontrado com esse filtro.</div>
                  </Panel>
                )}
              </div>
            </aside>

            <section style={{ display: "grid", gap: 18 }}>
              {selectedClient ? (
                <>
                  <ClientHeader client={selectedClient} onDelete={removeClient} />
                  <ClientJourney client={selectedClient} mobile={mobile} />
                  <ClientRecord client={selectedClient} onSave={saveClient} mobile={mobile} saving={saving} />
                  <FinalFeedback client={selectedClient} />
                </>
              ) : (
                <Panel>
                  <div style={{ color: THEME.muted }}>Selecione um cliente para abrir a ficha completa.</div>
                </Panel>
              )}
            </section>
          </div>
        )}

        {activeTab === "novo" && <ClientRecord client={draftClient} onSave={saveClient} mobile={mobile} isNew saving={saving} />}

      </main>
    </div>
  );
}

function Dashboard({ clients, metrics, mobile, onOpenClient }) {
  const upcoming = [...clients].sort((a, b) => a.diaProcesso - b.diaProcesso).slice(0, 4);
  const byStatus = STATUS_OPTIONS.map((status) => ({ status, count: clients.filter((client) => client.status === status).length }));

  if (!clients.length) {
    return (
      <div style={{ display: "grid", gap: 18 }}>
        <Panel>
          <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Nenhum atendimento cadastrado</div>
          <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "repeat(3, 1fr)", gap: 12, marginTop: 18 }}>
            <ActionTile title="Novo cadastro" text="Abra um atendimento com nome, WhatsApp, data de inicio e tipo de sessao." />
            <ActionTile title="Registro terapeutico" text="Preencha queixa, objetivo, diagnostico, causas e intervencoes ao longo do processo." />
            <ActionTile title="Devolutiva final" text="Consolide a sintese do caso e a orientacao de fechamento ao final do ciclo." />
          </div>
        </Panel>

        <Panel>
          <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 12 }}>Tipos de sessao</div>
          <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "repeat(3, 1fr)", gap: 12 }}>
            {SESSION_TYPES.map((session) => (
              <div key={session} style={{ border: `1px solid ${THEME.line}`, borderRadius: 18, padding: "14px 16px", background: "#fffdfa" }}>
                <div style={{ fontWeight: 800, marginBottom: 6 }}>{session}</div>
                <div style={{ color: THEME.muted, lineHeight: 1.6 }}>{SESSION_DETAILS[session]}</div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <section style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1.15fr 0.85fr", gap: 18 }}>
        <Panel>
          <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 14 }}>Visao geral</div>
          <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 12 }}>
            <MetricTile label="Clientes" value={clients.length} accent={THEME.text} />
            <MetricTile label="Em andamento" value={metrics.active} accent={THEME.green} />
            <MetricTile label="Pend. pagamento" value={metrics.pendingPayment} accent={THEME.terracotta} />
            <MetricTile label="Receita" value={formatCurrency(metrics.monthlyRevenue)} accent={THEME.sand} />
          </div>
        </Panel>

        <Panel>
          <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 14 }}>Status</div>
          <div style={{ display: "grid", gap: 10 }}>
            {byStatus.map((item) => {
              const tone = getStatusTone(item.status);
              return (
                <div key={item.status} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, background: tone.bg, color: tone.color, borderRadius: 16, padding: "12px 14px" }}>
                  <span style={{ fontWeight: 700 }}>{item.status}</span>
                  <strong>{item.count}</strong>
                </div>
              );
            })}
          </div>
        </Panel>
      </section>

      <section style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "0.95fr 1.05fr", gap: 18 }}>
        <Panel>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800 }}>Processo de 21 dias</div>
            </div>
          </div>
          <div style={{ display: "grid", gap: 10 }}>
            {PROCESS_STAGES.map((stage, index) => (
              <div key={stage.key} style={{ display: "grid", gridTemplateColumns: "42px 1fr auto", gap: 12, alignItems: "center", border: `1px solid ${THEME.line}`, borderRadius: 16, padding: "12px 14px", background: index % 2 === 0 ? THEME.panel : "#fffdfa" }}>
                <div style={{ width: 42, height: 42, borderRadius: 14, background: stage.key === "intervention" ? THEME.greenSoft : THEME.terracottaSoft, color: stage.key === "intervention" ? THEME.green : THEME.terracotta, display: "grid", placeItems: "center", fontWeight: 800 }}>
                  {index + 1}
                </div>
                <div>
                  <div style={{ fontWeight: 800 }}>{stage.label}</div>
                  <div style={{ color: THEME.muted, fontSize: 13 }}>{stage.days}</div>
                </div>
                <div style={{ color: THEME.muted, fontSize: 12 }}>21 dias</div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel>
          <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 14 }}>Atendimentos em destaque</div>
          <div style={{ display: "grid", gap: 12 }}>
            {upcoming.map((client) => (
              <button
                key={client.id}
                type="button"
                onClick={() => onOpenClient(client.id)}
                style={{ border: `1px solid ${THEME.line}`, background: "#fffdfa", borderRadius: 18, padding: "14px 16px", textAlign: "left", cursor: "pointer" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 800 }}>{client.nome}</div>
                    <div style={{ color: THEME.muted, fontSize: 13 }}>{client.tipoSessao}</div>
                  </div>
                  <StatusBadge status={client.status} />
                </div>
                <div style={{ marginTop: 12 }}>
                  <ProgressBar value={client.diaProcesso} total={21} />
                </div>
                <div style={{ marginTop: 8, color: THEME.muted, fontSize: 13 }}>
                  Dia {client.diaProcesso} de 21 • {client.etapaAtual.label}
                </div>
              </button>
            ))}
          </div>
        </Panel>
      </section>
    </div>
  );
}

function ClientHeader({ client, onDelete }) {
  return (
    <Panel>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontSize: 24, fontWeight: 800 }}>{client.nome}</div>
            <StatusBadge status={client.status} />
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, color: THEME.muted, fontSize: 14 }}>
            <span>{client.whatsapp || "WhatsApp nao informado"}</span>
            <span>{client.email || "Email opcional"}</span>
            <span>{client.tipoSessao}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onDelete(client.id)}
          style={{ border: `1px solid ${THEME.line}`, borderRadius: 14, background: "#fff7f4", color: "#8a4f38", padding: "10px 14px", cursor: "pointer", fontWeight: 700 }}
        >
          Remover
        </button>
      </div>
    </Panel>
  );
}

function ClientJourney({ client, mobile }) {
  return (
    <Panel>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap", marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800 }}>Linha do tempo do atendimento</div>
        </div>
        <div style={{ color: THEME.terracotta, fontWeight: 800 }}>Dia {client.diaProcesso} de 21</div>
      </div>

      <ProgressBar value={client.diaProcesso} total={21} />

      <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "repeat(4, 1fr)", gap: 10, marginTop: 16 }}>
        {PROCESS_STAGES.map((stage) => {
          const current = client.etapaAtual.key === stage.key;
          return (
            <div key={stage.key} style={{ border: `1px solid ${current ? THEME.green : THEME.line}`, background: current ? THEME.greenSoft : "#fffdfa", borderRadius: 16, padding: "14px 14px" }}>
              <div style={{ fontWeight: 800, marginBottom: 4 }}>{stage.label}</div>
              <div style={{ color: THEME.muted, fontSize: 13 }}>{stage.days}</div>
            </div>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr 1fr", gap: 12, marginTop: 16 }}>
        <InfoCard label="Inicio" value={formatDate(client.dataInicio)} />
        <InfoCard label="Etapa atual" value={client.etapaAtual.label} />
        <InfoCard label="Pagamento" value={client.statusPagamento} />
      </div>
    </Panel>
  );
}

function ClientRecord({ client, onSave, mobile, isNew = false, saving = false }) {
  const [form, setForm] = useState(client);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    setForm(client);
    setFormError("");
  }, [client]);

  function setField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!form.nome.trim()) {
      setFormError("Informe o nome da cliente para salvar o atendimento.");
      return;
    }
    if (!form.whatsapp.trim()) {
      setFormError("Informe o WhatsApp principal para manter o contato organizado.");
      return;
    }
    if (!form.dataInicio) {
      setFormError("Defina a data de inicio para calcular corretamente o processo de 21 dias.");
      return;
    }
    setFormError("");
    onSave({ ...form, id: form.id || generateId() });
  }

  return (
    <Panel>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800 }}>{isNew ? "Novo atendimento" : "Ficha completa do cliente"}</div>
          </div>
          <button type="submit" disabled={saving} style={{ border: "none", borderRadius: 16, background: THEME.text, color: "#fff", padding: "12px 18px", cursor: saving ? "wait" : "pointer", fontWeight: 700, opacity: saving ? 0.7 : 1 }}>
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
        {formError ? (
          <div style={{ border: `1px solid ${THEME.terracotta}`, background: "#fff5f1", borderRadius: 16, padding: "12px 14px", color: "#8a4f38", fontWeight: 700 }}>
            {formError}
          </div>
        ) : null}

        <SectionTitle title="Dados principais" />
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: 12 }}>
          <Field label="Nome"><input value={form.nome} onChange={(event) => setField("nome", event.target.value)} style={inputStyle} /></Field>
          <Field label="WhatsApp"><input value={form.whatsapp} onChange={(event) => setField("whatsapp", event.target.value)} style={inputStyle} /></Field>
          <Field label="Email opcional"><input value={form.email} onChange={(event) => setField("email", event.target.value)} style={inputStyle} /></Field>
          <Field label="Data de inicio"><input type="date" value={form.dataInicio} onChange={(event) => setField("dataInicio", event.target.value)} style={inputStyle} /></Field>
          <Field label="Tipo de sessao">
            <select value={form.tipoSessao} onChange={(event) => setField("tipoSessao", event.target.value)} style={inputStyle}>
              {SESSION_TYPES.map((item) => <option key={item}>{item}</option>)}
            </select>
            <div style={{ color: THEME.muted, fontSize: 12, marginTop: 6, lineHeight: 1.5 }}>{SESSION_DETAILS[form.tipoSessao]}</div>
          </Field>
          <Field label="Status">
            <select value={form.status} onChange={(event) => setField("status", event.target.value)} style={inputStyle}>
              {STATUS_OPTIONS.map((item) => <option key={item}>{item}</option>)}
            </select>
          </Field>
        </div>

        <SectionTitle title="Direcao do atendimento" />
        <div style={{ display: "grid", gap: 12 }}>
          <Field label="Queixa principal"><textarea value={form.queixaPrincipal} onChange={(event) => setField("queixaPrincipal", event.target.value)} style={inputStyle} /></Field>
          <Field label="Objetivo"><textarea value={form.objetivo} onChange={(event) => setField("objetivo", event.target.value)} style={inputStyle} /></Field>
        </div>

        <SectionTitle title="Registro terapeutico" />
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: 12 }}>
          <Field label="Diagnostico energetico"><textarea value={form.diagnosticoEnergetico} onChange={(event) => setField("diagnosticoEnergetico", event.target.value)} style={inputStyle} /></Field>
          <Field label="Causas identificadas"><textarea value={form.causasIdentificadas} onChange={(event) => setField("causasIdentificadas", event.target.value)} style={inputStyle} /></Field>
          <Field label="Areas afetadas"><textarea value={form.areasAfetadas} onChange={(event) => setField("areasAfetadas", event.target.value)} style={inputStyle} /></Field>
          <Field label="Intervencoes realizadas"><textarea value={form.intervencoesRealizadas} onChange={(event) => setField("intervencoesRealizadas", event.target.value)} style={inputStyle} /></Field>
          <Field label="Evolucao"><textarea value={form.evolucao} onChange={(event) => setField("evolucao", event.target.value)} style={inputStyle} /></Field>
          <Field label="Observacoes"><textarea value={form.observacoes} onChange={(event) => setField("observacoes", event.target.value)} style={inputStyle} /></Field>
        </div>

        <SectionTitle title="Financeiro e fechamento" />
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr 1fr", gap: 12 }}>
          <Field label="Valor">
            <input value={form.valor} onChange={(event) => setField("valor", event.target.value.replace(/[^\d,.]/g, ""))} style={inputStyle} placeholder="Ex.: 480,00" />
          </Field>
          <Field label="Status do pagamento">
            <select value={form.statusPagamento} onChange={(event) => setField("statusPagamento", event.target.value)} style={inputStyle}>
              {PAYMENT_OPTIONS.map((item) => <option key={item}>{item}</option>)}
            </select>
          </Field>
          <Field label="Dia do processo">
            <input value={form.dataInicio ? getProcessDay(form.dataInicio) : form.diaProcesso} readOnly style={{ ...inputStyle, background: "#f4efe8" }} />
            <div style={{ color: THEME.muted, fontSize: 12, marginTop: 6 }}>Etapa atual: {getStageFromDay(form.dataInicio ? getProcessDay(form.dataInicio) : form.diaProcesso).label}</div>
          </Field>
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
  const generatedSummary = buildFinalSummary(client);

  return (
    <Panel>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800 }}>Devolutiva final</div>
        </div>
        <div style={{ color: THEME.green, fontWeight: 800 }}>{client.statusPagamento === "Pago" ? "Pagamento regularizado" : "Pagamento em aberto"}</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
        <SummaryBlock title="Sintese do processo" text={client.devolutivaFinal || "Ainda sem devolutiva registrada."} />
        <SummaryBlock title="Preview consolidado" text={generatedSummary} />
        <SummaryBlock title="Padroes e causas" text={client.causasIdentificadas || "Sem causas registradas."} />
        <SummaryBlock title="Intervencoes aplicadas" text={client.intervencoesRealizadas || "Sem intervencoes registradas."} />
        <SummaryBlock title="Orientacao final" text={client.proximosPassos || "Sem orientacoes finais definidas."} />
      </div>
    </Panel>
  );
}

function Shell({ children }) {
  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(180deg, #f8f4ee 0%, ${THEME.bg} 56%, #f4ede2 100%)`, color: THEME.text, fontFamily: "'Segoe UI', sans-serif", padding: "24px 14px" }}>
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; background: ${THEME.bg}; }
      `}</style>
      <div style={{ maxWidth: 1220, margin: "0 auto" }}>{children}</div>
    </div>
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

function Panel({ children, style }) {
  return (
    <section style={{ background: "rgba(255,253,249,0.92)", border: `1px solid ${THEME.line}`, borderRadius: 24, padding: 18, boxShadow: THEME.shadow, ...style }}>
      {children}
    </section>
  );
}

function Field({ label, children }) {
  return (
    <label>
      <span style={labelStyle}>{label}</span>
      {children}
    </label>
  );
}

function StatCard({ label, value, tone = "green" }) {
  const color = tone === "terracotta" ? THEME.terracotta : THEME.green;
  const bg = tone === "terracotta" ? THEME.terracottaSoft : THEME.greenSoft;
  return (
    <div style={{ minWidth: 110, padding: "10px 12px", borderRadius: 16, background: bg, color }}>
      <div style={{ fontSize: 20, fontWeight: 800 }}>{value}</div>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8 }}>{label}</div>
    </div>
  );
}

function TabButton({ active, onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ border: `1px solid ${active ? THEME.text : THEME.line}`, background: active ? THEME.text : "#fffdfa", color: active ? "#fff" : THEME.muted, padding: "10px 14px", borderRadius: 999, cursor: "pointer", fontWeight: 700 }}
    >
      {label}
    </button>
  );
}

function PillButton({ active, onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ border: `1px solid ${active ? THEME.green : THEME.line}`, background: active ? THEME.greenSoft : "#fffdfa", color: active ? THEME.green : THEME.muted, borderRadius: 999, padding: "8px 12px", cursor: "pointer", fontWeight: 700, fontSize: 12 }}
    >
      {label}
    </button>
  );
}

function StatusBadge({ status }) {
  const tone = getStatusTone(status);
  return <span style={{ background: tone.bg, color: tone.color, borderRadius: 999, padding: "7px 10px", fontSize: 12, fontWeight: 700 }}>{status}</span>;
}

function MetricTile({ label, value, accent }) {
  return (
    <div style={{ background: "#fffdfa", border: `1px solid ${THEME.line}`, borderRadius: 18, padding: "16px 14px" }}>
      <div style={{ color: accent, fontSize: 22, fontWeight: 800, marginBottom: 4 }}>{value}</div>
      <div style={{ color: THEME.muted, fontSize: 12, textTransform: "uppercase", letterSpacing: 0.7, fontWeight: 700 }}>{label}</div>
    </div>
  );
}

function InfoCard({ label, value }) {
  return (
    <div style={{ border: `1px solid ${THEME.line}`, borderRadius: 16, padding: "13px 14px", background: "#fffdfa" }}>
      <div style={{ ...labelStyle, marginBottom: 4 }}>{label}</div>
      <div style={{ fontWeight: 700 }}>{value}</div>
    </div>
  );
}

function ProgressBar({ value, total }) {
  const percent = Math.max(0, Math.min(100, (value / total) * 100));
  return (
    <div style={{ height: 12, width: "100%", borderRadius: 999, background: "#ebdfd1", overflow: "hidden" }}>
      <div style={{ width: `${percent}%`, height: "100%", borderRadius: 999, background: "linear-gradient(90deg, #b76e4d 0%, #6e7f5f 100%)" }} />
    </div>
  );
}

function ClientListCard({ client, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ border: `1px solid ${active ? THEME.green : THEME.line}`, background: active ? "#f7fbf4" : "#fffdfa", borderRadius: 20, padding: "14px 15px", textAlign: "left", cursor: "pointer", boxShadow: active ? "0 14px 30px rgba(110,127,95,0.12)" : "none" }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
        <div style={{ fontWeight: 800 }}>{client.nome}</div>
        <StatusBadge status={client.status} />
      </div>
      <div style={{ color: THEME.muted, fontSize: 13, marginTop: 6 }}>{client.tipoSessao}</div>
      <div style={{ marginTop: 12 }}>
        <ProgressBar value={client.diaProcesso} total={21} />
      </div>
      <div style={{ color: THEME.muted, fontSize: 12, marginTop: 8 }}>Dia {client.diaProcesso} • {client.etapaAtual.label}</div>
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

function SectionTitle({ title }) {
  return <div style={{ fontSize: 12, fontWeight: 800, color: THEME.terracotta, textTransform: "uppercase", letterSpacing: 1, paddingTop: 4 }}>{title}</div>;
}

export default App;
