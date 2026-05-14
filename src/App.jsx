import { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard,
  FileSearch,
  Activity,
  FileBarChart2,
  Settings,
  LogOut,
  Database,
  Monitor,
  ShieldCheck,
  User,
  Eye,
  Trash2,
  RefreshCcw,
  Rocket,
} from "lucide-react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import toast, { Toaster } from "react-hot-toast";
import api from "./services/api";

import "./App.css";

const API_ROOT = "https://webharvest-pro.onrender.com";

function App() {
  const [url, setUrl] = useState("");
  const [monitorUrl, setMonitorUrl] = useState("");

  const [history, setHistory] = useState([]);
  const [monitors, setMonitors] = useState([]);

  const [loading, setLoading] = useState(false);

  async function fetchHistory() {
    try {
      const response = await api.get("/scraper/history");
      setHistory(response.data);
    } catch (error) {
      toast.error("Erro ao carregar histórico");
    }
  }

  async function fetchMonitors() {
    try {
      const response = await api.get("/api/monitor/list");
      setMonitors(response.data);
    } catch (error) {
      toast.error("Erro ao carregar monitores");
    }
  }

  useEffect(() => {
    fetchHistory();
    fetchMonitors();
  }, []);

  async function handleScrape() {
    if (!url.trim()) {
      toast.error("Digite uma URL");
      return;
    }

    try {
      setLoading(true);

      let finalUrl = url;

      if (
        !finalUrl.startsWith("http://") &&
        !finalUrl.startsWith("https://")
      ) {
        finalUrl = `https://${finalUrl}`;
      }

      await api.get(
        `/scraper/scrape?url=${encodeURIComponent(finalUrl)}`
      );

      toast.success("Extração realizada!");

      setUrl("");

      fetchHistory();
    } catch (error) {
      toast.error("Erro ao extrair site");
    } finally {
      setLoading(false);
    }
  }

  async function addMonitor() {
    if (!monitorUrl.trim()) {
      toast.error("Digite uma URL");
      return;
    }

    try {
      let finalUrl = monitorUrl;

      if (
        !finalUrl.startsWith("http://") &&
        !finalUrl.startsWith("https://")
      ) {
        finalUrl = `https://${finalUrl}`;
      }

      await api.post(
        `/api/monitor/add?url=${encodeURIComponent(finalUrl)}`
      );

      toast.success("Monitor criado");

      setMonitorUrl("");

      fetchMonitors();
    } catch (error) {
      toast.error("Erro ao criar monitor");
    }
  }

  async function deleteItem(id) {
    try {
      await api.delete(`/scraper/history/${id}`);

      toast.success("Registro removido");

      fetchHistory();
    } catch (error) {
      toast.error("Erro ao remover");
    }
  }

  async function clearHistory() {
    const confirmClear = window.confirm(
      "Deseja realmente limpar o histórico?"
    );

    if (!confirmClear) return;

    try {
      await api.delete("/scraper/history");

      toast.success("Histórico limpo");

      fetchHistory();
    } catch (error) {
      toast.error("Erro ao limpar");
    }
  }

  const chartData = useMemo(() => {
    return history
      .slice(0, 8)
      .reverse()
      .map((item, index) => ({
        name: `#${item.id}`,
        extrações: index + 3,
      }));
  }, [history]);

  return (
    <div className="dashboard">
      <Toaster position="top-right" />

      {/* SIDEBAR */}

      <aside className="sidebar">
        <div className="logo-box">
          <div className="logo-icon">
            <Rocket size={28} />
          </div>

          <div>
            <h1>WebHarvest</h1>
            <span>Inteligência de Extração</span>
          </div>
        </div>

        <nav className="menu">
          <button className="active">
            <LayoutDashboard size={20} />
            Painel
          </button>

          <button>
            <FileSearch size={20} />
            Extrações
          </button>

          <button>
            <Activity size={20} />
            Monitoramento
          </button>

          <button>
            <FileBarChart2 size={20} />
            Relatórios
          </button>

          <button>
            <Settings size={20} />
            Configurações
          </button>
        </nav>

        <div className="sidebar-user">
          <div className="avatar">M</div>

          <div>
            <h4>Miguel</h4>
            <span>migueldhein50@gmail.com</span>
          </div>

          <div className="jwt-badge">● JWT ativo</div>
        </div>

        <button className="logout-btn">
          <LogOut size={18} />
          Sair
        </button>
      </aside>

      {/* MAIN */}

      <main className="main-content">
        {/* HERO */}

        <section className="hero-card">
          <div>
            <small>WEBHARVEST PRO</small>

            <h2>Painel inteligente de raspagem</h2>

            <p>
              Automatize extrações, gere relatórios, monitore
              sites e visualize resultados em tempo real.
            </p>
          </div>

          <div className="api-status">
            <span className="online-dot"></span>
            API Online
            <small>FastAPI operacional</small>
          </div>
        </section>

        {/* STATS */}

        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon purple">
              <Database />
            </div>

            <div>
              <span>RASPAGENS</span>
              <h3>{history.length}</h3>
              <p>registros salvos</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon blue">
              <Monitor />
            </div>

            <div>
              <span>MONITORES</span>
              <h3>{monitors.length}</h3>
              <p>sites acompanhados</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">
              <ShieldCheck />
            </div>

            <div>
              <span>STATUS</span>
              <h3 className="online-text">On-line</h3>
              <p>API operacional</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon purple">
              <User />
            </div>

            <div>
              <span>USUÁRIO</span>
              <h4>migueldhein50@gmail.com</h4>
              <p>JWT ativo</p>
            </div>
          </div>
        </section>

        {/* CONTENT */}

        <section className="content-grid">
          {/* CHART */}

          <div className="panel chart-panel">
            <div className="panel-header">
              <h3>Análises</h3>

              <span className="tag">Tempo real</span>
            </div>

            <p>Últimas raspagens realizadas</p>

            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient
                      id="colorUv"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#8b5cf6"
                        stopOpacity={0.8}
                      />

                      <stop
                        offset="95%"
                        stopColor="#8b5cf6"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#1e293b"
                  />

                  <XAxis dataKey="name" stroke="#94a3b8" />

                  <YAxis stroke="#94a3b8" />

                  <Tooltip />

                  <Area
                    type="monotone"
                    dataKey="extrações"
                    stroke="#8b5cf6"
                    fillOpacity={1}
                    fill="url(#colorUv)"
                    strokeWidth={4}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* SCRAPER */}

          <div className="panel">
            <div className="panel-header">
              <h3>Nova extração</h3>
            </div>

            <p>
              Capture título, descrição, links e captura de tela.
            </p>

            <div className="input-group">
              <input
                type="text"
                placeholder="https://github.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />

              <button onClick={handleScrape}>
                {loading ? "..." : "Executar"}
              </button>
            </div>

            <div className="preview-box">
              <Eye size={20} />

              <div>
                <h4>Pré-visualização</h4>

                <p>
                  Cada raspagem gera uma imagem do site e salva no
                  histórico.
                </p>
              </div>
            </div>
          </div>

          {/* MONITOR */}

          <div className="panel">
            <div className="panel-header">
              <h3>Monitoramento</h3>

              <span className="tag">
                {monitors.length} ativos
              </span>
            </div>

            <p>
              Cadastre sites para acompanhar disponibilidade.
            </p>

            <div className="input-group">
              <input
                type="text"
                placeholder="https://site.com"
                value={monitorUrl}
                onChange={(e) => setMonitorUrl(e.target.value)}
              />

              <button onClick={addMonitor}>
                Monitorar
              </button>
            </div>

            <div className="empty-monitor">
              Nenhum site monitorado ainda.
            </div>
          </div>
        </section>

        {/* HISTORY + REPORTS */}

        <section className="bottom-grid">
          {/* HISTORY */}

          <div className="panel">
            <div className="panel-header">
              <h3>Histórico de extrações</h3>

              <div className="history-actions">
                <button
                  className="refresh-btn"
                  onClick={fetchHistory}
                >
                  <RefreshCcw size={16} />
                  Atualizar
                </button>

                <button
                  className="danger-btn"
                  onClick={clearHistory}
                >
                  <Trash2 size={16} />
                  Limpar histórico
                </button>
              </div>
            </div>

            <p>
              Visualize previews, descrições e URLs coletadas.
            </p>

            <div className="history-grid">
              {history.map((item) => (
                <div className="history-card" key={item.id}>
                  <img
                    src={`${API_ROOT}${item.screenshot_url}`}
                    alt={item.title}
                  />

                  <div className="history-info">
                    <span className="history-id">
                      #{item.id}
                    </span>

                    <h4>{item.title}</h4>

                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {item.url}
                    </a>

                    <div className="history-footer">
                      <span>
                        Hoje,{" "}
                        {new Date().toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>

                      <button
                        onClick={() => deleteItem(item.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* REPORTS */}

          <div className="panel reports-panel">
            <div className="panel-header">
              <h3>Relatórios</h3>
            </div>

            <p>Exporte os dados coletados.</p>

            <div className="reports-grid">
              <button
                onClick={() =>
                  window.open(
                    `${API_ROOT}/scraper/export/pdf`
                  )
                }
              >
                Exportar PDF
              </button>

              <button
                onClick={() =>
                  window.open(
                    `${API_ROOT}/scraper/export/excel`
                  )
                }
              >
                Exportar Excel
              </button>

              <button
                onClick={() =>
                  window.open(
                    `${API_ROOT}/scraper/export/json`
                  )
                }
              >
                Exportar JSON
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;