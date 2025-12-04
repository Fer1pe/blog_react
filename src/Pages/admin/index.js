// src/pages/admin/index.js (reescrito para usar o RichTextEditor)
import { useState, useEffect } from "react";
import { db, auth } from "../../FirebaseConn";
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where, orderBy } from "firebase/firestore";
import { signOut } from "firebase/auth";

import Header from "../../Components/Header";
import Footer from "../../Components/Footer";
import RichTextEditor from "../../Components/RichTextEditor"; // <<<<<< IMPORTADO

export default function Admin() {
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [content, setContent] = useState(''); // O conteúdo agora será HTML (string)
    const [isPublished, setIsPublished] = useState(false);
    const [articles, setArticles] = useState([]);
    const [editId, setEditId] = useState(null);
    const [user, setUser] = useState(null);

    // 1. Carrega os artigos do usuário logado
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((loggedInUser) => {
            if (loggedInUser) {
                setUser(loggedInUser);
                loadUserArticles(loggedInUser.uid);
            }
        });
        return () => unsubscribe();
    }, []);

    async function loadUserArticles(uid) {
        const articlesRef = collection(db, 'articles');
        const q = query(articlesRef, where("authorUid", "==", uid), orderBy("createdAt", "desc"));
        
        try {
            const querySnapshot = await getDocs(q);
            const userArticles = [];
            querySnapshot.forEach((doc) => {
                userArticles.push({
                    id: doc.id,
                    ...doc.data(),
                });
            });
            setArticles(userArticles);
        } catch (error) {
            console.error("Erro ao carregar artigos do autor:", error);
        }
    }

    // 2. Cria ou Atualiza Artigo
    async function handleSaveArticle(e) {
        e.preventDefault();

        // Valida se o conteúdo não está vazio (pode ser vazio, mas sem tags HTML)
        if (!title || !slug || !content || content.replace(/<(.|\n)*?>/g, '').trim().length === 0 || !user) {
            alert("Preencha o título, slug e o conteúdo do artigo.");
            return;
        }
        
        const articleData = {
            title,
            slug: slug.toLowerCase().replace(/\s+/g, '-'),
            content, // Salva o conteúdo em formato HTML
            isPublished,
            authorUid: user.uid,
            authorEmail: user.email,
            createdAt: editId ? articles.find(a => a.id === editId).createdAt : new Date(), // Mantém a data de criação no update
            updatedAt: new Date(), // Adiciona data de atualização
        };

        try {
            if (editId) {
                // Atualizar
                const docRef = doc(db, 'articles', editId);
                // Remove a data de criação para não sobrescrever o timestamp
                delete articleData.createdAt; 
                await updateDoc(docRef, articleData); 
                alert('Artigo atualizado com sucesso!');
                setEditId(null); 
            } else {
                // Criar
                await addDoc(collection(db, 'articles'), articleData);
                alert('Artigo criado com sucesso!');
            }

            // Recarrega a lista e limpa o formulário
            loadUserArticles(user.uid);
            setTitle('');
            setSlug('');
            setContent('');
            setIsPublished(false);
            
        } catch (error) {
            console.error("Erro ao salvar artigo:", error);
            alert("Erro ao salvar artigo. Verifique o console.");
        }
    }

    // 3. Entra em Modo de Edição
    function handleEdit(article) {
        setTitle(article.title);
        setSlug(article.slug);
        setContent(article.content);
        setIsPublished(article.isPublished);
        setEditId(article.id);
        window.scrollTo(0, 0); 
    }

    // 4. Excluir Artigo
    async function handleDelete(id) {
        if (window.confirm("Tem certeza que deseja excluir este artigo?")) {
            try {
                const docRef = doc(db, 'articles', id);
                await deleteDoc(docRef);
                alert('Artigo excluído com sucesso!');
                loadUserArticles(user.uid);
            } catch (error) {
                console.error("Erro ao excluir artigo:", error);
            }
        }
    }

    // 5. Função de Logout
    async function handleLogout() {
        await signOut(auth);
        alert('Você foi desconectado!');
    }

    // 6. Renderização
    return (
        <div>
            <Header title="Painel de Administração (CMS)" />
            <span className="mt-5">&nbsp;</span>
            <div className="container mt-5 pt-3">
                <h1 className="text-center">{editId ? 'Editar Artigo' : 'Novo Artigo'}</h1>
                <p className="text-center">Logado como: **{user?.email}**</p>
                <hr/>
                
                <form className="form-control mb-5" onSubmit={handleSaveArticle}>

                    <label className="mt-3 mb-1">Título:</label>
                    <input
                        className="form-control mb-3"
                        type="text"
                        placeholder="Título do artigo..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />

                    <label className="mb-1">Slug (URL amigável):</label>
                    <input
                        className="form-control mb-3"
                        type="text"
                        placeholder="exemplo-de-artigo-aqui"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                    />

                    <label className="mb-1">Conteúdo:</label>
                    {/* >>>>>>> USANDO O EDITOR DE TEXTO RICO AQUI <<<<<<< */}
                    <div className="mb-3">
                        <RichTextEditor
                            value={content}
                            onChange={setContent}
                            placeholder="Escreva seu conteúdo aqui..."
                        />
                    </div>

                    <div className="form-check mb-3">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            checked={isPublished}
                            onChange={(e) => setIsPublished(e.target.checked)}
                            id="isPublishedCheck"
                        />
                        <label className="form-check-label" htmlFor="isPublishedCheck">
                            Publicar Artigo (Visível na Home)
                        </label>
                    </div>

                    <button
                        className={`btn ${editId ? 'btn-info' : 'btn-primary'} mb-3`}
                        type="submit"
                    >
                        {editId ? 'Atualizar Artigo' : 'Criar Artigo'}
                    </button>
                    {editId && (
                        <button
                            className="btn btn-secondary mb-3 ms-2"
                            type="button"
                            onClick={() => {
                                setEditId(null); setTitle(''); setSlug(''); setContent(''); setIsPublished(false);
                            }}
                        >
                            Cancelar Edição
                        </button>
                    )}
                </form>

                {/* Lista de Artigos do Autor (Mantida) */}
                <h2 className="text-center mt-5">Meus Artigos</h2>
                <table className="table table-striped table-hover">
                    <thead>
                        <tr>
                            <th>Título</th>
                            <th>Status</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {articles.map((article) => (
                            <tr key={article.id}>
                                <td>{article.title}</td>
                                <td>
                                    <span className={`badge ${article.isPublished ? 'bg-success' : 'bg-secondary'}`}>
                                        {article.isPublished ? 'Publicado' : 'Rascunho'}
                                    </span>
                                </td>
                                <td>
                                    <button className="btn btn-sm btn-outline-info me-2" onClick={() => handleEdit(article)}>Editar</button>
                                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(article.id)}>Excluir</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {articles.length === 0 && <p className="text-center">Você não tem artigos.</p>}

            </div>

            <button className="btn-logout" onClick={handleLogout}>
                Sair
            </button>
            <Footer />
        </div>
    );
}