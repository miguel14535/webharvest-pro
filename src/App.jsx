import { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard, FileSearch, Activity, FileBarChart2,
  Settings, LogOut, Database, Monitor, ShieldCheck, User,
  Eye, Trash2, RefreshCcw, Rocket, Zap, TrendingUp,
  ExternalLink, FileText, Sheet, Braces, Plus, Radio,
  Clock, ChevronRight,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";
import toast, { Toaster } from "react-hot-toast";
import api from "./services/api";
import "./App.css";

const API_ROOT = "https://webharvest-pro.onrender.com";

const NAV = [
  { icon: LayoutDashboard, label: "Painel",        key: "painel"        },
  { icon: FileSearch,      label: "Extrações",      key: "extracoes"     },
  { icon: Activity,        label: "Monitoramento",  key: "monitoramento" },
  { icon: FileBarChart2,   label: "Relatórios",     key: "relatorios"    },
  { icon: Settings,        label: "Configurações",  key: "config"        },
];

const CustomTooltip = ({ active, payload, label }) =>
  active && payload?.length ? (
    <div className="ct">
      <span className="ct-label">{label}</span>
      <span className="ct-val">{payload[0].value} extrações</span>
    </div>
  ) : null;

export default function App() {
  const [url, setUrl]             = useState("");
  const [monitorUrl, setMonitorUrl] = useState("");
  const [history, setHistory]     = useState([]);
  const [monitors, setMonitors]   = useState([]);
  const [loading, setLoading]     = useState(false);
  const [activeNav, setActiveNav] = useState("painel");

  async function fetchHistory() {
    try { const r = await api.get("/scraper/history"); setHistory(r.data); }
    catch { toast.error("Erro ao carregar histórico"); }
  }
  async function fetchMonitors() {
    try { const r = await api.get("/api/monitor/list"); setMonitors(r.data); }
    catch { toast.error("Erro ao carregar monitores"); }
  }

  useEffect(() => { fetchHistory(); fetchMonitors(); }, []);

  async function handleScrape() {
    if (!url.trim()) { toast.error("Digite uma URL"); return; }
    try {
      setLoading(true);
      let u = url;
      if (!u.startsWith("http")) u = `https://${u}`;
      await api.get(`/scraper/scrape?url=${encodeURIComponent(u)}`);
      toast.success("Extração realizada!");
      setUrl("");
      fetchHistory();
    } catch { toast.error("Erro ao extrair site"); }
    finally { setLoading(false); }
  }

  async function addMonitor() {
    if (!monitorUrl.trim()) { toast.error("Digite uma URL"); return; }
    try {
      let u = monitorUrl;
      if (!u.startsWith("http")) u = `https://${u}`;
      await api.post(`/api/monitor/add?url=${encodeURIComponent(u)}`);
      toast.success("Monitor criado");
      setMonitorUrl("");
      fetchMonitors();
    } catch { toast.error("Erro ao criar monitor"); }
  }

  async function deleteItem(id) {
    try { await api.delete(`/scraper/history/${id}`); toast.success("Removido"); fetchHistory(); }
    catch { toast.error("Erro ao remover"); }
  }

  async function clearHistory() {
    if (!window.confirm("Limpar histórico?")) return;
    try { await api.delete("/scraper/history"); toast.success("Histórico limpo"); fetchHistory(); }
    catch { toast.error("Erro ao limpar"); }
  }

  const chartData = useMemo(() =>
    history.slice(0, 8).reverse().map((item, i) => ({
      name: `#${item.id}`, extrações: i + 3,
    })), [history]);

  return (
    <div className="shell">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#0f1629",
            color: "#e2e8f0",
            border: "1px solid rgba(124,58,237,0.3)",
            borderRadius: "12px",
            fontSize: "13px",
          },
        }}
      />

      {/* ═══ SIDEBAR ═══════════════════════════════════ */}
      <aside className="sidebar">
        {/* Brand */}
        <div className="brand">
          <div className="brand-mark">
            <Rocket size={20} strokeWidth={2.5} />
          </div>
          <div className="brand-text">
            <span className="brand-name">WebHarvest</span>
            <span className="brand-sub">Inteligência de Extração</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="nav">
          {NAV.map(({ icon: Icon, label, key }) => (
            <button
              key={key}
              className={`nav-btn ${activeNav === key ? "nav-active" : ""}`}
              onClick={() => setActiveNav(key)}
            >
              <Icon size={17} strokeWidth={2} />
              <span>{label}</span>
              {activeNav === key && <span className="nav-pip" />}
            </button>
          ))}
        </nav>

        {/* User */}
        <div className="sidebar-user">
          <div className="su-avatar">M</div>
          <div className="su-info">
            <span className="su-name">Miguel</span>
            <span className="su-email">migueldhein50@gmail.com</span>
            <span className="su-jwt">
              <span className="jwt-dot" />JWT ativo
            </span>
          </div>
        </div>

        <button className="btn-logout" onClick={() => toast("Saindo…")}>
          <LogOut size={15} />Sair
        </button>
      </aside>

      {/* ═══ MAIN ══════════════════════════════════════ */}
      <main className="main">

        {/* ── HERO ─────────────────────────────────── */}
        <header className="hero">
          <div className="hero-bg" />
          <div className="hero-content">
            <span className="hero-eyebrow">
              <Zap size={11} /> WEBHARVEST PRO
            </span>
            <h1 className="hero-title">
              Painel inteligente<br />de raspagem
            </h1>
            <p className="hero-sub">
              Automatize extrações, gere relatórios, monitore sites
              e visualize resultados em tempo real.
            </p>
          </div>
          <div className="api-pill">
            <span className="api-dot" />
            <div>
              <span className="api-label">API Online</span>
              <span className="api-sub">FastAPI operacional</span>
            </div>
          </div>
        </header>

        {/* ── STATS ────────────────────────────────── */}
        <div className="stats-row">
          {[
            { icon: Database,    cls:"purple", label:"RASPAGENS",   val: history.length,  sub:"registros salvos"   },
            { icon: Monitor,     cls:"blue",   label:"MONITORES",   val: monitors.length, sub:"sites acompanhados" },
            { icon: ShieldCheck, cls:"green",  label:"STATUS",      val: "On-line",       sub:"API operacional", green: true },
            { icon: User,        cls:"violet", label:"USUÁRIO",     val: "migueldhein50", sub:"@gmail.com", small: true },
          ].map(({ icon: Icon, cls, label, val, sub, green, small }) => (
            <div className="stat-card" key={label}>
              <div className={`stat-icon si-${cls}`}><Icon size={20} /></div>
              <div className="stat-body">
                <span className="stat-label">{label}</span>
                <strong className={`stat-val ${green ? "sv-green" : ""} ${small ? "sv-small" : ""}`}>{val}</strong>
                <span className="stat-sub">{sub}</span>
                {label === "USUÁRIO" && (
                  <span className="stat-jwt"><span className="jwt-dot blue" />JWT ativo</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ── MIDDLE GRID ──────────────────────────── */}
        <div className="mid-grid">

          {/* Chart */}
          <div className="card card-chart">
            <div className="card-hd">
              <div className="card-title">
                <TrendingUp size={16} className="ic-purple" />Análises
              </div>
              <span className="pill pill-purple">Tempo real</span>
            </div>
            <p className="card-desc">Últimas raspagens realizadas</p>
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
                  <defs>
                    <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#7c3aed" stopOpacity={0.55} />
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill:"#475569", fontSize:11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill:"#475569", fontSize:11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone" dataKey="extrações"
                    stroke="#8b5cf6" strokeWidth={2.5}
                    fill="url(#grad)"
                    dot={{ fill:"#8b5cf6", r:4, stroke:"#030712", strokeWidth:2 }}
                    activeDot={{ r:6, fill:"#c084fc", stroke:"#030712", strokeWidth:2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Nova Extração */}
          <div className="card">
            <div className="card-hd">
              <div className="card-title">
                <Rocket size={16} className="ic-purple" />Nova extração
              </div>
            </div>
            <p className="card-desc">Capture título, descrição, links e captura de tela.</p>
            <div className="field-row">
              <input
                className="field"
                placeholder="https://github.com"
                value={url}
                onChange={e => setUrl(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleScrape()}
              />
              <button className="btn-exec" onClick={handleScrape} disabled={loading}>
                {loading ? <span className="spin" /> : <Plus size={15} />}
                {loading ? "Extraindo…" : "Executar"}
              </button>
            </div>
            <div className="preview-block">
              <Eye size={18} className="ic-cyan" />
              <div>
                <strong>Pré-visualização</strong>
                <p>Cada raspagem gera uma imagem do site e salva no histórico.</p>
              </div>
            </div>
          </div>

          {/* Monitor */}
          <div className="card">
            <div className="card-hd">
              <div className="card-title">
                <Radio size={16} className="ic-purple" />Monitoramento
              </div>
              <span className="pill pill-dark">{monitors.length} ativos</span>
            </div>
            <p className="card-desc">Cadastre sites para acompanhar disponibilidade.</p>
            <div className="field-row">
              <input
                className="field"
                placeholder="https://site.com"
                value={monitorUrl}
                onChange={e => setMonitorUrl(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addMonitor()}
              />
              <button className="btn-exec" onClick={addMonitor}>
                <Monitor size={15} />Monitorar
              </button>
            </div>
            <div className="empty-state">
              <div className="empty-icon">
                <Radio size={28} strokeWidth={1.5} />
              </div>
              <span>Nenhum site monitorado ainda.</span>
            </div>
          </div>
        </div>

        {/* ── BOTTOM GRID ──────────────────────────── */}
        <div className="bot-grid">

          {/* History */}
          <div className="card">
            <div className="card-hd">
              <div className="card-title">
                <Clock size={16} className="ic-purple" />Histórico de extrações
              </div>
              <div className="hd-actions">
                <button className="btn-soft" onClick={fetchHistory}>
                  <RefreshCcw size={13} />Atualizar
                </button>
                <button className="btn-danger" onClick={clearHistory}>
                  <Trash2 size={13} />Limpar histórico
                </button>
              </div>
            </div>
            <p className="card-desc">Visualize previews, descrições e URLs coletadas.</p>

            {history.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon"><FileSearch size={26} strokeWidth={1.5} /></div>
                <span>Nenhuma extração realizada ainda.</span>
              </div>
            ) : (
              <div className="h-grid">
                {history.map(item => (
                  <div className="h-card" key={item.id}>
                    <div className="h-thumb">
                      <img
                        src={`${API_ROOT}${item.screenshot_url}`}
                        alt={item.title}
                        loading="lazy"
                      />
                      <span className="h-id">#{item.id}</span>
                    </div>
                    <div className="h-body">
                      <strong className="h-title">{item.title}</strong>
                      <a className="h-url" href={item.url} target="_blank" rel="noreferrer">
                        <ExternalLink size={10} />{item.url}
                      </a>
                      <div className="h-foot">
                        <span className="h-time">
                          <Clock size={10} />
                          {new Date().toLocaleTimeString("pt-BR", { hour:"2-digit", minute:"2-digit" })}
                        </span>
                        <button className="h-del" onClick={() => deleteItem(item.id)}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                <button className="h-next"><ChevronRight size={18} /></button>
              </div>
            )}
          </div>

          {/* Reports */}
          <div className="card">
            <div className="card-hd">
              <div className="card-title">
                <FileBarChart2 size={16} className="ic-purple" />Relatórios
              </div>
            </div>
            <p className="card-desc">Exporte os dados coletados em diferentes formatos.</p>
            <div className="reports-list">
              {[
                { icon: FileText, label:"Exportar PDF",   color:"#ef4444", path:"/scraper/export/pdf"   },
                { icon: Sheet,    label:"Exportar Excel", color:"#22c55e", path:"/scraper/export/excel" },
                { icon: Braces,   label:"Exportar JSON",  color:"#3b82f6", path:"/scraper/export/json"  },
              ].map(({ icon: Icon, label, color, path }) => (
                <button
                  key={label}
                  className="report-btn"
                  onClick={() => window.open(`${API_ROOT}${path}`)}
                >
                  <span className="report-ico" style={{ color }}>
                    <Icon size={20} />
                  </span>
                  <span className="report-label">{label}</span>
                  <ExternalLink size={13} className="report-ext" />
                </button>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
