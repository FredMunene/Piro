'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { TokenInput } from '@/components/token-input';
import { ArrowDownUp, Loader2 } from 'lucide-react';
import { useWeb3 } from '@/lib/web3-context';
import { ethers } from 'ethers';
import {
  USDC,
  WETH,
  USDC_DECIMALS,
  WETH_DECIMALS,
  ERC20_ABI,
  RPC,
} from '@/lib/constants';

const readProvider = new ethers.JsonRpcProvider(RPC);

export function SwapCard() {
  const {
    userAddress,
    connectWallet,
    currentTier,
    feeLabel,
    usdcBalance,
    wethBalance,
    zeroForOne,
    toggleDirection,
    approveToken,
    executeSwap,
    checkAllowance,
    swapStatus,
    setSwapStatus,
  } = useWeb3();

  const [sellAmount, setSellAmount] = useState('');
  const [buyAmount, setBuyAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isApproved, setIsApproved] = useState(false);

  const sellToken = zeroForOne ? 'USDC' : 'WETH';
  const buyToken = zeroForOne ? 'WETH' : 'USDC';
  const sellBalance = zeroForOne
    ? parseFloat(usdcBalance).toFixed(2) + ' USDC'
    : parseFloat(wethBalance).toFixed(6) + ' WETH';
  const buyBalance = zeroForOne
    ? parseFloat(wethBalance).toFixed(6) + ' WETH'
    : parseFloat(usdcBalance).toFixed(2) + ' USDC';

  const hasAmount =
    sellAmount && !isNaN(parseFloat(sellAmount)) && parseFloat(sellAmount) > 0;

  // check allowance when amount changes
  useEffect(() => {
    if (!hasAmount || !userAddress) {
      setIsApproved(false);
      return;
    }
    let cancelled = false;
    checkAllowance(sellAmount).then((ok) => {
      if (!cancelled) setIsApproved(ok);
    });
    return () => {
      cancelled = true;
    };
  }, [sellAmount, userAddress, zeroForOne, checkAllowance, hasAmount]);

  const handleFillMax = useCallback(async () => {
    if (!userAddress) return;
    try {
      const token = zeroForOne ? USDC : WETH;
      const decimals = zeroForOne ? USDC_DECIMALS : WETH_DECIMALS;
      const contract = new ethers.Contract(token, ERC20_ABI, readProvider);
      const bal = await contract.balanceOf(userAddress);
      setSellAmount(ethers.formatUnits(bal, decimals));
    } catch {}
  }, [userAddress, zeroForOne]);

  const handleApprove = async () => {
    if (!hasAmount) return;
    setIsLoading(true);
    await approveToken(sellAmount);
    const ok = await checkAllowance(sellAmount);
    setIsApproved(ok);
    setIsLoading(false);
  };

  const handleSwap = async () => {
    if (!userAddress || !hasAmount) return;
    setIsLoading(true);
    const hash = await executeSwap(sellAmount);
    if (hash) {
      setSellAmount('');
      setBuyAmount('');
    }
    setIsLoading(false);
  };

  const handleToggle = () => {
    toggleDirection();
    setSellAmount('');
    setBuyAmount('');
    setIsApproved(false);
    setSwapStatus({ text: '', type: 'info' });
  };

  const isBlocked = currentTier === 2;

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-lg">
      <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-4">
        Swap
      </h2>

      <TokenInput
        label="Sell"
        token={sellToken}
        amount={sellAmount}
        balance={sellBalance}
        onAmountChange={setSellAmount}
        onMaxClick={userAddress ? handleFillMax : undefined}
      />

      <div className="flex justify-center py-2">
        <button
          onClick={handleToggle}
          className="rounded-lg bg-secondary p-2 text-muted-foreground transition-colors hover:bg-secondary/80 hover:text-accent"
        >
          <ArrowDownUp className="h-5 w-5" />
        </button>
      </div>

      <TokenInput
        label="Buy"
        token={buyToken}
        amount={buyAmount}
        balance={buyBalance}
        disabled
      />

      <div className="my-4 rounded-xl bg-secondary p-3 text-center text-sm text-muted-foreground">
        Current fee:{' '}
        <span className="font-semibold text-foreground">{feeLabel}</span>
      </div>

      <div className="space-y-2">
        {!isApproved && userAddress && hasAmount && (
          <Button
            onClick={handleApprove}
            disabled={isLoading}
            className="w-full bg-secondary text-foreground hover:bg-secondary/80"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Approving...
              </>
            ) : (
              `Approve ${sellToken}`
            )}
          </Button>
        )}

        <Button
          onClick={!userAddress ? connectWallet : handleSwap}
          disabled={
            isLoading ||
            isBlocked ||
            (userAddress ? !hasAmount || !isApproved : false)
          }
          className={`w-full font-semibold ${
            isBlocked
              ? 'bg-red-900/40 text-red-400 border border-red-700 cursor-not-allowed'
              : !userAddress
                ? 'bg-accent hover:bg-accent/90 text-accent-foreground'
                : 'bg-emerald-900/40 text-emerald-400 hover:bg-emerald-900/60'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Swapping...
            </>
          ) : isBlocked ? (
            'Swaps Blocked (Red)'
          ) : !userAddress ? (
            'Connect Wallet'
          ) : !hasAmount ? (
            'Enter Amount'
          ) : (
            'Swap'
          )}
        </Button>
      </div>

      {swapStatus.text && (
        <div
          className={`mt-3 text-center text-sm ${
            swapStatus.type === 'error'
              ? 'text-red-400'
              : swapStatus.type === 'success'
                ? 'text-emerald-400'
                : 'text-muted-foreground'
          }`}
        >
          {swapStatus.text}
          {swapStatus.txHash && (
            <>
              {' '}
              <a
                href={`https://sepolia.arbiscan.io/tx/${swapStatus.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
              >
                View tx
              </a>
            </>
          )}
        </div>
      )}
    </div>
  );
}
