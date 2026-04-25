import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";

import { AuthInput } from "@/components/auth/AuthInput";
import { AuthShell } from "@/components/auth/AuthShell";
import { SocialRow } from "@/components/auth/SocialRow";
import { useAuth } from "@/context/AuthContext";

export default function SignupScreen() {
  const router = useRouter();
  const { signup } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    if (submitting) return;
    setError(null);
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    if (!trimmedName || !trimmedEmail || !password) {
      setError("Please fill in your name, email, and password.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setSubmitting(true);
    try {
      await signup({ name: trimmedName, email: trimmedEmail, password });
      router.replace("/(tabs)");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Signup failed. Please try again.";
      setError(extractMessage(message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Signup"
      footer={
        <>
          <SocialRow label="Or signup with" />
          <Text style={styles.bottomText}>
            Already have an account!{" "}
            <Link href="/(auth)/login" style={styles.bottomLink}>
              Login
            </Link>
          </Text>
        </>
      }
    >
      <AuthInput
        label="User Name"
        placeholder="User name"
        autoCapitalize="words"
        value={name}
        onChangeText={setName}
      />
      <AuthInput
        label="Email"
        placeholder="Email address"
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
      <AuthInput
        label="Confirm password"
        placeholder="Confirm password"
        isPassword
        value={confirm}
        onChangeText={setConfirm}
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Pressable
        onPress={onSubmit}
        disabled={submitting}
        style={({ pressed }) => [
          styles.primaryBtn,
          (pressed || submitting) && { opacity: 0.85 },
        ]}
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.primaryText}>Signup</Text>
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
    marginTop: 12,
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
