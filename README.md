# Piro

Piro is a prediction-informed router built on Uniswap v4. It uses live risk signals to adjust fees and block swaps when risk is too high.

## What It Does
- Reads the on-chain RiskSignal tier and staleness state.
- Fetches Polymarket probabilities for the configured condition.
- Maps the effective tier to fee policy (Green 0.30%, Amber 1.00%, Red blocked).
- Executes swaps through the Uniswap v4 router when allowed.
- Polls for updates every 30 seconds and supports manual refresh.

## Tech Stack
- Next.js (App Router)
- Tailwind CSS
- Ethers.js
- Arbitrum Sepolia
- Polymarket CLOB API

## Contracts (Arbitrum Sepolia)
| Contract | Address |
| --- | --- |
| RiskSignal | `0x7EA6F46b1005B1356524148CDDE4567192301B6e` |
| PredictionHook | `0x5CD3508356402e4b3D7E60E7DFeb75eBC8414080` |
| PredictionRouter (Uniswap v4 Router) | `0xA2f89e0e429861602AC731FEa0855d7D8ba7C152` |
| Receiver | `0x0CdbE45B99b6f2D1c2CEc65034DA60bA51ef4433` |
| USDC | `0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d` |
| WETH | `0x980B62Da83eFf3D4576C647993b0c1D7faf17c73` |

## Getting Started
1. Use Node 22+ (see `.nvmrc`).
2. Install dependencies.

```bash
npm install
```

3. Start the dev server.

```bash
npm run dev
```

## Build

```bash
npm run build
npm run start
```

## Project Structure
- `app/` Next.js routes and layout
- `components/` UI and feature components
- `lib/` Web3 context, constants, utilities
- `public/` logo and assets

