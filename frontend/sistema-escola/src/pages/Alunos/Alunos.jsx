import "./Alunos.css";
import { Upload, UserPlus } from "lucide-react";

const alunosMock = [
  {
    id: 1,
    nome: "Lucas Martins",
    matricula: "2024-001",
    responsavel: "Roberto Martins",
    turma: "3º Ano A",
    status: "ATIVO",
    iniciais: "LM",
  },
  {
    id: 2,
    nome: "Ana Silva Oliveira",
    matricula: "2024-042",
    responsavel: "Maria Silva",
    turma: "1º Ano C",
    status: "ATIVO",
    iniciais: "AS",
  },
];

function Alunos() {
  return (
    <div className="alunos">
      <div className="alunos-topo">
        <div>
          <h1>Gestão de Alunos</h1>
          <p className="subtitulo">Gerencie matrículas, turmas e visualize o status financeiro.</p>
        </div>
        <div className="alunos-topo-botoes">
          <button className="btn-importar">
            <Upload size={15} />
            Importar CSV
          </button>
          <button className="btn-adicionar">
            <UserPlus size={15} />
            Adicionar Aluno
          </button>
        </div>
      </div>

      <div className="alunos-filtros">
        <select className="filtro-select">
          <option>Turma: Todas</option>
          <option>1º Ano A</option>
          <option>1º Ano C</option>
          <option>3º Ano A</option>
        </select>
        <select className="filtro-select">
          <option>Status: Todos</option>
          <option>Ativo</option>
          <option>Inativo</option>
        </select>
        <span className="alunos-contagem">Mostrando 1-5 de 124 alunos</span>
      </div>

      <div className="alunos-tabela-wrapper">
        <table className="alunos-tabela">
          <thead>
            <tr>
              <th>NOME DO ALUNO</th>
              <th>RESPONSÁVEL</th>
              <th>TURMA</th>
              <th>STATUS</th>
              <th>AÇÕES</th>
            </tr>
          </thead>
          <tbody>
            {alunosMock.map((aluno) => (
              <tr key={aluno.id}>
                <td>
                  <div className="aluno-nome-cell">
                    <div className="aluno-avatar">{aluno.iniciais}</div>
                    <div>
                      <strong>{aluno.nome}</strong>
                      <span className="aluno-matricula">Matrícula: {aluno.matricula}</span>
                    </div>
                  </div>
                </td>
                <td>{aluno.responsavel}</td>
                <td>
                  <span className="badge-turma">{aluno.turma}</span>
                </td>
                <td>
                  <span className="badge-status ativo">● {aluno.status}</span>
                </td>
                <td>
                  <button className="btn-acoes">⋮</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="alunos-paginacao">
        <button className="pagina-btn ativo">1</button>
        <button className="pagina-btn">2</button>
        <button className="pagina-btn">3</button>
        <span>...</span>
        <button className="pagina-btn proximo">Próximo</button>
      </div>
    </div>
  );
}

export default Alunos;