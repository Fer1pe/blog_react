//src/Pages/home/index.js

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../../FirebaseConn";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import Header from "../../Components/Header";
import Footer from "../../Components/Footer";
import ArticleCard from "../../Components/ArticleCard"; 
import Spinner from "../../Components/Spinner"; // <<< IMPORTADO

export default function Home() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [articles, setArticles] = useState([]);
    const [loadingArticles, setLoadingArticles] = useState(true);
    const [loadingLogin, setLoadingLogin] = useState(false);
    const [loginError, setLoginError] = useState('');


    // 1. Função de Login
    async function handleLogin(e) {
        e.preventDefault();
        setLoadingLogin(true);
        setLoginError('');

        if (email === '' || password === '') {
            setLoginError('Preencha e-mail e senha.');
            setLoadingLogin(false);
            return;
        }

        try {
            await signInWithEmailAndPassword(auth, email, password);
            // Redireciona para admin após o login (o onAuthStateChanged fará a transição)
            navigate('/admin', { replace: true });
        } catch (error) {
            console.error("Erro no login:", error);
            if (error.code === 'auth/invalid-credential') {
                 setLoginError('Credenciais inválidas. Verifique seu e-mail e senha.');
            } else if (error.code === 'auth/user-not-found') {
                setLoginError('Usuário não encontrado.');
            } else {
                 setLoginError('Erro ao fazer login. Tente novamente.');
            }
        } finally {
            setLoadingLogin(false);
        }
    }


    // 2. Função para carregar artigos publicados
    async function loadArticles() {
        setLoadingArticles(true);
        try {
            const articlesRef = collection(db, "articles");
            // Busca apenas artigos que estão publicados, ordenados por data
            const q = query(articlesRef, where("isPublished", "==", true), orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);

            const articlesList = querySnapshot.docs.map(doc => {
                const data = doc.data();
                // Converte o timestamp para objeto Date para exibição
                if (data.createdAt && data.createdAt.toDate) {
                    data.createdAt = data.createdAt.toDate();
                }
                return {
                    id: doc.id,
                    ...data,
                };
            });
            setArticles(articlesList);

        } catch (error) {
            console.error("Erro ao carregar artigos:", error);
            setArticles([]);
        } finally {
            setLoadingArticles(false);
        }
    }

    // 3. Efeito para carregar artigos na montagem e verificar autenticação
    useEffect(() => {
        loadArticles();

        // Listener de autenticação para verificar se o usuário está logado
        const unsub = onAuthStateChanged(auth, (user) => {
            if (user) {
                // Usuário logado - mostra a Home como Blog Principal
                setIsLoggedIn(true);
            } else {
                // Usuário deslogado - mostra a Home como Tela de Login
                setIsLoggedIn(false);
            }
        });

        // Cleanup
        return () => {
            unsub();
        }
    }, []);

    // 4. Renderização
    if (isLoggedIn) {
        // --- VISÃO DO BLOG PRINCIPAL (Usuário Logado) ---
        return (
            <div>
                <Header /> 
                {/* Espaço para o fixed Header */}
                <span className="mt-5">&nbsp;</span> 
                <div className="container mt-5 pt-3 mb-5">
                    <h1 className="text-center text-primary fw-bold">Blog Principal</h1>
                    <p className="text-center mb-4">
                        {/* Botão de Admin alterado para info (azul claro) */}
                        <Link to="/admin" className="btn btn-info btn-sm shadow-sm">
                            Ir para o Painel de Administração
                        </Link>
                    </p>
                  
                    <hr className="mb-5"/>
                    
                    {/* Indicador de Carregamento de Artigos - USANDO O COMPONENTE SPINNER */}
                    {loadingArticles && (
                        <Spinner message="Carregando artigos..." colorClass="text-primary" />
                    )}

                    {/* Lista de Artigos */}
                    {!loadingArticles && articles.length === 0 ?
                    (
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
            <Header /> 
            {/* Espaço para o fixed Header */}
            <span className="mt-5">&nbsp;</span> 
            
            <div className="container">
                <div className="row mt-5">
                    {/* Centraliza o card de login em diferentes tamanhos de tela */}
                    <div className="col-12 col-md-8 col-lg-6 mx-auto"> 
                        <div className="card shadow-lg p-4 mt-5 border-0 rounded-4">
                            {/* Título ajustado para text-primary (azul marinho) e negrito */}
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

                                {/* Botão de Login com Loading State (Mantido inline) */}
                                <button
                                    className="btn btn-primary w-100 fw-bold shadow-sm" 
                                    type="submit"
                                    disabled={loadingLogin}
                                >
                                    {loadingLogin ?
                                    (
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
                            <Link to="/register" className="text-decoration-none text-info"> 
                                Não tem conta? **Crie uma aqui**
                            </Link>
                        </div>

                    </div>
                </div>
           </div>

            <Footer />
        </div>
    );
}