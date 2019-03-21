const nodemailer = require('nodemailer')
var sgTransport = require('nodemailer-sendgrid-transport')

const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(
  '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'
)

var options = {
  auth: {
    api_user: process.env.SENDGRID_USERNAME,
    api_key: process.env.SENDGRID_PASSWORD
  }
}
var client = nodemailer.createTransport(sgTransport(options))

module.exports = {
  send: async (to, token) => {
    var email = {
      from:
        '"Intelligent Trading Foundation Customer Service" <no-reply@intelligenttrading.org>', // sender address
      to: to, // list of receivers
      subject: 'Reset email', // Subject line
      text: `Follow ${
        process.env.PORTFOLIO_APP
      }#/auth/reset/${token}/ to reset your email. Not you? Let us know!`, // plain text body
      html: `Follow ${
        process.env.PORTFOLIO_APP
      }#/auth/reset/${token} to reset your email. Not you? Let us know!` // html body
    }

    return client.sendMail(email)
  },
  confirm: async (to, confirmToken) => {
    var email = {
      from:
        '"Intelligent Trading Foundation Customer Service" <no-reply@intelligenttrading.org>', // sender address
      to: to, // list of receivers
      templateId: 'd-c1deafa3833745fdbe77136b777383fa',
      text: "It's a great day!",
      subject: 'Welcome to ITF',
      dynamic_template_data: {
        confirm_url: `${process.env.DOMAIN}/api/auth/register/confirm/${confirmToken}`
      }
    }

    return sgMail.send(email)
  }
}
