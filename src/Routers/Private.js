/*import { useState, useEffect } from 'react';
import { auth } from '../FirebaseConn';
import { onAuthStateChanged } from 'firebase/auth';
import { Navigate } from 'react-router-dom';

export default function Private({ children }) {
    const [loading, setLoading] = useState(true);
    const [signed, setSigned] = useState(false);

    useEffect(() => {
        // Observa o estado de autenticação do Firebase
        const unsub = onAuthStateChanged(auth, (user) => {
            if (user) {
                // Se o usuário existir e estiver logado
                setSigned(true);
            } else {
                // Se o usuário não estiver logado
                setSigned(false);
            }
            setLoading(false);
        });

        // Limpa o listener quando o componente for desmontado
        return () => {
            unsub();
        };

    }, []);

    if (loading) {
        // Exibe uma tela de carregamento enquanto verifica o estado de autenticação
        // (Isso evita que a tela de login apareça e desapareça rapidamente)
        return <div className="text-center mt-5 pt-5">
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>;
    }

    if (!signed) {
        // Redireciona para a página inicial se não estiver logado
        return <Navigate to="/" />;
    }

    // Se estiver logado, renderiza o componente filho (Admin)
    return children;
}

*/


import { useState, useEffect } from "react";
import { auth } from "../FirebaseConn"; // CORREÇÃO: Caminho corrigido
import { onAuthStateChanged } from "firebase/auth";
import { Navigate } from "react-router-dom";
//import Spinner from "../../Components/Spinner"; // Assumindo que você tem um componente Spinner

export default function Private({ children }) {
    const [loading, setLoading] = useState(true);
    const [signed, setSigned] = useState(false);

    useEffect(() => {
        // Verifica o estado da autenticação ao carregar
        const unsub = onAuthStateChanged(auth, (user) => {
            if (user) {
                // Usuário logado
                setSigned(true);
            } else {
                // Usuário deslogado
                setSigned(false);
            }
            setLoading(false);
        });

        return () => {
            unsub();
        };
    }, []);

    if (loading) {
        // Se estiver carregando, mostre um indicador de carregamento
        return <Spinner />; 
    }

    if (!signed) {
        // Se não estiver logado, redireciona para a home/login
        return <Navigate to="/" />;
    }

    // Se estiver logado, renderiza o componente filho (a página admin)
    return children;
}