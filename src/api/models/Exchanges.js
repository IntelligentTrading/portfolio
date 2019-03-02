const mongoose = require("mongoose");
var Schema = mongoose.Schema;

var exchangeSchema = new Schema({
  label: { type: String}, //Binance
  credentials: { api_key: String, secret: String, preview: String },
  enabled: { type: Boolean, default: true }
});

var Exchange = mongoose.model("Exchange", exchangeSchema);
module.exports = Exchange;
