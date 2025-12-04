//src/Components/ArticleCard/index.js

import { Link } from 'react-router-dom';

export default function ArticleCard({ article }) { // Renomeado data para article para consistência
    
    // Garantindo que 'article' seja usado como prop
    const data = article;

    // Função utilitária para pegar um pequeno trecho do conteúdo
    const getSummary = (content) => {
        // Remove HTML/Tags (se vier do RichTextEditor)
        const text = content.replace(/<[^>]+>/g, ''); 
        
        // Limita a 150 caracteres e adiciona '...' se for maior
        return text.substring(0, 150) + (text.length > 150 ? '...' : '');
    };

    // Função para formatar a data (opcional, mas bom para garantir)
    const formatDate = (date) => {
        if (date instanceof Date && !isNaN(date)) {
            return date.toLocaleDateString('pt-BR');
        }
        return 'Data indisponível';
    };

    return (
        <div className="card h-100 shadow-sm">
            <div className="card-body d-flex flex-column">
                <h5 className="card-title">{data.title}</h5>
                <h6 className="card-subtitle mb-2 text-muted">Por: {data.authorEmail}</h6>
                
                <p className="card-text flex-grow-1">
                    {getSummary(data.content)}
                </p>
                
                <Link to={`/artigo/${data.slug}`} className="btn btn-primary mt-3">
                    Ler Mais
                </Link>
            </div>
            <div className="card-footer text-muted">
                {/* Usando o objeto Date diretamente, pois já foi convertido na Home */}
                Publicado em: {formatDate(data.createdAt)} 
            </div>
        </div>
    );
}