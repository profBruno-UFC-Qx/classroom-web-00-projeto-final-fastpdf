import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import jsPDF from 'jspdf';
import {
  LayoutDashboard,
  Users,
  DollarSign,
  Settings,
  LogOut,
  Search,
  Plus,
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

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [alunos, setAlunos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTurma, setSelectedTurma] = useState('Todas');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [showCsvInfo, setShowCsvInfo] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nomeAluno, setNomeAluno] = useState('');
  const [turmaSerie, setTurmaSerie] = useState('1ª Série');
  const [mensalidade, setMensalidade] = useState('');
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

  const handleGerarPDF = () => {
  const doc = new jsPDF();
  const dataHoje = new Date().toLocaleDateString('pt-BR');
  const totalAtivos = alunos.filter(a => a.Ativo !== false).length;
  const totalInativos = alunos.filter(a => a.Ativo === false).length;

  doc.setFillColor(11, 44, 82);
  doc.rect(0, 0, 210, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('FastPDF Admin', 14, 12);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Escola Municipal São José', 14, 20);

  doc.setFontSize(9);
  doc.text(`Data de emissão: ${dataHoje}`, 196, 12, { align: 'right' });
  doc.text(`Gerado por: ${user?.email || 'gestor'}`, 196, 20, { align: 'right' });

  doc.setTextColor(11, 44, 82);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Lista de Alunos', 14, 42);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Relatório completo de alunos matriculados na instituição.', 14, 50);

  const cards = [
    { label: 'Total de alunos', valor: String(alunos.length) },
    { label: 'Ativos', valor: String(totalAtivos) },
    { label: 'Inativos', valor: String(totalInativos) },
  ];

  cards.forEach((card, i) => {
    const x = 14 + i * 62;
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(x, 58, 58, 22, 2, 2, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, 58, 58, 22, 2, 2, 'S');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(card.label, x + 4, 65);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(11, 44, 82);
    doc.text(card.valor, x + 4, 75);
    doc.setFont('helvetica', 'normal');
  });

  doc.setFillColor(11, 44, 82);
  doc.rect(14, 88, 182, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('NOME DO ALUNO', 18, 93.5);
  doc.text('MATRÍCULA', 90, 93.5);
  doc.text('TURMA', 135, 93.5);
  doc.text('STATUS', 170, 93.5);

  let y = 96;
  const alunosOrdenados = [...alunos].sort((a, b) => {
  const nomeA = a.NomeCrianca || '';
  const nomeB = b.NomeCrianca || '';
  return nomeA.localeCompare(nomeB, 'pt-BR');
});
  alunosOrdenados.forEach((aluno, index) => {
    if (y > 265) {
      doc.addPage();
      y = 20;
    }

    y += 9;

    if (index % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, y - 6, 182, 9, 'F');
    }

    doc.setDrawColor(226, 232, 240);
    doc.line(14, y + 3, 196, y + 3);

    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(aluno.NomeCrianca || '-', 18, y);
    doc.text(aluno.Matricula || '-', 90, y);
    doc.text(aluno.SerieCursada || '-', 135, y);

    const ativo = aluno.Ativo !== false;
    if (ativo) {
      doc.setFillColor(220, 252, 231);
      doc.roundedRect(168, y - 5, 20, 6, 1, 1, 'F');
      doc.setTextColor(21, 128, 61);
    } else {
      doc.setFillColor(254, 226, 226);
      doc.roundedRect(168, y - 5, 20, 6, 1, 1, 'F');
      doc.setTextColor(185, 28, 28);
    }
    doc.setFontSize(8);
    doc.text(ativo ? 'Ativo' : 'Inativo', 178, y, { align: 'center' });
  });

  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240);
    doc.line(14, 282, 196, 282);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('FastPDF Admin — Sistema de Gestão Escolar', 14, 287);
    doc.text(`Página ${i} de ${pageCount}`, 196, 287, { align: 'right' });
  }

  doc.save('lista-alunos.pdf');
};

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

  const handlePhoneChange = (e) => {
    let value = e.target.value;
    value = value.replace(/\D/g, '');
    if (value.length > 0) value = '(' + value;
    if (value.length > 3) value = [value.slice(0, 3), ') ', value.slice(3)].join('');
    if (value.length > 10) value = [value.slice(0, 10), '-', value.slice(10, 14)].join('');
    if (value.length > 15) value = value.slice(0, 15);
    setTelefoneResponsavel(value);
  };

  const handleOpenNewModal = () => {
    setIsEditMode(false);
    setCurrentEditingStudentId(null);
    setNomeAluno('');
    setTurmaSerie('1ª Série');
    setMensalidade('');
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
    setMensalidade('');
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
    setMensalidade(String(aluno.ValorMensalidade || 0));
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
    return () => { window.removeEventListener('click', handleOutsideClick); };
  }, []);

  const parseCSV = (text) => {
    const lines = text.split(/\r?\n/);
    if (lines.length < 2) return [];
    const cleanHeaderRow = lines[0].replace(/^\uFEFF/, '');
    const headers = cleanHeaderRow.split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
    const results = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.trim().replace(/^["']|["']$/g, ''));
      const obj = {};
      headers.forEach((header, idx) => { obj[header] = values[idx] || ''; });
      results.push(obj);
    }
    return results;
  };

  const downloadCSVTemplate = () => {
    const headers = 'Nome,Turma,Mensalidade,Responsavel,Email,Telefone';
    const rows = [
      'Ana Clara Souza,1ª Série,350,Carlos Souza,carlos@email.com,(11) 98765-4321',
      'Bruno Santos,3ª Série,420,Mariana Santos,mariana@email.com,(21) 99876-5432',
      'Carla Dias,8ª Série,500,Roberto Dias,roberto@email.com,(31) 97654-3210'
    ];
    const csvContent = '\uFEFF' + [headers, ...rows].join('\n');
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
        const validationErrors = [];
        for (let i = 0; i < parsedRows.length; i++) {
          const row = parsedRows[i];
          const lineNum = i + 2;
          const nomeCrianca = (row.Nome || row.nome || row.NomeCrianca || '').trim();
          const nomeResponsavel = (row.Responsavel || row.responsavel || row.NomeResponsavel || '').trim();
          const valorMensalidadeRaw = row.Mensalidade || row.mensalidade || row.ValorMensalidade;
          if (!nomeCrianca) validationErrors.push(`Linha ${lineNum}: Nome do aluno é obrigatório.`);
          if (!nomeResponsavel) validationErrors.push(`Linha ${lineNum}: Nome do responsável é obrigatório.`);
          if (valorMensalidadeRaw) {
            const val = parseFloat(String(valorMensalidadeRaw).replace(/[^\d.]/g, ''));
            if (isNaN(val) || val < 0) validationErrors.push(`Linha ${lineNum}: Mensalidade inválida ("${valorMensalidadeRaw}").`);
          }
        }
        if (validationErrors.length > 0) {
          setLoading(false);
          alert(`Importação cancelada devido a erros de validação:\n\n${validationErrors.join('\n')}\n\nNenhum aluno foi cadastrado.`);
          e.target.value = '';
          return;
        }
        let successCount = 0;
        const currentUser = authService.getCurrentUser();
        for (const row of parsedRows) {
          const nomeCrianca = (row.Nome || row.nome || row.NomeCrianca).trim();
          const serieCursada = row.Turma || row.turma || row.SerieCursada;
          const valorMensalidadeRaw = row.Mensalidade || row.mensalidade || row.ValorMensalidade;
          const nomeResponsavel = (row.Responsavel || row.responsavel || row.NomeResponsavel).trim();
          const contaResponsavel = row.Email || row.email || row.ContaResponavel;
          const telefoneResponsavelVal = row.Telefone || row.telefone || row.TelefoneResponsavel || '';
          const valorDecimal = parseFloat(String(valorMensalidadeRaw).replace(/[^\d.]/g, '')) || 0;
          const matricula = `2026-${Math.floor(100 + Math.random() * 900)}-${Math.floor(10 + Math.random() * 90)}`;
          const payload = {
            NomeCrianca: nomeCrianca,
            Matricula: matricula,
            SerieCursada: serieCursada || 'Não Informada',
            NomeResponsavel: nomeResponsavel || 'Não Informado',
            ContaResponavel: contaResponsavel || 'contato@escola.com',
            TelefoneResponsavel: telefoneResponsavelVal,
            ValorMensalidade: valorDecimal
          };
          if (currentUser?.escola?.id) payload.escola = currentUser.escola.id;
          await alunoService.cadastrarAluno(payload);
          successCount++;
          if (contaResponsavel && contaResponsavel.trim()) {
            try {
              await authService.criarResponsavel(contaResponsavel.trim(), contaResponsavel.trim(), matricula, currentUser?.escola?.id);
            } catch (uErr) {
              console.warn('Failed to auto-create responsible user during CSV import:', uErr);
            }
          }
        }
        alert(`Processamento concluído!\n${successCount} alunos importados com sucesso.`);
        carregarAlunos();
      } catch (err) {
        console.error(err);
        alert('Erro ao processar o arquivo CSV: ' + (err.message || err));
      } finally {
        setLoading(false);
        e.target.value = '';
      }
    };
    reader.readAsText(file);
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
    const valorDecimal = parseFloat(mensalidade) || 0;
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
        const currentUser = authService.getCurrentUser();
        if (currentUser?.escola?.id) payload.escola = currentUser.escola.id;
        await alunoService.cadastrarAluno(payload);
        if (emailResponsavel.trim() && currentUser?.escola?.id) {
          try {
            await authService.criarResponsavel(emailResponsavel.trim(), emailResponsavel.trim(), matricula, currentUser.escola.id);
          } catch (uErr) {
            console.warn('Failed to auto-create responsible user during manual registration:', uErr);
          }
        }
      }
      setIsModalOpen(false);
      setNomeAluno('');
      setTurmaSerie('1ª Série');
      setMensalidade('');
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

  const filteredAlunos = alunos.filter(aluno => {
    const childName = aluno.NomeCrianca || '';
    const code = aluno.Matricula || '';
    const parentName = aluno.NomeResponsavel || '';
    const grade = aluno.SerieCursada || '';
    const matchesSearch =
      childName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      parentName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTurma = selectedTurma === 'Todas' || grade === selectedTurma;
    return matchesSearch && matchesTurma;
  }).sort((a, b) => {
    const nomeA = a.NomeCrianca || '';
    const nomeB = b.NomeCrianca || '';
    return nomeA.localeCompare(nomeB, 'pt-BR');
  });

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

  const getUniqueTurmas = () => {
    const turmas = new Set();
    alunos.forEach(a => { if (a.SerieCursada) turmas.add(a.SerieCursada); });
    return ['Todas', ...Array.from(turmas)];
  };

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
            {user?.cargo !== 'secretaria' && (<li><Link to="/dashboard" className="menu-item"><LayoutDashboard size={18} />Dashboard</Link></li>)}
            <li><Link to="/alunos" className="menu-item active"><Users size={18} />Alunos</Link></li>
            {user?.cargo !== 'secretaria' && (<li><Link to="/financeiro" className="menu-item"><DollarSign size={18} />Financeiro</Link></li>)}
            {user?.cargo !== 'secretaria' && (<li><Link to="/configuracoes" className="menu-item"><Settings size={18} />Configurações</Link></li>)}
          </ul>
        </div>
        <div className="sidebar-bottom">
          {user?.cargo !== 'secretaria' && (<button className="btn-sidebar-action" onClick={handleGerarPDF}><FileText size={16} />Gerar PDF</button>)}
          <button className="menu-item-logout" onClick={handleLogout}><LogOut size={18} />Sair</button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button className="btn-menu-toggle" onClick={() => setIsSidebarOpen(true)}><Menu size={24} /></button>
            <div className="search-bar">
              <Search className="search-icon" size={18} />
              <input type="text" className="search-input" placeholder="Buscar alunos, turmas..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} />
            </div>
          </div>
          <div className="topbar-actions">
            <div className="profile-avatar">{getUserInitial()}</div>
          </div>
        </header>

        <div className="page-body">
          <div className="page-header-row">
            <div className="page-title"><h1>Gestão de Alunos</h1><p>Gerencie matrículas, turmas e visualize o status financeiro.</p></div>
            <div className="page-actions">
              <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept=".csv" onChange={handleCsvImport} />
              <button className="btn-action-secondary" onClick={() => fileInputRef.current.click()}><Upload size={16} />Importar CSV</button>
              <button className="btn-action-primary" onClick={handleOpenNewModal}><Plus size={16} />Adicionar Aluno</button>
            </div>
          </div>

          <div className="filter-bar">
            <div className="filters-left">
              <select className="filter-select" value={selectedTurma} onChange={(e) => { setSelectedTurma(e.target.value); setCurrentPage(1); }}>
                {getUniqueTurmas().map(t => (<option key={t} value={t}>{t === 'Todas' ? 'Turma: Todas' : t}</option>))}
              </select>
            </div>
            <div className="filter-results-count">Mostrando {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredAlunos.length)} de {filteredAlunos.length} alunos</div>
          </div>

          <div className={`csv-instructions-card ${showCsvInfo ? 'expanded' : ''}`}>
            <button className="csv-instructions-toggle" type="button" onClick={() => setShowCsvInfo(!showCsvInfo)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><HelpCircle size={18} className="icon-blue" /><span>Como importar planilha de alunos via CSV?</span></div>
              {showCsvInfo ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            {showCsvInfo && (
              <div className="csv-instructions-body fade-in">
                <p>Para realizar o cadastro em lote, envie um arquivo com extensão <strong>.csv</strong> contendo o cabeçalho exato mostrado na tabela abaixo:</p>
                <div className="csv-table-preview-wrapper">
                  <table className="csv-table-preview">
                    <thead><tr><th>Nome</th><th>Turma</th><th>Mensalidade</th><th>Responsavel</th><th>Email</th><th>Telefone</th></tr></thead>
                    <tbody>
                      <tr><td>Ana Clara Souza</td><td>1ª Série</td><td>350</td><td>Carlos Souza</td><td>carlos@email.com</td><td>(11) 98765-4321</td></tr>
                      <tr><td>Bruno Santos</td><td>3ª Série</td><td>420</td><td>Mariana Santos</td><td>mariana@email.com</td><td>(21) 99876-5432</td></tr>
                    </tbody>
                  </table>
                </div>
                <div className="csv-rules-list">
                  <h4>Regras de Composição do CSV:</h4>
                  <ul>
                    <li><strong>Separador</strong>: Utilize <strong>vírgula (,)</strong> como separador de colunas.</li>
                    <li><strong>Coluna Mensalidade</strong>: Valor numérico inteiro em reais (ex: <code>350</code>).</li>
                    <li><strong>Coluna Telefone</strong>: Telefone celular ou fixo do responsável (ex: <code>(11) 98765-4321</code>).</li>
                    <li><strong>Codificação</strong>: Salve o arquivo CSV com codificação <strong>UTF-8</strong>.</li>
                  </ul>
                </div>
                <button type="button" className="btn-download-template" onClick={downloadCSVTemplate}><Download size={16} />Baixar Modelo de Exemplo</button>
              </div>
            )}
          </div>

          {error && (<div className="error-banner" style={{ marginBottom: '1.5rem' }}><AlertTriangle size={18} /><span>{error}</span></div>)}

          <div className="table-container">
            {loading ? (
              <div className="loader-container"><div className="spinner" /><span style={{ color: 'var(--text-muted)', fontWeight: '500' }}>Carregando dados do Strapi...</span></div>
            ) : filteredAlunos.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>Nenhum aluno encontrado. Cadastre um aluno manualmente ou importe via CSV!</div>
            ) : (
              <>
                <table className="alunos-table">
                  <thead>
                    <tr>
                      <th>Nome do Aluno</th><th>Responsável</th><th>Turma</th><th>Status</th>
                      {user?.cargo !== 'secretaria' && <th style={{ width: '80px', textAlign: 'center' }}>Ações</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((aluno) => (
                      <tr key={aluno.id}>
                        <td>
                          <div className="student-name-cell">
                            <div className="student-avatar">{getInitials(aluno.NomeCrianca)}</div>
                            <div className="student-info"><h4>{aluno.NomeCrianca}</h4><span>Matrícula: {aluno.Matricula || 'N/A'}</span></div>
                          </div>
                        </td>
                        <td><span className="responsible-name">{aluno.NomeResponsavel || 'N/A'}</span></td>
                        <td><span className="turma-badge">{aluno.SerieCursada || 'N/A'}</span></td>
                        <td><span className={`status-badge ${aluno.Ativo !== false ? 'ativo' : 'inativo'}`}>{aluno.Ativo !== false ? 'ATIVO' : 'INATIVO'}</span></td>
                        {user?.cargo !== 'secretaria' && (
                          <td style={{ textAlign: 'center' }}>
                            <div className="actions-dropdown-container">
                              <button className="icon-button" style={{ margin: '0 auto' }} onClick={(e) => { e.stopPropagation(); setActiveMenuStudentId(activeMenuStudentId === aluno.id ? null : aluno.id); }}><MoreVertical size={18} /></button>
                              {activeMenuStudentId === aluno.id && (
                                <div className="actions-dropdown-menu">
                                  <button type="button" onClick={() => handleEditClick(aluno)}>Editar</button>
                                  <button type="button" className="delete-option" onClick={() => handleOpenDeleteModal(aluno)}>Excluir</button>
                                </div>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
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
              </>
            )}
          </div>
        </div>
      </main>

      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h3>{isEditMode ? 'Editar Aluno' : 'Novo Aluno'}</h3>
              <button className="btn-close-modal" onClick={handleCloseModal}><X size={20} /></button>
            </div>
            <form onSubmit={handleManualSave}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {modalError && (<div className="error-banner"><AlertTriangle size={18} /><span>{modalError}</span></div>)}
                <div className="form-group">
                  <label htmlFor="nomeAluno">Nome do Aluno</label>
                  <input id="nomeAluno" type="text" className="input-field" style={{ paddingLeft: '1rem' }} placeholder="Ex: Maria Clara Souza" value={nomeAluno} onChange={(e) => setNomeAluno(e.target.value)} required disabled={isEditMode} />
                </div>
                <div style={{ display: 'flex', gap: '1.25rem' }}>
                  <div className="form-group" style={{ flex: 1.2 }}>
                    <label htmlFor="turma">Turma/Série</label>
                    <select id="turma" className="filter-select" style={{ width: '100%', paddingLeft: '1rem', height: '47px' }} value={turmaSerie} onChange={(e) => setTurmaSerie(e.target.value)} disabled={isEditMode}>
                      {['1ª Série','2ª Série','3ª Série','4ª Série','5ª Série','6ª Série','7ª Série','8ª Série'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="form-group" style={{ flex: 0.8 }}>
                    <label htmlFor="mensalidade">Mensalidade (R$)</label>
                    <input id="mensalidade" type="number" className="input-field" style={{ paddingLeft: '1rem' }} placeholder="Ex: 350" value={mensalidade} onChange={(e) => setMensalidade(e.target.value)} min="0" />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="nomeResponsavel">Nome do Responsável</label>
                  <input id="nomeResponsavel" type="text" className="input-field" style={{ paddingLeft: '1rem' }} placeholder="Ex: Carlos Souza" value={nomeResponsavel} onChange={(e) => setNomeResponsavel(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label htmlFor="telefoneResponsavel">Telefone do Responsável</label>
                  <input id="telefoneResponsavel" type="text" className="input-field" style={{ paddingLeft: '1rem' }} placeholder="Ex: (11) 98765-4321" value={telefoneResponsavel} onChange={handlePhoneChange} required />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email do Responsável</label>
                  <input id="email" type="email" className="input-field" style={{ paddingLeft: '1rem' }} placeholder="exemplo@email.com" value={emailResponsavel} onChange={(e) => setEmailResponsavel(e.target.value)} disabled={isEditMode} />
                </div>
                {isEditMode && (
                  <div className="form-group">
                    <label htmlFor="status">Status do Aluno</label>
                    <select id="status" className="filter-select" style={{ width: '100%', paddingLeft: '1rem', height: '47px' }} value={isAtivo ? 'ativo' : 'inativo'} onChange={(e) => setIsAtivo(e.target.value === 'ativo')}>
                      <option value="ativo">Ativo</option>
                      <option value="inativo">Inativo</option>
                    </select>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-modal-cancel" onClick={handleCloseModal} disabled={modalSaving}>Cancelar</button>
                <button type="submit" className="btn-modal-save" disabled={modalSaving}>{modalSaving ? 'Salvando...' : (isEditMode ? 'Salvar Alterações' : 'Salvar Aluno')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="modal-backdrop">
          <div className="confirm-modal-card">
            <div className="confirm-modal-body">
              <div className="confirm-modal-icon-container"><AlertTriangle size={28} /></div>
              <h3 className="confirm-modal-title">Excluir Aluno</h3>
              <p className="confirm-modal-text">Deseja realmente excluir o aluno <strong>{studentToDeleteName}</strong>? Esta ação não poderá ser desfeita.</p>
            </div>
            <div className="confirm-modal-footer">
              <button type="button" className="btn-confirm-cancel" onClick={handleCloseDeleteModal} disabled={deleteSaving}>Cancelar</button>
              <button type="button" className="btn-confirm-delete" onClick={handleConfirmDelete} disabled={deleteSaving}>{deleteSaving ? 'Excluindo...' : 'Excluir'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default Alunos;