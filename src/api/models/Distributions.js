const mongoose = require("mongoose");
var Schema = mongoose.Schema;

var distributionSchema = new Schema({
  allocations: [{ coin: String, portion: Number }],
  created_at: { type: Date, default: Date.now() },
  realized_at: Date,
  bitcoinAmount: Number,
  bitcoinPrice: Number,
  isRealized: Boolean,
  portfolioId: String
});

var Distribution = mongoose.model("Distribution", distributionSchema);
module.exports = Distribution;
