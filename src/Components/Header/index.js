/*
// src/Components/Header/index.js (modificado)
import 'bootstrap/dist/css/bootstrap.min.css';
import '../style.css';
import { Link } from 'react-router-dom';

// Aceita uma prop 'title'
export default function Header({ title = 'CMS Blog' }) { 
    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-pastel-nav fixed-top">
            <div className="container">
                <Link className="navbar-brand mx-auto" to="/">
                    {title}
                </Link>
            </div>
        </nav>
    );
}
*/

//src/Components/Header/index.js

import 'bootstrap/dist/css/bootstrap.min.css';
// CORREÇÃO do caminho CSS: Assume que style.css está em src/
import '../../style.css';


export default function Header() {
    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-pastel-nav fixed-top">
            <div className="container">
                <span className="navbar-brand mx-auto">
                    Lista de Tarefas
                </span>
            </div>
        </nav>
    );
}