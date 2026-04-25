import { FontAwesome, FontAwesome5, Ionicons } from "@expo/vector-icons";
import React from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  label: string;
};

function notifyComingSoon(provider: string) {
  Alert.alert(
    `${provider} sign-in coming soon`,
    "For now, please sign up with your email and password.",
  );
}

export function SocialRow({ label }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.dividerRow}>
        <View style={styles.line} />
        <Text style={styles.dividerText}>{label}</Text>
        <View style={styles.line} />
      </View>
      <View style={styles.row}>
        <SocialBtn onPress={() => notifyComingSoon("Google")}>
          <FontAwesome name="google" size={22} color="#ffffff" />
        </SocialBtn>
        <SocialBtn onPress={() => notifyComingSoon("Apple")}>
          <Ionicons name="logo-apple" size={24} color="#ffffff" />
        </SocialBtn>
        <SocialBtn onPress={() => notifyComingSoon("Facebook")}>
          <FontAwesome5 name="facebook-f" size={22} color="#ffffff" />
        </SocialBtn>
      </View>
      <Text style={styles.note}>Social sign-in is coming soon</Text>
    </View>
  );
}

function SocialBtn({
  children,
  onPress,
}: {
  children: React.ReactNode;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.btn, pressed && { opacity: 0.7 }]}
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
  note: {
    color: "rgba(255,255,255,0.7)",
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    textAlign: "center",
  },
});
