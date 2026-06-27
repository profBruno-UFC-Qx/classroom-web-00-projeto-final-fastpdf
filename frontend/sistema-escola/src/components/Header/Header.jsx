import "./Header.css";
import { Search, Bell } from "lucide-react";

function Header() {
  return (
    <header className="header">
      <div className="header-search">
        <Search size={16} className="search-icon" />
        <input
          type="text"
          placeholder="Buscar alunos, turmas..."
          className="search-input"
        />
      </div>

      <div className="header-actions">
        <button className="btn-novo-aluno">
          + Novo Aluno
        </button>
        <div className="header-notification">
          <span className="notification-dot"></span>
        </div>
        <div className="header-avatar">
          <span>A</span>
        </div>
      </div>
    </header>
  );
}

export default Header;