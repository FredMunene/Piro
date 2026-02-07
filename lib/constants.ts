export const RPC = "https://sepolia-rollup.arbitrum.io/rpc";
export const CHAIN_ID = 421614;
export const CHAIN_HEX = "0x" + CHAIN_ID.toString(16);

export const RISK_SIGNAL = "0x7EA6F46b1005B1356524148CDDE4567192301B6e";
export const ROUTER = "0xA2f89e0e429861602AC731FEa0855d7D8ba7C152";
export const PREDICTION_HOOK = "0x5CD3508356402e4b3D7E60E7DFeb75eBC8414080";
export const RECEIVER = "0x0CdbE45B99b6f2D1c2CEc65034DA60bA51ef4433";
export const USDC = "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d";
export const WETH = "0x980B62Da83eFf3D4576C647993b0c1D7faf17c73";
export const POLYMARKET_CONDITION =
  "0xa2e0e21aab2d6dbdae148134b816c461b6582d216fdc2a783a107b44018713ee";

export const USDC_DECIMALS = 6;
export const WETH_DECIMALS = 18;

export const MIN_SQRT_PRICE_PLUS_1 = "4295128740";
export const MAX_SQRT_PRICE_MINUS_1 =
  "1461446703485210103287273052203988822378723970341";

export const TIER_NAMES = ["Green", "Amber", "Red"] as const;
export const TIER_CLASSES = ["tier-green", "tier-amber", "tier-red"] as const;
export const FEE_LABELS = ["0.30%", "1.00%", "Blocked"] as const;

export const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)",
];

export const ROUTER_ABI = [
  "function swap(bool zeroForOne, int256 amountSpecified, uint160 sqrtPriceLimitX96, uint256 deadline) payable returns (bytes32)",
];

export const CONTRACTS = [
  { label: "RiskSignal", address: RISK_SIGNAL },
  { label: "PredictionHook", address: PREDICTION_HOOK },
  { label: "PredictionRouter", address: ROUTER },
  { label: "Receiver", address: RECEIVER },
] as const;

export const FEE_TIERS = [
  { tier: "Green", fee: "0.30%", threshold: "< 10%" },
  { tier: "Amber", fee: "1.00%", threshold: "10\u201324%" },
  { tier: "Red", fee: "Blocked", threshold: "\u2265 25%" },
] as const;
