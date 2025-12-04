//src/Components/Register/index.js

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../../FirebaseConn"; // Importa a instância do Auth
import { createUserWithEmailAndPassword } from "firebase/auth";
import Header from "../Header"; // Assumindo que Header está em ../Header/index.js
import Footer from "../Footer"; // Assumindo que Footer está em ../Footer/index.js

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    /**
     * @description Lida com o processo de cadastro de um novo usuário via Firebase Authentication.
     * @param {Event} e Evento de submissão do formulário.
     */
    async function handleRegister(e) {
        e.preventDefault();

        if (!email || !password) {
            alert('Preencha todos os campos.');
            return;
        }

        if (password.length < 6) {
            alert('A senha deve ter pelo menos 6 caracteres.');
            return;
        }

        try {
            // Cria o usuário no Firebase Auth
            await createUserWithEmailAndPassword(auth, email, password);
            
            // Redireciona para o painel de administração
            navigate('/admin', { replace: true });
            
        } catch (error) {
            // Loga o erro completo e exibe uma mensagem amigável para o usuário
            console.error("Erro ao registrar (objeto completo):", error);
            
            let errorMessage = "Erro ao criar usuário. Tente novamente.";

            if (error.code === 'auth/email-already-in-use') {
                errorMessage = "Este e-mail já está em uso. Tente fazer login.";
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = "O formato do e-mail é inválido.";
            }
            
            alert(errorMessage);
        }
    }

    return (
        <div>
            {/* O Header do CMS */}
            <Header title="Cadastro de Autor" />

            <div className="mt-5 pt-5">
                <div className="container">
                    <div className="row mt-5">
                        <div className="col-12 col-md-4 mx-auto">
                            
                            <h4 className="text-center">Cadastre-se</h4>
                            <p className="text-center">Crie sua conta de autor para começar a publicar.</p>

                            <form className="form-control mb-5 p-4 shadow-sm" onSubmit={handleRegister}>
                                <label className="mb-1">Seu e-mail:</label>
                                <input
                                    className="form-control mb-3"
                                    type="email"
                                    placeholder="teste@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />

                                <label className="mb-1">Sua senha (mín. 6 caracteres):</label>
                                <input
                                    className="form-control mb-3"
                                    autoComplete="off"
                                    type="password"
                                    placeholder="************"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />

                                <button
                                    className="btn btn-primary w-100 mb-3"
                                    type="submit"
                                >
                                    Cadastrar
                                </button>
                            </form>
                            
                            <p className="text-center">
                                <Link to="/">Já possui uma conta? Faça login</Link>
                            </p>

                        </div>
                    </div>
                </div>
            </div>
            
            {/* O Footer do CMS */}
            <Footer />
        </div>
    );
}