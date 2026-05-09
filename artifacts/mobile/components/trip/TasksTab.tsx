import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { palette } from "@/constants/colors";
import { useTrips } from "@/context/TripContext";
import type { Trip } from "@/context/TripContext";

export function TasksTab({ trip }: { trip: Trip }) {
  const { toggleTask, addTask } = useTrips();
  const [newTask, setNewTask] = useState("");

  const handleAdd = () => {
    const trimmed = newTask.trim();
    if (!trimmed) return;
    addTask(trip.id, trimmed);
    setNewTask("");
  };

  return (
    <View style={{ gap: 12 }}>
      <View style={styles.addRow}>
        <Feather name="plus" size={18} color={palette.mutedForeground} />
        <TextInput
          value={newTask}
          onChangeText={setNewTask}
          placeholder="Add a task"
          placeholderTextColor={palette.mutedForeground}
          style={styles.addInput}
          onSubmitEditing={handleAdd}
          returnKeyType="done"
        />
        {newTask.trim().length > 0 && (
          <Pressable onPress={handleAdd} style={styles.addBtn}>
            <Feather name="arrow-right" size={16} color="#fff" />
          </Pressable>
        )}
      </View>

      {trip.tasks.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Feather name="check-square" size={48} color={palette.primary} />
          </View>
          <Text style={styles.emptyTitle}>No tasks yet</Text>
          <Text style={styles.emptyText}>Add things to do before your trip above</Text>
        </View>
      ) : (
        <View style={{ gap: 8 }}>
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
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  addRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: palette.surfaceAlt,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 54,
  },
  addInput: {
    flex: 1,
    fontFamily: "Inter_500Medium",
    color: palette.foreground,
    fontSize: 15,
    paddingVertical: 0,
  },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: palette.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  empty: {
    alignItems: "center",
    paddingVertical: 48,
    gap: 12,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: palette.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    color: palette.foreground,
    fontFamily: "Inter_700Bold",
    fontSize: 17,
  },
  emptyText: {
    color: palette.mutedForeground,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 32,
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
