import { Link } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Switch, Text, View } from "react-native";

import { AuthInput } from "@/components/auth/AuthInput";
import { AuthShell } from "@/components/auth/AuthShell";
import { SocialRow } from "@/components/auth/SocialRow";
import { useAuth } from "@/context/AuthContext";
import type { OAuthProvider } from "@/lib/oauth";

export default function LoginScreen() {
  const { login, oauthLogin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    if (submitting || demoLoading) return;
    setError(null);
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setSubmitting(true);
    try {
      await login({ email: trimmedEmail, password });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Login failed. Please try again.";
      setError(extractMessage(message));
    } finally {
      setSubmitting(false);
    }
  };

  const onDemoLogin = async () => {
    if (submitting || demoLoading) return;
    setError(null);
    setDemoLoading(true);
    try {
      await login({ email: "demo@packeasy.local", password: "password123" });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Demo login failed. Please try again.";
      setError(extractMessage(message));
    } finally {
      setDemoLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: OAuthProvider) => {
    try {
      await oauthLogin(provider);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : `${provider} login failed.`;
      setError(extractMessage(message));
    }
  };

  const busy = submitting || demoLoading;

  return (
    <AuthShell
      title="Login"
      footer={
        <>
          <SocialRow label="Or login with" onOAuthPress={handleOAuthLogin} />
          <Text style={styles.bottomText}>
            Don&apos;t have an account?{" "}
            <Link href="/(auth)/signup" style={styles.bottomLink}>
              Signup
            </Link>
          </Text>
        </>
      }
    >
      <Pressable
        onPress={onDemoLogin}
        disabled={busy}
        style={({ pressed }) => [
          styles.demoBtn,
          (pressed || busy) && { opacity: 0.75 },
        ]}
      >
        {demoLoading ? (
          <ActivityIndicator color="#22c46a" />
        ) : (
          <>
            <Text style={styles.demoEmoji}>⚡</Text>
            <Text style={styles.demoText}>Try Demo — one tap login</Text>
          </>
        )}
      </Pressable>

      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerLabel}>or sign in manually</Text>
        <View style={styles.dividerLine} />
      </View>

      <AuthInput
        label="Email"
        placeholder="Email Address"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <AuthInput
        label="Password"
        placeholder="Password"
        isPassword
        value={password}
        onChangeText={setPassword}
      />

      <View style={styles.optionsRow}>
        <View style={styles.rememberRow}>
          <Switch
            value={remember}
            onValueChange={setRemember}
            trackColor={{ false: "rgba(255,255,255,0.3)", true: "#22c46a" }}
            thumbColor="#ffffff"
            ios_backgroundColor="rgba(255,255,255,0.3)"
          />
          <Text style={styles.rememberText}>Remember me</Text>
        </View>
        <Pressable hitSlop={8}>
          <Text style={styles.forgotText}>Forgot password?</Text>
        </Pressable>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Pressable
        onPress={onSubmit}
        disabled={busy}
        style={({ pressed }) => [
          styles.primaryBtn,
          (pressed || busy) && { opacity: 0.85 },
        ]}
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.primaryText}>Login</Text>
        )}
      </Pressable>
    </AuthShell>
  );
}

function extractMessage(raw: string): string {
  const m = raw.match(/HTTP \d+[^:]*:\s*(.+)$/);
  return m ? m[1] : raw;
}

const styles = StyleSheet.create({
  demoBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(34,196,106,0.15)",
    borderWidth: 1.5,
    borderColor: "#22c46a",
    height: 52,
    borderRadius: 10,
    marginBottom: 4,
  },
  demoEmoji: {
    fontSize: 18,
  },
  demoText: {
    color: "#22c46a",
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  dividerLabel: {
    color: "rgba(255,255,255,0.5)",
    fontFamily: "Inter_400Regular",
    fontSize: 12,
  },
  optionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  rememberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  rememberText: {
    color: "rgba(255,255,255,0.85)",
    fontFamily: "Inter_500Medium",
    fontSize: 13,
  },
  forgotText: {
    color: "rgba(255,255,255,0.85)",
    fontFamily: "Inter_500Medium",
    fontSize: 13,
  },
  errorText: {
    color: "#ffb4b4",
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    textAlign: "center",
  },
  primaryBtn: {
    backgroundColor: "#22c46a",
    height: 52,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  primaryText: {
    color: "#ffffff",
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
  },
  bottomText: {
    color: "rgba(255,255,255,0.85)",
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    textAlign: "center",
  },
  bottomLink: {
    color: "#22c46a",
    fontFamily: "Inter_700Bold",
    fontSize: 14,
  },
});
