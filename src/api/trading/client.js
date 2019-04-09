const rp = require('request-promise')
const crypto = require('crypto')
const portfolio_url = process.env.ITF_TRADING_API + '/portfolio/'
const portfolio_progress_url =
  process.env.ITF_TRADING_API + '/portfolio_process/'

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

    let exchangeReference = exchangeAccount.tradingCode ? exchangeAccount.tradingCode : exchangeAccount.label
    options.body[exchangeReference] = {
      secret_key: decrypted_secret.toString(),
      api_key: decrypted_api.toString()
    }

    return rp(options)
  },
  set: distribution => {
    var options = {
      method: 'PUT',
      uri: portfolio_url,
      body: {
        api_key: process.env.ITF_TRADING_API_KEY
      },
      json: true // Automatically stringifies the body to JSON
    }

    distribution.forEach(part => {
      let decrypted_api = crypto
        .privateDecrypt(
          process.env.PVT_PEM,
          Buffer.from(part.credentials.api_key, 'base64')
        )
        .toString()

      let decrypted_secret = crypto
        .privateDecrypt(
          process.env.PVT_PEM,
          Buffer.from(part.credentials.secret, 'base64')
        )
        .toString()

      options.body[part.exchange] = {
        api_key: decrypted_api,
        secret_key: decrypted_secret,
        type: 'market',
        allocations: part.allocations
      }
    })

    return rp(options)
  },
  progress: allocation_id => {
    var options = {
      method: 'POST',
      uri: portfolio_progress_url + allocation_id,
      body: {
        api_key: process.env.ITF_TRADING_API_KEY
      },
      json: true // Automatically stringifies the body to JSON
    }
    return rp(options)
  }
}
