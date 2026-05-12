import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

import api from "./services/api";
import "./App.css";

const API_ROOT = "https://webharvest-pro.onrender.com";

function App() {
  const [url, setUrl] = useState("");
  const [monitorUrl, setMonitorUrl] = useState("");
  const [history, setHistory] = useState([]);
  const [monitors, setMonitors] = useState([]);
  const [loading, setLoading] = useState(false);

  const user = {
    name: "Miguel",
    email: "migueldhein50@gmail.com",
  };

  async function fetchHistory() {
    try {
      const response = await api.get("/scraper/history");
      setHistory(response.data);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar histórico");
    }
  }

  async function fetchMonitors() {
    try {
      const response = await api.get("/monitor/list");
      setMonitors(response.data);
    } catch (error) {
      console.error(error);
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

    let finalUrl = url.trim();

    if (!finalUrl.startsWith("http://") && !finalUrl.startsWith("https://")) {
      finalUrl = `https://${finalUrl}`;
    }

    try {
      setLoading(true);
      await api.get(`/scraper/scrape?url=${encodeURIComponent(finalUrl)}`);
      setUrl("");
      await fetchHistory();
      toast.success("Extração realizada com sucesso!");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao realizar extração");
    } finally {
      setLoading(false);
    }
  }

  async function addMonitor() {
    if (!monitorUrl.trim()) {
      toast.error("Digite uma URL para monitorar");
      return;
    }

    let finalUrl = monitorUrl.trim();

    if (!finalUrl.startsWith("http://") && !finalUrl.startsWith("https://")) {
      finalUrl = `https://${finalUrl}`;
    }

    try {
      await api.post(`/monitor/add?url=${encodeURIComponent(finalUrl)}`);
      setMonitorUrl("");
      await fetchMonitors();
      toast.success("Monitor criado com sucesso!");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao criar monitor");
    }
  }

  async function deleteMonitor(id) {
    try {
      await api.delete(`/monitor/${id}`);
      await fetchMonitors();
      toast.success("Monitor removido");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao remover monitor");
    }
  }

  async function deleteItem(id) {
    try {
      await api.delete(`/scraper/history/${id}`);
      await fetchHistory();
      toast.success("Registro excluído");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao excluir registro");
    }
  }

  async function clearHistory() {
    const confirmClear = window.confirm(
      "Tem certeza que deseja limpar todo o histórico?"
    );

    if (!confirmClear) return;

    try {
      await api.delete("/scraper/history");
      await fetchHistory();
      toast.success("Histórico limpo com sucesso");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao limpar histórico");
    }
  }

  function exportFile(type) {
    window.open(`${API_ROOT}/api/scraper/export/${type}`, "_blank");
  }

  const chartData = useMemo(() => {
    return history
      .slice(0, 8)
      .reverse()
      .map((item, index) => ({
        name: `#${item.id}`,
        extrações: index + 1,
      }));
  }, [history]);

  return (
    <div className="app-shell">
      <Toaster position="top-right" />

      <aside className="sidebar">
        <div className="logo">
          <h1>WebHarvest</h1>
          <span>Inteligência de Extração de Dados</span>
        </div>

        <nav className="menu">
          <button>Painel</button>
          <button>Extrações</button>
          <button>Monitoramento</button>
          <button>Relatórios</button>
        </nav>
      </aside>

      <main className="main-content">
        <motion.section
          className="hero"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="hero-mini">WEBHARVEST PRO</div>
          <h2>Painel inteligente de raspagem</h2>
          <p>
            Automatize extrações, gere relatórios, monitore sites e visualize
            previews em tempo real.
          </p>
          <div className="hero-badge">● API Online</div>
        </motion.section>

        <section className="stats-grid">
          <div className="stat-card">
            <h4>Raspagens</h4>
            <h3>{history.length}</h3>
            <p>registros salvos</p>
          </div>

          <div className="stat-card">
            <h4>Monitores</h4>
            <h3>{monitors.length}</h3>
            <p>sites acompanhados</p>
          </div>

          <div className="stat-card">
            <h4>Status</h4>
            <h3>Online</h3>
            <p>FastAPI operacional</p>
          </div>

          <div className="stat-card">
            <h4>Usuário</h4>
            <p>{user.email}</p>
          </div>
        </section>

        <section className="content-grid">
          <div className="panel">
            <div className="panel-header">
              <h3>Análises</h3>
              <span className="panel-tag">Tempo real</span>
            </div>

            <div className="chart-container">
              <ResponsiveContainer>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#26314f" />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="extrações"
                    stroke="#7b61ff"
                    fill="#7b61ff"
                    fillOpacity={0.35}
                    strokeWidth={4}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <h3>Nova extração</h3>
            </div>

            <p>Capture título, descrição, links e screenshot.</p>

            <div className="scrape-form">
              <input
                placeholder="https://github.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />

              <button onClick={handleScrape} disabled={loading}>
                {loading ? "Extraindo..." : "Executar"}
              </button>
            </div>

            <div className="preview-box">
              <h4>Pré-visualização</h4>
              <p>Cada raspagem gera uma imagem do site e salva no histórico.</p>
            </div>
          </div>
        </section>

        <section className="panel monitor-section">
          <div className="panel-header">
            <h3>Monitoramento</h3>
            <span className="panel-tag">{monitors.length} ativos</span>
          </div>

          <div className="scrape-form">
            <input
              placeholder="https://site.com"
              value={monitorUrl}
              onChange={(e) => setMonitorUrl(e.target.value)}
            />

            <button onClick={addMonitor}>Monitorar</button>
          </div>

          <div className="monitor-list">
            {monitors.length === 0 ? (
              <div className="empty-state">Nenhum site monitorado ainda.</div>
            ) : (
              monitors.map((monitor) => (
                <div className="monitor-card" key={monitor.id}>
                  <span>{monitor.url}</span>
                  <button onClick={() => deleteMonitor(monitor.id)}>
                    Remover
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <h3>Relatórios</h3>
          </div>

          <div className="export-grid">
            <button className="export-pdf" onClick={() => exportFile("pdf")}>
              Exportar PDF
            </button>

            <button
              className="export-excel"
              onClick={() => exportFile("excel")}
            >
              Exportar Excel
            </button>

            <button className="export-json" onClick={() => exportFile("json")}>
              Exportar JSON
            </button>
          </div>
        </section>

        <section className="history-section">
          <div className="history-header">
            <h2>Histórico de extrações</h2>

            <div className="history-actions">
              <button className="refresh-btn" onClick={fetchHistory}>
                Atualizar
              </button>
              <button className="clear-btn" onClick={clearHistory}>
                Limpar histórico
              </button>
            </div>
          </div>

          {history.length === 0 ? (
            <div className="empty-state">Nenhuma extração realizada.</div>
          ) : (
            <div className="history-grid">
              {history.map((item) => (
                <article className="history-card" key={item.id}>
                  {item.screenshot_url ? (
                    <img
                      src={`${API_ROOT}${item.screenshot_url}`}
                      alt={item.title}
                    />
                  ) : (
                    <div className="empty-state">Sem preview</div>
                  )}

                  <div className="history-content">
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>

                    <div className="history-footer">
                      <a href={item.url} target="_blank" rel="noreferrer">
                        Acessar site
                      </a>

                      <button
                        className="delete-history"
                        onClick={() => deleteItem(item.id)}
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;