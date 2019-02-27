const userCtrl = require("./users");

module.exports = {
  add: (id, pack) => {
    let message = "";
    return userCtrl.getById(id).then(user => {
      if (user) {
        if (!user.portfolio.packs.some(x => x.label === pack.label)) {
          user.portfolio.packs.push(pack);
          message = "Packaged added.";
          user.save();
          return { statusCode: 200, object: message };
        } else {
          return {
            statusCode: 418,
            object: "Package already present in user's portfolio"
          };
        }
      }
      return { statusCode: 418, object: "User not found" };
    });
  },
  delete: (id, pack) => {
    return userCtrl.getById(id).then(user => {
      if (user) {
        let index = user.portfolio.packs.findIndex(x => x.label === pack.label);
        if (index < 0)
          return {
            statusCode: 418,
            object: "Pack not found for this user."
          };
        else {
          user.portfolio.packs.splice(index, 1);
          user.save();
          return { statusCode: 200, object: "Pack deleted." };
        }
      }
      return { statusCode: 418, object: "User not found" };
    });
  }
};
