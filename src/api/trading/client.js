const rp = require('request-promise')
const crypto = require('crypto')

const portfolio_url = process.env.ITF_TRADING_API + '/portfolio/'
process.env.ITF_TRADING_API_KEY

module.exports = {
  status: exchangeAccount => {
    // decrypt exchangeAccount credentials with pvt key

    var options = {
      method: 'POST',
      uri: portfolio_url,
      body: {
        api_key: process.env.ITF_TRADING_API_KEY
      },
      json: true // Automatically stringifies the body to JSON
    }

    let decrypted_api = crypto.privateDecrypt(
      process.env.PVT_PEM,
      Buffer.from(exchangeAccount.credentials.api_key, 'base64')
    )

    let decrypted_secret = crypto.privateDecrypt(
      process.env.PVT_PEM,
      Buffer.from(exchangeAccount.credentials.secret, 'base64')
    )

    options.body[exchangeAccount.label] = {
      secret_key: decrypted_secret.toString(),
      api_key: decrypted_api.toString()
    }

    return rp(options)
  }
}
