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
          'api::escola.escola.findOne'
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
      }
    } catch (err) {
      console.error('[FastPDF Bootstrap] Falha ao configurar permissões do User:', err);
    }
  },
};
