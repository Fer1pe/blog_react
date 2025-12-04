import { BrowserRouter } from "react-router-dom";
// Importa o componente que define todas as rotas. 
// O caminho é relativo à pasta src/.
import RoutesApp from "./Routers";

/**
 * Componente principal (App)
 *
 * Ele envolve toda a aplicação no BrowserRouter, que é necessário 
 * para usar o sistema de roteamento baseado em URL do React Router.
 */
export default function App() {
  return (
    // O BrowserRouter deve envolver o componente que contém as rotas (RoutesApp).
    <BrowserRouter>
      {/* RoutesApp contém todas as definições de <Route> */}
      <RoutesApp />
    </BrowserRouter>
  );
}