import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

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
      console.error("Erro ao carregar histórico", error);
    }
  }

  useEffect(() => {
    fetchHistory();
  }, []);

  async function handleScrape() {
    if (!url.trim()) {
      alert("Digite uma URL");
      return;
    }

    let finalUrl = url.trim();

    if (
      !finalUrl.startsWith("http://") &&
      !finalUrl.startsWith("https://")
    ) {
      finalUrl = `https://${finalUrl}`;
    }

    try {
      setLoading(true);

      await api.get(
        `/scraper/scrape?url=${encodeURIComponent(finalUrl)}`
      );

      setUrl("");

      await fetchHistory();

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
      await fetchHistory();
    } catch (error) {
      console.error(error);
      alert("Erro ao excluir item");
    }
  }

  const chartData = history
    .slice(0, 7)
    .reverse()
    .map((item, index) => ({
      name: `#${item.id}`,
      raspagens: index + 1,
    }));

  const cardAnimation = {
    initial: { opacity: 0, y: 35 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.45 },
    whileHover: {
      scale: 1.03,
      boxShadow:
        "0px 0px 28px rgba(124,58,237,0.45)",
    },
  };

  return (
    <div style={styles.container}>
      <motion.aside
        style={styles.sidebar}
        initial={{ opacity: 0, x: -60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 style={styles.logo}>WebHarvest</h1>

        <button style={styles.menuButton}>
          Painel
        </button>

        <button style={styles.menuButton}>
          Extrações
        </button>

        <button style={styles.menuButton}>
          Monitoramento
        </button>

        <button style={styles.menuButton}>
          Histórico
        </button>

        <button style={styles.logoutButton}>
          Sair
        </button>
      </motion.aside>

      <main style={styles.main}>
        <motion.div
          style={styles.header}
          initial={{ opacity: 0, y: -25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
        >
          <h1>Painel Analytics</h1>

          <p>
            Plataforma premium de scraping e análise web.
          </p>
        </motion.div>

        <div style={styles.cardsContainer}>
          <motion.div
            style={styles.card}
            {...cardAnimation}
          >
            <h2>Raspagens</h2>

            <strong style={styles.bigNumber}>
              {history.length}
            </strong>

            <p>Registros salvos</p>
          </motion.div>

          <motion.div
            style={styles.card}
            {...cardAnimation}
          >
            <h2>Status API</h2>

            <strong style={styles.onlineText}>
              Online
            </strong>

            <p>FastAPI operacional</p>
          </motion.div>

          <motion.div
            style={styles.card}
            {...cardAnimation}
          >
            <h2>Usuário</h2>

            <p style={styles.emailText}>
              {user.email}
            </p>

            <p>JWT ativo</p>
          </motion.div>
        </div>

        <motion.div
          style={styles.chartContainer}
          {...cardAnimation}
        >
          <div style={styles.chartHeader}>
            <h2>Analytics</h2>

            <span style={styles.analyticsBadge}>
              Últimas raspagens
            </span>
          </div>

          <div style={{ width: "100%", height: 320 }}>
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#1e293b"
                />

                <XAxis
                  dataKey="name"
                  stroke="#94a3b8"
                />

                <Tooltip />

                <Bar
                  dataKey="raspagens"
                  fill="#7c3aed"
                  radius={[10, 10, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          style={styles.scraperBox}
          {...cardAnimation}
        >
          <h2>Extração Avançada</h2>

          <p>
            Extraia dados, títulos e links de qualquer site.
          </p>

          <div style={styles.scrapeActions}>
            <input
              type="text"
              placeholder="https://github.com"
              value={url}
              onChange={(e) =>
                setUrl(e.target.value)
              }
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
              {loading
                ? "Extraindo..."
                : "Executar"}
            </button>
          </div>
        </motion.div>

        <motion.div
          style={styles.historyContainer}
          {...cardAnimation}
        >
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
            history.map((item, index) => (
              <motion.div
                key={item.id}
                style={styles.historyCard}
                initial={{
                  opacity: 0,
                  y: 25,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.35,
                  delay: index * 0.05,
                }}
                whileHover={{
                  scale: 1.01,
                  borderColor: "#7c3aed",
                }}
              >
                <div>
                  <h3>{item.title}</h3>

                  <p style={styles.historyUrl}>
                    {item.url}
                  </p>

                  <span style={styles.historyBadge}>
                    ID #{item.id}
                  </span>
                </div>

                <button
                  onClick={() =>
                    deleteItem(item.id)
                  }
                  style={styles.deleteButton}
                >
                  Excluir
                </button>
              </motion.div>
            ))
          )}
        </motion.div>
      </main>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexWrap: "wrap",
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top, #111827 0%, #020617 45%, #000 100%)",
    color: "white",
    fontFamily: "Arial",
  },

  sidebar: {
    width: "260px",
    minWidth: "220px",
    background: "rgba(8,16,40,0.95)",
    padding: "30px",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    borderRight: "1px solid #1e293b",
    boxShadow: "10px 0 30px rgba(0,0,0,0.25)",
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
    background:
      "linear-gradient(135deg,#dc2626,#991b1b)",
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
    minWidth: "320px",
  },

  header: {
    textAlign: "center",
    marginBottom: "40px",
  },

  cardsContainer: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
    marginBottom: "40px",
  },

  card: {
    background: "rgba(15,23,42,0.92)",
    padding: "30px",
    borderRadius: "20px",
    border: "1px solid #1e293b",
    textAlign: "center",
    boxShadow:
      "0 0 25px rgba(0,0,0,0.25)",
  },

  bigNumber: {
    fontSize: "42px",
    color: "#7c3aed",
  },

  onlineText: {
    color: "#22c55e",
    fontSize: "28px",
  },

  emailText: {
    wordBreak: "break-word",
    overflowWrap: "break-word",
    color: "#e2e8f0",
    fontWeight: "bold",
  },

  chartContainer: {
    background: "rgba(15,23,42,0.92)",
    padding: "30px",
    borderRadius: "20px",
    border: "1px solid #1e293b",
    marginBottom: "40px",
    boxShadow:
      "0 0 25px rgba(0,0,0,0.25)",
  },

  chartHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },

  analyticsBadge: {
    background: "#7c3aed",
    padding: "8px 14px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "bold",
  },

  scraperBox: {
    background: "rgba(15,23,42,0.92)",
    padding: "40px",
    borderRadius: "20px",
    border: "1px solid #1e293b",
    marginBottom: "40px",
    textAlign: "center",
    boxShadow:
      "0 0 25px rgba(0,0,0,0.25)",
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
    background:
      "linear-gradient(135deg,#7c3aed,#2563eb)",
    border: "none",
    padding: "18px 28px",
    borderRadius: "12px",
    color: "white",
    cursor: "pointer",
    fontWeight: "bold",
  },

  historyContainer: {
    background: "rgba(15,23,42,0.92)",
    padding: "30px",
    borderRadius: "20px",
    border: "1px solid #1e293b",
    boxShadow:
      "0 0 25px rgba(0,0,0,0.25)",
  },

  historyHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },

  refreshButton: {
    background:
      "linear-gradient(135deg,#2563eb,#1d4ed8)",
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
    wordBreak: "break-all",
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
    background:
      "linear-gradient(135deg,#dc2626,#991b1b)",
    border: "none",
    padding: "12px 18px",
    borderRadius: "10px",
    color: "white",
    cursor: "pointer",
    fontWeight: "bold",
  },
};

export default App;