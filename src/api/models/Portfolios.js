const mongoose = require("mongoose");
const Distribution = require("./Distributions");
var Schema = mongoose.Schema;

var portfolioSchema = new Schema({
  id: String, // Binance
  packs: { type: [String], default: ["conservative"] },
  custom: { type: [{ coin: String, portion: Number }] },
  lastDistributionRequest: [Distribution.schema],
  lastRebalance: Date,
  autorebalance: { type: Boolean, default: false },
});

var Porfolio = mongoose.model("Portfolio", portfolioSchema);
module.exports = Porfolio;
