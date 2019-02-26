var mongoose = require("mongoose");
let db_uri = process.env.MONGODB_URI;

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
