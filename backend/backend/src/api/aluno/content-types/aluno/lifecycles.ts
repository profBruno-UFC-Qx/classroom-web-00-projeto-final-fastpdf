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
  }
};
