import bcrypt from 'bcryptjs';

export default {
  register() {},

  async bootstrap({ strapi }: { strapi: any }) {
    try {
      const authRole = await strapi.query('plugin::users-permissions.role').findOne({
        where: { type: 'authenticated' },
        populate: ['permissions']
      });

      if (authRole) {
        const requiredActions = [
          'plugin::users-permissions.user.find',
          'plugin::users-permissions.user.findOne',
          'plugin::users-permissions.user.create',
          'plugin::users-permissions.user.update',
          'plugin::users-permissions.user.destroy',
          'api::escola.escola.find',
          'api::escola.escola.findOne',
          'api::aluno.aluno.find',
          'api::aluno.aluno.findOne',
          'api::aluno.aluno.create',
          'api::aluno.aluno.update',
          'api::aluno.aluno.delete',
          'api::carne.carne.find',
          'api::carne.carne.findOne',
          'api::carne.carne.create',
          'api::carne.carne.update',
          'api::carne.carne.delete',
          'api::parcela.parcela.find',
          'api::parcela.parcela.findOne',
          'api::parcela.parcela.create',
          'api::parcela.parcela.update',
          'api::parcela.parcela.delete'
        ];

        for (const actionName of requiredActions) {
          const hasPerm = authRole.permissions.some((p: any) => p.action === actionName);
          if (!hasPerm) {
            await strapi.query('plugin::users-permissions.permission').create({
              data: {
                action: actionName,
                role: authRole.id
              }
            });
            console.log(`[FastPDF Bootstrap] Permissão criada para: ${actionName}`);
          }
        }

        try {
          const alunos = await strapi.query('api::aluno.aluno').findMany({
            populate: ['escola']
          });

          for (const aluno of alunos) {
            const email = aluno.ContaResponavel;
            const matricula = aluno.Matricula;
            if (!email || !matricula) continue;

            const trimmedEmail = email.toLowerCase().trim();
            const hashedPassword = await bcrypt.hash(matricula, 10);

            const user = await strapi.query('plugin::users-permissions.user').findOne({
              where: { email: trimmedEmail }
            });

            if (user) {
              await strapi.query('plugin::users-permissions.user').update({
                where: { id: user.id },
                data: {
                  cargo: 'responsavel',
                  provider: 'local',
                  password: hashedPassword
                }
              });
              console.log(`[FastPDF Migration] Atualizado responsável existente: ${trimmedEmail}`);
            } else {
              await strapi.query('plugin::users-permissions.user').create({
                data: {
                  username: trimmedEmail,
                  email: trimmedEmail,
                  password: hashedPassword,
                  cargo: 'responsavel',
                  provider: 'local',
                  confirmed: true,
                  role: authRole.id
                }
              });
              console.log(`[FastPDF Migration] Criado novo responsável: ${trimmedEmail}`);
            }
          }
        } catch (migErr) {
          console.error('[FastPDF Migration] Falha na migração de responsáveis:', migErr);
        }
      }
    } catch (err) {
      console.error('[FastPDF Bootstrap] Falha ao configurar permissões do User:', err);
    }
  },
};