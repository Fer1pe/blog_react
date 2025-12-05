// src/Routers/index.js

import { Routes, Route } from 'react-router-dom'; // Componentes essenciais para definir o roteamento

// Importa os componentes de Página
import Home from '../Pages/home'; // Página inicial do blog, geralmente a lista de posts ou introdução
import Admin from '../Pages/admin'; // Painel de Administração (CRUD de artigos)
import ArticlePage from 'C:\Projetos_VSCode\trab_react\src\Pages\ArticlePage'; // Página que lista *todos* os artigos publicados
//import SingleArticlePage from '../Pages/SingleArticlePage'; // Página para visualizar um único artigo (por slug)

// Importa os componentes de Roteamento e UI
import Private from './Private'; // Componente de Rota Privada (Wrapper de segurança)
import Register from '../Components/Register'; // Componente de formulário de Cadastro/Registro
//import NotFound from '../Pages/NotFound'; // Página 404 dedicada

export default function RoutesApp() {
    return (
        // O componente <Routes> é o contêiner principal para a definição de rotas
        <Routes> 
            {/* ============================================ */}
            {/* ROTAS PÚBLICAS (Acesso sem necessidade de login) */}
            {/* ============================================ */}

            {/* Rota Home/Index */}
            <Route path="/" element={<Home />} />
            
            {/* Rota de Cadastro de Novo Usuário */}
            <Route path="/register" element={<Register />} />

            {/* Rota para a Listagem Completa de Artigos */}
            <Route path="/artigos" element={<ArticlePage />} />

            {/* Rota para a Página Individual do Artigo */}
            {/* O ":slug" é um parâmetro dinâmico. Ex: /artigo/meu-primeiro-post */}
            
            {/* ============================================ */}
            {/* ROTA PRIVADA (Exige Autenticação) */}
            {/* ============================================ */}
            
            {/* Rota para o Painel Administrativo */}
            <Route 
                path="/admin" 
                element={
                    // O componente <Private> envolve o <Admin>. 
                    // Se o usuário não estiver logado, o componente Private irá redirecioná-lo.
                    <Private>
                        <Admin />
                    </Private>
                } 
            />
            
            {/* ============================================ */}
            {/* ROTA FALLBACK (404) */}
            {/* ============================================ */}

        
        </Routes>
    );
}