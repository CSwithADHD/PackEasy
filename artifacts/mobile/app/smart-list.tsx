import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { palette } from "@/constants/colors";
import { useTrips } from "@/context/TripContext";

export default function SmartListModal() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { currentTrip, trips, seedCurrentTrip, setCurrentTrip } = useTrips();
  const [busy, setBusy] = useState(false);

  const trip = currentTrip ?? trips[trips.length - 1];

  const goToTrip = () => {
    if (trip && !currentTrip) setCurrentTrip(trip.id);
    router.replace("/(tabs)/trip");
  };

  const handleSmart = async () => {
    if (!trip || busy) return goToTrip();
    setBusy(true);
    try {
      if (!currentTrip) setCurrentTrip(trip.id);
      if (trip.categories.length === 0) {
        await seedCurrentTrip();
      }
      goToTrip();
    } catch (err) {
      Alert.alert(
        "Couldn't build list",
        err instanceof Error ? err.message : "Please try again.",
      );
    } finally {
      setBusy(false);
    }
  };

  const handleScratch = () => {
    goToTrip();
  };

  return (
    <Pressable style={styles.backdrop} onPress={() => router.back()}>
      <Pressable
        onPress={(e) => e.stopPropagation()}
        style={[styles.sheet, { paddingBottom: insets.bottom + 24 }]}
      >
        <View style={styles.handle} />
        <View style={styles.iconWrap}>
          <View style={styles.iconBg}>
            <Feather name="zap" size={26} color={palette.primary} />
          </View>
          <View style={styles.aiTag}>
            <Text style={styles.aiTagText}>AI</Text>
          </View>
        </View>

        <Text style={styles.title}>
          How do you want to pack
          {trip ? ` for ${trip.destination}` : ""}?
        </Text>
        <Text style={styles.subtitle}>
          Let AI build a list tailored to your weather, activities, and travel
          dates — or start from scratch.
        </Text>

        <PrimaryButton
          label={busy ? "Building..." : "Build My Smart List"}
          onPress={handleSmart}
          disabled={busy}
          icon={
            busy ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Feather name="zap" size={16} color="#fff" />
            )
          }
        />

        <View style={styles.orRow}>
          <View style={styles.orLine} />
          <Text style={styles.orText}>or</Text>
          <View style={styles.orLine} />
        </View>

        <PrimaryButton
          label="Start from scratch"
          variant="outline"
          onPress={handleScratch}
          disabled={busy}
        />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(8,18,24,0.55)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: palette.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 14,
    gap: 16,
  },
  handle: {
    alignSelf: "center",
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: palette.border,
    marginBottom: 8,
  },
  iconWrap: {
    alignSelf: "center",
    width: 72,
    height: 72,
    marginTop: 4,
  },
  iconBg: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: palette.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  aiTag: {
    position: "absolute",
    top: -6,
    right: -10,
    backgroundColor: palette.primary,
    paddingHorizontal: 8,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  aiTagText: {
    color: "#fff",
    fontFamily: "Inter_700Bold",
    fontSize: 11,
  },
  title: {
    color: palette.foreground,
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    textAlign: "center",
  },
  subtitle: {
    color: palette.mutedForeground,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 4,
  },
  orRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: palette.border,
  },
  orText: {
    color: palette.mutedForeground,
    fontFamily: "Inter_500Medium",
    fontSize: 13,
  },
});
