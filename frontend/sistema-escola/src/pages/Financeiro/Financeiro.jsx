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
  FileText,
  Filter,
  Download,
  CheckCircle,
  AlertTriangle,
  ChevronDown,
  RotateCcw,
  Camera,
  Lock
} from 'lucide-react';
import { alunoService } from '../../services/aluno';
import { authService } from '../../services/auth';
import './Financeiro.css';

function Financeiro() {
  const navigate = useNavigate();
  const profileMenuRef = useRef(null);
  const photoInputRef = useRef(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);

  // Data states
  const [alunos, setAlunos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

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

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [selectedStudentForPdf, setSelectedStudentForPdf] = useState(null);
  const [pixKey, setPixKey] = useState(localStorage.getItem('admin_pix_key') || 'contato@escola.com');
  const [updateTrigger, setUpdateTrigger] = useState(0);

  const carregarAlunos = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await alunoService.obterAlunos();
      const currentUser = authService.getCurrentUser();
      if (currentUser?.escola?.id) {
        const filtered = data.filter(aluno => aluno.escola?.id === currentUser.escola.id);
        setAlunos(filtered);
      } else {
        setAlunos(data);
      }
    } catch (err) {
      console.error(err);
      setError('Falha ao carregar alunos do Strapi. Certifique-se de que o backend está ativo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
      return;
    }
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    const savedPhoto = localStorage.getItem(`profile_photo_${currentUser?.email}`);
    if (savedPhoto) setProfilePhoto(savedPhoto);
    carregarAlunos();
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

  const getInitials = (name) => {
    if (!name) return 'AL';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
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
    const monthNum = Number(monthMap[selectedMonth] || '06');
    const yearNum = Number(selectedYear);
    const instMonth = inst.dueDate.getMonth() + 1;
    const instYear = inst.dueDate.getFullYear();
    const isPastSelectedPeriod = instYear < yearNum || (instYear === yearNum && instMonth < monthNum);
    if (isPastSelectedPeriod) return 'Atrasado';
    const today = new Date();
    if (instYear === yearNum && instMonth === monthNum) {
      if (today > inst.dueDate) return 'Atrasado';
      return 'Pendente';
    }
    return 'A Vencer';
  };

  const hasOverdueInstallmentsBefore = (aluno, currentInst) => {
    if (!currentInst) return false;
    const installments = getStudentInstallments(aluno);
    return installments.some(inst => {
      if (inst.dueDate >= currentInst.dueDate) return false;
      const status = getInstallmentStatus(aluno, inst);
      return status === 'Atrasado';
    });
  };

  const handleMarkAsPaid = async (aluno) => {
    const inst = getInstallmentForPeriod(aluno, selectedMonth, selectedYear);
    if (inst) {
      try {
        const currentHist = aluno.HistoricoPagamentos || {};
        const novoHistorico = { ...currentHist, [inst.number]: 'Pago' };
        await alunoService.atualizarAluno(aluno.documentId || aluno.id, { HistoricoPagamentos: novoHistorico });
        aluno.HistoricoPagamentos = novoHistorico;
        setUpdateTrigger(prev => prev + 1);
      } catch (err) {
        console.error('Error marking payment as paid on backend:', err);
        alert('Não foi possível registrar o pagamento no servidor.');
      }
    }
  };

  const handleUnmarkPaid = async (aluno) => {
    const inst = getInstallmentForPeriod(aluno, selectedMonth, selectedYear);
    if (inst) {
      try {
        const currentHist = aluno.HistoricoPagamentos || {};
        const novoHistorico = { ...currentHist, [inst.number]: 'Pendente' };
        await alunoService.atualizarAluno(aluno.documentId || aluno.id, { HistoricoPagamentos: novoHistorico });
        aluno.HistoricoPagamentos = novoHistorico;
        setUpdateTrigger(prev => prev + 1);
      } catch (err) {
        console.error('Error unmarking payment on backend:', err);
        alert('Não foi possível alterar o status de pagamento no servidor.');
      }
    }
  };

  const handleOpenPdfModal = (aluno) => {
    setSelectedStudentForPdf(aluno);
    setIsPdfModalOpen(true);
  };

  const handleGeneratePdf = (e) => {
    e.preventDefault();
    if (!selectedStudentForPdf) return;
    localStorage.setItem('admin_pix_key', pixKey);
    setIsPdfModalOpen(false);
    const printUrl = `/print-carne?id=${selectedStudentForPdf.id}&pix=${encodeURIComponent(pixKey)}`;
    window.open(printUrl, '_blank');
  };

  const filteredAlunosLeft = alunos.filter(aluno => {
    const createdYear = new Date(aluno.createdAt || '2026-01-01').getFullYear();
    if (createdYear > Number(selectedYear)) return false;
    const name = aluno.NomeCrianca || '';
    const serie = aluno.SerieCursada || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           serie.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const activeInstallmentsList = alunos.filter(aluno => {
    const createdYear = new Date(aluno.createdAt || '2026-01-01').getFullYear();
    if (createdYear > Number(selectedYear)) return false;
    const name = aluno.NomeCrianca || '';
    const serie = aluno.SerieCursada || '';
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          serie.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    const inst = getInstallmentForPeriod(aluno, selectedMonth, selectedYear);
    return inst !== undefined;
  });

  const calculateStats = () => {
    let totalReceived = 0;
    let totalToReceive = 0;
    let totalOverdue = 0;
    alunos.forEach(aluno => {
      const createdYear = new Date(aluno.createdAt || '2026-01-01').getFullYear();
      if (createdYear > Number(selectedYear)) return;
      const installments = getStudentInstallments(aluno);
      const monthNum = Number(monthMap[selectedMonth] || '06');
      const yearNum = Number(selectedYear);
      installments.forEach(inst => {
        const instMonth = inst.dueDate.getMonth() + 1;
        const instYear = inst.dueDate.getFullYear();
        const isBeforeOrEqual = instYear < yearNum || (instYear === yearNum && instMonth <= monthNum);
        if (!isBeforeOrEqual) return;
        const value = aluno.ValorMensalidade || 350.00;
        const status = getInstallmentStatus(aluno, inst);
        if (status === 'Pago') totalReceived += value;
        else if (status === 'Atrasado') totalOverdue += value;
        else if (instYear === yearNum && instMonth === monthNum) totalToReceive += value;
      });
    });
    return {
      received: totalReceived.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      toReceive: totalToReceive.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      overdue: totalOverdue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
    };
  };

  const stats = calculateStats();
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentInstallments = activeInstallmentsList.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(activeInstallmentsList.length / itemsPerPage);

  return (
    <div className="dashboard-container">
      {isSidebarOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.4)', zIndex: 99 }} onClick={() => setIsSidebarOpen(false)} />
      )}

      <aside className={`sidebar ${isSidebarOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-top">
          <div className="sidebar-logo">
            <div className="logo-icon"><FileText size={20} /></div>
            <div className="logo-text"><h2>FastPDF Admin</h2><span>Administração Escolar</span></div>
            <button className="btn-menu-toggle" style={{ marginLeft: 'auto' }} onClick={() => setIsSidebarOpen(false)}><X size={20} /></button>
          </div>
          <ul className="sidebar-menu">
            <li><Link to="/dashboard" className="menu-item"><LayoutDashboard size={18} />Dashboard</Link></li>
            <li><Link to="/alunos" className="menu-item"><Users size={18} />Alunos</Link></li>
            <li><Link to="/financeiro" className="menu-item active"><DollarSign size={18} />Financeiro</Link></li>
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
              <input type="text" className="search-input" placeholder="Buscar aluno ou fatura..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} />
            </div>
          </div>

          <div className="topbar-actions">
            <input type="file" ref={photoInputRef} style={{ display: 'none' }} accept="image/*" onChange={handlePhotoChange} />

            <div style={{ position: 'relative' }} ref={profileMenuRef}>
              <div className="profile-avatar" onClick={() => setIsProfileMenuOpen(prev => !prev)} style={{ cursor: 'pointer', overflow: 'hidden' }}>
                {profilePhoto ? (
                  <img src={profilePhoto} alt="Foto de perfil" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                ) : getUserInitial()}
              </div>

              {isProfileMenuOpen && (
                <div style={{ position: 'absolute', top: 'calc(100% + 10px)', right: 0, backgroundColor: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-lg)', minWidth: '200px', zIndex: 200, overflow: 'hidden' }}>
                  <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-light)' }}>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Logado como</p>
                    <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-dark)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</p>
                  </div>

                  <button onClick={() => { photoInputRef.current.click(); setIsProfileMenuOpen(false); }}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', padding: '0.75rem 1rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-dark)', textAlign: 'left' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-light)'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <Camera size={16} style={{ color: 'var(--text-muted)' }} /> Alterar foto
                  </button>

                  <button onClick={() => { navigate('/recuperar-senha'); setIsProfileMenuOpen(false); }}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', padding: '0.75rem 1rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-dark)', textAlign: 'left' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-light)'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <Lock size={16} style={{ color: 'var(--text-muted)' }} /> Alterar senha
                  </button>

                  <div style={{ borderTop: '1px solid var(--border)' }} />

                  <button onClick={handleLogout}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', padding: '0.75rem 1rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', color: '#ef4444', textAlign: 'left' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fff5f5'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <LogOut size={16} /> Sair
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="page-body">
          <div className="page-header-row" style={{ marginBottom: '2rem' }}>
            <div className="page-title">
              <h1>Gestão Financeira</h1>
              <p>Controle de carnês e pagamentos de mensalidades.</p>
            </div>
            <div className="page-actions" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>Mês Referência:</span>
              <select className="filter-select" style={{ height: '42px', paddingLeft: '0.75rem', fontWeight: '600' }} value={selectedMonth} onChange={(e) => { setSelectedMonth(e.target.value); setCurrentPage(1); }}>
                {monthNames.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <select className="filter-select" style={{ height: '42px', paddingLeft: '0.75rem', fontWeight: '600' }} value={selectedYear} onChange={(e) => { setSelectedYear(e.target.value); setCurrentPage(1); }}>
                <option value="2024">2024</option>
                <option value="2025">2025</option>
                <option value="2026">2026</option>
              </select>
            </div>
          </div>

          {error && (<div className="error-banner" style={{ marginBottom: '1.5rem' }}><AlertTriangle size={18} /><span>{error}</span></div>)}

          <div className="financeiro-grid">
            <div className="carnes-aluno-card">
              <div className="carnes-aluno-header">
                <h3>Carnês por Aluno</h3>
                <span className="link-ver-todos" style={{ cursor: 'pointer' }}>Ver todos &rarr;</span>
              </div>
              <div className="search-input-wrapper">
                <Search size={16} className="search-icon" />
                <input type="text" placeholder="Filtrar aluno..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
              <div className="student-carnes-list">
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Carregando...</div>
                ) : filteredAlunosLeft.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Nenhum aluno encontrado</div>
                ) : (
                  filteredAlunosLeft.map(aluno => (
                    <div className="student-carne-item" key={aluno.id}>
                      <div className="student-carne-info">
                        <div className="student-avatar" style={{ width: '36px', height: '36px', fontSize: '0.85rem' }}>{getInitials(aluno.NomeCrianca)}</div>
                        <div className="student-carne-details">
                          <h4>{aluno.NomeCrianca}</h4>
                          <span>Série: {aluno.SerieCursada || 'Não Informada'}</span>
                        </div>
                      </div>
                      <button className="btn-gerar-pdf" onClick={() => handleOpenPdfModal(aluno)}>
                        <Download size={12} />Gerar PDF
                      </button>
                    </div>
                  ))
                )}
              </div>
              <div className="list-scroll-footer">Role para ver mais alunos</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="parcelas-card">
                <div className="parcelas-header">
                  <h3>Controle de Parcelas - {selectedMonth}</h3>
                </div>
                <div className="table-container" style={{ boxShadow: 'none', border: 'none' }}>
                  {loading ? (
                    <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>Carregando...</div>
                  ) : filteredAlunosLeft.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>Nenhum registro encontrado.</div>
                  ) : (
                    <table className="alunos-table">
                      <thead>
                        <tr>
                          <th>Vencimento</th><th>Aluno</th><th>Valor (R$)</th><th>Status</th>
                          <th style={{ width: '130px', textAlign: 'center' }}>Ação</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentInstallments.map(aluno => {
                          const inst = getInstallmentForPeriod(aluno, selectedMonth, selectedYear);
                          const hasOverdueBefore = hasOverdueInstallmentsBefore(aluno, inst);
                          const status = hasOverdueBefore ? 'Atrasado' : getInstallmentStatus(aluno, inst);
                          const valor = aluno.ValorMensalidade || 350.00;
                          return (
                            <tr key={aluno.id}>
                              <td><span style={{ fontWeight: status === 'Atrasado' ? '700' : '500', color: status === 'Atrasado' ? 'var(--error)' : 'inherit' }}>{inst ? inst.dueDateStr : 'N/A'}</span></td>
                              <td><span className="responsible-name">{aluno.NomeCrianca}</span></td>
                              <td><span style={{ fontWeight: '600' }}>{valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></td>
                              <td><span className={`status-badge ${status.toLowerCase().replace(' ', '-')}`}>{status.toUpperCase()}</span></td>
                              <td style={{ textAlign: 'center' }}>
                                {status === 'Pago' ? (
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                    <span className="icon-pago-receipt"><FileText size={18} style={{ color: 'var(--text-muted)' }} title="Pago" /></span>
                                    <button className="btn-desmarcar-pago" onClick={() => handleUnmarkPaid(aluno)} title="Desmarcar pagamento" style={{ border: '1px solid #fee2e2', backgroundColor: '#fff5f5', color: '#ef4444', cursor: 'pointer', borderRadius: 'var(--radius-sm)', padding: '0.35rem 0.65rem', fontSize: '0.775rem', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                      <RotateCcw size={12} />Desmarcar
                                    </button>
                                  </div>
                                ) : hasOverdueBefore ? (
                                  <button className="btn-marcar-pago" disabled title="Bloqueado: Regularize as parcelas em atraso de meses anteriores primeiro." style={{ backgroundColor: '#f1f5f9', color: '#94a3b8', border: '1px solid #e2e8f0', cursor: 'not-allowed', opacity: 0.7 }}>
                                    <AlertTriangle size={12} style={{ color: '#ef4444' }} />Bloqueado
                                  </button>
                                ) : (
                                  <button className="btn-marcar-pago" onClick={() => handleMarkAsPaid(aluno)}>
                                    <CheckCircle size={12} />Marcar Pago
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
                {totalPages > 1 && (
                  <div className="pagination-row">
                    <button className="btn-pagination-nav" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>Anterior</button>
                    <div className="pagination-pages">
                      {Array.from({ length: totalPages }).map((_, i) => (
                        <button key={i} className={`btn-page ${currentPage === i + 1 ? 'active' : ''}`} onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
                      ))}
                    </div>
                    <button className="btn-pagination-nav" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>Próximo</button>
                  </div>
                )}
              </div>

              <div className="financeiro-summary-grid">
                <div className="summary-card recebido"><div className="summary-title">Total Recebido</div><div className="summary-value">{stats.received}</div></div>
                <div className="summary-card a-receber"><div className="summary-title">A Receber</div><div className="summary-value">{stats.toReceive}</div></div>
                <div className="summary-card atraso"><div className="summary-title">Em Atraso</div><div className="summary-value">{stats.overdue}</div></div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {isPdfModalOpen && selectedStudentForPdf && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3>Gerar Carnê de 12 Meses</h3>
              <button className="btn-close-modal" onClick={() => setIsPdfModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleGeneratePdf}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ backgroundColor: 'var(--bg-light)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                  <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Aluno selecionado:</p>
                  <h4 style={{ margin: '0 0 0.25rem 0', color: 'var(--primary)' }}>{selectedStudentForPdf.NomeCrianca}</h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Matrícula: {selectedStudentForPdf.Matricula || 'N/A'} | Mensalidade: {(selectedStudentForPdf.ValorMensalidade || 350.00).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                </div>
                <div className="form-group">
                  <label htmlFor="pixKey" style={{ fontWeight: '600' }}>Chave PIX do Administrador</label>
                  <input id="pixKey" type="text" className="input-field" style={{ paddingLeft: '1rem' }} placeholder="Ex: CNPJ, E-mail ou Celular" value={pixKey} onChange={(e) => setPixKey(e.target.value)} required />
                  <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '0.35rem' }}>Esta chave será impressa nas instruções de pagamento de cada uma das 12 parcelas.</small>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-modal-cancel" onClick={() => setIsPdfModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn-modal-save" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}><Download size={16} />Visualizar e Imprimir</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Financeiro;