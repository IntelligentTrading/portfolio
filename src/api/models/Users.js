const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const Portfolio = require("./Portfolios");
const Exchange = require("./Exchanges");

var Schema = mongoose.Schema;

var userSchema = new Schema(
  {
    email: { type: String, required: true, trim: true, unique: true },
    password: { type: String, required: true, trim: true },
    portfolio: { type: Portfolio.schema, default: new Portfolio() },
    exchanges: { type: [Exchange.schema], default: [] },
    enabled: { type: Boolean, default: true },
    resetToken: String
  },
  { timestamps: true }
);

userSchema.pre("save", function(next) {
  var user = this;

  // only hash the password if it has been modified (or is new)
  if (!user.isModified("password")) return next();

  // generate a salt
  bcrypt.genSalt(saltRounds, function(err, salt) {
    if (err) return next(err);

    // hash the password using our new salt
    bcrypt.hash(user.password, salt, function(err, hash) {
      if (err) return next(err);

      // override the cleartext password with the hashed one
      user.password = hash;
      next();
    });
  });
});

userSchema.methods.comparePassword = function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.getShareableProperties = function() {
  const {_id, email, portfolio, exchanges, enabled, createdAt, updatedAt } = this;
  return { _id, email, portfolio, exchanges, enabled, createdAt, updatedAt };
};

module.exports = mongoose.model("User", userSchema);
