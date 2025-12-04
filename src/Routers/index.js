import { Routes, Route } from 'react-router-dom';

// Importa os componentes de Página
import Home from '../Pages/home'; 
import Admin from '../Pages/admin';
import ArticlePage from '../Pages/ArticlePage'; 

// Importa os componentes de Roteamento e UI
import Private from './Private'; // Agora existe!
import Register from '../Components/Register'; // Verifica se o componente existe na pasta Components/Register/index.js

export default function RoutesApp() {
    return (
        <Routes>
            {/* Rotas Públicas */}
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/artigo/:slug" element={<ArticlePage />} /> {/* Rota dinâmica para artigos */}

            {/* Rotas Privadas (exigem login) */}
            <Route path="/admin" element={<Private><Admin /></Private>} />
            
            {/* Adicione uma rota 404 para URLs não encontradas */}
            <Route path="*" element={<Home />} /> 
        </Routes>
    );
}