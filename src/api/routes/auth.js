let router = require("express").Router();
const userCtrl = require("../controllers/users");
const resolver = require("../util/resolver");

router.post("/login", (req, res) => {
  resolver(userCtrl.authenticate(req), res);
});

router.post("/forgot", (req, res) => {
  resolver(userCtrl.forgot(req.body), res);
});

router.put("/reset/:token", (req, res) => {
  resolver(userCtrl.reset(req.params.token, req.body.newPassword), res);
});

module.exports = router;
