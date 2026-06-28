import { useNavigate } from 'react-router-dom';
import './LandingPage.css';
import { IconUsers, IconFileTypePdf, IconChartBar, IconUpload, IconSearch, IconUsersGroup } from '@tabler/icons-react';

const cards = [
  { icon: <IconUsers size={28} color="#185fa5" />, titulo: 'Gestão de alunos',    desc: 'Cadastre, importe CSV e gerencie turmas.' },
  { icon: <IconFileTypePdf size={28} color="#854f0b" />, titulo: 'Carnês em PDF', desc: 'Gere carnês de mensalidade com um clique.' },
  { icon: <IconChartBar size={28} color="#3b6d11" />, titulo: 'Controle financeiro', desc: 'Parcelas, recebimentos e inadimplência.' },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div>
      <div className="hero">
        <p className="hero-label">FASTPDF ADMIN</p>
        <h1>Gestão escolar descomplicada</h1>
        <p>Alunos, financeiro e carnês PDF em um só lugar.</p>
        <button className="hero-btn" onClick={() => navigate('/login')}>
          Acessar o sistema →
        </button>
      </div>

      <div className="cards">
        {cards.map((c) => (
          <div key={c.titulo} className="card">
            <div className="card-icon">{c.icon}</div>
            <h3>{c.titulo}</h3>
            <p>{c.desc}</p>
          </div>
        ))}
      </div>

      <div className="cards2">
  {[
    { icon: <IconUpload size={28} color="#534AB7" />,     titulo: 'Importação via CSV',     desc: 'Suba uma planilha e cadastre vários alunos de uma vez.' },
    { icon: <IconSearch size={28} color="#0F6E56" />,     titulo: 'Busca rápida',           desc: 'Encontre alunos e faturas em segundos.' },
    { icon: <IconUsersGroup size={28} color="#993C1D" />, titulo: 'Gestão de secretárias',  desc: 'Crie acessos limitados para sua equipe.' },
  ].map((c) => (
    <div key={c.titulo} className="card">
      <div className="card-icon">{c.icon}</div>
      <h3>{c.titulo}</h3>
      <p>{c.desc}</p>
    </div>
  ))}
</div>

      <div className="footer">
        <h2>Pronto para usar</h2>
        <p>Sem instalação. Acesse pelo navegador e comece no mesmo dia.</p>
      </div>
    </div>
  );
}