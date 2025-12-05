//src/Components/ArticleCard/index.js

import { Link } from 'react-router-dom';

export default function ArticleCard({ article }) { 
    
    const data = article;

    // Função utilitária para pegar um pequeno trecho do conteúdo
    const getSummary = (content) => {
        // Remove HTML/Tags (se vier do RichTextEditor)
        const text = content.replace(/<[^>]+>/g, '');
        // Limita a 150 caracteres e adiciona '...' se for maior
        return text.substring(0, 150) + (text.length > 150 ? '...' : '');
    };

    // Função para formatar a data
    const formatDate = (date) => {
        if (date instanceof Date && !isNaN(date)) {
            return date.toLocaleDateString('pt-BR');
        }
        return 'Data indisponível';
    };

    return (
        // Card clean (h-100 e shadow-sm mantidos)
        <div className="card h-100 shadow-sm border-0"> 
            <div className="card-body d-flex flex-column">
                <h5 className="card-title fw-bold text-primary">{data.title}</h5>
                {/* Cor do subtítulo ajustada para ser um pouco mais visível */}
                <h6 className="card-subtitle mb-2 text-secondary small">Por: {data.authorEmail}</h6> 
                
                <p className="card-text flex-grow-1 text-muted">
                   {getSummary(data.content)}
                </p>
                
                {/* Alterado para btn-info (azul corporativo) e mt-auto para alinhar na base */}
                <Link to={`/artigo/${data.slug}`} className="btn btn-info mt-auto fw-bold">
                    Ler Mais
                </Link>
            </div>
            {/* Footer do card com fundo cinza claro e texto secundário */}
            <div className="card-footer text-muted small bg-light"> 
                {/* Usando o objeto Date diretamente, pois já foi convertido na Home */}
                Publicado em: {formatDate(data.createdAt)} 
            </div>
        </div>
    );
}