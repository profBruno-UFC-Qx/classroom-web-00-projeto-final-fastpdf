import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, AlertTriangle } from 'lucide-react';
import { authService } from '../../services/auth';
import './Login.css';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const validateForm = () => {
    if (!email) {
      setError('Por favor, informe seu e-mail.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Por favor, insira um e-mail válido.');
      return false;
    }
    if (!password) {
      setError('Por favor, insira sua senha.');
      return false;
    }
    if (password.length < 6) {
      setError('A senha deve conter no mínimo 6 caracteres.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Connects to Strapi via authService
      const data = await authService.login(email, password);
      if (data?.user?.cargo === 'secretaria') {
        navigate('/alunos');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      // If server is not running or structure isn't ready in Strapi yet,
      // we'll handle the connection error nicely.
      console.error(err);
      if (err.message === 'Network Error' || err.status === 500) {
        setError('Não foi possível conectar ao servidor backend Strapi. Verifique se ele está rodando.');
      } else {
        setError(err.message || 'Credenciais inválidas. Verifique seu e-mail e senha.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container fade-in">
      {/* Left panel - Branding/Hero info */}
      <div className="login-left">
        <div className="login-left-content">
          <h1>Gestão Escolar Descomplicada e Confiável.</h1>
          <p>
            Emitir relatórios e acompanhe as finanças da sua instituição com a segurança e clareza que você precisa.
          </p>
        </div>
      </div>

      {/* Right panel - Form container */}
      <div className="login-right">
        <div className="login-right-content">
          <div className="login-header">
            <h2>Bem-vindo de volta</h2>
            <p>Acesse sua conta para gerenciar sua escola.</p>
          </div>

          {error && (
            <div className="error-banner">
              <AlertTriangle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">E-mail</label>
              <div className="input-wrapper">
                <input
                  id="email"
                  type="email"
                  className="input-field"
                  placeholder="admin@escola.com.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  autoComplete="email"
                />
                <Mail className="input-icon" size={18} />
              </div>
            </div>

            <div className="form-group">
              <div className="label-row">
                <label htmlFor="password">Senha</label>
                <a href="#esqueci-senha" className="forgot-link">
                  Esqueci senha
                </a>
              </div>
              <div className="input-wrapper">
                <input
                  id="password"
                  type="password"
                  className="input-field"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <Lock className="input-icon" size={18} />
              </div>
            </div>

            <button type="submit" className="btn-submit" disabled={isLoading}>
              {isLoading ? 'Entrando...' : 'Entrar'}
              {!isLoading && <ArrowRight className="arrow-icon" size={18} />}
            </button>
          </form>

          <div className="register-prompt">
            Ainda não tem conta?
            <Link to="/cadastro-escola" className="register-link">
              Cadastre-se
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
