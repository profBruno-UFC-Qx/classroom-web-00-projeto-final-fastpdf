import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  DollarSign, 
  Settings, 
  LogOut, 
  Search, 
  Plus, 
  Bell, 
  HelpCircle, 
  Menu, 
  X, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  FileText,
  Calendar,
  MoreVertical
} from 'lucide-react';
import { authService } from '../../services/auth';
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [activeTooltip, setActiveTooltip] = useState(null);

  const chartData = [
    { month: 'Jan', value: 3000, x: 60, y: 200 },
    { month: 'Fev', value: 8000, x: 160, y: 150 },
    { month: 'Mar', value: 6000, x: 260, y: 170 },
    { month: 'Abr', value: 14000, x: 360, y: 90 },
    { month: 'Mai', value: 11000, x: 460, y: 120 },
    { month: 'Jun', value: 17000, x: 560, y: 60 },
  ];

  // Fetch current user details on mount, ensure authenticated
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
      return;
    }
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  }, [navigate]);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const getUserInitial = () => {
    if (user?.username) return user.username.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return 'A';
  };

  return (
    <div className="dashboard-container">
      {/* Background overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            zIndex: 99
          }}
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`sidebar ${isSidebarOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-top">
          <div className="sidebar-logo">
            <div className="logo-icon">
              <FileText size={20} />
            </div>
            <div className="logo-text">
              <h2>FastPDF Admin</h2>
              <span>Administração Escolar</span>
            </div>
            {/* Close button for mobile sidebar */}
            <button 
              className="btn-menu-toggle" 
              style={{ marginLeft: 'auto' }}
              onClick={() => setIsSidebarOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          <ul className="sidebar-menu">
            <li>
              <Link to="/dashboard" className="menu-item active">
                <LayoutDashboard size={18} />
                Dashboard
              </Link>
            </li>
            <li>
              <Link to="/alunos" className="menu-item">
                <Users size={18} />
                Alunos
              </Link>
            </li>
            <li>
              <a href="#financeiro" className="menu-item">
                <DollarSign size={18} />
                Financeiro
              </a>
            </li>
            <li>
              <a href="#configuracoes" className="menu-item">
                <Settings size={18} />
                Configurações
              </a>
            </li>
          </ul>
        </div>

        <div className="sidebar-bottom">
          <button className="btn-sidebar-action">
            <FileText size={16} />
            Gerar PDF
          </button>
          <button className="menu-item-logout" onClick={handleLogout}>
            <LogOut size={18} />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        {/* Top Header */}
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Hamburger menu button for mobile */}
            <button className="btn-menu-toggle" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <div className="search-bar">
              <Search className="search-icon" size={18} />
              <input 
                type="text" 
                className="search-input" 
                placeholder="Buscar alunos, carnês..." 
              />
            </div>
          </div>

          <div className="topbar-actions">
            <button className="icon-button">
              <Bell size={20} />
              <span 
                style={{
                  position: 'absolute',
                  top: '2px',
                  right: '2px',
                  width: '6px',
                  height: '6px',
                  backgroundColor: '#ef4444',
                  borderRadius: '50%'
                }}
              />
            </button>
            <button className="icon-button">
              <HelpCircle size={20} />
            </button>
            <div className="profile-avatar">
              {getUserInitial()}
            </div>
          </div>
        </header>

        {/* Content Body */}
        <div className="page-body">
          {/* Section Header */}
          <div className="page-header-row">
            <div className="page-title">
              <h1>Visão Geral</h1>
              <p>Acompanhe a saúde financeira e a gestão de alunos.</p>
            </div>
            <div className="page-actions">
              <button className="btn-action-secondary" onClick={() => navigate('/alunos')}>
                <Plus size={16} />
                Novo Aluno
              </button>
              <button className="btn-action-primary">
                <Calendar size={16} />
                Gerar Carnês
              </button>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="metrics-grid">
            {/* Card 1: Total de Alunos */}
            <div className="metric-card">
              <div className="metric-card-header">
                <div className="metric-icon-wrapper metric-icon-blue">
                  <Users size={22} />
                </div>
              </div>
              <div className="metric-card-body">
                <div className="metric-title">Total de Alunos</div>
                <div className="metric-value">98</div>
              </div>
            </div>

            {/* Card 2: Parcelas Pagas */}
            <div className="metric-card">
              <div className="metric-card-header">
                <div className="metric-icon-wrapper metric-icon-green">
                  <CheckCircle size={22} />
                </div>
                <span className="metric-badge badge-green">NESTE MÊS</span>
              </div>
              <div className="metric-card-body">
                <div className="metric-title">Parcelas Pagas</div>
                <div className="metric-value">56</div>
              </div>
            </div>

            {/* Card 3: Parcelas Pendentes */}
            <div className="metric-card">
              <div className="metric-card-header">
                <div className="metric-icon-wrapper metric-icon-orange">
                  <Clock size={22} />
                </div>
                <span className="metric-badge badge-orange">A VENCER</span>
              </div>
              <div className="metric-card-body">
                <div className="metric-title">Parcelas Pendentes</div>
                <div className="metric-value">42</div>
              </div>
            </div>

            {/* Card 4: Parcelas Vencidas */}
            <div className="metric-card metric-card-danger">
              <div className="metric-card-header">
                <div className="metric-icon-wrapper metric-icon-red">
                  <AlertTriangle size={22} />
                </div>
                <span className="metric-badge badge-red">ATENÇÃO</span>
              </div>
              <div className="metric-card-body">
                <div className="metric-title" style={{ color: 'var(--error)' }}>Parcelas Vencidas</div>
                <div className="metric-value" style={{ color: 'var(--error)' }}>2</div>
              </div>
            </div>
          </div>

          {/* Chart Container */}
          <div className="chart-card">
            <div className="chart-card-header">
              <div className="chart-card-title">
                <h3>Visão financeira</h3>
                <p>Recebimentos dos últimos 6 meses</p>
              </div>
              <button className="icon-button">
                <MoreVertical size={20} />
              </button>
            </div>

            {/* Premium Custom SVG Area Chart */}
            <div className="chart-wrapper">
              <svg className="chart-svg" viewBox="0 0 600 250">
                <defs>
                  {/* Linear Gradient for Area Chart */}
                  <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0b2c52" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#0b2c52" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Grid Lines */}
                <line x1="45" y1="30" x2="580" y2="30" className="chart-grid-line" />
                <line x1="45" y1="80" x2="580" y2="80" className="chart-grid-line" />
                <line x1="45" y1="130" x2="580" y2="130" className="chart-grid-line" />
                <line x1="45" y1="180" x2="580" y2="180" className="chart-grid-line" />
                <line x1="45" y1="230" x2="580" y2="230" className="chart-grid-line" />

                {/* Y-Axis Labels */}
                <text x="35" y="34" textAnchor="end" className="chart-axis-text">20k</text>
                <text x="35" y="84" textAnchor="end" className="chart-axis-text">15k</text>
                <text x="35" y="134" textAnchor="end" className="chart-axis-text">10k</text>
                <text x="35" y="184" textAnchor="end" className="chart-axis-text">5k</text>
                <text x="35" y="234" textAnchor="end" className="chart-axis-text">0</text>

                {/* Gradient Area under the spline curve */}
                <path 
                  d="M 60 200 
                     C 100 180, 120 150, 160 150 
                     C 200 150, 220 170, 260 170 
                     C 300 170, 320 90, 360 90 
                     C 400 90, 420 120, 460 120 
                     C 500 120, 520 60, 560 60
                     L 560 230 L 60 230 Z" 
                  className="chart-area" 
                />

                {/* The main spline curve path */}
                <path 
                  d="M 60 200 
                     C 100 180, 120 150, 160 150 
                     C 200 150, 220 170, 260 170 
                     C 300 170, 320 90, 360 90 
                     C 400 90, 420 120, 460 120 
                     C 500 120, 520 60, 560 60" 
                  className="chart-line" 
                />

                {/* Circle Datapoints with mouse triggers */}
                {chartData.map((point, index) => (
                  <circle 
                    key={index}
                    cx={point.x} 
                    cy={point.y} 
                    className="chart-dot" 
                    onMouseEnter={() => setActiveTooltip(point)}
                    onMouseLeave={() => setActiveTooltip(null)}
                  />
                ))}

                {/* X-Axis Labels */}
                <text x="60" y="248" textAnchor="middle" className="chart-axis-text">Jan</text>
                <text x="160" y="248" textAnchor="middle" className="chart-axis-text">Fev</text>
                <text x="260" y="248" textAnchor="middle" className="chart-axis-text">Mar</text>
                <text x="360" y="248" textAnchor="middle" className="chart-axis-text">Abr</text>
                <text x="460" y="248" textAnchor="middle" className="chart-axis-text">Mai</text>
                <text x="560" y="248" textAnchor="middle" className="chart-axis-text">Jun</text>
              </svg>

              {/* Dynamic Interactive Tooltip */}
              {activeTooltip && (
                <div 
                  className="chart-tooltip"
                  style={{
                    position: 'absolute',
                    left: `${(activeTooltip.x / 600) * 100}%`,
                    top: `${(activeTooltip.y / 250) * 100 - 24}%`,
                    transform: 'translate(-50%, -100%)',
                    backgroundColor: 'var(--primary)',
                    color: 'var(--white)',
                    padding: '0.5rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    pointerEvents: 'none',
                    boxShadow: 'var(--shadow-lg)',
                    zIndex: 10,
                    whiteSpace: 'nowrap'
                  }}
                >
                  <div style={{ fontSize: '0.7rem', color: '#a5b4fc', fontWeight: '400', marginBottom: '0.125rem' }}>{activeTooltip.month}</div>
                  <div>R$ {activeTooltip.value.toLocaleString('pt-BR')},00</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
