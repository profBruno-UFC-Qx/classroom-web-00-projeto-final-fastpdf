import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login/Login';
import CadastroEscola from './pages/CadastroEscola/CadastroEscola';
import Dashboard from './pages/Dashboard/Dashboard';
import Alunos from './pages/Alunos/Alunos';
import Layout from './components/Layout/Layout';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro-escola" element={<CadastroEscola />} />
        <Route
          path="/dashboard"
          element={
            <Layout>
              <Dashboard />
            </Layout>
          }
        />
        <Route
          path="/alunos"
          element={
            <Layout>
              <Alunos />
            </Layout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;