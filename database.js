var mongoose = require("mongoose");

let database_name = "portfolio";
let db_uri = `mongodb://127.0.0.1:27017/${database_name}`; //process.env.MONGODB_URI

module.exports.connect = () => {
  var options = {
    keepAlive: 300,
    useCreateIndex: true,
    useNewUrlParser: true,
    reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
    reconnectInterval: 500 // Reconnect every 500ms
  };

  mongoose.connect(db_uri, options);
  mongoose.Promise = global.Promise;

  var db = mongoose.connection;
  db.once("open", function() {
    console.log("Database connected");
  });
};
