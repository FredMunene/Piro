'use client';

import { useWeb3 } from '@/lib/web3-context';
import { CONTRACTS, FEE_TIERS } from '@/lib/constants';
import { ExternalLink } from 'lucide-react';

function shortenAddress(addr: string) {
  return addr.slice(0, 6) + '...' + addr.slice(-4);
}

export function PolymarketCard() {
  const { polymarketProb } = useWeb3();
  const pct = polymarketProb !== null ? (polymarketProb * 100).toFixed(1) : null;
  const fillClass =
    polymarketProb === null
      ? 'bg-muted-foreground'
      : polymarketProb < 0.1
        ? 'bg-emerald-400'
        : polymarketProb < 0.25
          ? 'bg-amber-400'
          : 'bg-red-400';

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-lg">
      <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-4">
        Polymarket Signal
      </h2>
      <div className="space-y-3">
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Market</span>
          <a
            href="https://polymarket.com/event/what-price-will-ethereum-hit-in-february-2026"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline text-right"
          >
            Will ETH dip to $1,600?
          </a>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Probability</span>
          <div className="flex items-center gap-3 flex-1 ml-4">
            <span className="font-mono font-semibold text-foreground">
              {pct !== null ? `${pct}%` : '\u2014'}
            </span>
            <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${fillClass}`}
                style={{ width: pct !== null ? `${pct}%` : '0%' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function OnChainStateCard() {
  const { onChainState } = useWeb3();

  let confidenceText = '\u2014';
  let updatedAtText = '\u2014';
  let stalenessText = '\u2014';
  let stalenessClass = '';

  if (onChainState) {
    confidenceText = `${onChainState.confidence} bps (${(onChainState.confidence / 100).toFixed(2)}%)`;

    if (onChainState.updatedAt > 0) {
      updatedAtText = new Date(onChainState.updatedAt * 1000).toLocaleString();

      const age = Math.floor(Date.now() / 1000) - onChainState.updatedAt;
      const hrs = Math.floor(age / 3600);
      const mins = Math.floor((age % 3600) / 60);
      const secs = age % 60;
      const parts: string[] = [];
      if (hrs > 0) parts.push(hrs + 'h');
      if (mins > 0 || hrs > 0) parts.push(mins + 'm');
      parts.push(secs + 's');
      stalenessText = parts.join(' ') + ' ago';
      stalenessClass = onChainState.isStale ? 'text-red-400' : 'text-emerald-400';
    } else {
      updatedAtText = 'Never';
      stalenessText = 'N/A';
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-lg">
      <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-4">
        On-Chain State
      </h2>
      <div className="space-y-3">
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Confidence</span>
          <span className="font-mono text-foreground">{confidenceText}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Last Updated</span>
          <span className="font-mono text-foreground">{updatedAtText}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Staleness</span>
          <span className={`font-mono ${stalenessClass || 'text-foreground'}`}>
            {stalenessText}
          </span>
        </div>
      </div>
    </div>
  );
}

export function FeePolicyCard() {
  const { currentTier } = useWeb3();

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-lg">
      <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-4">
        Fee Policy
      </h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-2 text-muted-foreground font-medium">Tier</th>
            <th className="text-left py-2 text-muted-foreground font-medium">Fee</th>
            <th className="text-left py-2 text-muted-foreground font-medium">Threshold</th>
          </tr>
        </thead>
        <tbody>
          {FEE_TIERS.map((row, i) => (
            <tr
              key={row.tier}
              className={`border-b border-border/50 ${currentTier === i ? 'bg-secondary' : ''}`}
            >
              <td className="py-2 text-foreground">{row.tier}</td>
              <td className="py-2 font-mono text-foreground">{row.fee}</td>
              <td className="py-2 text-muted-foreground">{row.threshold}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ContractsCard() {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-lg">
      <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-4">
        Contracts (Arbitrum Sepolia)
      </h2>
      <div className="space-y-3">
        {CONTRACTS.map((c) => (
          <div key={c.label} className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">{c.label}</span>
            <a
              href={`https://sepolia.arbiscan.io/address/${c.address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 font-mono text-blue-400 hover:underline"
            >
              {shortenAddress(c.address)}
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
