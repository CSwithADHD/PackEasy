import * as WebBrowser from "expo-web-browser";
import { useCallback } from "react";
import { Alert } from "react-native";

import type { AuthResponse } from "@/lib/api";

WebBrowser.maybeCompleteAuthSession();

export type OAuthProvider = "google" | "facebook" | "apple";

export function useOAuth() {
  const handleOAuthLogin = useCallback(async (_provider: OAuthProvider): Promise<AuthResponse> => {
    Alert.alert(
      "Social Login",
      "Social login is not yet configured. Please use email and password to sign in.",
    );
    throw new Error("Social login not configured");
  }, []);

  return { handleOAuthLogin };
}
