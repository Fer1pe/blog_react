// src/pages/admin/index.js

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Usado para redirecionar o usuário (ex: para a página de login)
import { db, auth } from "../../FirebaseConn"; // Importa a conexão com o Firebase Firestore (db) e Auth (auth)
// Importa as funções do Firestore para manipular dados:
import { 
    collection, 
    addDoc, 
    getDocs, 
    updateDoc, 
    deleteDoc, 
    doc, 
    query, 
    where, 
    orderBy, 
    serverTimestamp // Cria um timestamp no servidor para consistência
} from "firebase/firestore"; 
// Importa funções do Firebase Auth para gerenciar o estado do login:
import { onAuthStateChanged, signOut } from "firebase/auth"; 
import Header from "../../Components/Header"; 
import Footer from "../../Components/Footer";
import RichTextEditor from "../../Components/RichTextEditor"; // Editor de texto para o conteúdo do artigo

export default function Admin() {

    // ============================================
    // ESTADOS (DADOS E CONTROLE DA INTERFACE)
    // ============================================
    const navigate = useNavigate(); // Hook para navegação programática

    const [user, setUser] = useState(null); // Armazena o objeto do usuário logado (usado para autorização)
    const [title, setTitle] = useState(''); // Estado para o input do Título
    const [slug, setSlug] = useState(''); // Estado para o input do Slug (URL amigável)
    const [content, setContent] = useState(''); // Estado para o conteúdo (HTML) do RichTextEditor
    const [isPublished, setIsPublished] = useState(false); // Estado para o checkbox de Publicação
    const [articles, setArticles] = useState([]); // Lista de artigos do autor para a tabela
    const [editId, setEditId] = useState(null); // ID do artigo em edição (null se estiver criando novo)
    const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
});


    // NOVO: estado para exibir mensagens de sucesso ou erro na UI
    const [systemMessage, setSystemMessage] = useState(null); 

    // ============================================
    // FUNÇÕES DE UTILIDADE
    // ============================================

    /** Formata um objeto Date para o formato DD/MM/AAAA. */
    const formatDate = (date) => {
        if (date instanceof Date && !isNaN(date)) {
            return date.toLocaleDateString('pt-BR');
        }
        return 'Data indisponível';
    };

    /** Cria um slug limpo (minúsculo, sem espaços/caracteres especiais) a partir de um texto. */
    const createSlug = (text) => {
        return text.toLowerCase()
                   .trim()
                   .replace(/\s+/g, '-') // Substitui espaços por hífen
                   .replace(/[^\w-]+/g, '') // Remove caracteres não-alfanuméricos (exceto hífen)
                   .replace(/--+/g, '-'); // Remove hífens duplicados
    };

    // ============================================
    // FUNÇÕES DE MANIPULAÇÃO DE DADOS (CRUD)
    // ============================================

    /** Carrega todos os artigos do usuário logado no Firestore. */
    async function loadArticles() {
        if (!user) return; // Garante que só carrega se houver um usuário logado

        try {
            const articlesRef = collection(db, "articles");
            // Cria uma query: filtra por authorUid e ordena pela data de criação
            const q = query(
                articlesRef,
                where("authorUid", "==", user.uid),
                orderBy("createdAt", "desc")
            );
            const querySnapshot = await getDocs(q);

            const articlesList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                // Converte o Timestamp do Firestore para o objeto Date do JS
                createdAt: doc.data().createdAt ? doc.data().createdAt.toDate() : new Date(),
            }));

            setArticles(articlesList);

            // Log de sucesso no console do navegador (útil para o Console Visual)
            console.log("%c[SISTEMA] Artigos carregados com sucesso.", "color: purple; font-weight: bold;");

        } catch (error) {
            console.error("Erro ao carregar artigos:", error);
        }
    }

    /** Salva ou atualiza um artigo no Firestore. */
    async function handleSaveArticle(e) {
        e.preventDefault(); // Evita o recarregamento da página

        if (title === '' || content === '' || slug === '') {
            alert("Preencha todos os campos obrigatórios (Título, Slug e Conteúdo)!");
            return;
        }

        const articleData = {
            title,
            slug: createSlug(slug),
            content,
            isPublished,
            authorEmail: user.email,
            authorUid: user.uid,
            // Mantém o createdAt original se estiver editando; usa serverTimestamp() se for novo.
            createdAt: editId ? articles.find(a => a.id === editId)?.createdAt : serverTimestamp(),
            updatedAt: serverTimestamp(), // Registra a última modificação
        };

        try {
            if (editId) {
                // MODO EDIÇÃO: Atualiza o documento existente
                const docRef = doc(db, "articles", editId);
                await updateDoc(docRef, articleData);

                console.log("%c[SISTEMA] Artigo atualizado:", "color: green; font-weight: bold;");
                
                setSystemMessage("Artigo atualizado com sucesso!");
            } else {
                // MODO CRIAÇÃO: Adiciona um novo documento à coleção
                const created = await addDoc(collection(db, "articles"), articleData);

                console.log("%c[SISTEMA] Novo artigo criado. ID: " + created.id, "color: blue; font-weight: bold;");
                
                setSystemMessage("Artigo criado com sucesso!");
            }

            // Exibe a mensagem de sistema por 5 segundos
            setTimeout(() => setSystemMessage(null), 5000); 

            // Limpa o formulário e o estado de edição
            setTitle('');
            setSlug('');
            setContent('');
            setIsPublished(false);
            setEditId(null); 

            loadArticles(); // Recarrega a lista para atualizar a tabela

        } catch (error) {
            console.error("Erro ao salvar artigo:", error);
            alert("Erro ao salvar o artigo. Verifique o console.");
        }
    }

    /** Pré-preenche o formulário com os dados do artigo para edição. */
    function handleEdit(article) {
        setEditId(article.id);
        setTitle(article.title);
        setSlug(article.slug);
        setContent(article.content); // Carrega o conteúdo no RichTextEditor
        setIsPublished(article.isPublished);
        window.scrollTo(0, 0); // Rola a página para o topo para que o usuário veja o formulário preenchido
    }

    /** Deleta o artigo selecionado do Firestore. */
    async function handleDelete(id) {
        if (window.confirm("Tem certeza que deseja excluir este artigo?")) {
            try {
                await deleteDoc(doc(db, "articles", id));

                console.log("%c[SISTEMA] Artigo deletado. ID: " + id, "color: red; font-weight: bold;");

                setSystemMessage("Artigo excluído com sucesso!");
                setTimeout(() => setSystemMessage(null), 5000);

                loadArticles(); // Recarrega a lista
            } catch (error) {
                console.error("Erro ao excluir artigo:", error);
                alert("Erro ao excluir o artigo. Verifique o console.");
            }
        }
    }

    /** Desloga o usuário do Firebase Auth. */
    async function handleLogout() {
        await signOut(auth);
    }

   // ============================================
// EFFECTS (AUTENTICAÇÃO, SEGURANÇA, TEMA, CARREGAMENTO)
// ============================================

// 1) Efeito de segurança: monitora o login/logout em tempo real
useEffect(() => {
    const unsub = onAuthStateChanged(auth, (authUser) => {
        if (authUser) {
            setUser(authUser);            // Usuário autenticado
        } else {
            navigate('/', { replace: true });  // Usuário não autenticado → sair
        }
    });

    // Cleanup ao desmontar o componente
    return () => unsub();
// eslint-disable-next-line react-hooks/exhaustive-deps
}, []);


// 2) Efeito para carregar artigos quando o usuário estiver disponível
useEffect(() => {
    if (user) {
        loadArticles();
    }
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [user]);


// 3) Efeito do Dark Mode: aplica CSS no <body> e salva no localStorage
useEffect(() => {
    document.body.classList.toggle("admin-dark-mode", darkMode);
    localStorage.setItem("darkMode", darkMode);
}, [darkMode]);

 // ============================================
// RENDERIZAÇÃO E ESTRUTURA DA UI (Bootstrap)
// ============================================

return (
    <div className={`admin-panel ${darkMode ? "admin-dark-mode" : ""}`}>
        <Header />

        <span className="mt-5">&nbsp;</span>

        <div className="container mt-5 pt-3 mb-5">

            {/* Feedback do sistema */}
            {systemMessage && (
                <div className="alert alert-success text-center fw-semibold shadow-sm mb-4">
                    {systemMessage}
                </div>
            )}

            <div className="d-flex justify-content-between align-items-center">
                <h1 className="text-primary fw-bold">
                    {editId ? "Editar Artigo" : "Novo Artigo"}
                </h1>

                {/* Botão Dark Mode */}
                <button
                    className="btn btn-outline-dark fw-bold shadow-sm"
                    onClick={() => setDarkMode(!darkMode)}
                >
                    {darkMode ? "Modo Claro" : "Modo Escuro"}
                </button>
            </div>

            <p className="text-muted small">
                Logado como: <b>{user?.email}</b>
            </p>
            <hr />
{/* FORMULÁRIO */}
<div className="row justify-content-center">
    <div className="col-12 col-lg-10">
        <form
            className="form-control mb-5 p-4 bg-white shadow-lg rounded-4 border-0"
            onSubmit={handleSaveArticle}
        >

            {/* Título */}
            <label className="mt-3 mb-1 fw-semibold text-dark">Título:</label>
            <input
                type="text"
                className="form-control mb-3"
                placeholder="Digite o título do artigo"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
            />

            {/* Slug */}
            <label className="mb-1 fw-semibold text-dark">
                Slug (URL amigável):
            </label>
            <input
                type="text"
                className="form-control mb-1"
                placeholder="ex: meu-artigo-super-legal"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
            />

            <p className="small text-muted fst-italic mb-3">
                Exemplo: /artigo/{createSlug(slug || "seu-slug")}
            </p>


                        {/* RichTextEditor */}
                        <label className="mb-1 fw-semibold text-dark">Conteúdo:</label>
                        <div className="mb-3">
                            <RichTextEditor value={content} onChange={setContent} />
                        </div>

                        {/* Publicação */}
                        <div className="form-check form-switch mb-4">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                checked={isPublished}
                                onChange={(e) => setIsPublished(e.target.checked)}
                                id="isPublishedCheck"
                                role="switch"
                            />
                            <label
                                className="form-check-label fw-semibold text-secondary"
                                htmlFor="isPublishedCheck"
                            >
                                Publicar Artigo ({isPublished ? "Visível" : "Rascunho"})
                            </label>
                        </div>

                        {/* Botões */}
                        <button
                            className={`btn ${
                                editId ? "btn-info text-white" : "btn-primary"
                            } fw-bold shadow-sm me-3`}
                            type="submit"
                        >
                            {editId ? "Salvar Alterações" : "Criar Novo Artigo"}
                        </button>

                        {editId && (
                            <button
                                className="btn btn-secondary fw-bold shadow-sm"
                                type="button"
                                onClick={() => {
                                    setEditId(null);
                                    setTitle("");
                                    setSlug("");
                                    setContent("");
                                    setIsPublished(false);
                                }}
                            >
                                Cancelar Edição
                            </button>
                        )}
                    </form>
                </div>
            </div>

            {/* ============================
                Seção 4: PAINEL DE MONITORAMENTO
            ============================ */}
            <div className="mt-5 pt-4">

                {/* CARD 1: CONTADOR */}
                <div className="bg-white shadow-lg rounded-4 p-4 mb-5 border-start border-4 border-primary">
                    <h3 className="fw-bold text-primary mb-3">Resumo do Painel</h3>
                    <p><b>Total de artigos:</b> {articles.length}</p>
                    <p><b>Publicados:</b> {articles.filter(a => a.isPublished).length}</p>
                    <p><b>Rascunhos:</b> {articles.filter(a => !a.isPublished).length}</p>
                </div>

                {/* CARD 2: CONSOLE VISUAL */}
                <div className="bg-black text-white rounded-4 shadow-lg p-3 mb-5" style={{ minHeight: "250px" }}>
                    <h4 className="fw-bold text-warning mb-3">Console Interno</h4>
                    <div
                        id="consoleViewer"
                        style={{
                            height: "180px",
                            overflowY: "auto",
                            fontFamily: "monospace",
                            whiteSpace: "pre-line",
                            fontSize: "14px"
                        }}
                    ></div>
                </div>

                {/* SCRIPT DE CAPTURA DE LOGS */}
                <script dangerouslySetInnerHTML={{
                    __html: `
                        (function() {
                            const oLog = console.log;
                            const oError = console.error;
                            const consoleDiv = document.getElementById("consoleViewer");
                            if (!consoleDiv) return;

                            function write(msg, color) {
                                const line = document.createElement("div");
                                line.style.color = color;
                                line.textContent = msg;
                                consoleDiv.appendChild(line);
                                consoleDiv.scrollTop = consoleDiv.scrollHeight;
                            }

                            console.log = function(...args) {
                                write(args.join(" "), "#00eaff");
                                oLog.apply(console, args);
                            };

                            console.error = function(...args) {
                                write(args.join(" "), "red");
                                oError.apply(console, args);
                            };

                            write("[SISTEMA] Console inicializado...", "yellow");
                        })();
                    `
                }} />

                {/* CARD 3: PREVIEW AO VIVO */}
                <div className="bg-white shadow-lg rounded-4 p-4 mb-5 border-start border-4 border-success">
                    <h3 className="fw-bold text-success mb-4">Preview do Artigo</h3>

                    {title.trim() === "" && content.trim() === "" ? (
                        <p className="text-muted fst-italic">
                            O preview será exibido aqui após você começar a escrever...
                        </p>
                    ) : (
                        <div>
                            <h2 className="fw-bold text-dark">{title || "Sem título"}</h2>
                            <p className="text-muted small mb-3">
                                /{slug ? createSlug(slug) : "seu-slug"}
                            </p>
                            <hr/>
                            <div
                                dangerouslySetInnerHTML={{ __html: content }}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* FOOTER DE AÇÕES */}
            <div className="text-center my-5">
                <button className="btn btn-danger btn-lg fw-bold shadow-sm" onClick={handleLogout}>
                    Sair do Painel
                </button>
                <a href="/" className="btn btn-secondary btn-lg fw-bold shadow-sm ms-3">
                    Ver Blog
                </a>
            </div>

        </div>

        <Footer />
    </div>
);
}




