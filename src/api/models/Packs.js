const mongoose = require("mongoose");
var Schema = mongoose.Schema;

var packSchema = new Schema({
  label: String,
  allocations: [{ coin: String, portion: Number }]
});

module.exports = mongoose.model("Pack", packSchema);
