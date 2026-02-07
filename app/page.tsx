'use client';

import { SwapHeader } from '@/components/swap-header';
import { SwapCard } from '@/components/swap-card';
import { RiskTierCard } from '@/components/risk-tier';
import {
  PolymarketCard,
  OnChainStateCard,
  FeePolicyCard,
  ContractsCard,
} from '@/components/dashboard-cards';
import { Web3Provider, useWeb3 } from '@/lib/web3-context';
import { RefreshCw } from 'lucide-react';

function RefreshButton() {
  const { refresh } = useWeb3();
  return (
    <button
      onClick={refresh}
      className="flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-sm text-muted-foreground hover:bg-secondary/80 hover:text-foreground transition-colors"
    >
      <RefreshCw className="h-4 w-4" />
      Refresh
    </button>
  );
}

function AppContent() {
  return (
    <div className="min-h-screen bg-background">
      <SwapHeader />

      <main className="flex flex-col items-center px-4 py-8 gap-4">
        <div className="w-full max-w-md space-y-4">
          <RiskTierCard />
          <SwapCard />
          <PolymarketCard />
          <OnChainStateCard />
          <FeePolicyCard />
          <ContractsCard />

          <div className="flex justify-center">
            <RefreshButton />
          </div>

          <footer className="text-center text-xs text-muted-foreground pt-4 pb-8 space-y-1">
            <p>Prediction-Informed Router &mdash; Chainlink CRE + Uniswap v4 + Polymarket</p>
            <p>Arbitrum Sepolia</p>
          </footer>
        </div>
      </main>
    </div>
  );
}

export default function Page() {
  return (
    <Web3Provider>
      <AppContent />
    </Web3Provider>
  );
}
