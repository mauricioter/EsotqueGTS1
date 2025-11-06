import React, { useState, useEffect } from "react";
import CadastroEquipamento from "./components/CadastroEquipamento";
import ListaEquipamentos from "./components/ListaEquipamentos";
import SidebarSearch from "./components/SidebarSearch";
import ThemeToggle from "./components/ThemeToggle";
import styles from './styles/theme.module.css';

export default function App() {
  const [search, setSearch] = useState({ query: "", field: "all" });
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("theme") || "light";
    } catch {
      return "light";
    }
  });

  // Listen for theme changes
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "theme") {
        setTheme(e.newValue || "light");
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  function handleSearch(query: string, field: string) {
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

