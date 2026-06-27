import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login/Login';
import CadastroEscola from './pages/CadastroEscola/CadastroEscola';
import Dashboard from './pages/Dashboard/Dashboard';
import Alunos from './pages/Alunos/Alunos';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro-escola" element={<CadastroEscola />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/alunos" element={<Alunos />} />
      </Routes>
    </Router>
  );
}

export default App;
