const UserModel = require("../models/Users");
const mongoose = require("mongoose");

module.exports = {
  create: info => {
    return UserModel.create(info).then(newUser => {
      //eventBus.emit('userCreated', newUser)
      return { statusCode: 201, object: newUser };
    });
  },
  getById: id => {
    if (mongoose.Types.ObjectId.isValid(id)) return UserModel.findById(id);
    return Promise.reject(new Error("Invalid object id"));
  },
  getByEmail: email => {
    return UserModel.findOne({ email: email });
  }
};
