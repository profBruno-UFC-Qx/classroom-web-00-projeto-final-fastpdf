
module.exports = {
  routes: [
    {
      // Método HTTP aceito por essa rota (só aceita POST, já que estamos
      // enviando dados  o e-mail  no corpo da requisição)
      method: 'POST',

      // Caminho da URL. Como o Strapi já prefixa tudo com /api,
      path: '/recuperar-senha',

      // Diz qual função vai executar quando essa rota for chamada.
  //aponta pra função "recuperar" dentro do controller recuperar senha tbm
      handler: 'recuperar-senha.recuperar',

      config: {
        // auth: false = rota PÚBLICA, não exige token JWT.
        auth: false,
      },
    },
  ],
};