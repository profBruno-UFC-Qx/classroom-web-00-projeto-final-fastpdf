async function linkResponsavel(data: any) {
  if (data && data.ContaResponavel) {
    const email = data.ContaResponavel.trim().toLowerCase();
    const nome = data.NomeResponsavel ? data.NomeResponsavel.trim() : 'Responsável';

    // 1. Find existing user with this email
    const existingUser = await strapi.db.query('plugin::users-permissions.user').findOne({
      where: { email }
    });

    if (existingUser) {
      // Link the relation
      data.responsavel = existingUser.id;
    } else {
      // 2. Find authenticated role
      const authenticatedRole = await strapi.db.query('plugin::users-permissions.role').findOne({
        where: { type: 'authenticated' }
      });

      // Generate a simple username (e.g. from email before @, unique suffix)
      const cleanUsername = email.split('@')[0] + Math.floor(100 + Math.random() * 900);

      // 3. Create a new user for the responsible
      const newUser = await strapi.db.query('plugin::users-permissions.user').create({
        data: {
          username: cleanUsername,
          email: email,
          password: 'Responsavel123!', // Safe temporary password
          role: authenticatedRole ? authenticatedRole.id : null,
          confirmed: true,
          blocked: false
        }
      });

      // Link the relation
      data.responsavel = newUser.id;
    }
  }
}

export default {
  async beforeCreate(event: any) {
    const { data } = event.params;
    await linkResponsavel(data);
  },

  async beforeUpdate(event: any) {
    const { data } = event.params;
    await linkResponsavel(data);
  },

  async afterCreate(event: any) {
    const { result } = event;
    const valorMensalidade = result.ValorMensalidade || 0;
    const matricula = result.Matricula || '0000';
    try {
      // 1. Cria o registro de "Carne" usando o Document Service (Strapi v5)
      const novoCarne = await strapi.documents('api::carne.carne').create({
        data: {
          Codigo: `CARNE-${matricula}-${new Date().getFullYear()}`,
          Ano: new Date().getFullYear(),
          aluno: result.id,
          // Nota: No Strapi v5, o status 'published' pode ser definido direto, mas o padrão de rascunho/publicação é controlado de outra forma, geralmente publicando automaticamente por padrão ou via status.
        }
      });

      const parcelasCriadasIds = [];

      // 2. Cria as 12 parcelas
      for (let i = 1; i <= 12; i++) {
        const dataVencimento = new Date();
        dataVencimento.setMonth(dataVencimento.getMonth() + i);

        const novaParcela = await strapi.documents('api::parcela.parcela').create({
          data: {
            NumeroParcela: i,
            Vencimento: dataVencimento,
            Valor: valorMensalidade,
            StatusPagamento: 'Pendente',
          }
        });
        // IMPORTANTE: No Strapi v5, preferimos guardar o 'documentId'
        parcelasCriadasIds.push(novaParcela.documentId || novaParcela.id);
      }

      // 3. Atualiza o Carnê vinculando as parcelas usando o documentId
      await strapi.documents('api::carne.carne').update({
        documentId: novoCarne.documentId,
        data: {
          parcelas: parcelasCriadasIds
        }
      });

      console.log(`Sucesso: Carnê e 12 parcelas vinculados para o aluno ID ${result.id}`);
    } catch (error) {
      console.error('Falha ao gerar carnê/parcelas automática no ciclo de vida:', error);
    }
  }


};
