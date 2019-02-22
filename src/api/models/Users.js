const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const Portfolio = require("./Portfolios");

var Schema = mongoose.Schema;

var userSchema = new Schema({
  email: { type: String, required: true, trim: true, unique: true },
  password: { type: String, required: true, trim: true },
  portfolio: Portfolio.schema,
  created_at: { type: Date, default: Date.now() },
  updated_at: Date,
  enabled: Boolean
});

var User = mongoose.model("User", userSchema);

module.exports = User;
