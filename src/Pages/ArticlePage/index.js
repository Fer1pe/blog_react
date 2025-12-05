// src/pages/ArticlePage/index.js

import { useState, useEffect } from "react";
// Importa Link para permitir a navegação para a página individual do artigo
import { Link } from "react-router-dom"; 
import { db } from "../../FirebaseConn";
// Importa orderBy para ordenar os resultados por data
import { collection, query, where, orderBy, getDocs } from "firebase/firestore"; 

import Header from "../../Components/Header";
import Footer from "../../Components/Footer";
import Spinner from "../../Components/Spinner";

export default function ArticlePage() {
    // Agora armazena a lista de artigos (em plural)
    const [articles, setArticles] = useState([]); 
    const [loading, setLoading] = useState(true);

    const formatDate = (date) => {
        if (date instanceof Date && !isNaN(date)) {
            return date.toLocaleDateString("pt-BR");
        }
        return "Data indisponível";
    };

    useEffect(() => {
        async function loadArticles() {
            setLoading(true);

            try {
                const articlesRef = collection(db, "articles");

                // Busca *todos* os artigos publicados, ordenados pela data de criação
                const q = query(
                    articlesRef,
                    where("isPublished", "==", true), // Filtra apenas artigos marcados como "Publicado"
                    orderBy("createdAt", "desc") // Ordena do mais recente para o mais antigo
                );
                const querySnapshot = await getDocs(q);

                const articlesList = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    // Converte Timestamp do Firestore para o objeto Date
                    createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : new Date(),
                }));

                setArticles(articlesList);
                
            } catch (error) {
                console.error("Erro ao buscar artigos:", error);
                setArticles([]);
            } finally {
                setLoading(false);
            }
        }
        
        loadArticles();
    }, []);

    return (
        <div>
            <Header />

            <div className="container mt-5 pt-5 mb-5">
                <div className="row">
                    <div className="col-12 col-md-10 mx-auto">
                        
                        <h1 className="text-center text-primary fw-bold mb-5">Todos os Artigos Publicados</h1>

                        {/* Spinner de Carregamento */}
                        {loading && (
                            <Spinner message="Carregando lista de artigos..." colorClass="text-info" />
                        )}

                        {/* Lista de Artigos Encontrados */}
                        {!loading && articles.length > 0 && (
                            <div className="list-group">
                                {articles.map(article => (
                                    // Cada artigo é um link para sua página individual
                                    <Link 
                                        to={`/artigo/${article.slug}`} 
                                        key={article.id} 
                                        className="list-group-item list-group-item-action flex-column align-items-start mb-3 p-4 shadow-sm rounded-lg border-0"
                                    >
                                        <div className="d-flex w-100 justify-content-between">
                                            <h5 className="mb-1 fw-bold text-dark">{article.title}</h5>
                                            <small className="text-muted">{formatDate(article.createdAt)}</small>
                                        </div>
                                        <p className="mb-1 text-secondary">
                                            {/* Exibe um pequeno snippet do conteúdo, removendo tags HTML */}
                                            {article.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
                                        </p>
                                        <small className="text-primary fw-bold">Leia mais &rarr;</small>
                                    </Link>
                                ))}
                            </div>
                        )}

                        {/* Mensagem de Lista Vazia */}
                        {!loading && articles.length === 0 && (
                            <div className="text-center mt-5 p-5 bg-light rounded shadow-sm">
                                <h2 className="text-secondary">Nenhum Artigo Publicado</h2>
                                <p className="lead mt-3 text-muted">Ainda não há conteúdo disponível no blog.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}