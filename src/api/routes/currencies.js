const express = require("express");
let router = express.Router();
let exchangeController = require("../controllers/exchanges");
const resolver = require("../util/resolver");
var cache = require("../../service/cache").redis;

router.get("/all", (req, res) => {
  resolver(exchangeController.currencies(), res);
});

router.get("/rate/BTC_USD", (req, res) => {
  resolver(cache.getAsync("btc_rate"), res);
});

module.exports = router;
