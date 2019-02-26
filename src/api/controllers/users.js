const UserModel = require("../models/Users");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const mailer = require("../util/mailer");

module.exports = {
  create: info => {
    return UserModel.create(info).then(newUser => {
      return { statusCode: 201, object: newUser };
    });
  },
  getById: id => {
    if (mongoose.Types.ObjectId.isValid(id)) return UserModel.findById(id);
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
          token: token
        };
      });
    });
  },
  forgot: userData => {
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
  }
};
