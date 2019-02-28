const express = require("express");
let router = express.Router();
let packsController = require("../controllers/packs");
const resolver = require("../util/resolver");

router.get("/serviceStatus", (req, res) => {
  resolver(Promise.resolve("up"), res);
});

router.get("/", (req, res) => {
  resolver(packsController.list(), res);
});

module.exports = router;
