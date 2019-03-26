const mongoose = require('mongoose')
var Schema = mongoose.Schema

var exchangeSchema = new Schema({
  label: { type: String }, // Binance
  credentials: {
    api_key: String,
    secret: String,
    preview: String,
    valid: { type: Boolean, default: true }
  },
  enabled: { type: Boolean, default: true }
})

var Exchange = mongoose.model('Exchange', exchangeSchema)
exchangeSchema.methods.getShareableProperties = function () {
  const { _id, label, credentials, enabled } = this
  return {
    _id,
    label,
    credentials: { preview: credentials.preview, valid: credentials.valid },
    enabled
  }
}

module.exports = Exchange
