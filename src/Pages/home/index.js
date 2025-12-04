//src/Pages/home/index.js

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../../FirebaseConn";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";

import Header from "../../Components/Header";
import Footer from "../../Components/Footer";
import ArticleCard from "../../Components/ArticleCard"; 

export default function Home() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    // isLoggedIn monitora se o usuário está autenticado. 
    // Se estiver, mostra o blog; se não, mostra o login de autor.
    const [isLoggedIn, setIsLoggedIn] = useState(false); 
    const [articles, setArticles] = useState([]);
    const [loginError, setLoginError] = useState(''); // Estado para exibir erros de login ao usuário
    const [loadingArticles, setLoadingArticles] = useState(true); // Estado de loading para a lista de artigos
    const [loadingLogin, setLoadingLogin] = useState(false); // Estado de loading para o botão de login

    const navigate = useNavigate();

    // 1. Monitora o estado da autenticação (chamado uma vez na montagem)
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                // Usuário logado: exibe o blog principal
                setIsLoggedIn(true);
                loadArticles();
            } else {
                // Usuário deslogado: exibe o formulário de login do autor
                setIsLoggedIn(false);
                setArticles([]); 
                setLoadingArticles(false); // Garante que o estado de loading é removido
            }
        });
        // Cleanup function para parar de monitorar quando o componente for desmontado
        return () => unsubscribe();
    }, []);

    // 2. Carrega artigos publicados do Firestore
    async function loadArticles() {
        setLoadingArticles(true);
        const articlesRef = collection(db, 'articles');
        
        // Consulta: apenas artigos publicados, ordenados por data de criação decrescente, limitando a 20.
        // ATENÇÃO: Essa consulta requer um índice composto no Firestore para os campos (isPublished, createdAt).
        const q = query(articlesRef, where("isPublished", "==", true), orderBy("createdAt", "desc"), limit(20));

        try {
            const querySnapshot = await getDocs(q);
            const loadedArticles = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                loadedArticles.push({
                    id: doc.id,
                    ...data,
                    // Converte o Timestamp do Firestore para objeto Date do JavaScript
                    createdAt: data.createdAt?.toDate() || new Date(), 
                });
            });
            setArticles(loadedArticles);
        } catch (error) {
            console.error("Erro ao carregar artigos. Verifique a conexão com o Firebase ou se o índice composto foi criado:", error);
            // Poderia adicionar setArticleError aqui se quisesse mostrar uma mensagem na tela principal do blog.
        } finally {
            setLoadingArticles(false);
        }
    }

    // 3. Lógica de Login para Autores
    async function handleLogin(e) {
        e.preventDefault();
        setLoginError(''); // Limpa erros anteriores

        if (!email || !password) {
            setLoginError('Preencha e-mail e senha para login.');
            return;
        }

        setLoadingLogin(true);

        try {
            await signInWithEmailAndPassword(auth, email, password);
            // O onAuthStateChanged será ativado, atualizando isLoggedIn.
            // Redireciona para o painel de administração (após o login bem-sucedido)
            navigate('/admin', { replace: true });
        } catch (error) {
            console.error("Erro ao fazer login (objeto completo):", error);
            
            let message = "Erro ao fazer login. Tente novamente.";
            if (error.code === 'auth/invalid-credential') {
                message = "Credenciais inválidas. Verifique seu e-mail e senha.";
            } else if (error.code === 'auth/user-disabled') {
                message = "Esta conta de usuário foi desativada.";
            } else {
                message = `Erro: ${error.message}`;
            }
            
            setLoginError(message);
        } finally {
            setLoadingLogin(false);
        }
    }

    // 4. Renderização
    if (isLoggedIn) {
        // --- VISÃO DO BLOG PRINCIPAL (Usuário Logado) ---
        return (
            <div>
                <Header title="Blog Principal" />
                {/* Espaço para o fixed Header */}
                <span className="mt-5">&nbsp;</span> 
                <div className="container mt-5 pt-3 mb-5">
                    <h1 className="text-center">Blog Principal</h1>
                    <p className="text-center mb-4">
                        <Link to="/admin" className="btn btn-warning btn-sm shadow-sm">
                            Ir para o Painel de Administração
                        </Link>
                    </p>
                    <hr className="mb-5"/>
                    
                    {/* Indicador de Carregamento de Artigos */}
                    {loadingArticles && (
                        <div className="text-center mt-5">
                             <div className="spinner-border text-primary" role="status">
                                 <span className="visually-hidden">Carregando artigos...</span>
                             </div>
                             <p className="text-muted mt-2">Carregando artigos...</p>
                        </div>
                    )}

                    {/* Lista de Artigos */}
                    {!loadingArticles && articles.length === 0 ? (
                        <p className="text-center mt-5">Nenhum artigo publicado ainda.</p>
                    ) : (
                        <div className="row">
                            {articles.map(article => (
                                <div key={article.id} className="col-12 col-sm-6 col-lg-4 mb-4">
                                    <ArticleCard article={article} /> 
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <Footer />
            </div>
        );
    }

    // --- VISÃO DA ÁREA DE LOGIN (Usuário Deslogado) ---
    return (
        <div>
            <Header title="Área do Autor" />
            {/* Espaço para o fixed Header */}
            <span className="mt-5">&nbsp;</span> 
            
            <div className="container">
                <div className="row mt-5">
                    {/* Centraliza o card de login em diferentes tamanhos de tela */}
                    <div className="col-12 col-md-8 col-lg-6 mx-auto"> 
                        <div className="card shadow-lg p-4 mt-5 border-0 rounded-4">
                            <h4 className="card-title text-center text-primary fw-bold">Login do Autor</h4>
                            <p className="card-subtitle mb-4 text-muted text-center">Entre para gerenciar seus artigos</p>

                            <form onSubmit={handleLogin}>
                                {/* Campo de E-mail */}
                                <div className="mb-3">
                                    <label className="form-label fw-semibold">E-mail:</label>
                                    <input
                                        className="form-control"
                                        type="email"
                                        placeholder="Digite seu e-mail..."
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>

                                {/* Campo de Senha */}
                                <div className="mb-4">
                                    <label className="form-label fw-semibold">Senha:</label>
                                    <input
                                        className="form-control"
                                        autoComplete="off"
                                        type="password"
                                        placeholder="************"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                
                                {/* Mensagem de Erro de Login */}
                                {loginError && (
                                    <div className="alert alert-danger mb-4" role="alert">
                                        {loginError}
                                    </div>
                                )}

                                {/* Botão de Login com Loading State */}
                                <button
                                    className="btn btn-success w-100 fw-bold shadow-sm"
                                    type="submit"
                                    disabled={loadingLogin}
                                >
                                    {loadingLogin ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                            {' Entrando...'}
                                        </>
                                    ) : 'Entrar'}
                                </button>
                            </form>
                        </div>
                        
                        {/* Link de Cadastro */}
                        <div className="text-center mt-3">
                            <Link to="/register" className="text-decoration-none text-primary">
                                Não tem conta? Crie uma aqui
                            </Link>
                        </div>

                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}