'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { ethers } from 'ethers';
import {
  RPC,
  CHAIN_ID,
  CHAIN_HEX,
  RISK_SIGNAL,
  ROUTER,
  USDC,
  WETH,
  USDC_DECIMALS,
  WETH_DECIMALS,
  POLYMARKET_CONDITION,
  ERC20_ABI,
  ROUTER_ABI,
  MIN_SQRT_PRICE_PLUS_1,
  MAX_SQRT_PRICE_MINUS_1,
  FEE_LABELS,
} from './constants';

export type TierIndex = 0 | 1 | 2;

interface OnChainState {
  rawTier: number;
  effectiveTier: TierIndex;
  updatedAt: number;
  confidence: number;
  isStale: boolean;
}

interface Web3State {
  // wallet
  provider: ethers.BrowserProvider | null;
  signer: ethers.Signer | null;
  userAddress: string | null;
  wrongNetwork: boolean;
  connectWallet: () => Promise<void>;

  // on-chain
  onChainState: OnChainState | null;
  polymarketProb: number | null;
  currentTier: TierIndex | null;
  feeLabel: string;

  // balances
  usdcBalance: string;
  wethBalance: string;

  // swap direction
  zeroForOne: boolean;
  toggleDirection: () => void;

  // approve + swap
  approveToken: (amount: string) => Promise<void>;
  executeSwap: (amount: string) => Promise<string>;
  checkAllowance: (amount: string) => Promise<boolean>;

  // status
  swapStatus: { text: string; type: 'info' | 'error' | 'success'; txHash?: string };
  setSwapStatus: (s: { text: string; type: 'info' | 'error' | 'success'; txHash?: string }) => void;

  // refresh
  refresh: () => Promise<void>;
}

const Web3Context = createContext<Web3State | null>(null);

export function useWeb3() {
  const ctx = useContext(Web3Context);
  if (!ctx) throw new Error('useWeb3 must be used within Web3Provider');
  return ctx;
}

const readProvider = new ethers.JsonRpcProvider(RPC);

async function rpcCall(to: string, data: string): Promise<string | null> {
  try {
    const res = await fetch(RPC, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_call',
        params: [{ to, data }, 'latest'],
      }),
    });
    const json = await res.json();
    return json.result ?? null;
  } catch {
    return null;
  }
}

async function fetchOnChainState(): Promise<OnChainState | null> {
  const [tierData, effectiveData] = await Promise.all([
    rpcCall(RISK_SIGNAL, '0x5ad701c2'), // getTier()
    rpcCall(RISK_SIGNAL, '0x162e5515'), // getEffectiveTier()
  ]);

  if (!tierData || !effectiveData) return null;

  const hex = tierData.slice(2);
  const rawTier = parseInt(hex.slice(0, 64), 16);
  const updatedAt = parseInt(hex.slice(64, 128), 16);
  const confidence = parseInt(hex.slice(128, 192), 16);

  const effHex = effectiveData.slice(2);
  const effectiveTier = parseInt(effHex.slice(0, 64), 16) as TierIndex;
  const isStale = parseInt(effHex.slice(64, 128), 16) === 1;

  return { rawTier, effectiveTier, updatedAt, confidence, isStale };
}

async function fetchPolymarket(): Promise<number | null> {
  try {
    const res = await fetch(
      'https://clob.polymarket.com/markets/' + POLYMARKET_CONDITION
    );
    const data = await res.json();
    const yesToken = data.tokens?.find(
      (t: { outcome: string }) => t.outcome === 'Yes'
    );
    return yesToken?.price ?? null;
  } catch {
    return null;
  }
}

export function Web3Provider({ children }: { children: ReactNode }) {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [wrongNetwork, setWrongNetwork] = useState(false);
  const [onChainState, setOnChainState] = useState<OnChainState | null>(null);
  const [polymarketProb, setPolymarketProb] = useState<number | null>(null);
  const [usdcBalance, setUsdcBalance] = useState('0');
  const [wethBalance, setWethBalance] = useState('0');
  const [zeroForOne, setZeroForOne] = useState(true);
  const [swapStatus, setSwapStatus] = useState<{
    text: string;
    type: 'info' | 'error' | 'success';
    txHash?: string;
  }>({ text: '', type: 'info' });

  const currentTier = onChainState?.effectiveTier ?? null;
  const feeLabel = currentTier !== null ? FEE_LABELS[currentTier] : '\u2014';

  const updateBalances = useCallback(
    async (addr: string) => {
      try {
        const usdc = new ethers.Contract(USDC, ERC20_ABI, readProvider);
        const weth = new ethers.Contract(WETH, ERC20_ABI, readProvider);
        const [uBal, wBal] = await Promise.all([
          usdc.balanceOf(addr),
          weth.balanceOf(addr),
        ]);
        setUsdcBalance(ethers.formatUnits(uBal, USDC_DECIMALS));
        setWethBalance(ethers.formatUnits(wBal, WETH_DECIMALS));
      } catch (e) {
        console.error('Balance fetch failed:', e);
      }
    },
    []
  );

  const refresh = useCallback(async () => {
    const [state, prob] = await Promise.all([
      fetchOnChainState(),
      fetchPolymarket(),
    ]);
    if (state) setOnChainState(state);
    if (prob !== null) setPolymarketProb(prob);
    if (userAddress) await updateBalances(userAddress);
  }, [userAddress, updateBalances]);

  const checkNetwork = useCallback(async (prov: ethers.BrowserProvider) => {
    const network = await prov.getNetwork();
    if (Number(network.chainId) !== CHAIN_ID) {
      setWrongNetwork(true);
      try {
        await (window as unknown as { ethereum: { request: (args: { method: string; params: unknown[] }) => Promise<void> } }).ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: CHAIN_HEX }],
        });
        setWrongNetwork(false);
      } catch (switchErr: unknown) {
        if ((switchErr as { code: number }).code === 4902) {
          await (window as unknown as { ethereum: { request: (args: { method: string; params: unknown[] }) => Promise<void> } }).ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: CHAIN_HEX,
                chainName: 'Arbitrum Sepolia',
                nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
                rpcUrls: [RPC],
                blockExplorerUrls: ['https://sepolia.arbiscan.io'],
              },
            ],
          });
          setWrongNetwork(false);
        }
      }
    } else {
      setWrongNetwork(false);
    }
  }, []);

  const connectWallet = useCallback(async () => {
    const eth = (window as unknown as { ethereum?: { request: (args: { method: string; params: unknown[] }) => Promise<string[]>; on: (event: string, handler: () => void) => void } }).ethereum;
    if (!eth) {
      setSwapStatus({ text: 'Install MetaMask to swap', type: 'error' });
      return;
    }
    try {
      const prov = new ethers.BrowserProvider(eth as unknown as ethers.Eip1193Provider);
      await prov.send('eth_requestAccounts', []);
      const s = await prov.getSigner();
      const addr = await s.getAddress();

      setProvider(prov);
      setSigner(s);
      setUserAddress(addr);

      await checkNetwork(prov);
      await updateBalances(addr);
    } catch {
      setSwapStatus({ text: 'Wallet connection failed', type: 'error' });
    }
  }, [checkNetwork, updateBalances]);

  const toggleDirection = useCallback(() => {
    setZeroForOne((prev) => !prev);
  }, []);

  const checkAllowance = useCallback(
    async (amount: string): Promise<boolean> => {
      if (!userAddress) return false;
      const sellToken = zeroForOne ? USDC : WETH;
      const sellDecimals = zeroForOne ? USDC_DECIMALS : WETH_DECIMALS;
      try {
        const token = new ethers.Contract(sellToken, ERC20_ABI, readProvider);
        const allowance = await token.allowance(userAddress, ROUTER);
        const needed = ethers.parseUnits(amount, sellDecimals);
        return allowance >= needed;
      } catch {
        return false;
      }
    },
    [userAddress, zeroForOne]
  );

  const approveToken = useCallback(
    async (amount: string) => {
      if (!signer) return;
      const sellToken = zeroForOne ? USDC : WETH;
      const sellDecimals = zeroForOne ? USDC_DECIMALS : WETH_DECIMALS;
      try {
        setSwapStatus({ text: 'Approving...', type: 'info' });
        const token = new ethers.Contract(sellToken, ERC20_ABI, signer);
        const parsed = ethers.parseUnits(amount, sellDecimals);
        const tx = await token.approve(ROUTER, parsed);
        setSwapStatus({ text: 'Waiting for confirmation...', type: 'info' });
        await tx.wait();
        setSwapStatus({ text: 'Approved!', type: 'success' });
      } catch (e: unknown) {
        const err = e as { reason?: string; message?: string };
        setSwapStatus({
          text: 'Approval failed: ' + (err.reason || err.message),
          type: 'error',
        });
      }
    },
    [signer, zeroForOne]
  );

  const executeSwap = useCallback(
    async (amount: string): Promise<string> => {
      if (!signer || currentTier === 2) return '';
      const sellDecimals = zeroForOne ? USDC_DECIMALS : WETH_DECIMALS;

      try {
        // verify allowance
        const sellToken = zeroForOne ? USDC : WETH;
        const tokenContract = new ethers.Contract(
          sellToken,
          ERC20_ABI,
          readProvider
        );
        const addr = await signer.getAddress();
        const allowance = await tokenContract.allowance(addr, ROUTER);
        const needed = ethers.parseUnits(amount, sellDecimals);
        if (allowance < needed) {
          setSwapStatus({ text: 'Approve tokens first', type: 'error' });
          return '';
        }

        setSwapStatus({ text: 'Sending swap...', type: 'info' });
        const router = new ethers.Contract(ROUTER, ROUTER_ABI, signer);
        const amountSpecified = -BigInt(ethers.parseUnits(amount, sellDecimals));
        const sqrtPriceLimit = zeroForOne
          ? MIN_SQRT_PRICE_PLUS_1
          : MAX_SQRT_PRICE_MINUS_1;
        const deadline = Math.floor(Date.now() / 1000) + 300;

        const tx = await router.swap(
          zeroForOne,
          amountSpecified,
          sqrtPriceLimit,
          deadline
        );

        setSwapStatus({
          text: 'Confirming...',
          type: 'info',
          txHash: tx.hash,
        });
        await tx.wait();
        setSwapStatus({
          text: 'Swap confirmed!',
          type: 'success',
          txHash: tx.hash,
        });

        if (userAddress) await updateBalances(userAddress);
        return tx.hash;
      } catch (e: unknown) {
        const err = e as { reason?: string; message?: string };
        let msg = err.reason || err.message || 'Swap failed';
        if (msg.includes('SwapBlockedRedTier')) {
          msg = 'Swap blocked \u2014 Red tier active';
        }
        setSwapStatus({ text: msg, type: 'error' });
        return '';
      }
    },
    [signer, currentTier, zeroForOne, userAddress, updateBalances]
  );

  // initial fetch + polling
  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 30000);
    return () => clearInterval(interval);
  }, [refresh]);

  // listen for wallet events
  useEffect(() => {
    const eth = (window as unknown as { ethereum?: { on: (event: string, handler: () => void) => void; removeListener: (event: string, handler: () => void) => void } }).ethereum;
    if (!eth) return;
    const reload = () => window.location.reload();
    eth.on('accountsChanged', reload);
    eth.on('chainChanged', reload);
    return () => {
      eth.removeListener('accountsChanged', reload);
      eth.removeListener('chainChanged', reload);
    };
  }, []);

  return (
    <Web3Context.Provider
      value={{
        provider,
        signer,
        userAddress,
        wrongNetwork,
        connectWallet,
        onChainState,
        polymarketProb,
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
        refresh,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
}
