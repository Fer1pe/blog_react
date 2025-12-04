//src/Components/Footer/index.js

import 'bootstrap/dist/css/bootstrap.min.css';
// CORREÇÃO do caminho CSS: Assume que style.css está em src/
import '../../style.css';


export default function Footer() {
  return (
    <nav className="navbar navbar-light bg-pastel-footer fixed-bottom">
      <div className="container">
        <span className="navbar-brand mx-auto">
          Maromo - Exemplo (To Do)
        </span>
      </div>
    </nav>
  );
}