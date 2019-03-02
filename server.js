const express = require("express");
const router = express.Router();
const app = express();
const boot = require("./boot");
const fs = require("fs");
var jwt = require("jsonwebtoken");

require("./database").connect();
boot(app);

app.use(express.static("public"));

const apiRouterFiles = fs.readdirSync("./src/api/routes");
apiRouterFiles.forEach(rf => {
  const route = `/api/${rf.replace(".js", "")}`;
  app.use(route, validateToken, require(`./src/api/routes/${rf}`));
});

app.listen(app.get("port"), function() {
  console.log("Listening on " + app.get("port"));
});

module.exports = app;

var getBearerToken = function(header, callback) {
  if (header && header.startsWith("Bearer ")) {
    // Remove Bearer from string
    header = header.slice(7, header.length);
    if (header.length > 0) return callback(null, token[1]);
    else {
      return callback("Malformed bearer token", null);
    }
  } else {
    return callback("Missing authorization header", null);
  }
};

function validateToken(request, response, next) {
  if (!request.baseUrl.startsWith("/api/auth")) {
    let token = request.headers["authorization"];
    if (token && token.startsWith("Bearer ")) {
      // Remove Bearer from string
      token = token.slice(7, token.length);
      if (token.length <= 0) {
        response
          .status(401)
          .send({ success: false, message: "Malformed bearer token" });
      } else {
        jwt.verify(token, app.get("jwt-secret"), function(error, decoded) {
          if (error) {
            response
              .status(401)
              .send({ success: false, error: "Invalid authorization token" });
          }
        });
      }
    } else {
      response
        .status(401)
        .send({ success: false, message: "Missing authorization header" });
    }
  }
  next();
}
