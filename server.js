const express = require("express");
const app = express();
const boot = require("./boot");
const fs = require("fs");

require("./database").connect();
boot(app);

//const security = require('./api/security')
//app.use(security.jwt());

app.use(express.static("public"));

const apiRouterFiles = fs.readdirSync("./src/api/routes");
apiRouterFiles.forEach(rf => {
  app.use(`/api/${rf.replace(".js", "")}`, require(`./src/api/routes/${rf}`));
});

app.listen(app.get("port"), function() {
  console.log("Listening on " + app.get("port"));
});

module.exports = app;
