const UserModel = require("../models/Users");

module.exports = {
  add: (id, exchange) => {
    let message = "";
    return UserModel.findById(id).then(user => {
      if (user) {
        if (!user.exchanges.some(x => x.label === exchange.label)) {
          // create PUB/PVT key to encrypt
          user.exchanges.push(exchange);
          message = "Exchange added.";
          user.save();
        }
      }
      return { statusCode: 200, object: message };
    });
  },
  edit: (id, exchange) => {
    let message = "";
    return UserModel.findById(id).then(user => {
      if (user) {
        let index = user.exchanges.findIndex(x => x.label === exchange.label);
        if (index < 0) message = "Exchange not found for this user.";
        else {
          user.exchanges[index] = exchange;
          message = "Exchange updated.";
          user.save();
        }
      }
      return { statusCode: 200, object: message };
    });
  },
  delete: (id, exchange) => {
    let message = "";
    return UserModel.findById(id).then(user => {
      if (user) {
        let index = user.exchanges.findIndex(x => x.label === exchange.label);
        if (index < 0) message = "Exchange not found for this user.";
        else {
          user.exchanges.splice(index, 1);
          message = "Exchange deleted.";
          user.save();
        }
      }
      return { statusCode: 200, object: message };
    });
  }
};
