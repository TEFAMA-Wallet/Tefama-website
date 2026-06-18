"use client";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function usePrice() {
  const { data, error, isLoading } = useSWR("/api/price", fetcher, {
    refreshInterval: 20_000,
    revalidateOnFocus: true,
  });
  return {
    price:        data?.price        ?? 0,
    change24h:    data?.change24h    ?? 0,
    high24h:      data?.high24h      ?? 0,
    low24h:       data?.low24h       ?? 0,
    volume24h:    data?.volume24h    ?? 0,
    deepPrice:    data?.deepPrice    ?? 0,
    deepInSui:    data?.deepInSui    ?? 0,
    deepChange24h:data?.deepChange24h?? 0,
    isLoading,
    error,
  };
}

export function useWallet(address: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    address ? `/api/wallet/${address}` : null,
    fetcher,
    { refreshInterval: 15_000 }
  );
  return {
    suiBalance:  data?.suiBalance  ?? 0,
    usdcBalance: data?.usdcBalance ?? 0,
    deepBalance: data?.deepBalance ?? 0,
    vault:       data?.vault       ?? null,
    isLoading,
    error,
    refresh: mutate,
  };
}

export function useTrades(vaultId?: string, deepPrice?: number) {
  const params = new URLSearchParams();
  if (vaultId)   params.set("vault",  vaultId);
  if (deepPrice) params.set("price",  String(deepPrice));

  const { data, error, isLoading, mutate } = useSWR(
    `/api/trades?${params}`,
    fetcher,
    { refreshInterval: 30_000 }
  );
  return {
    trades:   data?.trades ?? [],
    pnl:      data?.pnl    ?? 0,
    roi:      data?.roi    ?? 0,
    count:    data?.count  ?? 0,
    isLoading,
    error,
    refresh:  mutate,
  };
}
