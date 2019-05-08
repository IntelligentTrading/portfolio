const express = require("express");
let router = express.Router();
let exchangeController = require("../controllers/exchanges");
const resolver = require("../util/resolver");

router.get("/all", (req, res) => {
  resolver(exchangeController.currencies(), res);
});

module.exports = router;
