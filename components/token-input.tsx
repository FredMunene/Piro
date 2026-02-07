'use client';

interface TokenInputProps {
  label: string;
  token: string;
  amount: string;
  balance: string;
  onAmountChange?: (amount: string) => void;
  onMaxClick?: () => void;
  disabled?: boolean;
}

export function TokenInput({
  label,
  token,
  amount,
  balance,
  onAmountChange,
  onMaxClick,
  disabled = false,
}: TokenInputProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium uppercase text-muted-foreground">
          {label}
        </label>
        <span
          className={`text-xs text-muted-foreground ${onMaxClick ? 'cursor-pointer hover:text-accent' : ''}`}
          onClick={onMaxClick}
        >
          Balance: {balance}
        </span>
      </div>

      <div className="rounded-xl border border-border bg-secondary p-4 transition-all hover:border-border/80 focus-within:border-accent focus-within:ring-1 focus-within:ring-accent/30">
        <div className="flex items-center gap-3">
          <input
            type="text"
            inputMode="decimal"
            placeholder="0.0"
            value={amount}
            onChange={(e) => onAmountChange?.(e.target.value)}
            disabled={disabled}
            className="flex-1 bg-transparent text-2xl font-semibold text-foreground placeholder-muted-foreground outline-none font-mono disabled:opacity-50"
          />
          <span className="rounded-lg bg-card px-3 py-2 font-semibold text-foreground text-sm min-w-[72px] text-center">
            {token}
          </span>
        </div>
      </div>
    </div>
  );
}
