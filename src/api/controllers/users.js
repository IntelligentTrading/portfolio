const UserModel = require("../models/Users");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const mailer = require("../util/mailer");
const sec = require("../../lib/security/keymanager");
const allocationCtrl = require("../controllers/allocation");

const ctrl = (module.exports = {
  create: async info => {
    return UserModel.create(info).then(newUser => {
      return { statusCode: 201, object: newUser };
    });
  },
  getById: async id => {
    if (mongoose.Types.ObjectId.isValid(id))
      return UserModel.findById(id).then(user => {
        if (user) return user;
        return Promise.reject(new Error("User not found"));
      });
    return Promise.reject(new Error("Invalid object id"));
  },
  getByEmail: email => {
    return UserModel.findOne({ email: email });
  },
  all: () => {
    return UserModel.find();
  },
  authenticate: async fullRequest => {
    let credentials = fullRequest.body;

    if (!credentials.email || !credentials.password) {
      return Promise.resolve({
        statusCode: 401,
        object: "Email/Username and password required."
      });
    }

    return UserModel.findOne({ email: credentials.email }).then(userInfo => {
      if (!userInfo)
        return Promise.resolve({ statusCode: 401, object: "User not found." });

      return userInfo.comparePassword(credentials.password).then(match => {
        if (!match)
          return Promise.resolve({
            statusCode: 401,
            object: "Invalid credentials."
          });

        const token = jwt.sign(
          { id: userInfo._id },
          fullRequest.app.get("jwt-secret"),
          {
            expiresIn: "4h"
          }
        );

        return {
          user: userInfo.getShareableProperties(),
          pubKey: sec.publicKey().toString("base64"),
          token: token
        };
      });
    });
  },
  forgot: async userData => {
    if (!userData.email)
      return Promise.resolve({ statusCode: 400, object: "Email not provided" });

    return UserModel.findOne({ email: userData.email }).then(user => {
      if (!user)
        return Promise.resolve({ statusCode: 400, object: "User not found" });

      user.resetToken = crypto.randomBytes(48).toString("hex");
      user.save();
      return mailer.send(userData.email, user.resetToken);
    });
  },
  reset: (token, newPassword) => {
    if (!token) {
      return Promise.resolve({ statusCode: 400, object: "Token not provided" });
    }

    return UserModel.findOne({ resetToken: token }).then(user => {
      if (!user) Promise.resolve({ statusCode: 400, object: "User not found" });

      user.resetToken = null;
      user.password = newPassword;
      user.save();
    });
  },
  rebalance: async id => {
    return ctrl.getById(id).then(user => {
      if (user) {
        if (user.exchanges.length <= 0)
          return Promise.resolve({
            statusCode: 500,
            object: "No exchange has been set."
          });
        if (user.portfolio.packs.length <= 0)
          return Promise.resolve({
            statusCode: 500,
            object: "No package has been set."
          });
        return allocationCtrl.allocate(user.exchanges, user.portfolio.packs);
      }

      return Promise.resolve({ statusCode: 400, object: "User not found" });
    });
  }
});
