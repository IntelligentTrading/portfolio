const nodemailer = require("nodemailer");
var sgTransport = require("nodemailer-sendgrid-transport");

module.exports = {
  send: async (to, token) => {
    var options = {
      auth: {
        api_user: process.env.SENDGRID_USERNAME,
        api_key: process.env.SENDGRID_PASSWORD
      }
    };
    var client = nodemailer.createTransport(sgTransport(options));

    var email = {
      from:
        '"Intelligent Trading Foundation Customer Service" <no-reply@intelligenttrading.org>', // sender address
      to: to, // list of receivers
      subject: "Reset email", // Subject line
      text: `Follow ${
        process.env.PORTFOLIO_APP
      }/api/auth/reset/${token}/ to reset your email. Not you? Let us know!`, // plain text body
      html: `Follow ${
        process.env.PORTFOLIO_APP
      }/api/auth/reset/${token} to reset your email. Not you? Let us know!` // html body
    };

    return client.sendMail(email);
  }
};
