const mongoose = require('mongoose')
const Distribution = require('./Distributions')
var Schema = mongoose.Schema

var portfolioSchema = new Schema({
  id: String, // Binance
  packs: { type: [String], default: ['conservative'] },
  lastDistributionRequest: [Distribution.schema],
  lastRebalance: Date
})

var Porfolio = mongoose.model('Portfolio', portfolioSchema)
module.exports = Porfolio
