const express = require("express");
let router = express.Router();
let allocationCtrl = require("../controllers/allocation");
const resolver = require("../util/resolver");

router.get("/serviceStatus", (req, res) => {
  resolver(Promise.resolve("up"), res);
});

router.post("/", (req, res) => {
  resolver(allocationCtrl.allocate(req.body.packs), res);
});

router.post("/check", (req, res) => {
  resolver(allocationCtrl.checkAllocations(req.body), res);
});

module.exports = router;