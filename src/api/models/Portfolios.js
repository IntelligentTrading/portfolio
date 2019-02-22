const mongoose = require("mongoose");
const Exchange = require("./Exchanges");
const Distribution = require("./Distributions");
var Schema = mongoose.Schema;

var portfolioSchema = new Schema({
  id: String, //Binance
  packs: { type: [String], default: [] },
  exchanges: { type: [Exchange.schema], default: [] },
  lastRealizedDistribution: Distribution.schema,
  lastRebalance: Date
});

var Porfolio = mongoose.model("Portfolio", portfolioSchema);
module.exports = Porfolio;
