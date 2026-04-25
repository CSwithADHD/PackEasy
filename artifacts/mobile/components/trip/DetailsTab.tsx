import { Feather } from "@expo/vector-icons";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { palette } from "@/constants/colors";
import type { Trip } from "@/context/TripContext";

const WEATHER = [
  { date: "Apr 23", temp: "28°C", icon: "cloud" as const },
  { date: "Apr 24", temp: "22°C", icon: "cloud-drizzle" as const },
  { date: "Apr 25", temp: "27°C", icon: "sun" as const },
  { date: "Apr 26", temp: "29°C", icon: "sun" as const },
  { date: "Apr 27", temp: "30°C", icon: "sun" as const },
];

export function DetailsTab({ trip }: { trip: Trip }) {
  return (
    <View style={{ gap: 24 }}>
      <View>
        <Text style={styles.sectionLabel}>WEATHER IN {trip.destination.toUpperCase()}</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.weatherRow}
        >
          {WEATHER.map((w) => (
            <View key={w.date} style={styles.weatherCard}>
              <Text style={styles.weatherDate}>{w.date}</Text>
              <Feather name={w.icon} size={32} color={palette.primary} />
              <Text style={styles.weatherTemp}>{w.temp}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      <View>
        <Text style={styles.sectionLabel}>COLLABORATORS</Text>
        <Pressable style={styles.collabRow}>
          <View style={styles.collabIcon}>
            <Feather name="user-plus" size={18} color={palette.primary} />
          </View>
          <Text style={styles.collabAdd}>Add</Text>
          <View style={{ flex: 1 }} />
          <Feather name="chevron-right" size={18} color={palette.mutedForeground} />
        </Pressable>
      </View>

      <View style={styles.divider} />

      <Pressable style={styles.exportBtn}>
        <Feather name="upload" size={18} color={palette.foreground} />
        <Text style={styles.exportText}>Export Checklist</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    color: palette.mutedForeground,
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    letterSpacing: 1,
    marginBottom: 12,
  },
  weatherRow: {
    gap: 10,
    paddingRight: 16,
  },
  weatherCard: {
    width: 92,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: palette.surfaceAlt,
    alignItems: "center",
    gap: 10,
  },
  weatherDate: {
    color: palette.mutedForeground,
    fontFamily: "Inter_500Medium",
    fontSize: 12,
  },
  weatherTemp: {
    color: palette.foreground,
    fontFamily: "Inter_600SemiBold",
    fontSize: 17,
  },
  collabRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: palette.surfaceAlt,
    borderRadius: 14,
    padding: 12,
  },
  collabIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: palette.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  collabAdd: {
    color: palette.primary,
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
  divider: {
    height: 1,
    backgroundColor: palette.border,
  },
  exportBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    height: 56,
    borderRadius: 14,
    backgroundColor: palette.surfaceAlt,
  },
  exportText: {
    color: palette.foreground,
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
});
