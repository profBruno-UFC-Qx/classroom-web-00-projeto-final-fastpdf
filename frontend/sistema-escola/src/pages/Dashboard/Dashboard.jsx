import React, { useState, useEffect, useRef } from 'react';
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
  MoreVertical,
  Camera,
  Lock
} from 'lucide-react';
import { authService } from '../../services/auth';
import { alunoService } from '../../services/aluno';
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const profileMenuRef = useRef(null);
  const fileInputRef = useRef(null);

  const [alunos, setAlunos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
      return;
    }
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);

    // Carrega foto salva no localStorage
    const savedPhoto = localStorage.getItem(`profile_photo_${currentUser?.email}`);
    if (savedPhoto) setProfilePhoto(savedPhoto);

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

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const getUserInitial = () => {
    if (user?.username) return user.username.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return 'A';
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target.result;
      setProfilePhoto(base64);
      localStorage.setItem(`profile_photo_${user?.email}`, base64);
    };
    reader.readAsDataURL(file);
    setIsProfileMenuOpen(false);
  };

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
      list.push({ number: i, dueDate, dueDateStr });
    }
    return list;
  };

  const getInstallmentForPeriod = (aluno, monthName, yearStr) => {
    const parcelas = aluno.carne?.parcelas || [];
    const monthNum = monthMap[monthName];
    return parcelas.find(p => {
      if (!p.Vencimento) return false;
      const dataVencimento = new Date(p.Vencimento);
      const m = (dataVencimento.getMonth() + 1).toString().padStart(2, '0');
      const y = dataVencimento.getFullYear().toString();
      return m === monthNum && y === yearStr;
    });
  };

  const getInstallmentStatus = (aluno, inst) => {
    if (!inst) return 'A Vencer'; // Segurança contra undefined
    // Verifica primeiro se há um override local ou no histórico legado
    const numero = inst.NumeroParcela || inst.number;
    const savedStatus = aluno.HistoricoPagamentos?.[String(numero)] || localStorage.getItem(`financeiro_status_${aluno.id}_inst_${numero}`);
    if (savedStatus) return savedStatus;
    return inst.StatusPagamento || 'Pendente';
  };

  const activeAlunos = alunos.filter(aluno => {
    const createdYear = new Date(aluno.createdAt || '2026-01-01').getFullYear();
    return createdYear <= Number(selectedYear);
  });

  const totalAlunos = activeAlunos.length;

  let paidCount = 0;
  let pendingCount = 0;
  let overdueCount = 0;

  activeAlunos.forEach(aluno => {
    const parcelas = aluno.carne?.parcelas || [];
    parcelas.forEach(inst => {
      const status = getInstallmentStatus(aluno, inst);
      if (!inst.Vencimento) return;

      const dataVencimento = new Date(inst.Vencimento);
      const instMonth = dataVencimento.getMonth();
      const instYear = dataVencimento.getFullYear();

      const targetMonthIndex = monthNames.indexOf(selectedMonth);
      const targetYearNum = Number(selectedYear);
      const isCurrentMonth = instMonth === targetMonthIndex && instYear === targetYearNum;
      if (status === 'Pago' && isCurrentMonth) {
        paidCount++;
      } else if (status === 'Atrasado') {
        overdueCount++;
      } else if (isCurrentMonth) {
        pendingCount++;
      }
    });
  });

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
          monthTotal += (aluno.ValorMensalidade || 0);
        }
      });

      const label = mName.slice(0, 3);
      chartDataList.push({ month: label, fullName: mName, year: yStr, value: monthTotal });
    }
    return chartDataList;
  };

  const chartData = generateChartData();
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
    if (val >= 1000) return (val / 1000).toFixed(val % 1000 === 0 ? 0 : 1) + 'k';
    return val.toString();
  };

  return (
    <div className="dashboard-container">
      {isSidebarOpen && (
        <div
          style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.4)', zIndex: 99 }}
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside className={`sidebar ${isSidebarOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-top">
          <div className="sidebar-logo">
            <div className="logo-icon"><FileText size={20} /></div>
            <div className="logo-text">
              <h2>FastPDF Admin</h2>
              <span>Administração Escolar</span>
            </div>
            <button className="btn-menu-toggle" style={{ marginLeft: 'auto' }} onClick={() => setIsSidebarOpen(false)}>
              <X size={20} />
            </button>
          </div>

          <ul className="sidebar-menu">
            <li><Link to="/dashboard" className="menu-item active"><LayoutDashboard size={18} />Dashboard</Link></li>
            <li><Link to="/alunos" className="menu-item"><Users size={18} />Alunos</Link></li>
            <li><Link to="/financeiro" className="menu-item"><DollarSign size={18} />Financeiro</Link></li>
            <li><Link to="/configuracoes" className="menu-item"><Settings size={18} />Configurações</Link></li>
          </ul>
        </div>

        <div className="sidebar-bottom">
          {/* <button className="btn-sidebar-action"><FileText size={16} />Gerar PDF</button> */}
          <button className="menu-item-logout" onClick={handleLogout}><LogOut size={18} />Sair</button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button className="btn-menu-toggle" onClick={() => setIsSidebarOpen(true)}><Menu size={24} /></button>
            <div className="search-bar">
              <Search className="search-icon" size={18} />
              <input type="text" className="search-input" placeholder="Buscar alunos, carnês..." />
            </div>
          </div>

          <div className="topbar-actions">
            {/* Input oculto para upload de foto */}
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept="image/*"
              onChange={handlePhotoChange}
            />

            {/* Avatar com dropdown */}
            <div style={{ position: 'relative' }} ref={profileMenuRef}>
              <div
                className="profile-avatar"
                onClick={() => setIsProfileMenuOpen(prev => !prev)}
                style={{ cursor: 'pointer', overflow: 'hidden' }}
              >
                {profilePhoto ? (
                  <img src={profilePhoto} alt="Foto de perfil" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                ) : (
                  getUserInitial()
                )}
              </div>

              {isProfileMenuOpen && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 10px)',
                  right: 0,
                  backgroundColor: 'var(--white)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  boxShadow: 'var(--shadow-lg)',
                  minWidth: '200px',
                  zIndex: 200,
                  overflow: 'hidden'
                }}>
                  {/* Cabeçalho do menu */}
                  <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-light)' }}>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Logado como</p>
                    <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-dark)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user?.email}
                    </p>
                  </div>

                  {/* Opção: Alterar foto */}
                  <button
                    onClick={() => { fileInputRef.current.click(); setIsProfileMenuOpen(false); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.75rem',
                      width: '100%', padding: '0.75rem 1rem',
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontSize: '0.875rem', color: 'var(--text-dark)',
                      textAlign: 'left'
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-light)'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <Camera size={16} style={{ color: 'var(--text-muted)' }} />
                    Alterar foto
                  </button>

                  {/* Opção: Alterar senha */}
                  <button
                    onClick={() => { navigate('/recuperar-senha'); setIsProfileMenuOpen(false); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.75rem',
                      width: '100%', padding: '0.75rem 1rem',
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontSize: '0.875rem', color: 'var(--text-dark)',
                      textAlign: 'left'
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-light)'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <Lock size={16} style={{ color: 'var(--text-muted)' }} />
                    Alterar senha
                  </button>

                  {/* Divisor */}
                  <div style={{ borderTop: '1px solid var(--border)' }} />

                  {/* Opção: Sair */}
                  <button
                    onClick={handleLogout}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.75rem',
                      width: '100%', padding: '0.75rem 1rem',
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontSize: '0.875rem', color: '#ef4444',
                      textAlign: 'left'
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fff5f5'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <LogOut size={16} />
                    Sair
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="page-body">
          <div className="page-header-row">
            <div className="page-title">
              <h1>Visão Geral</h1>
              <p>Acompanhe a saúde financeira e a gestão de alunos.</p>
            </div>
            <div className="page-actions" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button className="btn-action-secondary" onClick={() => navigate('/alunos')}><Plus size={16} />Novo Aluno</button>
              <button className="btn-action-primary" onClick={() => navigate('/financeiro')}><Calendar size={16} />Gerar Carnês</button>
              <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', marginLeft: '1rem' }}>Mês Referência:</span>
              <select className="filter-select" style={{ height: '42px', paddingLeft: '0.75rem', fontWeight: '600' }} value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
                {monthNames.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <select className="filter-select" style={{ height: '42px', paddingLeft: '0.75rem', fontWeight: '600' }} value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                <option value="2024">2024</option>
                <option value="2025">2025</option>
                <option value="2026">2026</option>
              </select>
            </div>
          </div>

          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-card-header"><div className="metric-icon-wrapper metric-icon-blue"><Users size={22} /></div></div>
              <div className="metric-card-body"><div className="metric-title">Total de Alunos</div><div className="metric-value">{loading ? '...' : totalAlunos}</div></div>
            </div>
            <div className="metric-card">
              <div className="metric-card-header"><div className="metric-icon-wrapper metric-icon-green"><CheckCircle size={22} /></div><span className="metric-badge badge-green">NESTE MÊS</span></div>
              <div className="metric-card-body"><div className="metric-title">Parcelas Pagas</div><div className="metric-value">{loading ? '...' : paidCount}</div></div>
            </div>
            <div className="metric-card">
              <div className="metric-card-header"><div className="metric-icon-wrapper metric-icon-orange"><Clock size={22} /></div><span className="metric-badge badge-orange">A VENCER</span></div>
              <div className="metric-card-body"><div className="metric-title">Parcelas Pendentes</div><div className="metric-value">{loading ? '...' : pendingCount}</div></div>
            </div>
            <div className="metric-card metric-card-danger">
              <div className="metric-card-header"><div className="metric-icon-wrapper metric-icon-red"><AlertTriangle size={22} /></div><span className="metric-badge badge-red">ATENÇÃO</span></div>
              <div className="metric-card-body"><div className="metric-title" style={{ color: 'var(--error)' }}>Parcelas Vencidas</div><div className="metric-value" style={{ color: 'var(--error)' }}>{loading ? '...' : overdueCount}</div></div>
            </div>
          </div>

          <div className="chart-card">
            <div className="chart-card-header">
              <div className="chart-card-title"><h3>Visão financeira</h3><p>Recebimentos dos últimos 6 meses</p></div>
            </div>

            <div className="chart-wrapper">
              <svg className="chart-svg" viewBox="0 0 600 250">
                <defs>
                  <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0b2c52" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#0b2c52" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <line x1="45" y1="30" x2="580" y2="30" className="chart-grid-line" />
                <line x1="45" y1="80" x2="580" y2="80" className="chart-grid-line" />
                <line x1="45" y1="130" x2="580" y2="130" className="chart-grid-line" />
                <line x1="45" y1="180" x2="580" y2="180" className="chart-grid-line" />
                <line x1="45" y1="230" x2="580" y2="230" className="chart-grid-line" />
                <text x="35" y="34" textAnchor="end" className="chart-axis-text">{formatYLabel(yAxisMax)}</text>
                <text x="35" y="84" textAnchor="end" className="chart-axis-text">{formatYLabel(yAxisMax * 0.75)}</text>
                <text x="35" y="134" textAnchor="end" className="chart-axis-text">{formatYLabel(yAxisMax * 0.5)}</text>
                <text x="35" y="184" textAnchor="end" className="chart-axis-text">{formatYLabel(yAxisMax * 0.25)}</text>
                <text x="35" y="234" textAnchor="end" className="chart-axis-text">0</text>
                <path d={areaPath} className="chart-area" />
                <path d={linePath} className="chart-line" />
                {points.map((point, index) => (
                  <circle key={index} cx={point.x} cy={point.y} className="chart-dot" onMouseEnter={() => setActiveTooltip(point)} onMouseLeave={() => setActiveTooltip(null)} />
                ))}
                {points.map((point, index) => (
                  <text key={index} x={point.x} y="248" textAnchor="middle" className="chart-axis-text">{point.month}</text>
                ))}
              </svg>

              {activeTooltip && (
                <div className="chart-tooltip" style={{ position: 'absolute', left: `${(activeTooltip.x / 600) * 100}%`, top: `${(activeTooltip.y / 250) * 100 - 24}%`, transform: 'translate(-50%, -100%)', backgroundColor: 'var(--primary)', color: 'var(--white)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', fontWeight: '600', pointerEvents: 'none', boxShadow: 'var(--shadow-lg)', zIndex: 10, whiteSpace: 'nowrap' }}>
                  <div style={{ fontSize: '0.7rem', color: '#a5b4fc', fontWeight: '400', marginBottom: '0.125rem' }}>{activeTooltip.fullName} {activeTooltip.year}</div>
                  <div>R$ {activeTooltip.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
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