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
  MoreVertical,
  Upload,
  AlertTriangle,
  Download,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { alunoService } from '../../services/aluno';
import { authService } from '../../services/auth';
import './Alunos.css';

function Alunos() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Layout states
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);

  // Data states
  const [alunos, setAlunos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter and pagination states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTurma, setSelectedTurma] = useState('Todas');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [showCsvInfo, setShowCsvInfo] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nomeAluno, setNomeAluno] = useState('');
  const [turmaSerie, setTurmaSerie] = useState('1ª Série');
  const [mensalidade, setMensalidade] = useState('R$ 0,00');
  const [nomeResponsavel, setNomeResponsavel] = useState('');
  const [emailResponsavel, setEmailResponsavel] = useState('');
  const [telefoneResponsavel, setTelefoneResponsavel] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentEditingStudentId, setCurrentEditingStudentId] = useState(null);
  const [activeMenuStudentId, setActiveMenuStudentId] = useState(null);
  const [modalSaving, setModalSaving] = useState(false);
  const [modalError, setModalError] = useState('');
  const [isAtivo, setIsAtivo] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [studentToDeleteId, setStudentToDeleteId] = useState(null);
  const [studentToDeleteName, setStudentToDeleteName] = useState('');
  const [deleteSaving, setDeleteSaving] = useState(false);

  const carregarAlunos = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await alunoService.obterAlunos();
      setAlunos(data);
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
    setUser(authService.getCurrentUser());
    carregarAlunos();
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

  // Helper to format currency R$ dynamically
  const handleCurrencyChange = (e) => {
    const rawValue = e.target.value;
    const cleanValue = rawValue.replace(/\D/g, '');
    if (!cleanValue) {
      setMensalidade('R$ 0,00');
      return;
    }
    const cents = parseInt(cleanValue, 10);
    const formatted = (cents / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
    setMensalidade(formatted);
  };

  const handlePhoneChange = (e) => {
    let value = e.target.value;
    value = value.replace(/\D/g, '');
    if (value.length > 0) {
      value = '(' + value;
    }
    if (value.length > 3) {
      value = [value.slice(0, 3), ') ', value.slice(3)].join('');
    }
    if (value.length > 10) {
      value = [value.slice(0, 10), '-', value.slice(10, 14)].join('');
    }
    if (value.length > 15) {
      value = value.slice(0, 15);
    }
    setTelefoneResponsavel(value);
  };

  const handleOpenNewModal = () => {
    setIsEditMode(false);
    setCurrentEditingStudentId(null);
    setNomeAluno('');
    setTurmaSerie('1ª Série');
    setMensalidade('R$ 0,00');
    setNomeResponsavel('');
    setEmailResponsavel('');
    setTelefoneResponsavel('');
    setModalError('');
    setIsAtivo(true);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setCurrentEditingStudentId(null);
    setNomeAluno('');
    setTurmaSerie('1ª Série');
    setMensalidade('R$ 0,00');
    setNomeResponsavel('');
    setEmailResponsavel('');
    setTelefoneResponsavel('');
    setModalError('');
    setIsAtivo(true);
  };

  const handleEditClick = (aluno) => {
    setIsEditMode(true);
    setIsAtivo(aluno.Ativo !== false);
    setCurrentEditingStudentId(aluno.documentId || aluno.id);
    
    setNomeAluno(aluno.NomeCrianca || '');
    setTurmaSerie(aluno.SerieCursada || '1ª Série');
    
    const val = aluno.ValorMensalidade || 0;
    const formatted = val.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
    setMensalidade(formatted);
    
    setNomeResponsavel(aluno.NomeResponsavel || '');
    setEmailResponsavel(aluno.ContaResponavel || '');
    setTelefoneResponsavel(aluno.TelefoneResponsavel || '');
    
    setIsModalOpen(true);
    setActiveMenuStudentId(null);
  };

  const handleOpenDeleteModal = (aluno) => {
    setActiveMenuStudentId(null);
    setStudentToDeleteId(aluno.documentId || aluno.id);
    setStudentToDeleteName(aluno.NomeCrianca || '');
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setStudentToDeleteId(null);
    setStudentToDeleteName('');
  };

  const handleConfirmDelete = async () => {
    if (!studentToDeleteId) return;
    setDeleteSaving(true);
    try {
      await alunoService.deletarAluno(studentToDeleteId);
      setIsDeleteModalOpen(false);
      setStudentToDeleteId(null);
      setStudentToDeleteName('');
      carregarAlunos();
    } catch (err) {
      console.error(err);
      alert(err.message || 'Falha ao deletar aluno no Strapi.');
    } finally {
      setDeleteSaving(false);
    }
  };

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.actions-dropdown-container')) {
        setActiveMenuStudentId(null);
      }
    };
    window.addEventListener('click', handleOutsideClick);
    return () => {
      window.removeEventListener('click', handleOutsideClick);
    };
  }, []);

  // CSV Parser helper (handles commas and optional quotes)
  const parseCSV = (text) => {
    const lines = text.split(/\r?\n/);
    if (lines.length < 2) return [];

    // Header row
    const cleanHeaderRow = lines[0].replace(/^\uFEFF/, '');
    const headers = cleanHeaderRow.split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));

    const results = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Matches commas not enclosed in quotes
      const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.trim().replace(/^["']|["']$/g, ''));

      const obj = {};
      headers.forEach((header, idx) => {
        obj[header] = values[idx] || '';
      });
      results.push(obj);
    }
    return results;
  };

  const downloadCSVTemplate = () => {
    const headers = 'Nome,Turma,Mensalidade,Responsavel,Email,Telefone';
    const rows = [
      'Ana Clara Souza,1ª Série,350.00,Carlos Souza,carlos@email.com,(11) 98765-4321',
      'Bruno Santos,3ª Série,420.00,Mariana Santos,mariana@email.com,(21) 99876-5432',
      'Carla Dias,8ª Série,500.00,Roberto Dias,roberto@email.com,(31) 97654-3210'
    ];
    const csvContent = '\uFEFF' + [headers, ...rows].join('\n'); // UTF-8 BOM so Excel opens it with correct accents
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'modelo_importacao_alunos.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCsvImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target.result;
      try {
        const parsedRows = parseCSV(text);
        if (parsedRows.length === 0) {
          alert('O arquivo CSV está vazio ou possui formatação inválida.');
          return;
        }

        setLoading(true);
        let successCount = 0;
        let errorCount = 0;

        for (const row of parsedRows) {
          const nomeCrianca = row.Nome || row.nome || row.NomeCrianca;
          const serieCursada = row.Turma || row.turma || row.SerieCursada;
          const valorMensalidadeRaw = row.Mensalidade || row.mensalidade || row.ValorMensalidade;
          const nomeResponsavel = row.Responsavel || row.responsavel || row.NomeResponsavel;
          const contaResponsavel = row.Email || row.email || row.ContaResponavel;
          const telefoneResponsavelVal = row.Telefone || row.telefone || row.TelefoneResponsavel || '';

          if (!nomeCrianca) continue;

          // Convert formatted currency to float number
          let valorDecimal = 0;
          if (valorMensalidadeRaw) {
            const cleanVal = valorMensalidadeRaw.replace(/[^\d,.-]/g, '').replace(',', '.');
            valorDecimal = parseFloat(cleanVal) || 0;
          }

          // Generate random unique registration code
          const matricula = `2026-${Math.floor(100 + Math.random() * 900)}-${Math.floor(10 + Math.random() * 90)}`;

          const payload = {
            NomeCrianca: nomeCrianca,
            Matricula: matricula,
            SerieCursada: serieCursada || 'Não Informada',
            NomeResponsavel: nomeResponsavel || 'Não Informado',
            ContaResponavel: contaResponsavel || 'contato@escola.com', // Matches exact backend case spelling
            TelefoneResponsavel: telefoneResponsavelVal,
            ValorMensalidade: valorDecimal
          };

          try {
            await alunoService.cadastrarAluno(payload);
            successCount++;
          } catch (err) {
            console.error('Erro ao importar linha:', row, err);
            errorCount++;
          }
        }

        alert(`Processamento concluído!\n${successCount} alunos importados com sucesso.${errorCount > 0 ? `\n${errorCount} cadastros falharam.` : ''}`);
        carregarAlunos();
      } catch (err) {
        console.error(err);
        alert('Erro ao decodificar o arquivo CSV.');
      }
    };
    reader.readAsText(file, 'UTF-8');

    // Clear input so same file can be imported again
    e.target.value = '';
  };

  const handleManualSave = async (e) => {
    e.preventDefault();
    setModalError('');

    if (!nomeAluno.trim() && !isEditMode) {
      setModalError('Nome do aluno é obrigatório.');
      return;
    }
    if (!nomeResponsavel.trim()) {
      setModalError('Nome do responsável é obrigatório.');
      return;
    }
    if (emailResponsavel && !isEditMode) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailResponsavel)) {
        setModalError('Por favor, informe um e-mail válido.');
        return;
      }
    }

    setModalSaving(true);

    // Clean currency string to decimal BRL value
    const cleanVal = mensalidade.replace(/[^\d,.-]/g, '').replace(',', '.');
    const valorDecimal = parseFloat(cleanVal) || 0;

    try {
      if (isEditMode) {
        const payload = {
          NomeResponsavel: nomeResponsavel.trim(),
          TelefoneResponsavel: telefoneResponsavel.trim(),
          ValorMensalidade: valorDecimal,
          Ativo: isAtivo
        };
        await alunoService.atualizarAluno(currentEditingStudentId, payload);
      } else {
        // Generate random unique registration code
        const matricula = `2026-${Math.floor(100 + Math.random() * 900)}-${Math.floor(10 + Math.random() * 90)}`;
        const payload = {
          NomeCrianca: nomeAluno.trim(),
          Matricula: matricula,
          SerieCursada: turmaSerie,
          NomeResponsavel: nomeResponsavel.trim(),
          ContaResponavel: emailResponsavel.trim() || 'contato@escola.com',
          TelefoneResponsavel: telefoneResponsavel.trim(),
          ValorMensalidade: valorDecimal,
          Ativo: isAtivo
        };
        await alunoService.cadastrarAluno(payload);
      }

      setIsModalOpen(false);

      // Clean modal inputs
      setNomeAluno('');
      setTurmaSerie('1ª Série');
      setMensalidade('R$ 0,00');
      setNomeResponsavel('');
      setEmailResponsavel('');
      setTelefoneResponsavel('');
      setIsEditMode(false);
      setCurrentEditingStudentId(null);

      carregarAlunos();
    } catch (err) {
      console.error(err);
      setModalError(err.message || 'Falha ao salvar aluno. Verifique a conexão com o Strapi.');
    } finally {
      setModalSaving(false);
    }
  };

  // Filter and search logic
  const filteredAlunos = alunos.filter(aluno => {
    // Strapi returns fields nested or flat depending on populated API setup.
    // In Strapi v5 document attributes are in the root object of the element.
    const attr = aluno;

    const childName = attr.NomeCrianca || '';
    const code = attr.Matricula || '';
    const parentName = attr.NomeResponsavel || '';
    const grade = attr.SerieCursada || '';

    const matchesSearch =
      childName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      parentName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTurma = selectedTurma === 'Todas' || grade === selectedTurma;

    return matchesSearch && matchesTurma;
  });

  // Pagination calculation
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAlunos.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAlunos.length / itemsPerPage);

  const getInitials = (name) => {
    if (!name) return 'AL';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  // Get distinct classes for filter dropdown
  const getUniqueTurmas = () => {
    const turmas = new Set();
    alunos.forEach(a => {
      if (a.SerieCursada) turmas.add(a.SerieCursada);
    });
    return ['Todas', ...Array.from(turmas)];
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
              <Link to="/dashboard" className="menu-item">
                <LayoutDashboard size={18} />
                Dashboard
              </Link>
            </li>
            <li>
              <a href="#alunos" className="menu-item active">
                <Users size={18} />
                Alunos
              </a>
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
            <button className="btn-menu-toggle" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <div className="search-bar">
              <Search className="search-icon" size={18} />
              <input
                type="text"
                className="search-input"
                placeholder="Buscar alunos, turmas..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              />
            </div>
          </div>

          <div className="topbar-actions">
            <button className="btn-topbar-action" onClick={handleOpenNewModal}>
              <Plus size={16} />
              Novo Aluno
            </button>
            <button className="icon-button">
              <Bell size={20} />
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
              <h1>Gestão de Alunos</h1>
              <p>Gerencie matrículas, turmas e visualize o status financeiro.</p>
            </div>
            <div className="page-actions">
              {/* Hidden file input for CSV upload */}
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept=".csv"
                onChange={handleCsvImport}
              />
              <button className="btn-action-secondary" onClick={() => fileInputRef.current.click()}>
                <Upload size={16} />
                Importar CSV
              </button>
              <button className="btn-action-primary" onClick={handleOpenNewModal}>
                <Plus size={16} />
                Adicionar Aluno
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="filter-bar">
            <div className="filters-left">
              <select
                className="filter-select"
                value={selectedTurma}
                onChange={(e) => { setSelectedTurma(e.target.value); setCurrentPage(1); }}
              >
                {getUniqueTurmas().map(t => (
                  <option key={t} value={t}>{t === 'Todas' ? 'Turma: Todas' : t}</option>
                ))}
              </select>
            </div>
            <div className="filter-results-count">
              Mostrando {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredAlunos.length)} de {filteredAlunos.length} alunos
            </div>
          </div>

          {/* CSV Guide Collapsible Section */}
          <div className={`csv-instructions-card ${showCsvInfo ? 'expanded' : ''}`}>
            <button className="csv-instructions-toggle" type="button" onClick={() => setShowCsvInfo(!showCsvInfo)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <HelpCircle size={18} className="icon-blue" />
                <span>Como importar planilha de alunos via CSV?</span>
              </div>
              {showCsvInfo ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>

            {showCsvInfo && (
              <div className="csv-instructions-body fade-in">
                <p>Para realizar o cadastro em lote, envie um arquivo com extensão <strong>.csv</strong> contendo o cabeçalho exato mostrado na tabela abaixo:</p>
                <div className="csv-table-preview-wrapper">
                  <table className="csv-table-preview">
                    <thead>
                      <tr>
                        <th>Nome</th>
                        <th>Turma</th>
                        <th>Mensalidade</th>
                        <th>Responsavel</th>
                        <th>Email</th>
                        <th>Telefone</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Ana Clara Souza</td>
                        <td>1ª Série</td>
                        <td>350.00</td>
                        <td>Carlos Souza</td>
                        <td>carlos@email.com</td>
                        <td>(11) 98765-4321</td>
                      </tr>
                      <tr>
                        <td>Bruno Santos</td>
                        <td>3ª Série</td>
                        <td>420.00</td>
                        <td>Mariana Santos</td>
                        <td>mariana@email.com</td>
                        <td>(21) 99876-5432</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="csv-rules-list">
                  <h4>Regras de Composição do CSV:</h4>
                  <ul>
                    <li><strong>Separador</strong>: Utilize <strong>vírgula (,)</strong> como separador de colunas.</li>
                    <li><strong>Coluna Nome</strong>: Nome completo do aluno (obrigatório).</li>
                    <li><strong>Coluna Turma</strong>: Deve ser preenchida de <code>1ª Série</code> até <code>8ª Série</code> (sem letras A ou B).</li>
                    <li><strong>Coluna Mensalidade</strong>: Valor numérico ou formatado (ex: <code>350.00</code> ou <code>R$ 350,00</code>).</li>
                    <li><strong>Coluna Telefone</strong>: Telefone celular ou fixo do responsável (ex: <code>(11) 98765-4321</code>).</li>
                    <li><strong>Codificação</strong>: Salve o arquivo CSV com codificação <strong>UTF-8</strong> para manter acentos e caracteres especiais.</li>
                  </ul>
                </div>

                <button type="button" className="btn-download-template" onClick={downloadCSVTemplate}>
                  <Download size={16} />
                  Baixar Modelo de Exemplo
                </button>
              </div>
            )}
          </div>

          {/* Error Banner */}
          {error && (
            <div className="error-banner" style={{ marginBottom: '1.5rem' }}>
              <AlertTriangle size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* Students Table */}
          <div className="table-container">
            {loading ? (
              <div className="loader-container">
                <div className="spinner" />
                <span style={{ color: 'var(--text-muted)', fontWeight: '500' }}>Carregando dados do Strapi...</span>
              </div>
            ) : filteredAlunos.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
                Nenhum aluno encontrado. Cadastre um aluno manualmente ou importe via CSV!
              </div>
            ) : (
              <>
                <table className="alunos-table">
                  <thead>
                    <tr>
                      <th>Nome do Aluno</th>
                      <th>Responsável</th>
                      <th>Turma</th>
                      <th>Status</th>
                      <th style={{ width: '80px', textAlign: 'center' }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((aluno) => {
                      const id = aluno.id;
                      const attr = aluno;
                      return (
                        <tr key={id}>
                          <td>
                            <div className="student-name-cell">
                              <div className="student-avatar">
                                {getInitials(attr.NomeCrianca)}
                              </div>
                              <div className="student-info">
                                <h4>{attr.NomeCrianca}</h4>
                                <span>Matrícula: {attr.Matricula || 'N/A'}</span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="responsible-name">{attr.NomeResponsavel || 'N/A'}</span>
                          </td>
                          <td>
                            <span className="turma-badge">{attr.SerieCursada || 'N/A'}</span>
                          </td>
                          <td>
                            <span className={`status-badge ${aluno.Ativo !== false ? 'ativo' : 'inativo'}`}>
                              {aluno.Ativo !== false ? 'ATIVO' : 'INATIVO'}
                            </span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <div className="actions-dropdown-container">
                              <button 
                                className="icon-button" 
                                style={{ margin: '0 auto' }}
                                onClick={(e) => { e.stopPropagation(); setActiveMenuStudentId(activeMenuStudentId === id ? null : id); }}
                              >
                                <MoreVertical size={18} />
                              </button>
                              {activeMenuStudentId === id && (
                                <div className="actions-dropdown-menu">
                                  <button type="button" onClick={() => handleEditClick(aluno)}>Editar</button>
                                  <button type="button" className="delete-option" onClick={() => handleOpenDeleteModal(aluno)}>Excluir</button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Pagination footer */}
                {totalPages > 1 && (
                  <div className="pagination-row">
                    <button
                      className="btn-pagination-nav"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      Anterior
                    </button>
                    <div className="pagination-pages">
                      {Array.from({ length: totalPages }).map((_, i) => (
                        <button
                          key={i}
                          className={`btn-page ${currentPage === i + 1 ? 'active' : ''}`}
                          onClick={() => setCurrentPage(i + 1)}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                    <button
                      className="btn-pagination-nav"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      Próximo
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
      {/* Manual Student Creation/Edit Modal */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h3>{isEditMode ? 'Editar Aluno' : 'Novo Aluno'}</h3>
              <button className="btn-close-modal" onClick={handleCloseModal}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleManualSave}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {modalError && (
                  <div className="error-banner">
                    <AlertTriangle size={18} />
                    <span>{modalError}</span>
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="nomeAluno">Nome do Aluno</label>
                  <input
                    id="nomeAluno"
                    type="text"
                    className="input-field"
                    style={{ paddingLeft: '1rem' }}
                    placeholder="Ex: Maria Clara Souza"
                    value={nomeAluno}
                    onChange={(e) => setNomeAluno(e.target.value)}
                    required
                    disabled={isEditMode}
                  />
                </div>

                <div style={{ display: 'flex', gap: '1.25rem' }}>
                  <div className="form-group" style={{ flex: 1.2 }}>
                    <label htmlFor="turma">Turma/Série</label>
                    <select
                      id="turma"
                      className="filter-select"
                      style={{ width: '100%', paddingLeft: '1rem', height: '47px' }}
                      value={turmaSerie}
                      onChange={(e) => setTurmaSerie(e.target.value)}
                      disabled={isEditMode}
                    >
                      <option value="1ª Série">1ª Série</option>
                      <option value="2ª Série">2ª Série</option>
                      <option value="3ª Série">3ª Série</option>
                      <option value="4ª Série">4ª Série</option>
                      <option value="5ª Série">5ª Série</option>
                      <option value="6ª Série">6ª Série</option>
                      <option value="7ª Série">7ª Série</option>
                      <option value="8ª Série">8ª Série</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ flex: 0.8 }}>
                    <label htmlFor="mensalidade">Mensalidade</label>
                    <input
                      id="mensalidade"
                      type="text"
                      className="input-field"
                      style={{ paddingLeft: '1rem' }}
                      value={mensalidade}
                      onChange={handleCurrencyChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="nomeResponsavel">Nome do Responsável</label>
                  <input
                    id="nomeResponsavel"
                    type="text"
                    className="input-field"
                    style={{ paddingLeft: '1rem' }}
                    placeholder="Ex: Carlos Souza"
                    value={nomeResponsavel}
                    onChange={(e) => setNomeResponsavel(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="telefoneResponsavel">Telefone do Responsável</label>
                  <input
                    id="telefoneResponsavel"
                    type="text"
                    className="input-field"
                    style={{ paddingLeft: '1rem' }}
                    placeholder="Ex: (11) 98765-4321"
                    value={telefoneResponsavel}
                    onChange={handlePhoneChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    type="email"
                    className="input-field"
                    style={{ paddingLeft: '1rem' }}
                    placeholder="exemplo@email.com"
                    value={emailResponsavel}
                    onChange={(e) => setEmailResponsavel(e.target.value)}
                    disabled={isEditMode}
                  />
                </div>

                {isEditMode && (
                  <div className="form-group">
                    <label htmlFor="status">Status do Aluno</label>
                    <select
                      id="status"
                      className="filter-select"
                      style={{ width: '100%', paddingLeft: '1rem', height: '47px' }}
                      value={isAtivo ? 'ativo' : 'inativo'}
                      onChange={(e) => setIsAtivo(e.target.value === 'ativo')}
                    >
                      <option value="ativo">Ativo</option>
                      <option value="inativo">Inativo</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-modal-cancel"
                  onClick={handleCloseModal}
                  disabled={modalSaving}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-modal-save"
                  disabled={modalSaving}
                >
                  {modalSaving ? 'Salvando...' : (isEditMode ? 'Salvar Alterações' : 'Salvar Aluno')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="modal-backdrop">
          <div className="confirm-modal-card">
            <div className="confirm-modal-body">
              <div className="confirm-modal-icon-container">
                <AlertTriangle size={28} />
              </div>
              <h3 className="confirm-modal-title">Excluir Aluno</h3>
              <p className="confirm-modal-text">
                Deseja realmente excluir o aluno <strong>{studentToDeleteName}</strong>? Esta ação não poderá ser desfeita.
              </p>
            </div>
            <div className="confirm-modal-footer">
              <button
                type="button"
                className="btn-confirm-cancel"
                onClick={handleCloseDeleteModal}
                disabled={deleteSaving}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn-confirm-delete"
                onClick={handleConfirmDelete}
                disabled={deleteSaving}
              >
                {deleteSaving ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Alunos;
