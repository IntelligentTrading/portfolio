let router = require("express").Router();
const userCtrl = require("../controllers/users");
const resolver = require("../util/resolver");

router.get("/serviceStatus", (req, res) => {
  resolver(Promise.resolve("up"), res);
});

router.post("/:id/exchanges", (req, res) => {
  resolver(userCtrl.exchanges.add(req.params.id, req.body), res);
});
router.put("/:id/exchanges", (req, res) => {
  resolver(userCtrl.exchanges.edit(req.params.id, req.body), res);
});
router.delete("/:id/exchanges", (req, res) => {
  resolver(userCtrl.exchanges.delete(req.params.id, req.body), res);
});

router.post("/:id/packs", (req, res) => {
  resolver(userCtrl.packs.add(req.params.id, req.body.label), res);
});

router.delete("/:id/packs", (req, res) => {
  resolver(userCtrl.packs.delete(req.params.id, req.body), res);
});

router.put("/:id/rebalance", (req, res) => {
  resolver(userCtrl.rebalance(req.params.id), res);
});

router.get("/:id?", (req, res) => {
  if (req.params.id) {
    resolver(userCtrl.getById(req.params.id), res);
  } else if (req.query.email) {
    resolver(userCtrl.getByEmail(req.query.email), res);
  } else resolver(userCtrl.all(), res);
});

module.exports = router;
