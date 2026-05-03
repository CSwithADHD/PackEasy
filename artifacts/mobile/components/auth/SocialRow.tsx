import { FontAwesome, FontAwesome5, Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from "react-native";

import type { OAuthProvider } from "@/lib/oauth";

type Props = {
  label: string;
  onOAuthPress?: (provider: OAuthProvider) => Promise<void>;
};

export function SocialRow({ label, onOAuthPress }: Props) {
  const [loading, setLoading] = useState<OAuthProvider | null>(null);

  const handlePress = async (provider: OAuthProvider) => {
    if (!onOAuthPress) {
      Alert.alert(
        `${provider.charAt(0).toUpperCase() + provider.slice(1)} sign-in coming soon`,
        "For now, please sign up with your email and password.",
      );
      return;
    }
    setLoading(provider);
    try {
      await onOAuthPress(provider);
    } catch (error) {
      const message = error instanceof Error ? error.message : "OAuth login failed";
      Alert.alert("Login Error", message);
    } finally {
      setLoading(null);
    }
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.dividerRow}>
        <View style={styles.line} />
        <Text style={styles.dividerText}>{label}</Text>
        <View style={styles.line} />
      </View>
      <View style={styles.row}>
        <SocialBtn
          onPress={() => handlePress("google")}
          disabled={loading !== null}
        >
          {loading === "google" ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <FontAwesome name="google" size={22} color="#ffffff" />
          )}
        </SocialBtn>
        <SocialBtn
          onPress={() => handlePress("apple")}
          disabled={loading !== null}
        >
          {loading === "apple" ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Ionicons name="logo-apple" size={24} color="#ffffff" />
          )}
        </SocialBtn>
        <SocialBtn
          onPress={() => handlePress("facebook")}
          disabled={loading !== null}
        >
          {loading === "facebook" ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <FontAwesome5 name="facebook-f" size={22} color="#ffffff" />
          )}
        </SocialBtn>
      </View>
    </View>
  );
}

function SocialBtn({
  children,
  onPress,
  disabled,
}: {
  children: React.ReactNode;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.btn,
        (pressed || disabled) && { opacity: 0.7 },
      ]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 12,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  dividerText: {
    color: "#ffffff",
    fontFamily: "Inter_500Medium",
    fontSize: 13,
  },
  row: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 14,
  },
  btn: {
    width: 70,
    height: 52,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
});
