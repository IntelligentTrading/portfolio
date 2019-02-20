const allocationEngine = require("./allocation");
const normalizer = require("./normalization");

const AMOUNT = 5;

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

let coins = normalizer.normalize(PACKS);

const exchanges = [
  { name: "EX1", supported: ["BTC", "ETH"], weight: 0.1 },
  { name: "EX2", supported: ["BTC", "ETH", "OMG", "ADA", "XRP"], weight: 0.9 }
];

let desired_allocations = allocationEngine.allocate(exchanges, coins);
let reallocated_amount = allocationEngine.checkCorrectness(
  desired_allocations,
  exchanges,
  AMOUNT
);

console.log("Portfolio amount:" + AMOUNT);
console.log("Exchanges:");
console.log(JSON.stringify(exchanges));
console.log();
console.log(JSON.stringify(desired_allocations));
console.log();
console.log("Target allocation:");
console.log(JSON.stringify(coins));
console.log();

console.log(JSON.stringify(reallocated_amount));

// 1. get the packs
// 2. normalize the allocations
// 3. add BTC 0.01 minimum
// 4. call allocationEngine
// 5. verify
