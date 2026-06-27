import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { alunoService } from '../../services/aluno';
import { authService } from '../../services/auth';
import { ArrowLeft, Printer } from 'lucide-react';
import './Financeiro.css';

function CarnePrint() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const idParam = searchParams.get('id');
  const pixKey = searchParams.get('pix') || 'contato@escola.com';

  const [alunos, setAlunos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState(null);

  useEffect(() => {
    // Authenticate check
    if (!authService.isAuthenticated()) {
      navigate('/login');
      return;
    }

    const loadData = async () => {
      try {
        const data = await alunoService.obterAlunos();
        setAlunos(data);
        const found = data.find(a => a.id.toString() === idParam || a.documentId === idParam);
        if (found) {
          setStudent(found);
        }
      } catch (err) {
        console.error('Erro ao carregar dados do aluno:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [idParam, navigate]);

  // Auto trigger print when loaded
  useEffect(() => {
    if (!loading && student) {
      const timer = setTimeout(() => {
        window.print();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [loading, student]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'sans-serif' }}>
        <p>Carregando dados para geração do carnê...</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <h2>Aluno não encontrado</h2>
        <button onClick={() => navigate('/financeiro')} style={{ marginTop: '1rem', padding: '0.5rem 1rem', cursor: 'pointer' }}>
          Voltar para Financeiro
        </button>
      </div>
    );
  }

  // Get due day based on ID
  const getDueDay = (aluno) => {
    const mod = aluno.id % 4;
    if (mod === 1) return 1;
    if (mod === 2 || mod === 0) return 5;
    return 15;
  };

  const valor = student.ValorMensalidade || 350.00;

  // Generate 12 installments array, each 30 days after creation date
  const getStudentInstallments = (aluno) => {
    const baseDate = new Date(aluno.createdAt || '2026-06-27T12:00:00.000Z');
    const list = [];
    for (let i = 1; i <= 12; i++) {
      const dueDate = new Date(baseDate.getTime() + i * 30 * 24 * 60 * 60 * 1000);
      const dueDateStr = `${dueDate.getDate().toString().padStart(2, '0')}/${(dueDate.getMonth() + 1).toString().padStart(2, '0')}/${dueDate.getFullYear()}`;
      list.push({
        number: i,
        dueDate: dueDateStr,
        value: valor
      });
    }
    return list;
  };

  const installments = getStudentInstallments(student);

  // Render a mock barcode using vertical bars
  const renderBarcode = () => {
    const barTypes = ['thin', 'medium', 'thick', 'wide'];
    const bars = [];
    // Generate deterministic pseudo-random bars for realistic visual look
    let seed = 42;
    for (let i = 0; i < 45; i++) {
      seed = (seed * 9301 + 49297) % 233280;
      const typeIndex = Math.floor((seed / 233280) * barTypes.length);
      bars.push(<div key={i} className={`barcode-bar ${barTypes[typeIndex]}`} />);
      if (i % 3 === 0) {
        bars.push(<div key={`s-${i}`} className="barcode-space" />);
      }
    }
    return <div className="carne-barcode-mock">{bars}</div>;
  };

  return (
    <div className="carne-print-container">
      {/* Control bar - hidden during print */}
      <div className="no-print" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 20px',
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        marginBottom: '20px',
        fontFamily: 'sans-serif'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => navigate('/financeiro')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: '#475569',
              fontWeight: '600'
            }}
          >
            <ArrowLeft size={16} />
            Voltar
          </button>
          <span style={{ color: '#94a3b8' }}>|</span>
          <span style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b' }}>
            Visualizando Carnê: <strong>{student.NomeCrianca}</strong>
          </span>
        </div>
        <button
          onClick={() => window.print()}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#0b2c52',
            color: '#fff',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '13px'
          }}
        >
          <Printer size={16} />
          Imprimir Carnê
        </button>
      </div>

      {/* The 12 Slips */}
      {installments.map((inst) => (
        <div className="carne-slip" key={inst.number}>
          {/* Canhoto (Recibo do Sacado) */}
          <div className="carne-left">
            <div>
              <div className="carne-header-row" style={{ borderBottom: '1px solid #000', marginBottom: '6px' }}>
                <span className="carne-logo-title" style={{ fontSize: '9px' }}>FastPDF Admin</span>
                <span className="carne-slip-num">{inst.number.toString().padStart(2, '0')}/12</span>
              </div>

              <table className="carne-grid-table" style={{ fontSize: '8px', marginBottom: '6px' }}>
                <tbody>
                  <tr>
                    <td colSpan="2">
                      <span className="carne-label">Beneficiário</span>
                      <span className="carne-value">FastPDF Admin / Escola</span>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <span className="carne-label">Vencimento</span>
                      <span className="carne-value">{inst.dueDate}</span>
                    </td>
                    <td>
                      <span className="carne-label">Valor Parcela</span>
                      <span className="carne-value">
                        {inst.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan="2">
                      <span className="carne-label">Sacado (Aluno)</span>
                      <span className="carne-value" style={{ fontSize: '9px' }}>{student.NomeCrianca}</span>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan="2">
                      <span className="carne-label">Matrícula</span>
                      <span className="carne-value">{student.Matricula || 'N/A'}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style={{ borderTop: '1px solid #000', paddingTop: '6px', fontSize: '8px' }}>
              <span className="carne-label">Chave PIX para pagamento</span>
              <span className="carne-value" style={{ wordBreak: 'break-all', display: 'block', fontSize: '8px' }}>{pixKey}</span>
            </div>
          </div>

          {/* Ficha de Compensação */}
          <div className="carne-right">
            <div>
              <div className="carne-header-row">
                <span className="carne-logo-title">FastPDF Admin / Escola</span>
                <span className="carne-slip-num">PARCELA {inst.number.toString().padStart(2, '0')} DE 12</span>
              </div>

              <table className="carne-grid-table">
                <tbody>
                  <tr>
                    <td style={{ width: '70%' }}>
                      <span className="carne-label">Local de Pagamento</span>
                      <span className="carne-value">Pagar preferencialmente via PIX</span>
                    </td>
                    <td style={{ width: '30%' }}>
                      <span className="carne-label">Vencimento</span>
                      <span className="carne-value" style={{ fontSize: '11px' }}>{inst.dueDate}</span>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <span className="carne-label">Beneficiário</span>
                      <span className="carne-value">FastPDF Admin / Escola</span>
                    </td>
                    <td>
                      <span className="carne-label">Valor do Documento</span>
                      <span className="carne-value" style={{ fontSize: '11px' }}>
                        {inst.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan="2">
                      <span className="carne-label">Sacado (Aluno)</span>
                      <span className="carne-value" style={{ fontSize: '11px' }}>
                        {student.NomeCrianca} — Matrícula: {student.Matricula || 'N/A'}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="carne-right-pix-box">
                <div>
                  <span className="carne-label" style={{ color: '#0b2c52', fontSize: '8px' }}>Pague com PIX</span>
                  <p style={{ margin: '2px 0 0 0', fontSize: '9px', lineHeight: '1.3' }}>
                    Utilize a chave PIX abaixo para efetuar o pagamento desta parcela:<br />
                    <strong style={{ fontSize: '10px', color: '#000', wordBreak: 'break-all' }}>{pixKey}</strong>
                  </p>
                </div>
              </div>
            </div>

            <div>
              {renderBarcode()}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default CarnePrint;
