import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import CadastroEquipamento from "./components/CadastroEquipamento";
import ListaEquipamentos from "./components/ListaEquipamentos";
import SidebarSearch from "./components/SidebarSearch";
import ThemeToggle from "./components/ThemeToggle";
import "./index.css";

// Componente principal da aplicação
function App() {
  const [search, setSearch] = useState({ query: "", field: "all" });

  function handleSearch(query, field) {
    setSearch({ query, field });
  }

  return (
    <div className="app-container">
      <div className="row" style={{ justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h1 className="header">Controle de Estoque</h1>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <ThemeToggle />
        </div>
      </div>

      <div className="app-shell">
        <SidebarSearch onSearch={handleSearch} />
        <main className="main">
          <CadastroEquipamento />
          <hr style={{ margin: "20px 0" }} />
          <ListaEquipamentos searchQuery={search.query} searchField={search.field} />
        </main>
      </div>
    </div>
  );
}

// Renderização apenas no cliente
document.addEventListener("DOMContentLoaded", () => {
  const rootElement = document.getElementById("root");
  if (rootElement) {
    ReactDOM.createRoot(rootElement).render(<App />);
  }
});