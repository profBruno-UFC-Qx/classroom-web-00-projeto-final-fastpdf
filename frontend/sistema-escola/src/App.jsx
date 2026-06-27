import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login/Login';
import CadastroEscola from './pages/CadastroEscola/CadastroEscola';
import Dashboard from './pages/Dashboard/Dashboard';
import Alunos from './pages/Alunos/Alunos';
import Financeiro from './pages/Financeiro/Financeiro';
import CarnePrint from './pages/Financeiro/CarnePrint';
import Configuracoes from './pages/Configuracoes/Configuracoes';
import ResponsavelDashboard from './pages/Responsavel/ResponsavelDashboard';
import { authService } from './services/auth';
import RecuperarSenha from './pages/RecuperarSenha/RecuperarSenha';

// Protected route to enforce authentication and cargo roles
const ProtectedRoute = ({ children, allowedCargos }) => {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  const user = authService.getCurrentUser();
  const cargo = user?.cargo || 'admin';

  if (allowedCargos && !allowedCargos.includes(cargo)) {
    if (cargo === 'responsavel') {
      return <Navigate to="/responsavel" replace />;
    }
    return <Navigate to="/alunos" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro-escola" element={<CadastroEscola />} />
        <Route path="/recuperar-senha" element={<RecuperarSenha />} />
        
        <Route path="/dashboard" element={
          <ProtectedRoute allowedCargos={['admin']}>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/alunos" element={
          <ProtectedRoute allowedCargos={['admin', 'secretaria']}>
            <Alunos />
          </ProtectedRoute>
        } />
        
        <Route path="/financeiro" element={
          <ProtectedRoute allowedCargos={['admin']}>
            <Financeiro />
          </ProtectedRoute>
        } />
        
        <Route path="/print-carne" element={
          <ProtectedRoute allowedCargos={['admin']}>
            <CarnePrint />
          </ProtectedRoute>
        } />

        <Route path="/configuracoes" element={
          <ProtectedRoute allowedCargos={['admin']}>
            <Configuracoes />
          </ProtectedRoute>
        } />

        <Route path="/responsavel" element={
          <ProtectedRoute allowedCargos={['responsavel']}>
            <ResponsavelDashboard />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;