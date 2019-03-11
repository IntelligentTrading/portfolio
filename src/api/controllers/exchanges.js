const currencies = require('./currencies.json')

module.exports = {
  currencies: () => {
    return Promise.resolve(currencies) // this will be an API call, I'll prepare to use async code
  }
}