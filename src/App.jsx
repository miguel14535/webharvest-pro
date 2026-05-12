import "./App.css";
import axios from "axios";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import {
  Rocket,
  Database,
  Shield,
  Monitor,
  FileText,
  Activity,
  Eye,
  Trash2,
  RefreshCw,
  LogOut,
} from "lucide-react";

const API = "http://127.0.0.1:8000";

function App() {
  const [url, setUrl] = useState("");
  const [history, setHistory] = useState([]);
  const [monitors, setMonitors] = useState([]);
  const [loading, setLoading] = useState(false);

  async function loadHistory() {
    try {
      const res = await axios.get(`${API}/scraper/history`);
      setHistory(res.data.reverse());
    } catch {
      toast.error("Erro ao carregar histórico");
    }
  }

  async function loadMonitors() {
    try {
      const res = await axios.get(`${API}/api/monitor/list`);
      setMonitors(res.data);
    } catch {
      toast.error("Erro ao carregar monitores");
    }
  }

  useEffect(() => {
    loadHistory();
    loadMonitors();
  }, []);

  async function scrapeWebsite() {
    if (!url) return toast.error("Digite uma URL");

    try {
      setLoading(true);

      await axios.get(`${API}/scraper/scrape`, {
        params: { url },
      });

      toast.success("Extração concluída");

      setUrl("");

      loadHistory();
    } catch {
      toast.error("Erro ao raspar site");
    } finally {
      setLoading(false);
    }
  }

  async function clearHistory() {
    try {
      await axios.delete(`${API}/scraper/history`);
      toast.success("Histórico limpo");
      loadHistory();
    } catch {
      toast.error("Erro ao limpar");
    }
  }

  async function deleteItem(id) {
    try {
      await axios.delete(`${API}/scraper/history/${id}`);
      loadHistory();
    } catch {
      toast.error("Erro ao deletar");
    }
  }

  return (
    <>
      <Toaster position="top-right" />

      <div className="dashboard">

        <aside className="sidebar">

          <div className="logo">
            <div className="logo-icon">
              <Rocket size={28} />
            </div>

            <div>
              <h1>WebHarvest</h1>
              <p>Inteligência de Extração</p>
            </div>
          </div>

          <nav className="menu">

            <button className="menu-item active">
              <Database size={18} />
              Painel
            </button>

            <button className="menu-item">
              <Rocket size={18} />
              Extrações
            </button>

            <button className="menu-item">
              <Monitor size={18} />
              Monitoramento
            </button>

            <button className="menu-item">
              <FileText size={18} />
              Relatórios
            </button>

          </nav>

          <div className="profile-card">

            <div className="avatar">
              M
            </div>

            <h3>Miguel</h3>

            <p>migueldhein50@gmail.com</p>

            <span className="status-online">
              • JWT ativo
            </span>

          </div>

          <button className="logout-btn">
            <LogOut size={18} />
            Sair
          </button>

        </aside>

        <main className="content">

          <section className="hero">

            <div>

              <span className="hero-tag">
                WEBHARVEST PRO
              </span>

              <h1>
                Painel inteligente de raspagem
              </h1>

              <p>
                Automatize extrações, gere relatórios,
                monitore sites e visualize resultados.
              </p>

            </div>

            <div className="api-status">

              <div className="green-dot"></div>

              <div>
                <strong>API Online</strong>
                <p>FastAPI operacional</p>
              </div>

            </div>

          </section>

          <section className="stats-grid">

            <div className="stat-card">
              <div className="icon purple">
                <Database size={24} />
              </div>

              <div>
                <span>RASPAGENS</span>
                <h2>{history.length}</h2>
                <p>registros salvos</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="icon blue">
                <Monitor size={24} />
              </div>

              <div>
                <span>MONITORES</span>
                <h2>{monitors.length}</h2>
                <p>sites acompanhados</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="icon green">
                <Shield size={24} />
              </div>

              <div>
                <span>STATUS</span>
                <h2 className="online">On-line</h2>
                <p>API operacional</p>
              </div>
            </div>

          </section>

          <section className="main-grid">

            <div className="card">

              <div className="card-header">
                <h2>Nova extração</h2>
              </div>

              <p>
                Capture título, descrição,
                links e screenshots.
              </p>

              <div className="scrape-box">

                <input
                  type="text"
                  placeholder="https://github.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />

                <button onClick={scrapeWebsite}>
                  {loading ? "Extraindo..." : "Executar"}
                </button>

              </div>

            </div>

            <div className="card">

              <div className="card-header">
                <h2>Monitoramento</h2>
              </div>

              <div className="monitor-list">

                {monitors.length === 0 && (
                  <p>Nenhum site monitorado.</p>
                )}

                {monitors.map((monitor) => (
                  <div className="monitor-item" key={monitor.id}>

                    <span>
                      {monitor.url}
                    </span>

                    <span className="badge">
                      {monitor.last_status}
                    </span>

                  </div>
                ))}

              </div>

            </div>

          </section>

          <section className="history-section">

            <div className="history-header">

              <h2>
                Histórico de extrações
              </h2>

              <div className="history-actions">

                <button onClick={loadHistory}>
                  <RefreshCw size={16} />
                  Atualizar
                </button>

                <button
                  className="danger"
                  onClick={clearHistory}
                >
                  <Trash2 size={16} />
                  Limpar
                </button>

              </div>

            </div>

            <div className="history-grid">

              {history.map((item) => (

                <div className="history-card" key={item.id}>

                  {item.screenshot_url ? (
                    <img
                      src={`${API}${item.screenshot_url}`}
                      alt={item.title}
                      className="preview-image"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="no-preview">
                      Sem preview
                    </div>
                  )}

                  <div className="history-content">

                    <span className="history-id">
                      #{item.id}
                    </span>

                    <h3>
                      {item.title}
                    </h3>

                    <a
                      href={item.url}
                      target="_blank"
                    >
                      {item.url}
                    </a>

                    <div className="history-footer">

                      <span>
                        Hoje
                      </span>

                      <button
                        className="delete-btn"
                        onClick={() => deleteItem(item.id)}
                      >
                        <Trash2 size={16} />
                      </button>

                    </div>

                  </div>

                </div>

              ))}

            </div>

          </section>

        </main>

      </div>
    </>
  );
}

export default App;