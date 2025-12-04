//src/pages/ArticlePage/index.js

import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { db } from "../../FirebaseConn";
import { collection, query, where, getDocs } from "firebase/firestore";

import Header from "../../Components/Header";
import Footer from "../../Components/Footer";

export default function ArticlePage() {
    // Pega o parâmetro 'slug' da URL (ex: /artigo/meu-primeiro-artigo)
    const { slug } = useParams(); 
    
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (slug) {
            loadArticleBySlug(slug);
        }
    }, [slug]);

    /**
     * @description Busca o artigo no Firestore usando o slug (e verifica se está publicado).
     * @param {string} articleSlug O slug do artigo na URL.
     */
    async function loadArticleBySlug(articleSlug) {
        setLoading(true);
        setArticle(null); // Limpa o artigo anterior

        try {
            const articlesRef = collection(db, 'articles');
            // Busca pelo slug e garante que o artigo está publicado
            const q = query(
                articlesRef, 
                where("slug", "==", articleSlug),
                where("isPublished", "==", true)
            );
            
            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                // Artigo não encontrado ou não publicado
                console.log(`Artigo com slug "${articleSlug}" não encontrado ou não publicado.`);
                setArticle(null); 
            } else {
                // Artigo encontrado!
                const doc = snapshot.docs[0];
                setArticle({
                    id: doc.id,
                    ...doc.data(),
                    createdAt: doc.data().createdAt?.toDate() || new Date(),
                });
            }

        } catch (error) {
            console.error("Erro ao carregar artigo:", error);
            setArticle(null); 
        } finally {
            setLoading(false);
        }
    }

    // Função auxiliar para formatar a data
    const formatDate = (date) => {
        if (date instanceof Date && !isNaN(date)) {
            return date.toLocaleDateString('pt-BR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
        return 'Data indisponível';
    };

    // Renderização do componente
    return (
        <div>
            <Header title="CMS Blog" />
            <div className="container mt-5 pt-5 mb-5">
                <div className="row">
                    <div className="col-12 col-md-10 mx-auto">

                        {loading && (
                            <div className="text-center mt-5">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Carregando artigo...</span>
                                </div>
                            </div>
                        )}

                        {!loading && article ? (
                            // CONTEÚDO DO ARTIGO
                            <article className="mt-5 p-4 bg-white shadow-sm rounded">
                                <h1 className="display-4 mb-4 text-center">{article.title}</h1>
                                <p className="lead text-muted text-center border-bottom pb-3">
                                    Por **{article.authorEmail}** em {formatDate(article.createdAt)}
                                </p>
                                
                                {/* IMPORTANTE: 
                                    Renderiza o HTML gerado pelo RichTextEditor. 
                                    Isto é NECESSÁRIO para exibir negrito, listas, etc., 
                                    mas só deve ser usado com conteúdo confiável.
                                */}
                                <div 
                                    className="article-content mt-5"
                                    dangerouslySetInnerHTML={{ __html: article.content }} 
                                />
                            </article>
                        ) : (
                            // MENSAGEM DE ERRO (404)
                            !loading && (
                                <div className="text-center mt-5 p-5 bg-light rounded shadow-sm">
                                    <h2 className="text-danger">Erro 404: Artigo Não Encontrado</h2>
                                    <p className="lead mt-3">
                                        O artigo que você está procurando não existe ou ainda não foi publicado.
                                    </p>
                                </div>
                            )
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}