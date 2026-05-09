import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Alert, Linking, Pressable, ScrollView, Share, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { palette } from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";

type RowProps = {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  onPress?: () => void;
};

function Row({ icon, label, onPress }: RowProps) {
  return (
    <Pressable onPress={onPress} style={styles.row}>
      <View style={styles.rowIcon}>
        <Feather name={icon} size={16} color={palette.primary} />
      </View>
      <Text style={styles.rowLabel}>{label}</Text>
      <Feather name="chevron-right" size={18} color={palette.mutedForeground} />
    </Pressable>
  );
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert("Sign out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign out",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: "Check out PackEasy — the smartest travel packing app! 🧳",
        title: "PackEasy",
      });
    } catch {}
  };

  const handleFeedback = () => {
    Linking.openURL("mailto:feedback@packeasy.app?subject=PackEasy Feedback").catch(() =>
      Alert.alert("Feedback", "Send your feedback to feedback@packeasy.app")
    );
  };

  const handlePrivacy = () => {
    Linking.openURL("https://packeasy.app/privacy").catch(() =>
      Alert.alert("Privacy Policy", "Visit packeasy.app/privacy for our privacy policy")
    );
  };

  const comingSoon = (feature: string) => {
    Alert.alert("Coming Soon", `${feature} will be available in a future update.`);
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <Text style={styles.pageTitle}>Settings</Text>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 100, gap: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <Pressable style={styles.proCard}>
          <View style={styles.proIcon}>
            <Feather name="award" size={20} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.proTitleRow}>
              <View style={styles.proTag}>
                <Text style={styles.proTagText}>PRO</Text>
              </View>
              <Text style={styles.proTitle}>Get PackEasy Pro</Text>
            </View>
            <Text style={styles.proSub}>Collaborators, Widgets, and more</Text>
          </View>
          <Feather name="chevron-right" size={18} color="#fff" />
        </Pressable>

        <View>
          <Text style={styles.sectionLabel}>Account & Sync</Text>
          <View style={styles.card}>
            <Row icon="user" label={user ? `Signed in as ${user.name}` : "Account Sync & Backup"} />
            <View style={styles.divider} />
            <Row icon="log-out" label="Sign out" onPress={handleLogout} />
          </View>
        </View>

        <View>
          <Text style={styles.sectionLabel}>Preferences</Text>
          <View style={styles.card}>
            <Row icon="sliders" label="Preferences" onPress={() => comingSoon("Preferences")} />
            <View style={styles.divider} />
            <Row icon="globe" label="Language" onPress={() => comingSoon("Language settings")} />
            <View style={styles.divider} />
            <Row icon="moon" label="Theme" onPress={() => comingSoon("Dark / light theme")} />
          </View>
        </View>

        <View>
          <Text style={styles.sectionLabel}>Support & Feedback</Text>
          <View style={styles.card}>
            <Row icon="share-2" label="Share app" onPress={handleShare} />
            <View style={styles.divider} />
            <Row icon="message-square" label="Feedback" onPress={handleFeedback} />
            <View style={styles.divider} />
            <Row icon="alert-triangle" label="Report a bug" onPress={handleFeedback} />
            <View style={styles.divider} />
            <Row icon="shield" label="Privacy Policy" onPress={handlePrivacy} />
          </View>
        </View>

        <Text style={styles.version}>Version 1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.background },
  pageTitle: {
    color: palette.foreground,
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    textAlign: "center",
    paddingVertical: 14,
  },
  proCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: palette.primary,
    borderRadius: 18,
    padding: 14,
  },
  proIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },
  proTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  proTag: {
    backgroundColor: "#fff",
    paddingHorizontal: 8,
    height: 22,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  proTagText: {
    color: palette.primary,
    fontFamily: "Inter_700Bold",
    fontSize: 11,
  },
  proTitle: {
    color: "#fff",
    fontFamily: "Inter_700Bold",
    fontSize: 15,
  },
  proSub: {
    color: "rgba(255,255,255,0.85)",
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 2,
  },
  sectionLabel: {
    color: palette.foreground,
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    marginBottom: 10,
  },
  card: {
    backgroundColor: palette.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.border,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: palette.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: {
    flex: 1,
    color: palette.foreground,
    fontFamily: "Inter_500Medium",
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: palette.border,
    marginLeft: 62,
  },
  version: {
    color: palette.mutedForeground,
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    textAlign: "center",
  },
});
