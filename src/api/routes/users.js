let router = require("express").Router();
let usersController = require("../controllers/users");
const resolver = require("../util/resolver");

router.get("/serviceStatus", (req, res) => {
  resolver(Promise.resolve("up"), res);
});

router.post("/", (req, res) => {
  resolver(usersController.create(req.body), res);
});

router.get("/", (req, res) => {
  if (req.query.id) {
    resolver(usersController.getById(req.query.id), res);
  } else if (req.query.email) {
    resolver(usersController.getByEmail(req.query.email), res);
  }
});

module.exports = router;
