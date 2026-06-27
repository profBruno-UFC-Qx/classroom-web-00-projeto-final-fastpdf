import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, FileText, MapPin, Phone, Mail, Lock, CheckCircle, AlertTriangle, ArrowLeft } from 'lucide-react';
import { escolaService } from '../../services/escola';
import { authService } from '../../services/auth';
import './CadastroEscola.css';

function CadastroEscola() {
  const navigate = useNavigate();
  
  // School states
  const [nome, setNome] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [endereco, setEndereco] = useState('');
  const [telefone, setTelefone] = useState('');
  
  // Administrator states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Helper to format CPF (000.000.000-00) or CNPJ (00.000.000/0000-00) dynamically
  const handleCnpjChange = (e) => {
    const rawValue = e.target.value;
    const cleanValue = rawValue.replace(/\D/g, '');
    
    let formatted = cleanValue;
    if (cleanValue.length <= 11) {
      // Format as CPF: 000.000.000-00
      if (cleanValue.length > 3 && cleanValue.length <= 6) {
        formatted = `${cleanValue.slice(0, 3)}.${cleanValue.slice(3)}`;
      } else if (cleanValue.length > 6 && cleanValue.length <= 9) {
        formatted = `${cleanValue.slice(0, 3)}.${cleanValue.slice(3, 6)}.${cleanValue.slice(6)}`;
      } else if (cleanValue.length > 9) {
        formatted = `${cleanValue.slice(0, 3)}.${cleanValue.slice(3, 6)}.${cleanValue.slice(6, 9)}-${cleanValue.slice(9, 11)}`;
      }
    } else {
      // Format as CNPJ: 00.000.000/0000-00
      const truncated = cleanValue.slice(0, 14);
      if (truncated.length > 2 && truncated.length <= 5) {
        formatted = `${truncated.slice(0, 2)}.${truncated.slice(2)}`;
      } else if (truncated.length > 5 && truncated.length <= 8) {
        formatted = `${truncated.slice(0, 2)}.${truncated.slice(2, 5)}.${truncated.slice(5)}`;
      } else if (truncated.length > 8 && truncated.length <= 12) {
        formatted = `${truncated.slice(0, 2)}.${truncated.slice(2, 5)}.${truncated.slice(5, 8)}/${truncated.slice(8)}`;
      } else if (truncated.length > 12) {
        formatted = `${truncated.slice(0, 2)}.${truncated.slice(2, 5)}.${truncated.slice(5, 8)}/${truncated.slice(8, 12)}-${truncated.slice(12, 14)}`;
      }
    }
    
    setCnpj(formatted);
  };

  // Helper to format Phone dynamically ((00) 00000-0000)
  const handlePhoneChange = (e) => {
    const rawValue = e.target.value;
    const cleanValue = rawValue.replace(/\D/g, '');
    
    let formatted = cleanValue;
    if (cleanValue.length > 2 && cleanValue.length <= 6) {
      formatted = `(${cleanValue.slice(0, 2)}) ${cleanValue.slice(2)}`;
    } else if (cleanValue.length > 6 && cleanValue.length <= 10) {
      formatted = `(${cleanValue.slice(0, 2)}) ${cleanValue.slice(2, 6)}-${cleanValue.slice(6)}`;
    } else if (cleanValue.length > 10) {
      formatted = `(${cleanValue.slice(0, 2)}) ${cleanValue.slice(2, 7)}-${cleanValue.slice(7, 11)}`;
    }
    
    setTelefone(formatted);
  };

  const validateForm = () => {
    // School validations
    if (!nome.trim()) {
      setError('Por favor, informe o nome da escola.');
      return false;
    }
    const cleanCnpj = cnpj.replace(/\D/g, '');
    if (cleanCnpj.length !== 11 && cleanCnpj.length !== 14) {
      setError('Por favor, insira um CPF (11 dígitos) ou CNPJ (14 dígitos) válido.');
      return false;
    }
    
    // User validations
    if (!email.trim()) {
      setError('Por favor, informe o e-mail do gestor.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Por favor, insira um e-mail válido para o gestor.');
      return false;
    }
    if (!password) {
      setError('Por favor, defina a senha do gestor.');
      return false;
    }
    if (password.length < 6) {
      setError('A senha do gestor deve conter no mínimo 6 caracteres.');
      return false;
    }
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setIsLoading(true);

    // Clear any previous token session to avoid 401 Unauthorized from Strapi
    // (if a previous session has an expired/invalid token, Strapi rejects public requests)
    authService.logout();

    const dadosEscola = {
      Nome: nome.trim(),
      CNPJ: cnpj,
      Endereco: endereco.trim() || null,
      Telefone: telefone.trim() || null,
      Email: email.trim(),
    };

    try {
      // 1. Register School in Strapi
      const createdSchool = await escolaService.cadastrar(dadosEscola);
      
      // Extract the database numeric ID. Strapi's users-permissions plugin
      // requires the integer ID (not the UUID documentId) for relationship updates.
      const schoolId = createdSchool?.data?.id;
      
      if (!schoolId) {
        throw new Error('Falha ao obter o ID da escola criada no Strapi.');
      }

      // 2. Register Administrator user
      // We register the user without passing the school relationship directly,
      // because Strapi's default register controller blocks custom fields.
      const registrationData = await authService.register(
        email.trim(),
        email.trim(),
        password
      );

      const userId = registrationData?.user?.id;
      if (!userId) {
        throw new Error('Falha ao obter o ID do usuário gestor criado.');
      }

      // 3. Update the User record to link it to the newly created School
      // The register call automatically authenticated our client, so we now have the JWT token
      await authService.atualizar(userId, {
        escola: schoolId
      });

      setIsSuccess(true);
    } catch (err) {
      console.error(err);
      if (err.message === 'Network Error' || err.status === 500) {
        setError('Não foi possível conectar ao backend Strapi. Verifique se o servidor está ativo e se os modelos (Escola e relações do User) foram configurados.');
      } else {
        setError(err.message || 'Erro ao realizar cadastro unificado. Certifique-se de que o CNPJ ou e-mail já não estão cadastrados.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setIsSuccess(false);
    setNome('');
    setCnpj('');
    setEndereco('');
    setTelefone('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  if (isSuccess) {
    return (
      <div className="cadastro-container fade-in">
        <div className="success-card">
          <CheckCircle className="success-icon" size={64} />
          <h2>Cadastro Concluído!</h2>
          <p>
            A instituição <strong>{nome}</strong> foi registrada e a conta do gestor <strong>{email}</strong> está ativa e vinculada.
          </p>
          <div className="success-actions">
            <button className="btn-primary" onClick={() => navigate('/login')}>
              Ir para o Login
            </button>
            <button className="btn-secondary" onClick={handleReset}>
              Cadastrar Outra
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cadastro-container fade-in">
      <div className="cadastro-card">
        <div className="cadastro-header">
          <h2>Cadastrar Escola e Gestor</h2>
          <p>Insira as informações da instituição e crie o usuário de acesso administrador</p>
        </div>

        {error && (
          <div className="error-banner" style={{ marginBottom: '1.5rem' }}>
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="cadastro-form">
          {/* Seção 1: Dados da Escola */}
          <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '0.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', color: 'var(--primary)', marginBottom: '1rem', fontWeight: 600 }}>1. Dados da Escola</h3>
            <div className="cadastro-form" style={{ gap: '1.25rem' }}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="nome">Nome da Escola *</label>
                  <div className="input-wrapper">
                    <input
                      id="nome"
                      type="text"
                      className="input-field"
                      placeholder="Nome da instituição"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      disabled={isLoading}
                      required
                    />
                    <Building2 className="input-icon" size={18} />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="cnpj">CPF ou CNPJ *</label>
                  <div className="input-wrapper">
                    <input
                      id="cnpj"
                      type="text"
                      className="input-field"
                      placeholder="CPF ou CNPJ da escola"
                      value={cnpj}
                      onChange={handleCnpjChange}
                      maxLength={18}
                      disabled={isLoading}
                      required
                    />
                    <FileText className="input-icon" size={18} />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="endereco">Endereço</label>
                <div className="input-wrapper">
                  <input
                    id="endereco"
                    type="text"
                    className="input-field"
                    placeholder="Rua, Número, Bairro, Cidade"
                    value={endereco}
                    onChange={(e) => setEndereco(e.target.value)}
                    disabled={isLoading}
                  />
                  <MapPin className="input-icon" size={18} />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="telefone">Telefone</label>
                <div className="input-wrapper">
                  <input
                    id="telefone"
                    type="tel"
                    className="input-field"
                    placeholder="(00) 00000-0000"
                    value={telefone}
                    onChange={handlePhoneChange}
                    maxLength={15}
                    disabled={isLoading}
                  />
                  <Phone className="input-icon" size={18} />
                </div>
              </div>
            </div>
          </div>

          {/* Seção 2: Dados do Gestor (Login) */}
          <div>
            <h3 style={{ fontSize: '1.125rem', color: 'var(--primary)', marginBottom: '1rem', fontWeight: 600 }}>2. Acesso do Gestor (Administrador)</h3>
            <div className="cadastro-form" style={{ gap: '1.25rem' }}>
              <div className="form-group">
                <label htmlFor="email">E-mail do Gestor *</label>
                <div className="input-wrapper">
                  <input
                    id="email"
                    type="email"
                    className="input-field"
                    placeholder="gestor@escola.com.br"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                  <Mail className="input-icon" size={18} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="password">Senha *</label>
                  <div className="input-wrapper">
                    <input
                      id="password"
                      type="password"
                      className="input-field"
                      placeholder="Mínimo 6 caracteres"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      required
                    />
                    <Lock className="input-icon" size={18} />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirmar Senha *</label>
                  <div className="input-wrapper">
                    <input
                      id="confirmPassword"
                      type="password"
                      className="input-field"
                      placeholder="Repita a senha"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isLoading}
                      required
                    />
                    <Lock className="input-icon" size={18} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button type="submit" className="btn-submit" disabled={isLoading}>
            {isLoading ? 'Cadastrando tudo...' : 'Cadastrar Escola e Gestor'}
          </button>
        </form>

        <div className="back-link-container">
          <Link to="/login" className="back-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            <ArrowLeft size={16} /> Voltar para o Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default CadastroEscola;
