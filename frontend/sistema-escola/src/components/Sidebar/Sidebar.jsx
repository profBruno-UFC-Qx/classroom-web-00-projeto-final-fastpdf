import "./Sidebar.css";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, CreditCard, Settings, LogOut } from "lucide-react";

function Sidebar() {
  const location = useLocation();

  const links = [
    { to: "/dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { to: "/alunos", label: "Alunos", icon: <Users size={18} /> },
    { to: "/financeiro", label: "Financeiro", icon: <CreditCard size={18} /> },
    { to: "/configuracoes", label: "Configurações", icon: <Settings size={18} /> },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">
          <span>F</span>
        </div>
        <div className="logo-text">
          <strong>FastPDF</strong>
          <span>Admin</span>
          <small>Administração Escolar</small>
        </div>
      </div>

      <nav className="sidebar-nav">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`sidebar-link ${location.pathname === link.to ? "active" : ""}`}
          >
            {link.icon}
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <Link to="/login" className="sidebar-link">
          <LogOut size={18} />
          Sair
        </Link>
      </div>
    </aside>
  );
}

export default Sidebar;