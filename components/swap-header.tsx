'use client';

import { Button } from '@/components/ui/button';
import { Zap } from 'lucide-react';
import { useWeb3 } from '@/lib/web3-context';

export function SwapHeader() {
  const { userAddress, wrongNetwork, connectWallet } = useWeb3();

  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
              <Zap className="h-6 w-6 text-accent-foreground" />
            </div>
            <div>
              <span className="text-xl font-bold text-foreground">Prediction-Informed Router</span>
              <p className="text-xs text-muted-foreground">Uniswap v4 hook with live prediction market risk signals</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden rounded-lg bg-secondary px-3 py-2 text-sm font-medium text-muted-foreground sm:block">
              <span className="inline-block h-2 w-2 rounded-full bg-accent mr-2"></span>
              Arbitrum Sepolia
            </div>

            {userAddress ? (
              <button className="rounded-lg bg-secondary px-4 py-2 text-sm font-medium font-mono text-emerald-400 border border-emerald-800 transition-colors hover:bg-secondary/80">
                {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
              </button>
            ) : (
              <Button
                onClick={connectWallet}
                className="bg-accent hover:bg-accent/90 text-accent-foreground font-medium"
              >
                Connect Wallet
              </Button>
            )}
          </div>
        </div>

        {wrongNetwork && (
          <div className="mt-3 rounded-lg bg-amber-500/10 border border-amber-500/20 px-4 py-2 text-sm text-amber-400 text-center">
            Wrong network — please switch to Arbitrum Sepolia
          </div>
        )}
      </div>
    </header>
  );
}
