import "./Dashboard.css";

function Dashboard() {
  return (
    <div className="dashboard">
      <h1>Painel Administrativo</h1>
      <p className="subtitulo">Bem-vinda ao sistema FastPDF!</p>

      <div className="cards">
        <div className="card">
          <h2>120</h2>
          <p>Parcelas Pagas</p>
        </div>

        <div className="card">
          <h2>18</h2>
          <p>Pendentes</p>
        </div>

        <div className="card">
          <h2>5</h2>
          <p>Vencidas</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;