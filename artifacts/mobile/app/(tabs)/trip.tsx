import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ChecklistTab } from "@/components/trip/ChecklistTab";
import { DetailsTab } from "@/components/trip/DetailsTab";
import { SegmentedTabs } from "@/components/trip/SegmentedTabs";
import { TasksTab } from "@/components/trip/TasksTab";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { palette } from "@/constants/colors";
import { useTrips } from "@/context/TripContext";

const TABS = ["Checklist", "Details", "Tasks"];

export default function TripScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { currentTrip } = useTrips();
  const [tab, setTab] = useState("Checklist");

  if (!currentTrip) {
    return (
      <View style={[styles.empty, { paddingTop: insets.top + 80 }]}>
        <View style={styles.emptyIcon}>
          <Feather name="map" size={56} color={palette.primary} />
        </View>
        <Text style={styles.emptyTitle}>No trip selected</Text>
        <Text style={styles.emptyText}>Plan a trip to see your checklist here.</Text>
        <Pressable
          onPress={() => router.push("/new-trip")}
          style={styles.startBtn}
        >
          <Feather name="plus" size={16} color="#fff" />
          <Text style={styles.startText}>Plan a trip</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScreenHeader
        title={currentTrip.destination}
        showBack
        right={
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Pressable
              style={styles.headerBtn}
              onPress={() => Alert.alert("Search", "Search within your packing list coming soon.")}
            >
              <Feather name="search" size={16} color={palette.foreground} />
            </Pressable>
            <Pressable
              style={styles.headerBtn}
              onPress={() =>
                Alert.alert(
                  currentTrip.destination,
                  "More options",
                  [
                    { text: "Rename trip", onPress: () => Alert.alert("Coming Soon", "Rename trip will be available in a future update.") },
                    { text: "Delete trip", style: "destructive", onPress: () => Alert.alert("Coming Soon", "Delete trip will be available in a future update.") },
                    { text: "Cancel", style: "cancel" },
                  ],
                )
              }
            >
              <Feather name="more-vertical" size={16} color={palette.foreground} />
            </Pressable>
          </View>
        }
      />

      <SegmentedTabs options={TABS} value={tab} onChange={setTab} />

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 120, gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {tab === "Checklist" ? <ChecklistTab trip={currentTrip} /> : null}
        {tab === "Details" ? <DetailsTab trip={currentTrip} /> : null}
        {tab === "Tasks" ? <TasksTab trip={currentTrip} /> : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.background },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: palette.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  empty: {
    flex: 1,
    backgroundColor: palette.background,
    alignItems: "center",
    paddingHorizontal: 24,
    gap: 14,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: palette.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    color: palette.foreground,
    fontFamily: "Inter_700Bold",
    fontSize: 18,
  },
  emptyText: {
    color: palette.mutedForeground,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    textAlign: "center",
  },
  startBtn: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 18,
    height: 48,
    borderRadius: 14,
    backgroundColor: palette.primary,
  },
  startText: { color: "#fff", fontFamily: "Inter_600SemiBold", fontSize: 15 },
});
