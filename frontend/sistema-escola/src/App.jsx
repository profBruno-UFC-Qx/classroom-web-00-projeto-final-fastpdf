import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login/Login';
import CadastroEscola from './pages/CadastroEscola/CadastroEscola';
import RecuperarSenha from './pages/RecuperarSenha/RecuperarSenha';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro-escola" element={<CadastroEscola />} />
        <Route path="/recuperar-senha" element={<RecuperarSenha />} />
      </Routes>
    </Router>
  );
}

export default App;