import { useQueryClient } from "@tanstack/react-query";
import { setAuthTokenGetter, setBaseUrl } from "@workspace/api-client-react";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { api } from "@/lib/api";
import { authStorage, type StoredUser } from "@/lib/auth-storage";

const API_BASE = process.env.EXPO_PUBLIC_DOMAIN
  ? `https://${process.env.EXPO_PUBLIC_DOMAIN}`
  : "";

setBaseUrl(API_BASE || null);

type AuthState = {
  user: StoredUser | null;
  token: string | null;
  loading: boolean;
  signup: (input: { name: string; email: string; password: string }) => Promise<void>;
  login: (input: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<StoredUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const tokenRef = useRef<string | null>(null);

  useEffect(() => {
    tokenRef.current = token;
  }, [token]);

  useEffect(() => {
    setAuthTokenGetter(() => tokenRef.current);
    return () => setAuthTokenGetter(null);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [storedToken, storedUser] = await Promise.all([
        authStorage.getToken(),
        authStorage.getUser(),
      ]);
      if (cancelled) return;
      if (storedToken && storedUser) {
        tokenRef.current = storedToken;
        setToken(storedToken);
        setUser(storedUser);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const persistAuth = useCallback(
    async (nextUser: StoredUser, nextToken: string) => {
      tokenRef.current = nextToken;
      setToken(nextToken);
      setUser(nextUser);
      await Promise.all([
        authStorage.setToken(nextToken),
        authStorage.setUser(nextUser),
      ]);
      queryClient.invalidateQueries({ queryKey: ["trips"] });
    },
    [queryClient],
  );

  const signup = useCallback<AuthState["signup"]>(
    async (input) => {
      const res = await api.signup(input);
      await persistAuth(res.user, res.token);
    },
    [persistAuth],
  );

  const login = useCallback<AuthState["login"]>(
    async (input) => {
      const res = await api.login(input);
      await persistAuth(res.user, res.token);
    },
    [persistAuth],
  );

  const logout = useCallback<AuthState["logout"]>(async () => {
    try {
      if (tokenRef.current) await api.logout();
    } catch {
    }
    tokenRef.current = null;
    setToken(null);
    setUser(null);
    await authStorage.clear();
    queryClient.clear();
  }, [queryClient]);

  const value = useMemo<AuthState>(
    () => ({ user, token, loading, signup, login, logout }),
    [user, token, loading, signup, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
