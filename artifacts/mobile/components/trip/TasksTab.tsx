import { Feather } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { palette } from "@/constants/colors";
import { useTrips } from "@/context/TripContext";
import type { Trip } from "@/context/TripContext";

export function TasksTab({ trip }: { trip: Trip }) {
  const { toggleTask } = useTrips();

  if (trip.tasks.length === 0) {
    return (
      <View style={styles.empty}>
        <View style={styles.emptyIcon}>
          <Feather name="check-square" size={56} color={palette.primary} />
        </View>
        <Text style={styles.emptyTitle}>No tasks yet</Text>
        <Text style={styles.emptyText}>
          Here you can add things to do before your trip
        </Text>
      </View>
    );
  }

  return (
    <View style={{ gap: 10 }}>
      {trip.tasks.map((t) => (
        <Pressable
          key={t.id}
          onPress={() => toggleTask(trip.id, t.id)}
          style={styles.row}
        >
          <View style={[styles.checkbox, t.done && styles.checkboxDone]}>
            {t.done ? <Feather name="check" size={14} color="#fff" /> : null}
          </View>
          <Text style={[styles.label, t.done && styles.labelDone]}>{t.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    alignItems: "center",
    paddingVertical: 64,
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
    paddingHorizontal: 40,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 12,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: palette.border,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxDone: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
  },
  label: {
    flex: 1,
    color: palette.foreground,
    fontFamily: "Inter_500Medium",
    fontSize: 14,
  },
  labelDone: {
    color: palette.mutedForeground,
    textDecorationLine: "line-through",
  },
});
