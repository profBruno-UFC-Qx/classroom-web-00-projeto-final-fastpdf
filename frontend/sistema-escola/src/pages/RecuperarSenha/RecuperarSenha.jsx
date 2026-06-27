import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, ArrowLeft, CheckCircle, AlertTriangle } from 'lucide-react';
import api from '../../services/api';
import './RecuperarSenha.css';

function RecuperarSenha() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

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
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      await api.post('/auth/forgot-password', { email });
      setSuccess(true);
    } catch (err) {
      console.error('Erro ao recuperar senha:', err);
      setError('Não foi possível enviar o e-mail. Verifique o endereço informado.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="recuperar-container fade-in" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div className="success-card">
          <CheckCircle className="success-icon" size={64} />
          <h2>E-mail enviado!</h2>
          <p>
            Enviamos um link de redefinição para <strong>{email}</strong>. Verifique sua caixa de entrada.
          </p>
          <Link to="/login" className="btn-secondary">
            ← Voltar para login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="recuperar-container fade-in">
      <div className="recuperar-left">
        <div className="recuperar-left-content">
          <h1>Não se preocupe, acontece com todos.</h1>
          <p>
            Informe seu e-mail cadastrado e enviaremos um link para você redefinir sua senha com segurança.
          </p>
        </div>
      </div>

      <div className="recuperar-right">
        <div className="recuperar-right-content">
          <div className="recuperar-header">
            <h2>Recuperar Senha</h2>
            <p>Digite seu e-mail para receber o link de redefinição.</p>
          </div>

          {error && (
            <div className="error-banner">
              <AlertTriangle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="recuperar-form">
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

            <button type="submit" className="btn-submit" disabled={isLoading}>
              {isLoading ? 'Enviando...' : 'Enviar link'}
              {!isLoading && <ArrowRight className="arrow-icon" size={18} />}
            </button>
          </form>

          <div className="voltar-prompt">
            <Link to="/login" className="voltar-link">
              <ArrowLeft size={16} />
              Voltar para login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RecuperarSenha;