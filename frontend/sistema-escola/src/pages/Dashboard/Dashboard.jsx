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
import { alunoService } from '../../services/aluno';
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [activeTooltip, setActiveTooltip] = useState(null);

  // Dynamic student data
  const [alunos, setAlunos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch current user details on mount, ensure authenticated
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
      return;
    }
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);

    const carregarDados = async () => {
      try {
        const data = await alunoService.obterAlunos();
        if (currentUser?.escola?.id) {
          const filtered = data.filter(aluno => aluno.escola?.id === currentUser.escola.id);
          setAlunos(filtered);
        } else {
          setAlunos(data);
        }
      } catch (err) {
        console.error('Erro ao carregar dados no Dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    carregarDados();
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

  // Month and Year navigation/selection
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const getInitialPeriod = () => {
    const today = new Date();
    const curMonth = monthNames[today.getMonth()];
    const curYear = today.getFullYear().toString();
    return { month: curMonth, year: curYear };
  };

  const initialPeriod = getInitialPeriod();
  const [selectedMonth, setSelectedMonth] = useState(initialPeriod.month);
  const [selectedYear, setSelectedYear] = useState(initialPeriod.year);

  const monthMap = {
    Janeiro: '01', Fevereiro: '02', Março: '03', Abril: '04', Maio: '05', Junho: '06',
    Julho: '07', Agosto: '08', Setembro: '09', Outubro: '10', Novembro: '11', Dezembro: '12'
  };

  const getStudentInstallments = (aluno) => {
    const baseDate = new Date(aluno.createdAt || '2026-06-27T12:00:00.000Z');
    const list = [];
    for (let i = 1; i <= 12; i++) {
      const dueDate = new Date(baseDate.getTime() + i * 30 * 24 * 60 * 60 * 1000);
      const dueDateStr = `${dueDate.getDate().toString().padStart(2, '0')}/${(dueDate.getMonth() + 1).toString().padStart(2, '0')}/${dueDate.getFullYear()}`;
      list.push({
        number: i,
        dueDate,
        dueDateStr
      });
    }
    return list;
  };

  const getInstallmentForPeriod = (aluno, monthName, yearStr) => {
    const list = getStudentInstallments(aluno);
    const monthNum = monthMap[monthName] || '06';
    const targetMonthYear = `${monthNum}/${yearStr}`;

    return list.find(inst => {
      const instMonthYear = `${(inst.dueDate.getMonth() + 1).toString().padStart(2, '0')}/${inst.dueDate.getFullYear()}`;
      return instMonthYear === targetMonthYear;
    });
  };

  const getInstallmentStatus = (aluno, inst) => {
    if (!inst) return 'A Vencer';

    const savedStatus = aluno.HistoricoPagamentos?.[inst.number] || localStorage.getItem(`financeiro_status_${aluno.id}_inst_${inst.number}`);
    if (savedStatus) return savedStatus;

    const monthNum = monthNames.indexOf(selectedMonth) + 1;
    const yearNum = Number(selectedYear);
    const instMonth = inst.dueDate.getMonth() + 1;
    const instYear = inst.dueDate.getFullYear();

    // 1. If the installment is in a month prior to the selected period, it is overdue
    const isPastSelectedPeriod = instYear < yearNum || (instYear === yearNum && instMonth < monthNum);
    if (isPastSelectedPeriod) {
      return 'Atrasado';
    }

    // 2. If it is in the selected period, it is Atrasado if today has passed the due date
    const today = new Date();
    if (instYear === yearNum && instMonth === monthNum) {
      if (today > inst.dueDate) {
        return 'Atrasado';
      }
      return 'Pendente';
    }

    return 'A Vencer';
  };

  const today = new Date();

  // 1. Calculate active students (matriculated on or before the selected year)
  const activeAlunos = alunos.filter(aluno => {
    const createdYear = new Date(aluno.createdAt || '2026-01-01').getFullYear();
    return createdYear <= Number(selectedYear);
  });

  const totalAlunos = activeAlunos.length;

  // 2. Calculate dynamic stats for selected month (overdueCount is cumulative across all months)
  let paidCount = 0;
  let pendingCount = 0;
  let overdueCount = 0;

  activeAlunos.forEach(aluno => {
    const installments = getStudentInstallments(aluno);
    installments.forEach(inst => {
      const status = getInstallmentStatus(aluno, inst);
      const instMonth = inst.dueDate.getMonth();
      const instYear = inst.dueDate.getFullYear();

      const targetMonthIndex = monthNames.indexOf(selectedMonth);
      const targetYearNum = Number(selectedYear);
      const isCurrentMonth = instMonth === targetMonthIndex && instYear === targetYearNum;

      if (status === 'Pago' && isCurrentMonth) {
        paidCount++;
      } else if (status === 'Atrasado') {
        overdueCount++; // Cumulative across all months
      } else if (isCurrentMonth) {
        pendingCount++;
      }
    });
  });

  // 3. Generate 6-month chart data ending with the selectedMonth/selectedYear
  const generateChartData = () => {
    const chartDataList = [];
    const targetMonthIndex = monthNames.indexOf(selectedMonth);
    const targetYearNum = Number(selectedYear);

    for (let i = 5; i >= 0; i--) {
      const d = new Date(targetYearNum, targetMonthIndex - i, 1);
      const mName = monthNames[d.getMonth()];
      const yStr = d.getFullYear().toString();

      let monthTotal = 0;
      alunos.forEach(aluno => {
        const inst = getInstallmentForPeriod(aluno, mName, yStr);
        if (!inst) return;

        const status = getInstallmentStatus(aluno, inst);
        if (status === 'Pago') {
          monthTotal += (aluno.ValorMensalidade || 350.00);
        }
      });

      const label = mName.slice(0, 3);
      chartDataList.push({
        month: label,
        fullName: mName,
        year: yStr,
        value: monthTotal
      });
    }
    return chartDataList;
  };

  const chartData = generateChartData();

  // 4. Calculate dynamic SVG rendering points
  const maxVal = Math.max(...chartData.map(d => d.value), 1000);
  const yAxisMax = Math.ceil(maxVal * 1.2 / 1000) * 1000;

  const points = chartData.map((d, index) => {
    const x = 60 + index * 100;
    const y = 230 - (d.value / yAxisMax) * 200;
    return { x, y, ...d };
  });

  const linePath = `M ${points[0].x} ${points[0].y} ` + 
    points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');

  const areaPath = `${linePath} L ${points[5].x} 230 L ${points[0].x} 230 Z`;

  const formatYLabel = (val) => {
    if (val >= 1000) {
      return (val / 1000).toFixed(val % 1000 === 0 ? 0 : 1) + 'k';
    }
    return val.toString();
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
              <Link to="/financeiro" className="menu-item">
                <DollarSign size={18} />
                Financeiro
              </Link>
            </li>
            <li>
              <Link to="/configuracoes" className="menu-item">
                <Settings size={18} />
                Configurações
              </Link>
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
            <div className="page-actions" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button className="btn-action-secondary" onClick={() => navigate('/alunos')}>
                <Plus size={16} />
                Novo Aluno
              </button>
              <button className="btn-action-primary" onClick={() => navigate('/financeiro')}>
                <Calendar size={16} />
                Gerar Carnês
              </button>

              <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', marginLeft: '1rem' }}>Mês Referência:</span>
              <select
                className="filter-select"
                style={{ height: '42px', paddingLeft: '0.75rem', fontWeight: '600' }}
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                <option value="Janeiro">Janeiro</option>
                <option value="Fevereiro">Fevereiro</option>
                <option value="Março">Março</option>
                <option value="Abril">Abril</option>
                <option value="Maio">Maio</option>
                <option value="Junho">Junho</option>
                <option value="Julho">Julho</option>
                <option value="Agosto">Agosto</option>
                <option value="Setembro">Setembro</option>
                <option value="Outubro">Outubro</option>
                <option value="Novembro">Novembro</option>
                <option value="Dezembro">Dezembro</option>
              </select>

              <select
                className="filter-select"
                style={{ height: '42px', paddingLeft: '0.75rem', fontWeight: '600' }}
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                <option value="2024">2024</option>
                <option value="2025">2025</option>
                <option value="2026">2026</option>
              </select>
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
                <div className="metric-value">{loading ? '...' : totalAlunos}</div>
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
                <div className="metric-value">{loading ? '...' : paidCount}</div>
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
                <div className="metric-value">{loading ? '...' : pendingCount}</div>
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
                <div className="metric-value" style={{ color: 'var(--error)' }}>{loading ? '...' : overdueCount}</div>
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
                <text x="35" y="34" textAnchor="end" className="chart-axis-text">{formatYLabel(yAxisMax)}</text>
                <text x="35" y="84" textAnchor="end" className="chart-axis-text">{formatYLabel(yAxisMax * 0.75)}</text>
                <text x="35" y="134" textAnchor="end" className="chart-axis-text">{formatYLabel(yAxisMax * 0.5)}</text>
                <text x="35" y="184" textAnchor="end" className="chart-axis-text">{formatYLabel(yAxisMax * 0.25)}</text>
                <text x="35" y="234" textAnchor="end" className="chart-axis-text">0</text>

                {/* Gradient Area under the spline curve */}
                <path 
                  d={areaPath}
                  className="chart-area" 
                />

                {/* The main spline curve path */}
                <path 
                  d={linePath}
                  className="chart-line" 
                />

                {/* Circle Datapoints with mouse triggers */}
                {points.map((point, index) => (
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
                {points.map((point, index) => (
                  <text key={index} x={point.x} y="248" textAnchor="middle" className="chart-axis-text">
                    {point.month}
                  </text>
                ))}
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
                  <div style={{ fontSize: '0.7rem', color: '#a5b4fc', fontWeight: '400', marginBottom: '0.125rem' }}>{activeTooltip.fullName} {activeTooltip.year}</div>
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
