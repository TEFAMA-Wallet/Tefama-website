"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import {
  loadSession,
  saveSession,
  clearSession,
  type ZkLoginSession,
} from "@/lib/zklogin-store";
import { shortenAddress } from "@/lib/zklogin";

interface ZkLoginState {
  session: ZkLoginSession | null;
  isLoading: boolean;
  address: string | null;
  shortAddress: string | null;
  isConnected: boolean;
  setSession: (s: ZkLoginSession) => void;
  logout: () => void;
}

const ZkLoginContext = createContext<ZkLoginState | null>(null);

export function ZkLoginProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<ZkLoginSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setSessionState(loadSession());
    setIsLoading(false);
  }, []);

  const setSession = useCallback((s: ZkLoginSession) => {
    saveSession(s);
    setSessionState(s);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setSessionState(null);
  }, []);

  const address = session?.address ?? null;
  const shortAddress = address ? shortenAddress(address) : null;

  return (
    <ZkLoginContext.Provider
      value={{
        session,
        isLoading,
        address,
        shortAddress,
        isConnected: !!session,
        setSession,
        logout,
      }}
    >
      {children}
    </ZkLoginContext.Provider>
  );
}

export function useZkLogin(): ZkLoginState {
  const ctx = useContext(ZkLoginContext);
  if (!ctx) throw new Error("useZkLogin must be used inside ZkLoginProvider");
  return ctx;
}
