//src/Components/Register/index.js

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../../FirebaseConn";
import { createUserWithEmailAndPassword } from "firebase/auth";
import Header from "../Header";
import Footer from "../Footer";

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    async function handleRegister(e) { 
        e.preventDefault();

        if (email === '' || password === '') {
            alert('Preencha todos os campos!');
            return;
        }

        try {
            await createUserWithEmailAndPassword(auth, email, password);
            alert('Cadastro realizado com sucesso! Faça login.');
            navigate('/', { replace: true });
        } catch (error) {
            console.error("Erro ao cadastrar:", error);
            if (error.code === 'auth/weak-password') {
                alert('Senha muito fraca, utilize 6 ou mais caracteres.');
            } else if (error.code === 'auth/email-already-in-use') {
                alert('Este e-mail já está em uso.');
            } else {
                alert('Erro ao cadastrar. Tente novamente.');
            }
        }
    }

    return (
        <div>
            <Header /> 

            <div className="mt-5 pt-5">
                <div className="container">
                   
                   <div className="row mt-5">
                        <div className="col-12 col-md-4 mx-auto">
                            
                            {/* Título ajustado para "Autor" */}
                            <h4 className="text-center text-primary fw-bold">Cadastro de Autor</h4>
                            <p className="text-center text-muted">Crie sua conta para publicar artigos.</p>

                            {/* Classe de formulário ajustada para remover o fundo cinza, usando apenas o card/sombra */}
                            <form className="mb-5 p-4 shadow-sm border rounded-3" onSubmit={handleRegister}>
                                <label className="mb-1 fw-semibold">Seu e-mail:</label>
                                <input
                                    className="form-control mb-3"
                                    type="email"
                                    placeholder="teste@empresa.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />

                                <label className="mb-1 fw-semibold">Sua senha (mín. 6 caracteres):</label>
                                <input
                                    className="form-control mb-3"
                                    autoComplete="off"
                                    type="password"
                                    placeholder="************"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />

                                <button
                                    // btn-primary (azul marinho/padrão) é o ideal para o contexto empresarial
                                    className="btn btn-primary w-100 mb-3 fw-bold" 
                                    type="submit"
                                >
                                    Cadastrar
                                </button>
                            </form>
                            
                            <p className="text-center">
                                <Link to="/" className="text-decoration-none text-secondary">
                                    Já possui uma conta? **Faça login**
                                </Link>
                            </p>

                        </div>
                    </div>
                </div>
           
           </div>
            
            <Footer />
        </div>
    );
}