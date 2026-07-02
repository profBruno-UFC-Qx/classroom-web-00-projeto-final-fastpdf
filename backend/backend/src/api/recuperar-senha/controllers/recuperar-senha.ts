
import bcrypt from 'bcryptjs';

export default {

  async recuperar(ctx: any) {

    // extrai o campo "email" do corpo (body) da requisição
   //se o frontend mandou user@gmail.
    // aqui a gente pega esse valor
    const { email } = ctx.request.body;

    // Se o e-mail não foi enviado (campo vazio ou ausente),
    // retorna erro 400 (Bad Request) e para a execução aqui.
    if (!email) {
      return ctx.badRequest('E-mail é obrigatório.');
    }

    // consulta o banco de dados procurando um usuário com esse e-mail 
    // strapi.query(...) acessa diretamente a tabela de usuários do plugin
    // users-permissions 
    const user = await strapi
      .query('plugin::users-permissions.user')
      .findOne({ where: { email } });

    //se não achou nenhum usuário com esse e-mail,
    // ainda assim respondemos como se tivesse dado certo
   
    if (!user) {
      return ctx.send({ message: 'Se o e-mail existir, uma nova senha foi enviada.' });
    }

    // gera uma senha aleatória de 10 caracteres.
    // Math.random() → número decimal aleatório, ex: 0.482910...
    // .toString(36) → converte esse número pra uma string usando letras e
    //   números
    // .slice(-10) → pega só os últimos 10 caracteres dessa string,
    //   descartando o "0." do começo
    const novaSenha = Math.random().toString(36).slice(-10);

    // Transforma a senha em texto puro  num HASH criptográfico
   
    const senhaComHash = await bcrypt.hash(novaSenha, 10);

    // Atualiza o usuário no banco de dados ele pega o registro com esse "id"
    // e substitui o campo "password" pelo novo hash
// daqui, a senha antiga do usuário não funciona mais
    await strapi.query('plugin::users-permissions.user').update({
      where: { id: user.id },
      data: { password: senhaComHash },
    });

    // Usa o serviço de e-mail do Strapi (configurado no plugins.ts com o
    // provedor SMTP) para enviar a senha nova 
    // único lugar onde a senha aparece de cara no bd
    // ela já está salva como hash
    await strapi.plugin('email').service('email').send({
      to: user.email,                    // destinatário: o e-mail do usuário encontrado
      subject: 'Sua nova senha - Sistema Escola',  // assunto do e-mail
      text: `Olá, ${user.username}!\n\nSua nova senha de acesso é: ${novaSenha}\n\nRecomendamos alterá-la após o login.`,
      // versão do e-mail sem formatação (texto puro), pra clientes de
      // e-mail que não suportam HTML

      html: `<p>Olá, <strong>${user.username}</strong>!</p><p>Sua nova senha de acesso é: <strong>${novaSenha}</strong></p><p>Recomendamos alterá-la após o login.</p>`,

    });

    // Responde ao frontend confirmando sucesso. O RecuperarSenha.jsx
    // recebe essa resposta e troca a tela pra nova senha mandada
    return ctx.send({ message: 'Nova senha enviada para o seu e-mail.' });
  },
};