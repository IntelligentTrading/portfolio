const allocationEngine = require("../../lib/allocation/allocation");
const normalizer = require("../../lib/allocation/normalization");

// retreived from settings or config or db
const exchanges = [
  { name: "EX1", supported: ["BTC", "ETH"], weight: 0.1 },
  { name: "EX2", supported: ["BTC", "ETH", "OMG", "ADA", "XRP"], weight: 0.9 }
];

module.exports = {
  allocate: packs => {
    let coins = normalizer.normalize(packs);
    console.log(coins);
    let desired_allocations = allocationEngine.allocate(exchanges, coins);
    return Promise.resolve(desired_allocations);
  }
};

/* Request body
const PACKS = [
  {
    name: "risky",
    weight: 0.4,
    allocations: [
      { coin: "XRP", portion: 0.2 },
      { coin: "OMG", portion: 0.5 },
      { coin: "ADA", portion: 0.3 }
    ]
  },
  {
    name: "conservative",
    weight: 0.6,
    allocations: [{ coin: "ETH", portion: 0.7 }, { coin: "XVG", portion: 0.3 }]
  }
];
*/
