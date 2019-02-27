let router = require("express").Router();
const userCtrl = require("../controllers/users");
const exchangeCtrl = require("../controllers/exchanges");
const packsCtrl = require("../controllers/packs");
const resolver = require("../util/resolver");

router.get("/serviceStatus", (req, res) => {
  resolver(Promise.resolve("up"), res);
});

router.post("/:id/exchanges", (req, res) => {
  resolver(exchangeCtrl.add(req.params.id, req.body), res);
});
router.put("/:id/exchanges", (req, res) => {
  resolver(exchangeCtrl.edit(req.params.id, req.body), res);
});
router.delete("/:id/exchanges", (req, res) => {
  resolver(exchangeCtrl.delete(req.params.id, req.body), res);
});

router.post("/:id/packs", (req, res) => {
  resolver(packsCtrl.add(req.params.id, req.body), res);
});

router.delete("/:id/packs", (req, res) => {
  resolver(packsCtrl.delete(req.params.id, req.body), res);
});

router.put("/:id/rebalance", (req, res) => {
  resolver(userCtrl.rebalance(req.params.id), res);
});

router.post("/", (req, res) => {
  resolver(userCtrl.create(req.body), res);
});

router.get("/:id?", (req, res) => {
  if (req.params.id) {
    resolver(userCtrl.getById(req.params.id), res);
  } else if (req.query.email) {
    resolver(userCtrl.getByEmail(req.query.email), res);
  } else resolver(userCtrl.all(), res);
});

module.exports = router;
