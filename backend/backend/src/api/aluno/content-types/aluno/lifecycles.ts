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
      // 1. Cria o registro de "Carne" já publicado (status: 'published')
      const novoCarne = await strapi.documents('api::carne.carne').create({
        data: {
          Codigo: `CARNE-${matricula}-${new Date().getFullYear()}`,
          Ano: new Date().getFullYear(),
          aluno: result.documentId,
        },
        status: 'published',
      });

      const parcelasCriadasIds: any[] = [];

      // 2. Cria as 12 parcelas já publicadas
      for (let i = 1; i <= 12; i++) {
        const dataVencimento = new Date();
        dataVencimento.setMonth(dataVencimento.getMonth() + i);

        const novaParcela = await strapi.documents('api::parcela.parcela').create({
          data: {
            NumeroParcela: i,
            Vencimento: dataVencimento,
            Valor: valorMensalidade,
            StatusPagamento: 'Pendente',
          },
          status: 'published',
        });
        parcelasCriadasIds.push(novaParcela.documentId || novaParcela.id);
      }

      // 3. Atualiza o Carnê vinculando as parcelas (mantém publicado)
      await strapi.documents('api::carne.carne').update({
        documentId: novoCarne.documentId,
        data: {
          parcelas: parcelasCriadasIds,
        },
        status: 'published',
      });

      console.log(`Sucesso: Carnê e 12 parcelas PUBLICADOS para o aluno documentId ${result.documentId}`);
    } catch (error) {
      console.error('Falha ao gerar carnê/parcelas automática no ciclo de vida:', error);
    }
  }


};
