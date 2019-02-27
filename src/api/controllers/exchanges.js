const userCtrl = require("./users");

module.exports = {
  add: (id, exchange) => {
    let message = "";
    return userCtrl.getById(id).then(user => {
      if (user) {
        if (!user.exchanges.some(x => x.label === exchange.label)) {
          user.exchanges.push(exchange);
          message = "Exchange added.";
          user.save();
          return { statusCode: 200, object: message };
        } else {
          return {
            statusCode: 418,
            object: "Exchange already present in user's list"
          };
        }
      }
      return { statusCode: 418, object: "User not found" };
    });
  },
  edit: (id, exchange) => {
    let message = "";
    return userCtrl.getById(id).then(user => {
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
    return userCtrl.getById(id).then(user => {
      if (user) {
        let index = user.exchanges.findIndex(x => x.label === exchange.label);
        if (index < 0)
          return {
            statusCode: 418,
            object: "Exchange not found for this user."
          };
        else {
          user.exchanges.splice(index, 1);
          user.save();
          return { statusCode: 200, object: "Exchange deleted." };
        }
      }
      return { statusCode: 418, object: "User not found" };
    });
  }
};
