import { useEffect, useState } from "react";
import api from "./services/api";
import "./App.css";

function App() {
  const [url, setUrl] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const user = {
    email: "migueldhein50@gmail.com",
  };

  async function fetchHistory() {
    try {
      const response = await api.get("/scraper/history");
      setHistory(response.data);
    } catch (error) {
      console.error("Erro ao carregar histórico");
    }
  }

  useEffect(() => {
    fetchHistory();
  }, []);

  async function handleScrape() {
    if (!url) {
      alert("Digite uma URL");
      return;
    }

    try {
      setLoading(true);

      await api.get(`/scraper/scrape?url=${encodeURIComponent(url)}`);

      setUrl("");
      fetchHistory();

      alert("Extração realizada com sucesso!");
    } catch (error) {
      console.error(error);
      alert("Erro ao realizar scraping");
    } finally {
      setLoading(false);
    }
  }

  async function deleteItem(id) {
    try {
      await api.delete(`/scraper/history/${id}`);
      fetchHistory();
    } catch (error) {
      console.error(error);
      alert("Erro ao excluir item");
    }
  }

  return (
    <div style={styles.container}>
      <aside style={styles.sidebar}>
        <h1 style={styles.logo}>WebHarvest</h1>

        <button style={styles.menuButton}>Painel</button>
        <button style={styles.menuButton}>Extrações</button>
        <button style={styles.menuButton}>Monitoramento</button>
        <button style={styles.menuButton}>Histórico</button>

        <button style={styles.logoutButton}>Sair</button>
      </aside>

      <main style={styles.main}>
        <div style={styles.header}>
          <h1>Painel de guerrilha</h1>
          <p>Plataforma de automação, scraping e análise web.</p>
        </div>

        <div style={styles.cardsContainer}>
          <div style={styles.card}>
            <h2>Raspagens</h2>
            <strong>{history.length}</strong>
            <p>Registros salvos</p>
          </div>

          <div style={styles.card}>
            <h2>API de status</h2>
            <strong>On-line</strong>
            <p>FastAPI operacional</p>
          </div>

          <div style={styles.card}>
            <h2>Usuário</h2>

            <p
              style={{
                wordBreak: "break-word",
                overflowWrap: "break-word",
              }}
            >
              {user.email}
            </p>

            <p>JWT ativo</p>
          </div>
        </div>

        <div style={styles.scraperBox}>
          <h2>Extração de Executáveis Avançada</h2>

          <p>
            Extraia título, descrição SEO, links, imagens e títulos.
          </p>

          <div style={styles.scrapeActions}>
            <input
              type="text"
              placeholder="Exemplo: https://github.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              style={styles.input}
            />

            <button
              onClick={handleScrape}
              disabled={loading}
              style={{
                ...styles.executeButton,
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Extraindo..." : "Executar"}
            </button>
          </div>
        </div>

        <div style={styles.historyContainer}>
          <div style={styles.historyHeader}>
            <h2>Histórico</h2>

            <button
              onClick={fetchHistory}
              style={styles.refreshButton}
            >
              Atualizar
            </button>
          </div>

          {history.length === 0 ? (
            <p style={{ color: "#94a3b8" }}>
              Nenhuma raspagem realizada.
            </p>
          ) : (
            history.map((item) => (
              <div key={item.id} style={styles.historyCard}>
                <div>
                  <h3>{item.title}</h3>

                  <p style={styles.historyUrl}>{item.url}</p>

                  <span style={styles.historyBadge}>
                    ID #{item.id}
                  </span>
                </div>

                <button
                  onClick={() => deleteItem(item.id)}
                  style={styles.deleteButton}
                >
                  Excluir
                </button>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    background: "#020617",
    color: "white",
    fontFamily: "Arial",
  },

  sidebar: {
    width: "260px",
    background: "#081028",
    padding: "30px",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },

  logo: {
    marginBottom: "20px",
  },

  menuButton: {
    background: "#0f172a",
    border: "1px solid #1e293b",
    color: "white",
    padding: "16px",
    borderRadius: "12px",
    cursor: "pointer",
    textAlign: "left",
    fontWeight: "bold",
  },

  logoutButton: {
    marginTop: "auto",
    background: "#dc2626",
    border: "none",
    padding: "16px",
    borderRadius: "12px",
    color: "white",
    cursor: "pointer",
    fontWeight: "bold",
  },

  main: {
    flex: 1,
    padding: "40px",
  },

  header: {
    textAlign: "center",
    marginBottom: "40px",
  },

  cardsContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
    marginBottom: "40px",
  },

  card: {
    background: "#0b1736",
    padding: "30px",
    borderRadius: "20px",
    border: "1px solid #1e293b",
    textAlign: "center",
  },

  scraperBox: {
    background: "#0b1736",
    padding: "40px",
    borderRadius: "20px",
    border: "1px solid #1e293b",
    marginBottom: "40px",
    textAlign: "center",
  },

  scrapeActions: {
    display: "flex",
    gap: "15px",
    marginTop: "25px",
  },

  input: {
    flex: 1,
    padding: "18px",
    borderRadius: "12px",
    border: "1px solid #1e293b",
    background: "#071126",
    color: "white",
    outline: "none",
  },

  executeButton: {
    background: "#7c3aed",
    border: "none",
    padding: "18px 28px",
    borderRadius: "12px",
    color: "white",
    cursor: "pointer",
    fontWeight: "bold",
  },

  historyContainer: {
    background: "#0b1736",
    padding: "30px",
    borderRadius: "20px",
    border: "1px solid #1e293b",
  },

  historyHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },

  refreshButton: {
    background: "#2563eb",
    border: "none",
    padding: "12px 18px",
    borderRadius: "10px",
    color: "white",
    cursor: "pointer",
    fontWeight: "bold",
  },

  historyCard: {
    background: "#020617",
    border: "1px solid #1e293b",
    padding: "25px",
    borderRadius: "16px",
    marginBottom: "20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
  },

  historyUrl: {
    color: "#60a5fa",
    marginTop: "10px",
  },

  historyBadge: {
    display: "inline-block",
    marginTop: "10px",
    background: "#1e293b",
    padding: "6px 12px",
    borderRadius: "999px",
    color: "#cbd5e1",
    fontSize: "12px",
  },

  deleteButton: {
    background: "#dc2626",
    border: "none",
    padding: "12px 18px",
    borderRadius: "10px",
    color: "white",
    cursor: "pointer",
    fontWeight: "bold",
  },
};

export default App;