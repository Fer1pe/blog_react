//src/Components/Header/index.js

import 'bootstrap/dist/css/bootstrap.min.css';
import '../../style.css';

export default function Header() {
    return (
        // navbar-dark para melhor contraste com o fundo escuro do bg-pastel-nav
        <nav className="navbar navbar-expand-lg navbar-dark bg-pastel-nav fixed-top">
            <div className="container">
                {/* Texto alterado para o nome do Blog/CMS */}
                <span className="navbar-brand mx-auto fw-bold"> 
                    CMS Empresarial
                </span>
            </div>
        </nav>
    );
}