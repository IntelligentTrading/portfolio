const mongoose = require("mongoose");
var Schema = mongoose.Schema;

var exchangeSchema = new Schema({
  label: String, //Binance
  credentials: { api_key: String, secret: String },
  enabled: { type: Boolean, default: true }
});

var Exchange = mongoose.model("Exchange", exchangeSchema);
module.exports = Exchange;
