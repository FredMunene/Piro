'use client';

import { AlertCircle, TrendingUp, AlertTriangle, HelpCircle } from 'lucide-react';
import { useWeb3 } from '@/lib/web3-context';

const tierConfig = {
  0: {
    name: 'Green',
    label: 'Low Risk',
    color: 'bg-emerald-500/10 border-emerald-500/20',
    textColor: 'text-emerald-400',
    badgeBg: 'bg-emerald-900/40 border-emerald-700',
    icon: TrendingUp,
    description: 'Swaps allowed — Normal fees (0.30%)',
  },
  1: {
    name: 'Amber',
    label: 'Medium Risk',
    color: 'bg-amber-500/10 border-amber-500/20',
    textColor: 'text-amber-400',
    badgeBg: 'bg-amber-900/40 border-amber-700',
    icon: AlertCircle,
    description: 'Swaps allowed — Elevated fees (1.00%)',
  },
  2: {
    name: 'Red',
    label: 'High Risk',
    color: 'bg-red-500/10 border-red-500/20',
    textColor: 'text-red-400',
    badgeBg: 'bg-red-900/40 border-red-700',
    icon: AlertTriangle,
    description: 'Swaps Blocked — Risk level too high',
  },
} as const;

export function RiskTierCard() {
  const { currentTier, onChainState } = useWeb3();

  if (currentTier === null) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 shadow-lg">
        <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-4">
          Current Risk Tier
        </h2>
        <div className="flex flex-col items-center py-6">
          <div className="rounded-lg border border-border bg-secondary px-6 py-3">
            <HelpCircle className="h-8 w-8 text-muted-foreground mx-auto" />
          </div>
          <p className="mt-3 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const config = tierConfig[currentTier];
  const Icon = config.icon;
  const staleText = onChainState?.isStale ? ' (escalated from stale signal)' : '';

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-lg">
      <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-4">
        Current Risk Tier
      </h2>
      <div className="flex flex-col items-center py-4">
        <div className={`rounded-lg border px-6 py-3 ${config.badgeBg}`}>
          <div className="flex items-center gap-2">
            <Icon className={`h-6 w-6 ${config.textColor}`} />
            <span className={`text-3xl font-bold ${config.textColor}`}>{config.name}</span>
          </div>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          Effective tier{staleText}
        </p>
      </div>
      <div className={`mt-2 flex items-center gap-3 rounded-lg border p-3 ${config.color}`}>
        <Icon className={`h-5 w-5 flex-shrink-0 ${config.textColor}`} />
        <div className="flex-1">
          <p className={`text-sm font-semibold ${config.textColor}`}>{config.label}</p>
          <p className="text-xs text-muted-foreground">{config.description}</p>
        </div>
      </div>
    </div>
  );
}
