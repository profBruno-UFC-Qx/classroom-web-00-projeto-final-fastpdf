
# Sistema de Geração de Carnês — FastPDF

Este projeto é uma solução prática para automatizar a gestão financeira de pequenas instituições de ensino, permitindo a geração de documentos de cobrança (PDF) em lote através da importação de dados via CSV.

## 🧑‍💻 Membros da equipe

* **Matrícula:** [565857, 571602, 570351]
* **Nome:** [Edivar Cruz Carvalho Filho, MARIA CLARA ZACARIAS MARQUES,  MARIA EDUARDA CARNEIRO DE FREITAS]
* **Curso:** Engenharia de Software - UFC Quixadá

## 💡 Objetivo Geral

Desenvolver uma ferramenta de gestão financeira simplificada que automatize a criação, organização e acompanhamento de carnês escolares, eliminando processos manuais e facilitando o controle de inadimplência em escolas de pequeno porte.

## 👀 Público-Alvo

Gestores de centros de reforço escolar, microempreendedores da área educacional e pais/responsáveis que necessitam de acesso rápido aos documentos de pagamento.

## 🌟 Impacto Esperado

* **Eficiência Operacional:** Redução do tempo de emissão de carnês de horas para poucos segundos.
* **Transparência:** Melhor comunicação entre escola e responsáveis sobre o status das mensalidades.
* **Acessibilidade:** Disponibilização digital de boletos e carnês, evitando perdas de documentos físicos.

## 🧑‍🤝‍🧑 Papéis ou tipos de usuário da aplicação

* **Usuário não logado:** Acesso à página institucional e tela de cadastro de responsáveis.
* **Admin:** Configuração global da escola e gerenciamento de permissões.
* **Secretaria:** Perfil operacional para importação de CSV, geração de PDFs e controle de pagamentos.
* **Responsável:** Acesso restrito para consulta de dependentes e download de seus respectivos carnês.

## 🚩 Principais funcionalidades da aplicação

### Funcionalidades Públicas
* Página institucional da escola.
* Interface de Login e Recuperação de Senha.
* Cadastro de novo Responsável.

### Funcionalidades Restritas
* **Painel Administrativo:** Dashboard com métricas de parcelas pagas, pendentes e vencidas.
* **Módulo de Importação:** Processamento de arquivos CSV para cadastro massivo de alunos e mensalidades.
* **Geração de PDF:** Motor de renderização para carnês individuais ou em lote (jsPDF).
* **Gestão de Status:** Atualização manual de pagamentos e histórico financeiro.

## 🗓️ Entidades ou tabelas do sistema

1.  **Usuário:** Gerenciamento de perfis e autenticação.
2.  **Escola:** Dados cadastrais da instituição.
3.  **Aluno:** Entidade central vinculada à escola e ao responsável.
4.  **Carnê:** Agrupador de obrigações financeiras por período.
5.  **Parcela:** Detalhamento de cada vencimento (vencimento, valor, status).

---

## 🖥️ Tecnologias e frameworks utilizados

**Frontend:**
* Html puro ou React (Depende, iremos conversar)
* Tailwind CSS
* PapaParse (Processamento de CSV)
* jsPDF + html2canvas (Geração de documentos)

**Backend:**
* Strapi (Headless CMS & API REST)
* SQLite (Banco de Dados)
* JWT (Autenticação e Autorização)

## 📝 Operações implementadas para cada entidade

| Entidade | Criação | Leitura | Atualização | Remoção |
| :--- | :---: | :---: | :---: | :---: |
| **Aluno** | X | X | X | X |
| **Carnê / Parcela** | X | X | X | X |
| **Escola** | X | X | X | - |

## 🌐 Rotas da API REST utilizadas

| Método HTTP | URL | Descrição |
| :--- | :--- | :--- |
| **POST** | `/api/auth/local` | Autenticação de usuário e recebimento de Token |
| **POST** | `/api/auth/local/register` | Registro de novo responsável |
| **GET** | `/api/alunos?populate=*` | Listagem completa de alunos e vínculos |
| **POST** | `/api/alunos` | Criação de aluno (individual ou via bulk import) |
| **GET** | `/api/carnes` | Recuperação de dados para geração de PDF |
| **PUT** | `/api/parcelas/:id` | Alteração de status (Ex: de 'Pendente' para 'Pago') |
| **GET** | `/api/users/me` | Verificação de perfil e permissões do usuário logado |

FORMA DE USO:
LOGIN: Primeiro faz o cadastro e depois o login, que leva pra tela de dashboard
RESPONSÁVEL: Utiliza o email de cadastro do aluno e a senha é a matrícula dele, que fica logo em baixo do nome do aluno na tela de dashboard, e depois de logado, ele pode ver os carnês dos alunos vinculados a ele.