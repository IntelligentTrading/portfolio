var rpromise = require("request-promise");
var node_svc_api = "https://itf-node-services-prod.herokuapp.com/api";
var node_svc_api_key = process.env.NODE_SVC_API_KEY;
var cache = require("../service/cache").redis;

function Options() {
  return {
    headers: {
      "NSVC-API-KEY": node_svc_api_key,
    },
  };
}

function getUSDRateFor(symbol) {
  var request_opts = new Options();
  request_opts.url = `${node_svc_api}/tickers/transaction_currencies/${symbol}`;
  return rpromise(request_opts)
    .then(rate => {
      if (rate) {
        let symbolRate = JSON.parse(rate)[0].priceUsd;
        cache.set("btc_rate", symbolRate);
      }
    })
    .catch(err => console.log("1:" + err));
}

getUSDRateFor("BTC").then(() => {
  setTimeout(() => process.exit(), 10000);
});
