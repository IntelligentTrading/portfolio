const mongoose = require("mongoose");
var Schema = mongoose.Schema;

var exchangeSchema = new Schema({
  id: String, //Binance
  credentials: { api_key: String, secret: String },
  enabled: Boolean
});

var Exchange = mongoose.model("Exchange", exchangeSchema);
module.exports = Exchange;
