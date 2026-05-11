import { useEffect, useState } from "react";
import api from "./services/api";

function App() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [logged, setLogged] = useState(
        !!localStorage.getItem("token")
    );

    const [userEmail, setUserEmail] = useState("");
    const [url, setUrl] = useState("");
    const [resultado, setResultado] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (logged) {
            loadHistory();
            loadUser();
        }
    }, [logged]);

    async function handleLogin() {
        try {
            const response = await api.post(
                "/auth/login",
                {},
                {
                    params: {
                        email,
                        password
                    }
                }
            );

            localStorage.setItem(
                "token",
                response.data.access_token
            );

            setLogged(true);
            alert("Login realizado!");
        } catch (error) {
            console.log(error);
            alert("Erro no login");
        }
    }

    async function loadUser() {
        try {
            const token = localStorage.getItem("token");

            const response = await api.get("/users/me", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setUserEmail(
                response.data.authenticated_user.email
            );
        } catch (error) {
            console.log(error);
        }
    }

    async function loadHistory() {
        try {
            const response = await api.get("/scraper/history");
            setHistory(response.data);
        } catch (error) {
            console.log(error);
        }
    }

    async function executarScraping() {
        try {
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

            setLoading(true);

            const response = await api.get("/scraper/scrape", {
                params: {
                    url: finalUrl
                }
            });

            setResultado(response.data);
            setUrl("");

            await loadHistory();
        } catch (error) {
            console.log(error);
            alert("Erro no scraping");
        } finally {
            setLoading(false);
        }
    }

    async function deleteHistoryItem(id) {
        try {
            await api.delete(`/scraper/history/${id}`);
            await loadHistory();

            alert("Item removido!");
        } catch (error) {
            console.log(error);
            alert("Erro ao excluir");
        }
    }

    function logout() {
        localStorage.removeItem("token");
        setLogged(false);
        setUserEmail("");
        setResultado(null);
        setUrl("");
        setHistory([]);
    }

    if (!logged) {
        return (
            <div style={styles.loginPage}>
                <div style={styles.loginCard}>
                    <h1 style={styles.logo}>
                        WebHarvest Pro
                    </h1>

                    <input
                        placeholder="Email"
                        value={email}
                        onChange={(e) =>
                            setEmail(e.target.value)
                        }
                        style={styles.input}
                    />

                    <input
                        placeholder="Senha"
                        type="password"
                        value={password}
                        onChange={(e) =>
                            setPassword(e.target.value)
                        }
                        style={styles.input}
                    />

                    <button
                        onClick={handleLogin}
                        style={styles.loginButton}
                    >
                        Entrar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.dashboard}>
            <aside style={styles.sidebar}>
                <h2 style={styles.sidebarLogo}>
                    WebHarvest
                </h2>

                <button style={styles.menuButton}>
                    Dashboard
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

                <button
                    onClick={logout}
                    style={styles.logoutButton}
                >
                    Sair
                </button>
            </aside>

            <main style={styles.main}>
                <h1 style={styles.title}>
                    Painel de Controle
                </h1>

                <p style={styles.subtitle}>
                    Plataforma de automação, scraping e análise web.
                </p>

                <div style={styles.cards}>
                    <div style={styles.card}>
                        <h3>Scrapings</h3>
                        <strong>{history.length}</strong>
                        <p>Registros salvos</p>
                    </div>

                    <div style={styles.card}>
                        <h3>Status API</h3>
                        <strong>Online</strong>
                        <p>FastAPI operacional</p>
                    </div>

                    <div style={styles.card}>
                        <h3>Usuário</h3>
                        <strong style={styles.userText}>
                            {userEmail || "Carregando..."}
                        </strong>
                        <p>JWT ativo</p>
                    </div>
                </div>

                <section style={styles.panel}>
                    <h2>Executar Scraping Avançado</h2>

                    <p style={styles.subtitle}>
                        Extraia título, descrição SEO, links, imagens e headings.
                    </p>

                    <div style={styles.scraperForm}>
                        <input
                            type="text"
                            placeholder="Ex: https://github.com"
                            value={url}
                            onChange={(e) =>
                                setUrl(e.target.value)
                            }
                            style={styles.input}
                        />

                        <button
                            onClick={executarScraping}
                            style={styles.scrapeButton}
                        >
                            {loading
                                ? "Executando..."
                                : "Executar"}
                        </button>
                    </div>

                    {resultado && (
                        <div style={styles.resultBox}>
                            <h2>Resultado da Extração</h2>

                            <p>
                                <strong>URL:</strong>{" "}
                                {resultado.url}
                            </p>

                            <p>
                                <strong>Título:</strong>{" "}
                                {resultado.title}
                            </p>

                            <p>
                                <strong>Descrição:</strong>{" "}
                                {resultado.description}
                            </p>

                            <div style={styles.resultStats}>
                                <div style={styles.statMiniCard}>
                                    <strong>
                                        {resultado.links_count}
                                    </strong>
                                    <span>Links encontrados</span>
                                </div>

                                <div style={styles.statMiniCard}>
                                    <strong>
                                        {resultado.images_count}
                                    </strong>
                                    <span>Imagens encontradas</span>
                                </div>
                            </div>

                            <div style={styles.resultSection}>
                                <h3>Headings H1</h3>

                                {resultado.headings?.h1?.length > 0 ? (
                                    resultado.headings.h1.map(
                                        (item, index) => (
                                            <p key={index}>
                                                • {item}
                                            </p>
                                        )
                                    )
                                ) : (
                                    <p style={styles.emptyText}>
                                        Nenhum H1 encontrado.
                                    </p>
                                )}
                            </div>

                            <div style={styles.resultSection}>
                                <h3>Headings H2</h3>

                                {resultado.headings?.h2?.length > 0 ? (
                                    resultado.headings.h2.map(
                                        (item, index) => (
                                            <p key={index}>
                                                • {item}
                                            </p>
                                        )
                                    )
                                ) : (
                                    <p style={styles.emptyText}>
                                        Nenhum H2 encontrado.
                                    </p>
                                )}
                            </div>

                            <div style={styles.resultSection}>
                                <h3>Links encontrados</h3>

                                <div style={styles.scrollBox}>
                                    {resultado.links?.length > 0 ? (
                                        resultado.links.map(
                                            (link, index) => (
                                                <p key={index}>
                                                    <a
                                                        href={link}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        style={styles.link}
                                                    >
                                                        {link}
                                                    </a>
                                                </p>
                                            )
                                        )
                                    ) : (
                                        <p style={styles.emptyText}>
                                            Nenhum link encontrado.
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div style={styles.resultSection}>
                                <h3>Preview de imagens</h3>

                                <div style={styles.imageGrid}>
                                    {resultado.images?.length > 0 ? (
                                        resultado.images
                                            .slice(0, 8)
                                            .map((img, index) => (
                                                <img
                                                    key={index}
                                                    src={img}
                                                    alt=""
                                                    style={styles.previewImage}
                                                />
                                            ))
                                    ) : (
                                        <p style={styles.emptyText}>
                                            Nenhuma imagem encontrada.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </section>

                <section style={styles.panel}>
                    <div style={styles.historyHeader}>
                        <h2>Histórico</h2>

                        <button
                            onClick={loadHistory}
                            style={styles.refreshButton}
                        >
                            Atualizar
                        </button>
                    </div>

                    {history.length === 0 ? (
                        <p style={styles.subtitle}>
                            Nenhum scraping realizado.
                        </p>
                    ) : (
                        history.map((item) => (
                            <div
                                key={item.id}
                                style={styles.historyItem}
                            >
                                <div>
                                    <h3>
                                        {item.title}
                                    </h3>

                                    <p style={styles.historyUrl}>
                                        {item.url}
                                    </p>

                                    <span style={styles.historyBadge}>
                                        ID #{item.id}
                                    </span>
                                </div>

                                <button
                                    onClick={() =>
                                        deleteHistoryItem(item.id)
                                    }
                                    style={styles.deleteButton}
                                >
                                    Excluir
                                </button>
                            </div>
                        ))
                    )}
                </section>
            </main>
        </div>
    );
}

const styles = {
    loginPage: {
        minHeight: "100vh",
        background: "#020617",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Arial"
    },

    loginCard: {
        background: "#0f172a",
        padding: "40px",
        borderRadius: "20px",
        width: "400px",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        border: "1px solid #1e293b"
    },

    logo: {
        color: "white",
        fontSize: "42px"
    },

    input: {
        padding: "15px",
        borderRadius: "10px",
        border: "1px solid #1e293b",
        background: "#111827",
        color: "white",
        outline: "none",
        width: "100%"
    },

    loginButton: {
        padding: "15px",
        border: "none",
        borderRadius: "10px",
        background: "#2563eb",
        color: "white",
        fontWeight: "bold",
        cursor: "pointer"
    },

    dashboard: {
        display: "flex",
        minHeight: "100vh",
        background: "#020617",
        color: "white",
        fontFamily: "Arial"
    },

    sidebar: {
        width: "250px",
        background: "#0f172a",
        padding: "30px",
        display: "flex",
        flexDirection: "column",
        gap: "15px",
        borderRight: "1px solid #1e293b"
    },

    sidebarLogo: {
        marginBottom: "30px"
    },

    menuButton: {
        padding: "14px",
        borderRadius: "10px",
        border: "1px solid #1e293b",
        background: "#111827",
        color: "white",
        cursor: "pointer",
        textAlign: "left",
        fontWeight: "bold"
    },

    logoutButton: {
        marginTop: "auto",
        padding: "14px",
        border: "none",
        borderRadius: "10px",
        background: "#dc2626",
        color: "white",
        cursor: "pointer",
        fontWeight: "bold"
    },

    main: {
        flex: 1,
        padding: "40px",
        maxWidth: "1150px"
    },

    title: {
        fontSize: "42px",
        marginBottom: "10px"
    },

    subtitle: {
        color: "#94a3b8",
        marginBottom: "24px"
    },

    cards: {
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "20px",
        marginTop: "30px",
        marginBottom: "30px"
    },

    card: {
        background: "#0f172a",
        padding: "25px",
        borderRadius: "16px",
        border: "1px solid #1e293b",
        textAlign: "center"
    },

    userText: {
        fontSize: "15px",
        wordBreak: "break-word"
    },

    panel: {
        background: "#0f172a",
        padding: "30px",
        borderRadius: "16px",
        marginBottom: "30px",
        border: "1px solid #1e293b"
    },

    scraperForm: {
        display: "flex",
        gap: "15px",
        marginTop: "20px"
    },

    scrapeButton: {
        padding: "15px 24px",
        border: "none",
        borderRadius: "10px",
        background: "#7c3aed",
        color: "white",
        cursor: "pointer",
        fontWeight: "bold",
        whiteSpace: "nowrap"
    },

    resultBox: {
        marginTop: "25px",
        background: "#020617",
        padding: "24px",
        borderRadius: "14px",
        border: "1px solid #334155"
    },

    resultStats: {
        display: "flex",
        gap: "16px",
        marginTop: "20px",
        marginBottom: "20px"
    },

    statMiniCard: {
        background: "#0f172a",
        padding: "18px",
        borderRadius: "12px",
        border: "1px solid #1e293b",
        display: "flex",
        flexDirection: "column",
        gap: "6px"
    },

    resultSection: {
        marginTop: "25px"
    },

    scrollBox: {
        maxHeight: "220px",
        overflowY: "auto",
        background: "#0f172a",
        padding: "15px",
        borderRadius: "12px",
        border: "1px solid #1e293b"
    },

    link: {
        color: "#60a5fa",
        wordBreak: "break-all"
    },

    imageGrid: {
        display: "flex",
        gap: "12px",
        flexWrap: "wrap"
    },

    previewImage: {
        width: "120px",
        height: "120px",
        objectFit: "cover",
        borderRadius: "12px",
        border: "1px solid #334155",
        background: "#111827"
    },

    emptyText: {
        color: "#94a3b8"
    },

    historyHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
    },

    refreshButton: {
        padding: "10px 16px",
        borderRadius: "10px",
        border: "none",
        background: "#2563eb",
        color: "white",
        cursor: "pointer",
        fontWeight: "bold"
    },

    historyItem: {
        background: "#020617",
        padding: "20px",
        borderRadius: "12px",
        marginTop: "15px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        border: "1px solid #334155",
        gap: "20px"
    },

    historyUrl: {
        color: "#94a3b8",
        wordBreak: "break-all"
    },

    historyBadge: {
        display: "inline-block",
        padding: "6px 10px",
        borderRadius: "999px",
        background: "#1e293b",
        color: "#cbd5e1",
        fontSize: "12px"
    },

    deleteButton: {
        background: "#dc2626",
        border: "none",
        padding: "10px 15px",
        borderRadius: "10px",
        color: "white",
        cursor: "pointer",
        fontWeight: "bold"
    }
};

export default App;