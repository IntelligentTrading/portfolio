const PackModel = require("../models/Packs");

module.exports = {
  list: () => {
    return PackModel.find();
  }
};
