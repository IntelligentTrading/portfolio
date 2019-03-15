const mongoose = require('mongoose')
var Schema = mongoose.Schema

var distributionSchema = new Schema(
  {
    allocations: [{ coin: String, portion: Number }],
    exchange: String,
    realized_at: Date,
    status: String,
    portfolioId: String,
    pid: String
  },
  { timestamps: true }
)

var Distribution = mongoose.model('Distribution', distributionSchema)
module.exports = Distribution
