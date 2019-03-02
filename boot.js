var bodyParser = require("body-parser");
var cors = require("cors");

var isAuthorized = request => {
  return true;
  //var nsvc_api_key = request.header('NSVC-API-KEY');
  //return nsvc_api_key == process.env.NODE_SVC_API_KEY;
};

module.exports = app => {
  app.use(bodyParser.json({ limit: "50mb" }));
  app.use(cors());
  app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, nsvc-api-key"
    );
    res.header(
      "Access-Control-Allow-Methods",
      "POST, GET, OPTIONS, PUT, DELETE, HEAD"
    );

    if ("OPTIONS" == req.method) res.send(204);
    else next();
  });

  app.use("/api", function(req, res, next) {
    if (!isAuthorized(req)) res.sendStatus(401);
    else next();
  });

  app.set("view engine", "ejs");
  app.set("port", process.env.PORT || 5002);
  app.get("/", function(request, response) {
    response.sendStatus(200);
  });
};
