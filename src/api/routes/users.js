let router = require("express").Router();
const userCtrl = require("../controllers/users");
const exchangeCtrl = require("../controllers/exchanges");
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

router.post("/", (req, res) => {
  resolver(userCtrl.create(req.body), res);
});

router.get("/:id?", (req, res) => {
  if (req.param.id) {
    resolver(userCtrl.getById(req.param.id), res);
  } else if (req.query.email) {
    resolver(userCtrl.getByEmail(req.query.email), res);
  } else resolver(userCtrl.all(), res);
});

module.exports = router;
