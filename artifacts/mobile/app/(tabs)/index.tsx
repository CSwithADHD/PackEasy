import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { palette } from "@/constants/colors";
import { useTrips } from "@/context/TripContext";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { trips, setCurrentTrip } = useTrips();

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <View style={{ flex: 1 }} />
        <Pressable style={styles.joinBtn}>
          <Feather name="user-plus" size={14} color={palette.foreground} />
          <Text style={styles.joinText}>Join</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 120, gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>Destinations</Text>

        {trips.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Feather name="map-pin" size={36} color={palette.primary} />
            </View>
            <Text style={styles.emptyTitle}>No trips yet</Text>
            <Text style={styles.emptyText}>
              Tap "Add new" to plan your first trip and start packing
            </Text>
          </View>
        ) : (
          <>
            <Text style={styles.sectionLabel}>Current Trip</Text>
            {trips.map((trip) => {
              const allItems = trip.categories.flatMap((c) => c.items);
              const total = allItems.length;
              const done = allItems.filter((i) => i.done).length;
              const pct = total === 0 ? 0 : Math.round((done / total) * 100);
              return (
                <Pressable
                  key={trip.id}
                  onPress={() => {
                    setCurrentTrip(trip.id);
                    router.push("/(tabs)/trip");
                  }}
                  style={styles.tripCard}
                >
                  <View style={styles.tripHead}>
                    <Text style={styles.tripName}>
                      {trip.emoji ? `${trip.emoji} ` : ""}
                      {trip.destination}
                    </Text>
                    <View style={styles.editBtn}>
                      <Feather name="edit-2" size={14} color="#fff" />
                    </View>
                  </View>
                  <View style={styles.statsBox}>
                    <View style={styles.statsRow}>
                      <Text style={styles.statsLabel}>{total} items</Text>
                      <Text style={styles.statsValue}>
                        {done}/{total}
                      </Text>
                    </View>
                    <View style={styles.barTrack}>
                      <View style={[styles.barFill, { width: `${pct}%` }]} />
                    </View>
                    <View style={styles.statsRow}>
                      <Text style={styles.statsLabel}>Progress</Text>
                      <Text style={styles.statsValue}>{pct}%</Text>
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </>
        )}
      </ScrollView>

      <Pressable
        onPress={() => router.push("/new-trip")}
        style={[styles.fab, { bottom: insets.bottom + 80 }]}
      >
        <Feather name="plus" size={18} color="#fff" />
        <Text style={styles.fabText}>Add new</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.background },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  joinBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: palette.surfaceAlt,
    paddingHorizontal: 12,
    height: 36,
    borderRadius: 12,
  },
  joinText: {
    color: palette.foreground,
    fontFamily: "Inter_500Medium",
    fontSize: 13,
  },
  pageTitle: {
    color: palette.foreground,
    fontFamily: "Inter_700Bold",
    fontSize: 28,
    textAlign: "center",
    marginVertical: 8,
  },
  sectionLabel: {
    color: palette.mutedForeground,
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    marginTop: 8,
  },
  tripCard: {
    borderRadius: 22,
    padding: 18,
    backgroundColor: palette.primary,
    gap: 16,
  },
  tripHead: {
    flexDirection: "row",
    alignItems: "center",
  },
  tripName: {
    flex: 1,
    color: "#fff",
    fontFamily: "Inter_700Bold",
    fontSize: 20,
  },
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },
  statsBox: {
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 14,
    padding: 14,
    gap: 8,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statsLabel: {
    color: "rgba(255,255,255,0.85)",
    fontFamily: "Inter_500Medium",
    fontSize: 13,
  },
  statsValue: {
    color: "#fff",
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
  },
  barTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.22)",
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    backgroundColor: "#fff",
  },
  emptyCard: {
    backgroundColor: palette.surfaceAlt,
    borderRadius: 20,
    padding: 28,
    alignItems: "center",
    gap: 10,
  },
  emptyIcon: {
    width: 76,
    height: 76,
    borderRadius: 22,
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
  fab: {
    position: "absolute",
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: palette.primary,
    paddingHorizontal: 18,
    height: 52,
    borderRadius: 26,
    shadowColor: palette.primary,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  fabText: {
    color: "#fff",
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
});
