export default ({ env }: any) => ({
  email: {
    config: {
      provider: 'nodemailer',
      providerOptions: {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: 'teste2025aaa@gmail.com',
          pass: 'nwppewvbjodhdxpd',
        },
      },
      settings: {
        defaultFrom: 'teste2025aaa@gmail.com',
        defaultReplyTo: 'teste2025aaa@gmail.com',
      },
    },
  },
});