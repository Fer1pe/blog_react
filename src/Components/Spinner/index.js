// src/Components/Spinner/index.js

import React from 'react'; // Importar React é essencial para usar JSX

/**
 * Componente Spinner de Carregamento.
 * Utiliza as classes de spinner do Bootstrap.
 */
export default function Spinner({ colorClass = 'text-primary', message = 'Carregando...' }) {
    return (
        <div className="text-center mt-5">
            {/* O spinner do Bootstrap */}
            <div className={`spinner-border ${colorClass}`} role="status">
                <span className="visually-hidden">{message}</span>
            </div>
            {/* A mensagem abaixo do spinner */}
            <p className="text-muted mt-2">{message}</p>
        </div>
    );
}