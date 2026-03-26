import { useEffect, useMemo, useState } from "react";
import { hasSupabaseEnv } from "./lib/supabase";
import { getCurrentSession, signInWithPassword, signOut } from "./services/auth";
import { deleteClient, listClients, upsertClient } from "./services/clients";

const BRAND = {
  name: "Jaqueline Monteiro",
  subtitle: "Energia Coerente",
};

const MAIN_TABS = [
  { key: "dashboard", label: "Dashboard" },
  { key: "clientes", label: "Clientes" },
  { key: "atendimentos", label: "Atendimentos" },
  { key: "metodos", label: "Metodos" },
  { key: "devolutivas", label: "Devolutivas" },
  { key: "financeiro", label: "Financeiro" },
];

const METHOD_TABS = [
  { key: "overview", label: "Visao geral" },
  { key: "protocolos", label: "Protocolos" },
  { key: "biometros", label: "Biometros" },
  { key: "graficos", label: "Graficos" },
  { key: "fichas", label: "Fichas" },
  { key: "referencias", label: "Referencias" },
];

const SESSION_TYPES = ["Mini Harmonizacao", "Sessao Essencial", "Sessao Profunda"];
const STATUS_OPTIONS = ["Novo contato", "Aguardando inicio", "Em atendimento", "Aguardando devolutiva", "Concluido"];
const PAYMENT_OPTIONS = ["Pendente", "Parcial", "Pago"];
const PROCESS_STAGES = [
  { key: "intake", label: "Acolhimento", days: "Dia 1-3" },
  { key: "diagnosis", label: "Diagnostico", days: "Dia 4-7" },
  { key: "intervention", label: "Intervencoes", days: "Dia 8-17" },
  { key: "closure", label: "Devolutiva", days: "Dia 18-21" },
];

const TGR_PROTOCOLS = [
  { slug: "despertar", nome: "Despertar", resumo: "Leitura e reorganizacao de padroes centrais de expansao e consciencia." },
  { slug: "vitalidade", nome: "Vitalidade", resumo: "Analise e ajuste de disposicao, fluxo vital e sustentacao energetica." },
  { slug: "harmonia", nome: "Harmonia", resumo: "Reequilibrio de campos internos para restaurar estabilidade e coerencia." },
  { slug: "relacoes", nome: "Relacoes", resumo: "Leitura profunda de vinculos, interferencias e padroes relacionais." },
  { slug: "limpeza-protecao", nome: "Limpeza e Protecao", resumo: "Identificacao de sobrecargas, interferencias e camadas de protecao." },
  { slug: "prosperidade", nome: "Prosperidade", resumo: "Mapeamento de bloqueios e organizacao de campos ligados a fluxo e realizacao." },
  { slug: "psicoemocionais", nome: "Psicoemocionais", resumo: "Leitura dos eixos emocionais e mentais envolvidos no processo." },
  { slug: "chakras", nome: "Chakras", resumo: "Observacao da distribuicao energetica e dos centros principais." },
];

const TGR_BIOMETERS = [
  { slug: "numerico", nome: "Biometro Numerico", tema: "Geral" },
  { slug: "tempo", nome: "Biometro de Tempo", tema: "Geral" },
  { slug: "vitalidade", nome: "Biometro de Vitalidade", tema: "Vitalidade" },
  { slug: "limpeza", nome: "Biometro de Limpeza", tema: "Limpeza e Protecao" },
  { slug: "protecao", nome: "Biometro de Protecao", tema: "Limpeza e Protecao" },
  { slug: "chakras", nome: "Biometro de Chakras", tema: "Chakras" },
  { slug: "rel-mental", nome: "Relacionamento - Campo Mental", tema: "Relacoes" },
  { slug: "rel-emocional", nome: "Relacionamento - Campo Emocional", tema: "Relacoes" },
];

const TGR_GRAPHICS = [
  { slug: "despertar", nome: "Graficos de Despertar", tema: "Protocolos TGR" },
  { slug: "harmonia", nome: "Graficos de Harmonia", tema: "Protocolos TGR" },
  { slug: "vitalidade", nome: "Graficos de Vitalidade", tema: "Protocolos TGR" },
  { slug: "relacoes", nome: "Graficos de Relacoes", tema: "Protocolos TGR" },
  { slug: "limpeza-protecao", nome: "Graficos de Limpeza e Protecao", tema: "Protocolos TGR" },
  { slug: "psicoemocionais", nome: "Graficos Psicoemocionais", tema: "Protocolos TGR" },
];

const TGR_FICHAS = [
  { nome: "Ficha Geral TGR", tipo: "Ficha base" },
  { nome: "Ficha de Relacoes", tipo: "Ficha por protocolo" },
  { nome: "Ficha de Limpeza e Protecao", tipo: "Ficha por protocolo" },
  { nome: "Ficha de Prosperidade", tipo: "Ficha por protocolo" },
];

const TGR_REFERENCES = [
  { nome: "Apostilas TGR", tipo: "Referencia de estudo" },
  { nome: "Protocolos completos", tipo: "Referencia operacional" },
  { nome: "Graficos e biometros", tipo: "Ferramentas de consulta" },
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

const RELACOES_BIOMETERS = [
  "Relacionamento - Campo Mental",
  "Relacionamento - Campo Emocional",
  "Tipo de Vinculo",
  "Biometro Numerico",
  "Biometro de Tempo",
];

const RELACOES_GRAPHICS = [
  "Graficos de Relacoes",
  "Graficos de Apoio Relacional",
  "Graficos complementares do TGR",
];

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
  leituraChakras: "",
  observacoesChakras: "",
  leituraGraficos: "",
  sinteseGraficos: "",
  intervencaoIndicada: "",
  orientacaoTerapeutica: "",
  focoProximosDias: "",
  observacoesFinais: "",
  conclusaoAnalitica: "",
};

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
    observacoes: "Cliente responsiva e com boa percepcao do processo.",
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
    observacoes: "Aguardar retorno apos os primeiros 3 dias.",
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

function inferProtocolSlug(client) {
  const text = `${client.queixaPrincipal || ""} ${client.objetivo || ""} ${client.diagnosticoEnergetico || ""}`.toLowerCase();
  if (text.includes("relac")) return "relacoes";
  if (text.includes("protec") || text.includes("limpeza")) return "limpeza-protecao";
  if (text.includes("vital")) return "vitalidade";
  if (text.includes("harmon")) return "harmonia";
  if (text.includes("chakra")) return "chakras";
  return "despertar";
}

function findProtocolName(slug) {
  return TGR_PROTOCOLS.find((item) => item.slug === slug)?.nome || "Despertar";
}

const primaryButtonStyle = {
  border: "none",
  borderRadius: 16,
  background: THEME.text,
  color: "#fff",
  padding: "12px 18px",
  cursor: "pointer",
  fontWeight: 700,
};

const secondaryButtonStyle = {
  border: `1px solid ${THEME.line}`,
  borderRadius: 14,
  background: "#fffdfa",
  color: THEME.text,
  padding: "10px 14px",
  cursor: "pointer",
  fontWeight: 700,
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
  const [activeMethod, setActiveMethod] = useState("tgr");
  const [activeMethodTab, setActiveMethodTab] = useState("overview");
  const [relacoesForm, setRelacoesForm] = useState(emptyRelacoesForm);
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
    const onResize = () => setMobile(window.innerWidth < 920);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const clientsWithProgress = useMemo(
    () =>
      clients.map((client) => {
        const computedDay = client.dataInicio ? getProcessDay(client.dataInicio) : Number(client.diaProcesso || 1);
        return {
          ...client,
          diaProcesso: computedDay,
          etapaAtual: getStageFromDay(computedDay),
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
        diaProcesso: client.diaProcesso,
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
      if (response.mode === "local" && response.all) setClients(response.all);
      else {
        setClients((current) => {
          const exists = current.some((item) => item.id === record.id);
          if (exists) return current.map((item) => (item.id === record.id ? record : item));
          return [record, ...current];
        });
      }
      setSelectedId(record.id);
      setDraftClient({ ...emptyClient, id: generateId() });
      setMainTab("clientes");
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

  function handleTabChange(nextTab) {
    if (nextTab === "metodos") {
      setActiveMethod("tgr");
      setActiveMethodTab("overview");
    }
    setMainTab(nextTab);
  }

  function openRelacoesForClient(client) {
    if (!client) return;
    setActiveMethod("tgr");
    setActiveMethodTab("protocolos");
    setRelacoesContext({
      clientId: client.id,
      clientName: client.nome,
      protocolName: findProtocolName(client.protocolSlug),
    });
    setRelacoesForm((current) => ({
      ...current,
      objetivoLeitura: current.objetivoLeitura || client.objetivo || "",
      observacaoInicial: current.observacaoInicial || client.queixaPrincipal || "",
      conclusaoAnalitica: current.conclusaoAnalitica || client.diagnosticoEnergetico || "",
    }));
    setMainTab("metodos");
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
        <TopMetrics metrics={metrics} mobile={mobile} />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16, marginBottom: 18 }}>
          {MAIN_TABS.map((tab) => (
            <TabButton key={tab.key} active={mainTab === tab.key} onClick={() => handleTabChange(tab.key)} label={tab.label} />
          ))}
        </div>
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
          search={search}
          setSearch={setSearch}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          setSelectedId={setSelectedId}
          saveClient={saveClient}
          removeClient={removeClient}
          saving={saving}
          activeMethod={activeMethod}
          setActiveMethod={setActiveMethod}
          activeMethodTab={activeMethodTab}
          setActiveMethodTab={setActiveMethodTab}
          relacoesForm={relacoesForm}
          setRelacoesForm={setRelacoesForm}
          relacoesContext={relacoesContext}
          setMainTab={setMainTab}
          openRelacoesForClient={openRelacoesForClient}
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
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    setSelectedId,
    saveClient,
    removeClient,
    saving,
    activeMethod,
    setActiveMethod,
    activeMethodTab,
    setActiveMethodTab,
    relacoesForm,
    setRelacoesForm,
    relacoesContext,
    setMainTab,
    openRelacoesForClient,
  } = props;

  if (mainTab === "dashboard") {
    return (
      <DashboardView
        clients={clients}
        appointments={appointments}
        metrics={metrics}
        mobile={mobile}
        onOpenClient={(id) => {
          setSelectedId(id);
          setMainTab("clientes");
        }}
        onOpenMethod={() => setMainTab("metodos")}
      />
    );
  }

  if (mainTab === "clientes") {
    return (
      <ClientsView
        clients={filteredClients}
        selectedClient={selectedClient}
        search={search}
        setSearch={setSearch}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        setSelectedId={setSelectedId}
        saveClient={saveClient}
        removeClient={removeClient}
        saving={saving}
        mobile={mobile}
        openRelacoesForClient={openRelacoesForClient}
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
        activeMethodTab={activeMethodTab}
        setActiveMethodTab={setActiveMethodTab}
        relacoesForm={relacoesForm}
        setRelacoesForm={setRelacoesForm}
        relacoesContext={relacoesContext}
        appointments={appointments}
        mobile={mobile}
      />
    );
  }

  if (mainTab === "devolutivas") return <FeedbacksView clients={clients} mobile={mobile} />;
  return <FinancialView clients={clients} mobile={mobile} />;
}

function Header({ user, onLogout, mobile }) {
  return (
    <header style={{ borderBottom: `1px solid ${THEME.line}`, background: "rgba(251,247,241,0.92)", backdropFilter: "blur(10px)", position: "sticky", top: 0, zIndex: 5 }}>
      <div style={{ maxWidth: 1220, margin: "0 auto", padding: mobile ? "14px 14px" : "18px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: mobile ? 22 : 28, fontWeight: 800, letterSpacing: 0.2 }}>{BRAND.name}</div>
            <div style={{ color: THEME.terracotta, fontSize: 13, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase" }}>{BRAND.subtitle}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ color: THEME.muted, fontSize: 13 }}>{user?.email}</span>
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

function DashboardView({ clients, appointments, metrics, mobile, onOpenClient, onOpenMethod }) {
  const highlighted = appointments.slice().sort((a, b) => a.diaProcesso - b.diaProcesso).slice(0, 4);

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <section style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1.05fr 0.95fr", gap: 18 }}>
        <Panel>
          <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 14 }}>Visao geral</div>
          <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: 12 }}>
            <ActionTile title="Clientes" text={`${clients.length} clientes cadastrados`} />
            <ActionTile title="Atendimentos" text={`${appointments.length} atendimentos registrados`} />
            <ActionTile title="Pendencias" text={`${metrics.pendingFeedback} aguardando devolutiva`} />
            <ActionTile title="Metodo ativo" text="TGR estruturado como primeiro metodo" />
          </div>
        </Panel>

        <Panel>
          <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 14 }}>Metodos</div>
          <button type="button" onClick={onOpenMethod} style={{ ...secondaryButtonStyle, width: "100%", justifyContent: "space-between", display: "flex", padding: "14px 16px" }}>
            <span>TGR</span>
            <span style={{ color: THEME.muted }}>Protocolos, Biometros e Graficos</span>
          </button>
        </Panel>
      </section>

      <section style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: 18 }}>
        <Panel>
          <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 14 }}>Processo de 21 dias</div>
          <div style={{ display: "grid", gap: 10 }}>
            {PROCESS_STAGES.map((stage, index) => (
              <div key={stage.key} style={{ display: "grid", gridTemplateColumns: "42px 1fr auto", gap: 12, alignItems: "center", border: `1px solid ${THEME.line}`, borderRadius: 16, padding: "12px 14px", background: index % 2 === 0 ? THEME.panel : "#fffdfa" }}>
                <div style={{ width: 42, height: 42, borderRadius: 14, background: stage.key === "intervention" ? THEME.greenSoft : THEME.terracottaSoft, color: stage.key === "intervention" ? THEME.green : THEME.terracotta, display: "grid", placeItems: "center", fontWeight: 800 }}>{index + 1}</div>
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
            {highlighted.length ? highlighted.map((appointment) => (
              <button key={appointment.id} type="button" onClick={() => onOpenClient(appointment.clientId)} style={{ border: `1px solid ${THEME.line}`, background: "#fffdfa", borderRadius: 18, padding: "14px 16px", textAlign: "left", cursor: "pointer" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 800 }}>{appointment.title}</div>
                    <div style={{ color: THEME.muted, fontSize: 13 }}>{findProtocolName(appointment.protocolSlug)} - TGR</div>
                  </div>
                  <StatusBadge status={appointment.status} />
                </div>
                <div style={{ marginTop: 12 }}><ProgressBar value={appointment.diaProcesso} total={21} /></div>
              </button>
            )) : <div style={{ color: THEME.muted }}>Nenhum atendimento em destaque.</div>}
          </div>
        </Panel>
      </section>
    </div>
  );
}

function ClientsView({ clients, selectedClient, search, setSearch, statusFilter, setStatusFilter, setSelectedId, saveClient, removeClient, saving, mobile, openRelacoesForClient }) {
  return (
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
        <ClientRecord client={selectedClient || { ...emptyClient, id: generateId() }} onSave={saveClient} mobile={mobile} saving={saving} />
        {selectedClient ? (
          <>
            <ClientHeader client={selectedClient} onDelete={removeClient} onOpenRelacoes={() => openRelacoesForClient(selectedClient)} />
            <ClientJourney client={selectedClient} mobile={mobile} />
            <FinalFeedback client={selectedClient} />
          </>
        ) : null}
      </section>
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
                  <div style={{ fontWeight: 700 }}>TGR - {findProtocolName(appointment.protocolSlug)}</div>
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

function MethodsView({ activeMethod, setActiveMethod, activeMethodTab, setActiveMethodTab, relacoesForm, setRelacoesForm, relacoesContext, appointments, mobile }) {
  const methodCards = [{ slug: "tgr", nome: "TGR", resumo: "Metodo principal com protocolos, biometros, graficos e fichas." }];
  const tgrAppointmentCount = appointments.filter((appointment) => appointment.methodSlug === "tgr").length;

  return (
    <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "260px minmax(0, 1fr)", gap: 18 }}>
      <aside style={{ display: "grid", gap: 14, alignSelf: "start" }}>
        <Panel>
          <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>Metodos</div>
          <div style={{ display: "grid", gap: 10 }}>
            {methodCards.map((method) => (
              <button key={method.slug} type="button" onClick={() => setActiveMethod(method.slug)} style={{ border: `1px solid ${activeMethod === method.slug ? THEME.green : THEME.line}`, background: activeMethod === method.slug ? "#f7fbf4" : "#fffdfa", borderRadius: 18, padding: "14px 16px", textAlign: "left", cursor: "pointer" }}>
                <div style={{ fontWeight: 800, marginBottom: 4 }}>{method.nome}</div>
                <div style={{ color: THEME.muted, fontSize: 13 }}>{method.resumo}</div>
              </button>
            ))}
          </div>
        </Panel>
      </aside>

      <section style={{ display: "grid", gap: 18 }}>
        <Panel>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>TGR</div>
              <div style={{ color: THEME.muted }}>Estrutura modular para protocolos, biometros, graficos, fichas e referencias.</div>
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
        {activeMethodTab === "protocolos" && <TgrProtocolsView mobile={mobile} relacoesForm={relacoesForm} setRelacoesForm={setRelacoesForm} relacoesContext={relacoesContext} />}
        {activeMethodTab === "biometros" && <MethodCatalog title="Biometros TGR" items={TGR_BIOMETERS} mobile={mobile} />}
        {activeMethodTab === "graficos" && <MethodCatalog title="Graficos TGR" items={TGR_GRAPHICS} mobile={mobile} />}
        {activeMethodTab === "fichas" && <MethodCatalog title="Fichas TGR" items={TGR_FICHAS} mobile={mobile} />}
        {activeMethodTab === "referencias" && <MethodCatalog title="Referencias TGR" items={TGR_REFERENCES} mobile={mobile} />}
      </section>
    </div>
  );
}

function MethodOverview({ appointments, mobile }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "repeat(3, 1fr)", gap: 18 }}>
      <Panel>
        <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 12 }}>Protocolos</div>
        <div style={{ color: THEME.muted, lineHeight: 1.65 }}>Cada protocolo deve ser modelado com objetivo, etapas, campos de leitura, graficos relacionados e biometros de apoio.</div>
      </Panel>
      <Panel>
        <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 12 }}>Ferramentas</div>
        <div style={{ color: THEME.muted, lineHeight: 1.65 }}>Biometros e graficos ficam organizados como ferramentas do metodo, e nao como menus soltos do sistema inteiro.</div>
      </Panel>
      <Panel>
        <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 12 }}>Uso atual</div>
        <div style={{ color: THEME.muted, lineHeight: 1.65 }}>{appointments.length} atendimentos estao prontos para consumir o TGR como metodo principal.</div>
      </Panel>
    </div>
  );
}

function TgrProtocolsView({ mobile, relacoesForm, setRelacoesForm, relacoesContext }) {
  return (
    <div style={{ display: "grid", gap: 18 }}>
      <MethodCatalog title="Protocolos TGR" items={TGR_PROTOCOLS} mobile={mobile} />
      <RelacoesProtocolView mobile={mobile} form={relacoesForm} setForm={setRelacoesForm} context={relacoesContext} />
    </div>
  );
}

function RelacoesProtocolView({ mobile, form, setForm, context }) {
  function setField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function toggleChakra(key, chakra) {
    setForm((current) => {
      const values = current[key];
      const exists = values.includes(chakra);
      return {
        ...current,
        [key]: exists ? values.filter((item) => item !== chakra) : [...values, chakra],
      };
    });
  }

  return (
    <Panel>
      <div style={{ display: "grid", gap: 18 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Relacoes</div>
          <div style={{ color: THEME.muted, lineHeight: 1.65 }}>
            Primeiro protocolo operacional do TGR dentro do sistema, com leitura de vinculo, campos mental e emocional, e bloco transversal de chakras.
          </div>
        </div>

        {context ? (
          <div style={{ border: `1px solid ${THEME.green}`, background: "#f7fbf4", borderRadius: 18, padding: "14px 16px", display: "grid", gap: 4 }}>
            <div style={{ fontWeight: 800 }}>Atendimento vinculado</div>
            <div style={{ color: THEME.muted }}>{context.clientName}</div>
            <div style={{ color: THEME.muted, fontSize: 13 }}>Protocolo atual do atendimento: {context.protocolName}</div>
          </div>
        ) : null}

        <SectionTitle title="Cabecalho da leitura" />
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: 12 }}>
          <Field label="Tipo de relacao">
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
          <Field label="Observacao inicial">
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
          <Field label="Tipo de vinculo">
            <textarea value={form.tipoVinculoResultado} onChange={(event) => setField("tipoVinculoResultado", event.target.value)} style={inputStyle} />
          </Field>
          <Field label="Interferencias identificadas">
            <textarea value={form.interferenciasIdentificadas} onChange={(event) => setField("interferenciasIdentificadas", event.target.value)} style={inputStyle} />
          </Field>
          <Field label="Padrao relacional">
            <textarea value={form.padraoRelacional} onChange={(event) => setField("padraoRelacional", event.target.value)} style={inputStyle} />
          </Field>
          <Field label="Nivel de harmonia relacional">
            <textarea value={form.nivelHarmoniaRelacional} onChange={(event) => setField("nivelHarmoniaRelacional", event.target.value)} style={inputStyle} />
          </Field>
        </div>

        <SectionTitle title="Chakras" />
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: 18 }}>
          <div>
            <div style={{ ...labelStyle, marginBottom: 8 }}>Em harmonia</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {CHAKRA_OPTIONS.map((chakra) => (
                <PillButton key={`h-${chakra}`} active={form.chakrasEmHarmonia.includes(chakra)} onClick={() => toggleChakra("chakrasEmHarmonia", chakra)} label={chakra} />
              ))}
            </div>
          </div>
          <div>
            <div style={{ ...labelStyle, marginBottom: 8 }}>Em desequilibrio</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {CHAKRA_OPTIONS.map((chakra) => (
                <PillButton key={`d-${chakra}`} active={form.chakrasEmDesequilibrio.includes(chakra)} onClick={() => toggleChakra("chakrasEmDesequilibrio", chakra)} label={chakra} />
              ))}
            </div>
          </div>
          <Field label="Leitura dos chakras">
            <textarea value={form.leituraChakras} onChange={(event) => setField("leituraChakras", event.target.value)} style={inputStyle} />
          </Field>
          <Field label="Observacoes dos chakras">
            <textarea value={form.observacoesChakras} onChange={(event) => setField("observacoesChakras", event.target.value)} style={inputStyle} />
          </Field>
        </div>

        <SectionTitle title="Ferramentas relacionadas" />
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: 18 }}>
          <ToolListCard title="Biometros relacionados" items={RELACOES_BIOMETERS} />
          <ToolListCard title="Graficos relacionados" items={RELACOES_GRAPHICS} />
        </div>

        <SectionTitle title="Sintese e conduta" />
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: 12 }}>
          <Field label="Leitura dos graficos">
            <textarea value={form.leituraGraficos} onChange={(event) => setField("leituraGraficos", event.target.value)} style={inputStyle} />
          </Field>
          <Field label="Sintese dos graficos">
            <textarea value={form.sinteseGraficos} onChange={(event) => setField("sinteseGraficos", event.target.value)} style={inputStyle} />
          </Field>
          <Field label="Intervencao indicada">
            <textarea value={form.intervencaoIndicada} onChange={(event) => setField("intervencaoIndicada", event.target.value)} style={inputStyle} />
          </Field>
          <Field label="Orientacao terapeutica">
            <textarea value={form.orientacaoTerapeutica} onChange={(event) => setField("orientacaoTerapeutica", event.target.value)} style={inputStyle} />
          </Field>
          <Field label="Foco dos proximos dias">
            <textarea value={form.focoProximosDias} onChange={(event) => setField("focoProximosDias", event.target.value)} style={inputStyle} />
          </Field>
          <Field label="Conclusao analitica">
            <textarea value={form.conclusaoAnalitica} onChange={(event) => setField("conclusaoAnalitica", event.target.value)} style={inputStyle} />
          </Field>
          <Field label="Observacoes finais">
            <textarea value={form.observacoesFinais} onChange={(event) => setField("observacoesFinais", event.target.value)} style={inputStyle} />
          </Field>
        </div>
      </div>
    </Panel>
  );
}

function ToolListCard({ title, items }) {
  return (
    <div style={{ border: `1px solid ${THEME.line}`, background: "#fffdfa", borderRadius: 18, padding: "14px 16px" }}>
      <div style={{ fontWeight: 800, marginBottom: 10 }}>{title}</div>
      <div style={{ display: "grid", gap: 8 }}>
        {items.map((item) => (
          <div key={item} style={{ color: THEME.muted }}>{item}</div>
        ))}
      </div>
    </div>
  );
}

function MethodCatalog({ title, items, mobile }) {
  return (
    <Panel>
      <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 14 }}>{title}</div>
      <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: 12 }}>
        {items.map((item) => (
          <div key={item.slug || item.nome} style={{ border: `1px solid ${THEME.line}`, background: "#fffdfa", borderRadius: 18, padding: "14px 16px" }}>
            <div style={{ fontWeight: 800, marginBottom: 6 }}>{item.nome}</div>
            <div style={{ color: THEME.muted, lineHeight: 1.6 }}>{item.resumo || item.tema || item.tipo}</div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function FeedbacksView({ clients, mobile }) {
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
                <div style={{ color: THEME.muted, fontSize: 13 }}>{findProtocolName(client.protocolSlug)} - TGR</div>
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

function ClientHeader({ client, onDelete, onOpenRelacoes }) {
  return (
    <Panel>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontSize: 24, fontWeight: 800 }}>{client.nome}</div>
            <StatusBadge status={client.status} />
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, color: THEME.muted, fontSize: 14 }}>
            <span>{client.whatsapp || "Contato nao informado"}</span>
            <span>{client.email || "Sem email"}</span>
            <span>TGR - {findProtocolName(client.protocolSlug)}</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button type="button" onClick={onOpenRelacoes} style={secondaryButtonStyle}>Abrir em Relacoes</button>
          <button type="button" onClick={() => onDelete(client.id)} style={{ ...secondaryButtonStyle, color: "#8a4f38", background: "#fff7f4" }}>Remover</button>
        </div>
      </div>
    </Panel>
  );
}

function ClientJourney({ client, mobile }) {
  return (
    <Panel>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap", marginBottom: 14 }}>
        <div style={{ fontSize: 18, fontWeight: 800 }}>Timeline do atendimento</div>
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
      <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "repeat(4, 1fr)", gap: 12, marginTop: 16 }}>
        <InfoCard label="Metodo" value="TGR" />
        <InfoCard label="Protocolo" value={findProtocolName(client.protocolSlug)} />
        <InfoCard label="Etapa atual" value={client.etapaAtual.label} />
        <InfoCard label="Pagamento" value={client.statusPagamento} />
      </div>
    </Panel>
  );
}

function ClientRecord({ client, onSave, mobile, saving = false }) {
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
    if (!form.nome.trim()) return setFormError("Informe o nome da cliente para salvar o atendimento.");
    if (!form.whatsapp.trim()) return setFormError("Informe o WhatsApp principal para manter o contato organizado.");
    if (!form.dataInicio) return setFormError("Defina a data de inicio para calcular corretamente o processo de 21 dias.");
    setFormError("");
    onSave({ ...form, id: form.id || generateId() });
  }

  return (
    <Panel>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ fontSize: 18, fontWeight: 800 }}>Ficha do atendimento</div>
          <button type="submit" disabled={saving} style={{ ...primaryButtonStyle, opacity: saving ? 0.7 : 1, cursor: saving ? "wait" : "pointer" }}>{saving ? "Salvando..." : "Salvar"}</button>
        </div>
        {formError ? <div style={{ border: `1px solid ${THEME.terracotta}`, background: "#fff5f1", borderRadius: 16, padding: "12px 14px", color: "#8a4f38", fontWeight: 700 }}>{formError}</div> : null}
        <SectionTitle title="Cliente e metodo" />
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: 12 }}>
          <Field label="Nome"><input value={form.nome} onChange={(event) => setField("nome", event.target.value)} style={inputStyle} /></Field>
          <Field label="WhatsApp"><input value={form.whatsapp} onChange={(event) => setField("whatsapp", event.target.value)} style={inputStyle} /></Field>
          <Field label="Email"><input value={form.email} onChange={(event) => setField("email", event.target.value)} style={inputStyle} /></Field>
          <Field label="Data de inicio"><input type="date" value={form.dataInicio} onChange={(event) => setField("dataInicio", event.target.value)} style={inputStyle} /></Field>
          <Field label="Metodo"><input value="TGR" readOnly style={{ ...inputStyle, background: "#f4efe8" }} /></Field>
          <Field label="Protocolo TGR">
            <select value={form.tipoSessao} onChange={(event) => setField("tipoSessao", event.target.value)} style={inputStyle}>{SESSION_TYPES.map((item) => <option key={item}>{item}</option>)}</select>
            <div style={{ color: THEME.muted, fontSize: 12, marginTop: 6, lineHeight: 1.5 }}>{SESSION_DETAILS[form.tipoSessao]}</div>
          </Field>
        </div>
        <SectionTitle title="Direcao do atendimento" />
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: 12 }}>
          <Field label="Status"><select value={form.status} onChange={(event) => setField("status", event.target.value)} style={inputStyle}>{STATUS_OPTIONS.map((item) => <option key={item}>{item}</option>)}</select></Field>
          <Field label="Dia do processo"><input value={form.dataInicio ? getProcessDay(form.dataInicio) : form.diaProcesso} readOnly style={{ ...inputStyle, background: "#f4efe8" }} /></Field>
          <Field label="Queixa principal"><textarea value={form.queixaPrincipal} onChange={(event) => setField("queixaPrincipal", event.target.value)} style={inputStyle} /></Field>
          <Field label="Objetivo"><textarea value={form.objetivo} onChange={(event) => setField("objetivo", event.target.value)} style={inputStyle} /></Field>
        </div>
        <SectionTitle title="Leitura e intervencao" />
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: 12 }}>
          <Field label="Diagnostico energetico"><textarea value={form.diagnosticoEnergetico} onChange={(event) => setField("diagnosticoEnergetico", event.target.value)} style={inputStyle} /></Field>
          <Field label="Causas identificadas"><textarea value={form.causasIdentificadas} onChange={(event) => setField("causasIdentificadas", event.target.value)} style={inputStyle} /></Field>
          <Field label="Areas afetadas"><textarea value={form.areasAfetadas} onChange={(event) => setField("areasAfetadas", event.target.value)} style={inputStyle} /></Field>
          <Field label="Intervencoes realizadas"><textarea value={form.intervencoesRealizadas} onChange={(event) => setField("intervencoesRealizadas", event.target.value)} style={inputStyle} /></Field>
          <Field label="Evolucao"><textarea value={form.evolucao} onChange={(event) => setField("evolucao", event.target.value)} style={inputStyle} /></Field>
          <Field label="Observacoes"><textarea value={form.observacoes} onChange={(event) => setField("observacoes", event.target.value)} style={inputStyle} /></Field>
        </div>
        <SectionTitle title="Financeiro e devolutiva" />
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr 1fr", gap: 12 }}>
          <Field label="Valor"><input value={form.valor} onChange={(event) => setField("valor", event.target.value.replace(/[^\d,.]/g, ""))} style={inputStyle} placeholder="Ex.: 480,00" /></Field>
          <Field label="Status do pagamento"><select value={form.statusPagamento} onChange={(event) => setField("statusPagamento", event.target.value)} style={inputStyle}>{PAYMENT_OPTIONS.map((item) => <option key={item}>{item}</option>)}</select></Field>
          <Field label="Etapa atual"><input value={getStageFromDay(form.dataInicio ? getProcessDay(form.dataInicio) : form.diaProcesso).label} readOnly style={{ ...inputStyle, background: "#f4efe8" }} /></Field>
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
        <div style={{ fontSize: 18, fontWeight: 800 }}>Devolutiva final</div>
        <div style={{ color: THEME.green, fontWeight: 800 }}>{client.statusPagamento === "Pago" ? "Pagamento regularizado" : "Pagamento em aberto"}</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
        <SummaryBlock title="Sintese do processo" text={client.devolutivaFinal || "Ainda sem devolutiva registrada."} />
        <SummaryBlock title="Texto consolidado" text={generatedSummary} />
        <SummaryBlock title="Padroes e causas" text={client.causasIdentificadas || "Sem causas registradas."} />
        <SummaryBlock title="Intervencoes aplicadas" text={client.intervencoesRealizadas || "Sem intervencoes registradas."} />
        <SummaryBlock title="Orientacao final" text={client.proximosPassos || "Sem orientacoes finais definidas."} />
      </div>
    </Panel>
  );
}

function FeedbackCard({ client }) {
  return (
    <div style={{ border: `1px solid ${THEME.line}`, borderRadius: 18, background: "#fffdfa", padding: "14px 16px" }}>
      <div style={{ fontWeight: 800, marginBottom: 4 }}>{client.nome}</div>
      <div style={{ color: THEME.muted, fontSize: 13 }}>{findProtocolName(client.protocolSlug)} - TGR</div>
    </div>
  );
}

function Shell({ children }) {
  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(180deg, #f8f4ee 0%, ${THEME.bg} 56%, #f4ede2 100%)`, color: THEME.text, fontFamily: "'Segoe UI', sans-serif" }}>
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; background: ${THEME.bg}; }
        button, input, textarea, select { font: inherit; }
        textarea { min-height: 108px; resize: vertical; }
      `}</style>
      {children}
    </div>
  );
}

function Panel({ children, style }) {
  return <section style={{ background: "rgba(255,253,249,0.92)", border: `1px solid ${THEME.line}`, borderRadius: 24, padding: 18, boxShadow: THEME.shadow, ...style }}>{children}</section>;
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
  return <button type="button" onClick={onClick} style={{ border: `1px solid ${active ? THEME.text : THEME.line}`, background: active ? THEME.text : "#fffdfa", color: active ? "#fff" : THEME.muted, padding: "10px 14px", borderRadius: 999, cursor: "pointer", fontWeight: 700 }}>{label}</button>;
}

function PillButton({ active, onClick, label }) {
  return <button type="button" onClick={onClick} style={{ border: `1px solid ${active ? THEME.green : THEME.line}`, background: active ? THEME.greenSoft : "#fffdfa", color: active ? THEME.green : THEME.muted, borderRadius: 999, padding: "8px 12px", cursor: "pointer", fontWeight: 700, fontSize: 12 }}>{label}</button>;
}

function MetricTile({ label, value, accent }) {
  return (
    <div style={{ background: "#fffdfa", border: `1px solid ${THEME.line}`, borderRadius: 18, padding: "16px 14px" }}>
      <div style={{ color: accent, fontSize: 22, fontWeight: 800, marginBottom: 4 }}>{value}</div>
      <div style={{ color: THEME.muted, fontSize: 12, textTransform: "uppercase", letterSpacing: 0.7, fontWeight: 700 }}>{label}</div>
    </div>
  );
}

function StatusBadge({ status }) {
  const tone = getStatusTone(status);
  return <span style={{ background: tone.bg, color: tone.color, borderRadius: 999, padding: "7px 10px", fontSize: 12, fontWeight: 700 }}>{status}</span>;
}

function ProgressBar({ value, total }) {
  const percent = Math.max(0, Math.min(100, (value / total) * 100));
  return (
    <div style={{ height: 12, width: "100%", borderRadius: 999, background: "#ebdfd1", overflow: "hidden" }}>
      <div style={{ width: `${percent}%`, height: "100%", borderRadius: 999, background: "linear-gradient(90deg, #b76e4d 0%, #6e7f5f 100%)" }} />
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

function ClientListCard({ client, active, onClick }) {
  return (
    <button type="button" onClick={onClick} style={{ border: `1px solid ${active ? THEME.green : THEME.line}`, background: active ? "#f7fbf4" : "#fffdfa", borderRadius: 20, padding: "14px 15px", textAlign: "left", cursor: "pointer", boxShadow: active ? "0 14px 30px rgba(110,127,95,0.12)" : "none" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
        <div style={{ fontWeight: 800 }}>{client.nome}</div>
        <StatusBadge status={client.status} />
      </div>
      <div style={{ color: THEME.muted, fontSize: 13, marginTop: 6 }}>TGR - {findProtocolName(client.protocolSlug)}</div>
      <div style={{ marginTop: 12 }}><ProgressBar value={client.diaProcesso} total={21} /></div>
      <div style={{ color: THEME.muted, fontSize: 12, marginTop: 8 }}>Dia {client.diaProcesso} - {client.etapaAtual.label}</div>
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
