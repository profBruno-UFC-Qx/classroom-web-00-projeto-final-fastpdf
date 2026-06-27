import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  DollarSign,
  Settings,
  LogOut,
  Bell,
  HelpCircle,
  Menu,
  X,
  FileText,
  User,
  Shield,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Plus
} from 'lucide-react';
import { authService } from '../../services/auth';
import api from '../../services/api';
import './Configuracoes.css';

function Configuracoes() {
  const navigate = useNavigate();

  // Layout states
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [adminUser, setAdminUser] = useState(null);

  // Password update states
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdSuccess, setPwdSuccess] = useState('');
  const [pwdError, setPwdError] = useState('');

  // Secretary list and creation states
  const [secretarias, setSecretarias] = useState([]);
  const [secLoading, setSecLoading] = useState(false);
  const [secError, setSecError] = useState('');
  const [secSuccess, setSecSuccess] = useState('');
  
  // Secretary form fields
  const [secUsername, setSecUsername] = useState('');
  const [secEmail, setSecEmail] = useState('');
  const [secPassword, setSecPassword] = useState('');

  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
      return;
    }

    const fetchUserProfile = async () => {
      try {
        const cachedUser = authService.getCurrentUser();
        if (!cachedUser?.id) return;

        // Fetch fresh populated user profile from backend
        let freshUser = await authService.obterPerfil(cachedUser.id);
        
        // Auto-healing fallback: if the database user has no linked school, link to the first school
        if (!freshUser?.escola?.id) {
          try {
            const schoolsResponse = await api.get('/escolas');
            const schoolsList = schoolsResponse.data?.data || [];
            if (schoolsList.length > 0) {
              const firstSchoolId = schoolsList[0].id;
              console.log(`[Configuracoes] Auto-healing: Linking user ${cachedUser.id} to school ID ${firstSchoolId}`);
              await authService.atualizar(cachedUser.id, { escola: firstSchoolId });
              freshUser = await authService.obterPerfil(cachedUser.id);
            }
          } catch (healErr) {
            console.error('[Configuracoes] Failed school link auto-healing:', healErr);
          }
        }
        
        // Update local storage and state with fresh populated user info
        localStorage.setItem('user', JSON.stringify(freshUser));
        setAdminUser(freshUser);

        if (freshUser?.escola?.id) {
          carregarSecretarias(freshUser.escola.id);
        } else {
          setSecError('A sua conta de administrador não está vinculada a nenhuma escola.');
        }
      } catch (err) {
        console.error('Error fetching fresh user profile:', err);
        // Fallback to cached profile
        const cachedUser = authService.getCurrentUser();
        setAdminUser(cachedUser);
        if (cachedUser?.escola?.id) {
          carregarSecretarias(cachedUser.escola.id);
        } else {
          setSecError('A sua conta de administrador não está vinculada a nenhuma escola.');
        }
      }
    };

    fetchUserProfile();
  }, [navigate]);

  const carregarSecretarias = async (escolaId) => {
    try {
      setSecLoading(true);
      const data = await authService.listarSecretarias(escolaId);
      setSecretarias(data || []);
    } catch (err) {
      console.error(err);
      setSecError('Erro ao listar secretarias cadastradas.');
    } finally {
      setSecLoading(false);
    }
  };

  const handleCreateSecretary = async (e) => {
    e.preventDefault();
    setSecError('');
    setSecSuccess('');

    if (!secUsername.trim() || !secEmail.trim() || !secPassword.trim()) {
      setSecError('Por favor, preencha todos os campos da secretaria.');
      return;
    }

    if (secPassword.length < 6) {
      setSecError('A senha da secretaria deve conter no mínimo 6 caracteres.');
      return;
    }

    if (!adminUser?.escola?.id) {
      setSecError('A sua conta de administrador não está vinculada a nenhuma escola.');
      return;
    }

    try {
      setSecLoading(true);
      await authService.criarSecretaria(
        secUsername.trim(),
        secEmail.trim(),
        secPassword,
        adminUser.escola.id
      );
      setSecSuccess('Secretaria adicionada com sucesso!');
      setSecUsername('');
      setSecEmail('');
      setSecPassword('');
      carregarSecretarias(adminUser.escola.id);
    } catch (err) {
      console.error(err);
      setSecError(err.message || 'Falha ao criar secretaria. Certifique-se de que o e-mail não esteja em uso.');
    } finally {
      setSecLoading(false);
    }
  };

  const handleDeleteSecretary = async (id) => {
    setSecError('');
    setSecSuccess('');
    try {
      setSecLoading(true);
      await authService.deletarSecretaria(id);
      setSecSuccess('Secretaria removida com sucesso!');
      setDeleteConfirmId(null);
      if (adminUser?.escola?.id) {
        carregarSecretarias(adminUser.escola.id);
      }
    } catch (err) {
      console.error(err);
      setSecError('Erro ao remover secretaria. Verifique a conexão.');
    } finally {
      setSecLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPwdError('');
    setPwdSuccess('');

    if (!senhaAtual || !novaSenha || !confirmarNovaSenha) {
      setPwdError('Por favor, preencha todos os campos de senha.');
      return;
    }

    if (novaSenha.length < 6) {
      setPwdError('A nova senha deve conter no mínimo 6 caracteres.');
      return;
    }

    if (novaSenha !== confirmarNovaSenha) {
      setPwdError('A confirmação da nova senha não confere.');
      return;
    }

    try {
      setPwdLoading(true);
      await authService.atualizar(adminUser.id, {
        password: novaSenha
      });
      setPwdSuccess('Senha atualizada com sucesso!');
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmarNovaSenha('');
    } catch (err) {
      console.error(err);
      setPwdError('Erro ao atualizar a senha. Verifique a conexão.');
    } finally {
      setPwdLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const getUserInitial = () => {
    if (!adminUser?.username) return 'RO';
    return adminUser.username.slice(0, 2).toUpperCase();
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
              <Link to="/configuracoes" className="menu-item active">
                <Settings size={18} />
                Configurações
              </Link>
            </li>
          </ul>
        </div>

        <div className="sidebar-bottom">
          <button className="btn-sidebar-action" onClick={() => navigate('/financeiro')}>
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
              <input
                type="text"
                className="search-input"
                placeholder="Pesquisar..."
                readOnly
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
          <div className="page-header-row" style={{ marginBottom: '2rem' }}>
            <div className="page-title">
              <h1>Configurações da Conta</h1>
              <p>Gerencie suas informações pessoais, preferências de segurança e dados da instituição.</p>
            </div>
          </div>

          <div className="config-grid" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Card 1: Perfil do Usuário */}
            <div className="config-card">
              <div className="config-card-header">
                <div className="config-icon-wrapper blue">
                  <User size={20} />
                </div>
                <h3>Perfil do Usuário</h3>
              </div>

              <div className="config-card-body grid-2-col">
                <div className="form-group">
                  <label>NOME COMPLETO</label>
                  <input
                    type="text"
                    className="form-input"
                    value={adminUser?.username || 'Ricardo Oliveira'}
                    readOnly
                    disabled
                  />
                </div>

                <div className="form-group">
                  <label>E-MAIL INSTITUCIONAL</label>
                  <input
                    type="email"
                    className="form-input"
                    value={adminUser?.email || 'admin@escola.com.br'}
                    readOnly
                    disabled
                  />
                </div>

                <div className="form-group">
                  <label>CARGO</label>
                  <input
                    type="text"
                    className="form-input"
                    value={adminUser?.cargo === 'admin' ? 'Administrador' : adminUser?.cargo || 'Administrador'}
                    readOnly
                    disabled
                  />
                </div>

                <div className="form-group">
                  <label>INSTITUIÇÃO</label>
                  <input
                    type="text"
                    className="form-input"
                    value={adminUser?.escola?.Nome || 'Colégio FastPDF'}
                    readOnly
                    disabled
                  />
                </div>
              </div>
            </div>

            {/* Card 2: Segurança e Senha */}
            <div className="config-card">
              <div className="config-card-header">
                <div className="config-icon-wrapper green">
                  <Shield size={20} />
                </div>
                <h3>Segurança e Senha</h3>
              </div>

              <form onSubmit={handleUpdatePassword} className="config-card-body">
                {pwdError && (
                  <div className="alert alert-danger">
                    <AlertTriangle size={16} />
                    <span>{pwdError}</span>
                  </div>
                )}
                {pwdSuccess && (
                  <div className="alert alert-success">
                    <CheckCircle size={16} />
                    <span>{pwdSuccess}</span>
                  </div>
                )}

                <div className="form-group" style={{ maxWidth: '600px', marginBottom: '1.25rem' }}>
                  <label>Senha Atual</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="••••••••"
                    value={senhaAtual}
                    onChange={(e) => setSenhaAtual(e.target.value)}
                  />
                </div>

                <div className="grid-2-col" style={{ marginBottom: '1.5rem' }}>
                  <div className="form-group">
                    <label>Nova Senha</label>
                    <input
                      type="password"
                      className="form-input"
                      placeholder="Mínimo 8 caracteres"
                      value={novaSenha}
                      onChange={(e) => setNovaSenha(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Confirmar Nova Senha</label>
                    <input
                      type="password"
                      className="form-input"
                      placeholder="Repita a nova senha"
                      value={confirmarNovaSenha}
                      onChange={(e) => setConfirmarNovaSenha(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-actions" style={{ display: 'flex', gap: '0.75rem' }}>
                  <button type="submit" className="btn-save" disabled={pwdLoading}>
                    {pwdLoading ? 'Salvando...' : 'Salvar Alterações'}
                  </button>
                  <button type="button" className="btn-cancel" onClick={() => { setSenhaAtual(''); setNovaSenha(''); setConfirmarNovaSenha(''); }}>
                    Cancelar
                  </button>
                </div>
              </form>

              <div className="security-tip-box" style={{ margin: '1.5rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <Shield size={20} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.25rem' }}>Dica de Segurança</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                    Para uma senha mais forte, use uma combinação de letras maiúsculas, minúsculas, números e caracteres especiais (!@#$). Nunca compartilhe suas credenciais de acesso.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 3: Adicionar/Gerenciar Secretaria */}
            <div className="config-card">
              <div className="config-card-header">
                <div className="config-icon-wrapper navy">
                  <Users size={20} style={{ color: 'var(--white)' }} />
                </div>
                <h3>Gestão de Secretarias</h3>
              </div>

              <div className="config-card-body">
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                  Adicione e gerencie usuários do tipo **Secretaria**. Estes usuários podem apenas cadastrar novos alunos e não terão acesso às abas de Dashboard, Financeiro ou Configurações.
                </p>

                {secError && (
                  <div className="alert alert-danger" style={{ marginBottom: '1.25rem' }}>
                    <AlertTriangle size={16} />
                    <span>{secError}</span>
                  </div>
                )}
                {secSuccess && (
                  <div className="alert alert-success" style={{ marginBottom: '1.25rem' }}>
                    <CheckCircle size={16} />
                    <span>{secSuccess}</span>
                  </div>
                )}

                <form onSubmit={handleCreateSecretary} className="grid-3-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '1rem', alignItems: 'flex-end', marginBottom: '2rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>NOME DE USUÁRIO</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Ex: secretaria.maria"
                      value={secUsername}
                      onChange={(e) => setSecUsername(e.target.value)}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>E-MAIL</label>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="maria@escola.com"
                      value={secEmail}
                      onChange={(e) => setSecEmail(e.target.value)}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>SENHA</label>
                    <input
                      type="password"
                      className="form-input"
                      placeholder="Mínimo 6 caracteres"
                      value={secPassword}
                      onChange={(e) => setSecPassword(e.target.value)}
                    />
                  </div>

                  <button type="submit" className="btn-add-sec" style={{ height: '42px', padding: '0 1.25rem', backgroundColor: 'var(--primary)', color: 'var(--white)', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <Plus size={16} />
                    Adicionar
                  </button>
                </form>

                <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>Secretarias Cadastradas</h4>
                
                {secLoading && secretarias.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Carregando secretarias...</div>
                ) : secretarias.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px dashed #cbd5e1', fontSize: '0.85rem' }}>
                    Nenhuma secretaria cadastrada nesta escola ainda.
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table className="sec-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                          <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>USUÁRIO</th>
                          <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>E-MAIL</th>
                          <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>CARGO</th>
                          <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', width: '100px', textAlign: 'center' }}>AÇÃO</th>
                        </tr>
                      </thead>
                      <tbody>
                        {secretarias.map(sec => (
                          <tr key={sec.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.85rem', fontWeight: '500' }}>{sec.username}</td>
                            <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{sec.email}</td>
                            <td style={{ padding: '0.75rem 0.5rem' }}>
                              <span style={{ display: 'inline-block', padding: '0.2rem 0.5rem', backgroundColor: '#f1f5f9', color: '#64748b', fontSize: '0.7rem', fontWeight: '700', borderRadius: '4px' }}>SECRETARIA</span>
                            </td>
                            <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>
                              {deleteConfirmId === sec.id ? (
                                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                  <button onClick={() => handleDeleteSecretary(sec.id)} style={{ border: 'none', background: 'var(--error)', color: 'var(--white)', padding: '0.2rem 0.4rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '600', cursor: 'pointer' }}>Confirmar</button>
                                  <button onClick={() => setDeleteConfirmId(null)} style={{ border: '1px solid #cbd5e1', background: 'none', color: '#64748b', padding: '0.2rem 0.4rem', borderRadius: '4px', fontSize: '0.7rem', cursor: 'pointer' }}>Voltar</button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setDeleteConfirmId(sec.id)}
                                  style={{ border: 'none', background: 'none', color: 'var(--error)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0.25rem' }}
                                  title="Remover secretaria"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
            
          </div>
        </div>
      </main>
    </div>
  );
}

export default Configuracoes;
