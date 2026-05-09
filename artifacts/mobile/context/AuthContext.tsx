import { onAuthStateChanged } from "firebase/auth";
import { useQueryClient } from "@tanstack/react-query";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { auth } from "@/lib/firebase";
import { api } from "@/lib/api";
import { authStorage, type StoredUser } from "@/lib/auth-storage";
import { useOAuth, type OAuthProvider } from "@/lib/oauth";

type AuthState = {
  user: StoredUser | null;
  token: string | null;
  loading: boolean;
  signup: (input: { name: string; email: string; password: string }) => Promise<void>;
  login: (input: { email: string; password: string }) => Promise<void>;
  oauthLogin: (provider: OAuthProvider) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const { handleOAuthLogin } = useOAuth();
  const [user, setUser] = useState<StoredUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const idToken = await firebaseUser.getIdToken();
        const stored: StoredUser = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName ?? firebaseUser.email ?? "User",
          email: firebaseUser.email ?? "",
        };
        setToken(idToken);
        setUser(stored);
        await Promise.all([
          authStorage.setToken(idToken),
          authStorage.setUser(stored),
        ]);
      } else {
        setToken(null);
        setUser(null);
        await authStorage.clear();
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const persistAuth = useCallback(
    async (nextUser: StoredUser, nextToken: string) => {
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

  const oauthLogin = useCallback<AuthState["oauthLogin"]>(
    async (provider) => {
      const res = await handleOAuthLogin(provider);
      await persistAuth(res.user, res.token);
    },
    [persistAuth, handleOAuthLogin],
  );

  const logout = useCallback<AuthState["logout"]>(async () => {
    try {
      await api.logout();
    } catch {
    }
    setToken(null);
    setUser(null);
    await authStorage.clear();
    queryClient.clear();
  }, [queryClient]);

  const value = useMemo<AuthState>(
    () => ({ user, token, loading, signup, login, oauthLogin, logout }),
    [user, token, loading, signup, login, oauthLogin, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
