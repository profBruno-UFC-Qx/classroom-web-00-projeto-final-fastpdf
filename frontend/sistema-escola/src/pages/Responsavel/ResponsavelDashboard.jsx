import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  LogOut,
  FileText,
  DollarSign,
  CheckCircle,
  AlertTriangle,
  Clock,
  QrCode,
  Copy,
  ChevronDown,
  Info
} from 'lucide-react';
import { authService } from '../../services/auth';
import { alunoService } from '../../services/aluno';
import './ResponsavelDashboard.css';

function ResponsavelDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [childrenList, setChildrenList] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Payment modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInst, setSelectedInst] = useState(null);
  const [isPaying, setIsPaying] = useState(false);
  const [copiedText, setCopiedText] = useState('');

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
      return;
    }
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    carregarDadosResponsavel(currentUser);
  }, [navigate]);

  const carregarDadosResponsavel = async (currentUser) => {
    setLoading(true);
    setError('');
    try {
      const data = await alunoService.obterAlunos();
      // Filter students whose ContaResponavel matches current user email
      const myChildren = data.filter(
        aluno => aluno.ContaResponavel?.toLowerCase().trim() === currentUser.email?.toLowerCase().trim()
      );
      
      setChildrenList(myChildren);
      if (myChildren.length > 0) {
        setSelectedChild(myChildren[0]);
      } else {
        setError('Não encontramos nenhum aluno associado ao seu e-mail de responsável.');
      }
    } catch (err) {
      console.error(err);
      setError('Falha ao carregar os dados financeiros do aluno. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const getStudentInstallments = (aluno) => {
    if (!aluno) return [];
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

  const getInstallmentStatus = (aluno, inst) => {
    if (!inst) return 'A Vencer';

    // 1. Read from backend DB field
    const savedStatus = aluno.HistoricoPagamentos?.[inst.number];
    if (savedStatus) return savedStatus;

    // 2. Read from localStorage as fallback
    const localStatus = localStorage.getItem(`financeiro_status_${aluno.id}_inst_${inst.number}`);
    if (localStatus) return localStatus;

    // 3. Fallback logic: check date relative to today
    const today = new Date();
    if (today > inst.dueDate) {
      return 'Atrasado';
    }
    
    // If it's within the current month or within 30 days
    const diffTime = inst.dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 30 && diffDays > 0) {
      return 'Pendente';
    }

    return 'A Vencer';
  };

  const handleOpenPaymentModal = (inst) => {
    setSelectedInst(inst);
    setIsModalOpen(true);
    setCopiedText('');
  };

  const handleConfirmPayment = async () => {
    if (!selectedChild || !selectedInst) return;
    setIsPaying(true);
    try {
      const currentHist = selectedChild.HistoricoPagamentos || {};
      const novoHistorico = {
        ...currentHist,
        [selectedInst.number]: 'Pago'
      };

      await alunoService.atualizarAluno(selectedChild.id, { HistoricoPagamentos: novoHistorico });
      
      // Update local state instantly
      selectedChild.HistoricoPagamentos = novoHistorico;
      setSelectedChild({ ...selectedChild });
      
      setIsModalOpen(false);
      alert('Confirmação enviada! O pagamento da parcela foi registrado e compensado com sucesso.');
    } catch (err) {
      console.error(err);
      alert('Ocorreu um erro ao confirmar o pagamento. Tente novamente.');
    } finally {
      setIsPaying(false);
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(''), 2000);
  };

  // Slips ordering / stats
  const installments = selectedChild ? getStudentInstallments(selectedChild) : [];
  
  let totalPago = 0;
  let totalPendente = 0;
  let totalAtrasado = 0;

  installments.forEach(inst => {
    const status = getInstallmentStatus(selectedChild, inst);
    const value = selectedChild.ValorMensalidade || 0;
    if (status === 'Pago') {
      totalPago += value;
    } else if (status === 'Atrasado') {
      totalAtrasado += value;
    } else if (status === 'Pendente') {
      totalPendente += value;
    }
  });

  const getStatusBadgeClass = (status) => {
    if (status === 'Pago') return 'status-paid';
    if (status === 'Atrasado') return 'status-overdue';
    if (status === 'Pendente') return 'status-pending';
    return 'status-upcoming';
  };

  const formatCurrency = (val) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const mockPixKey = selectedChild?.escola?.Email || 'pix@fastpdfadmin.com';
  const mockBarcode = `00190.00009 02345.678904 12345.678909 9 998700000${selectedChild?.ValorMensalidade || '350'}00`;

  return (
    <div className="parent-dashboard-container">
      {/* Header bar */}
      <header className="parent-header">
        <div className="parent-logo">
          <div className="logo-box">
            <FileText size={18} />
          </div>
          <h3>FastPDF Portal</h3>
        </div>
        <div className="parent-user-info">
          <div className="avatar-circle">
            <User size={16} />
          </div>
          <span>{user?.email}</span>
          <button className="btn-logout-parent" onClick={handleLogout} title="Sair">
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Main content grid */}
      <main className="parent-main">
        {loading ? (
          <div className="parent-loader-wrapper">
            <div className="parent-spinner" />
            <p>Carregando as informações escolares...</p>
          </div>
        ) : error ? (
          <div className="parent-error-card">
            <AlertTriangle size={32} />
            <p>{error}</p>
            <button className="btn-retry" onClick={() => carregarDadosResponsavel(user)}>Tentar novamente</button>
          </div>
        ) : (
          <div className="parent-grid">
            
            {/* Left section: Child switcher and School Card */}
            <section className="parent-left-col">
              {childrenList.length > 1 && (
                <div className="child-switcher-card">
                  <h4>Selecione o Aluno</h4>
                  <div className="switcher-select-wrapper">
                    <select
                      value={selectedChild.id}
                      onChange={(e) => {
                        const child = childrenList.find(c => c.id === Number(e.target.value));
                        if (child) setSelectedChild(child);
                      }}
                    >
                      {childrenList.map(c => (
                        <option key={c.id} value={c.id}>{c.NomeCrianca}</option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="select-arrow" />
                  </div>
                </div>
              )}

              <div className="child-profile-card">
                <div className="profile-banner">
                  <div className="big-avatar">
                    {selectedChild.NomeCrianca?.charAt(0).toUpperCase()}
                  </div>
                  <h3>{selectedChild.NomeCrianca}</h3>
                  <span className="matricula-tag">Matrícula: {selectedChild.Matricula}</span>
                </div>
                <div className="profile-details">
                  <div className="detail-item">
                    <span>Série Cursada</span>
                    <strong>{selectedChild.SerieCursada}</strong>
                  </div>
                  <div className="detail-item">
                    <span>Mensalidade</span>
                    <strong>{formatCurrency(selectedChild.ValorMensalidade || 0)}</strong>
                  </div>
                  <div className="detail-item">
                    <span>Escola</span>
                    <strong>{selectedChild.escola?.Nome || 'Escola FastPDF'}</strong>
                  </div>
                  <div className="detail-item">
                    <span>Telefone</span>
                    <strong>{selectedChild.TelefoneResponsavel || 'Não cadastrado'}</strong>
                  </div>
                </div>
              </div>

              <div className="safety-card-parent">
                <div className="safety-title">
                  <Info size={16} />
                  <span>Dica de Segurança</span>
                </div>
                <p>
                  Nunca compartilhe a senha de acesso (matrícula do seu filho) com terceiros. A escola nunca solicita dados bancários ou senhas por telefone.
                </p>
              </div>
            </section>

            {/* Right section: Financial stats and Installments list */}
            <section className="parent-right-col">
              
              {/* Stat Cards */}
              <div className="parent-stats-grid">
                <div className="p-stat-card card-paid">
                  <div className="p-stat-icon"><CheckCircle size={20} /></div>
                  <div className="p-stat-info">
                    <span>Total Pago</span>
                    <h3>{formatCurrency(totalPago)}</h3>
                  </div>
                </div>

                <div className="p-stat-card card-pending">
                  <div className="p-stat-icon"><Clock size={20} /></div>
                  <div className="p-stat-info">
                    <span>Pendente</span>
                    <h3>{formatCurrency(totalPendente)}</h3>
                  </div>
                </div>

                <div className="p-stat-card card-overdue">
                  <div className="p-stat-icon"><AlertTriangle size={20} /></div>
                  <div className="p-stat-info">
                    <span>Em Atraso</span>
                    <h3>{formatCurrency(totalAtrasado)}</h3>
                  </div>
                </div>
              </div>

              {/* Installments Table */}
              <div className="installments-card">
                <div className="card-header">
                  <h3>Carnê Digital de Mensalidades - {new Date().getFullYear()}</h3>
                  <span className="installments-helper">Clique em "Pagar Parcela" para exibir os dados de pagamento (Pix / Código de Barras).</span>
                </div>
                
                <div className="table-responsive-parent">
                  <table className="parent-installments-table">
                    <thead>
                      <tr>
                        <th>Nº</th>
                        <th>Vencimento</th>
                        <th>Valor</th>
                        <th>Status</th>
                        <th style={{ width: '150px', textAlign: 'center' }}>Ação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {installments.map(inst => {
                        const status = getInstallmentStatus(selectedChild, inst);
                        return (
                          <tr key={inst.number}>
                            <td><strong>{inst.number.toString().padStart(2, '0')} / 12</strong></td>
                            <td>{inst.dueDateStr}</td>
                            <td>{formatCurrency(selectedChild.ValorMensalidade || 0)}</td>
                            <td>
                              <span className={`parent-badge ${getStatusBadgeClass(status)}`}>
                                {status.toUpperCase()}
                              </span>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              {status === 'Pago' ? (
                                <span className="text-paid-success">Compensado</span>
                              ) : (
                                <button
                                  className="btn-pay-installment"
                                  onClick={() => handleOpenPaymentModal(inst)}
                                >
                                  Pagar Parcela
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

          </div>
        )}
      </main>

      {/* Payment Modal */}
      {isModalOpen && selectedInst && (
        <div className="parent-modal-overlay">
          <div className="parent-modal-card">
            <div className="parent-modal-header">
              <h3>Registrar Pagamento - Parcela {selectedInst.number.toString().padStart(2, '0')}/12</h3>
              <button className="btn-close-modal" onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>
            
            <div className="parent-modal-body">
              
              {/* Slip details summary */}
              <div className="modal-slip-summary">
                <div className="summary-row">
                  <span>Beneficiário:</span>
                  <strong>{selectedChild?.escola?.Nome || 'Escola FastPDF'}</strong>
                </div>
                <div className="summary-row">
                  <span>Vencimento:</span>
                  <strong>{selectedInst.dueDateStr}</strong>
                </div>
                <div className="summary-row">
                  <span>Valor:</span>
                  <strong className="text-highlight-value">{formatCurrency(selectedChild?.ValorMensalidade || 0)}</strong>
                </div>
              </div>

              {/* PIX copy-paste code box */}
              <div className="payment-method-box">
                <div className="method-header">
                  <QrCode size={18} />
                  <span>Pagar via Chave PIX da Escola</span>
                </div>
                <p className="method-instruction">Copie a chave abaixo ou escaneie o código QR fictício para realizar a transferência bancária:</p>
                
                <div className="copy-code-field">
                  <input type="text" readOnly value={mockPixKey} />
                  <button 
                    onClick={() => copyToClipboard(mockPixKey, 'pix')}
                    title="Copiar Chave Pix"
                  >
                    {copiedText === 'pix' ? 'Copiado!' : <Copy size={16} />}
                  </button>
                </div>

                <div className="qr-code-placeholder-wrapper">
                  <div className="qr-code-placeholder">
                    {/* Simulated vector QR Code in CSS */}
                    <div className="qr-box">
                      <div className="qr-corner top-left"></div>
                      <div className="qr-corner top-right"></div>
                      <div className="qr-corner bottom-left"></div>
                      <div className="qr-dot dot1"></div>
                      <div className="qr-dot dot2"></div>
                      <div className="qr-dot dot3"></div>
                    </div>
                  </div>
                  <span>QR CODE PIX DE TESTE</span>
                </div>
              </div>

              {/* Barcode box */}
              <div className="payment-method-box">
                <div className="method-header">
                  <FileText size={18} />
                  <span>Código de Barras do Boleto</span>
                </div>
                <div className="copy-code-field">
                  <input type="text" readOnly value={mockBarcode} className="barcode-input" />
                  <button 
                    onClick={() => copyToClipboard(mockBarcode, 'barcode')}
                    title="Copiar Código de Barras"
                  >
                    {copiedText === 'barcode' ? 'Copiado!' : <Copy size={16} />}
                  </button>
                </div>
              </div>

              {/* Alert message */}
              <div className="payment-alert">
                <AlertTriangle size={16} />
                <span>
                  Ao clicar em confirmar, você declara ter efetuado o pagamento desse boleto via Pix ou código de barras nas instituições financeiras parceiras.
                </span>
              </div>
            </div>

            <div className="parent-modal-footer">
              <button className="btn-cancel" onClick={() => setIsModalOpen(false)}>Cancelar</button>
              <button 
                className="btn-confirm-payment" 
                onClick={handleConfirmPayment}
                disabled={isPaying}
              >
                {isPaying ? 'Confirmando...' : 'Confirmar Pagamento Realizado'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ResponsavelDashboard;
