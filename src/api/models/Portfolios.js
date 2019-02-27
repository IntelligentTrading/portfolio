const mongoose = require("mongoose");
const Distribution = require("./Distributions");
var Schema = mongoose.Schema;

var packSchema = new Schema({
  label: String,
  weight: Number,
  allocations: [{ coin: String, portion: Number }]
});
var Pack = mongoose.model("Pack", packSchema);

var portfolioSchema = new Schema({
  id: String, //Binance
  packs: { type: [Pack.schema], default: [] },
  lastRealizedDistribution: Distribution.schema,
  lastRebalance: Date
});

var Porfolio = mongoose.model("Portfolio", portfolioSchema);
module.exports = Porfolio;
