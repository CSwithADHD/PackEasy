import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  LayoutAnimation,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  UIManager,
  View,
} from "react-native";

import { palette } from "@/constants/colors";
import { useTrips } from "@/context/TripContext";
import type { Trip } from "@/context/TripContext";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export function ChecklistTab({ trip }: { trip: Trip }) {
  const { toggleItem, addItem, addCategory } = useTrips();
  const [openIds, setOpenIds] = useState<Set<string>>(
    () => new Set(trip.categories.map((c) => c.id)),
  );
  const [newCategory, setNewCategory] = useState("");
  const [adding, setAdding] = useState<string | null>(null);
  const [newItem, setNewItem] = useState("");

  const toggleOpen = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenIds((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  return (
    <View style={{ gap: 12 }}>
      <View style={styles.addCategoryRow}>
        <Feather name="plus" size={18} color={palette.mutedForeground} />
        <TextInput
          value={newCategory}
          onChangeText={setNewCategory}
          placeholder="Add category"
          placeholderTextColor={palette.mutedForeground}
          style={styles.addCategoryInput}
          onSubmitEditing={() => {
            addCategory(trip.id, newCategory);
            setNewCategory("");
          }}
          returnKeyType="done"
        />
      </View>

      <View style={styles.tipBox}>
        <View style={styles.tipIcon}>
          <Feather name="info" size={16} color={palette.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.tipTitle}>Tap items to mark as packed</Text>
          <Text style={styles.tipSub}>Tap category header to collapse</Text>
        </View>
      </View>

      {trip.categories.map((cat) => {
        const open = openIds.has(cat.id);
        const doneCount = cat.items.filter((i) => i.done).length;
        return (
          <View key={cat.id} style={styles.categoryCard}>
            <Pressable
              onPress={() => toggleOpen(cat.id)}
              style={styles.categoryHeader}
            >
              <Feather
                name={cat.icon as keyof typeof Feather.glyphMap}
                size={18}
                color={palette.primary}
              />
              <Text style={styles.categoryName}>{cat.name}</Text>
              <View style={styles.countPill}>
                <Text style={styles.countPillText}>
                  {doneCount}/{cat.items.length}
                </Text>
              </View>
              <View style={styles.iconBtn}>
                <Feather
                  name={open ? "chevron-up" : "chevron-down"}
                  size={16}
                  color={palette.mutedForeground}
                />
              </View>
            </Pressable>

            {open ? (
              <View style={styles.itemsWrap}>
                {cat.items.map((item) => (
                  <Pressable
                    key={item.id}
                    onPress={() => toggleItem(trip.id, cat.id, item.id)}
                    style={styles.itemRow}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        item.done && styles.checkboxDone,
                      ]}
                    >
                      {item.done ? (
                        <Feather name="check" size={14} color="#fff" />
                      ) : null}
                    </View>
                    <Text
                      style={[
                        styles.itemLabel,
                        item.done && styles.itemLabelDone,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                ))}

                {adding === cat.id ? (
                  <View style={styles.addItemRow}>
                    <Feather name="plus" size={16} color={palette.primary} />
                    <TextInput
                      autoFocus
                      value={newItem}
                      onChangeText={setNewItem}
                      placeholder="New item"
                      placeholderTextColor={palette.mutedForeground}
                      style={styles.addItemInput}
                      onBlur={() => {
                        if (newItem.trim()) addItem(trip.id, cat.id, newItem);
                        setNewItem("");
                        setAdding(null);
                      }}
                      onSubmitEditing={() => {
                        addItem(trip.id, cat.id, newItem);
                        setNewItem("");
                        setAdding(null);
                      }}
                      returnKeyType="done"
                    />
                  </View>
                ) : (
                  <Pressable
                    onPress={() => setAdding(cat.id)}
                    style={styles.addItemRow}
                  >
                    <Feather name="plus" size={16} color={palette.mutedForeground} />
                    <Text style={styles.addItemText}>Add item</Text>
                  </Pressable>
                )}
              </View>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  addCategoryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: palette.surfaceAlt,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 50,
  },
  addCategoryInput: {
    flex: 1,
    fontFamily: "Inter_500Medium",
    color: palette.foreground,
    fontSize: 15,
    paddingVertical: 0,
  },
  tipBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: palette.primarySoft,
    borderRadius: 14,
    padding: 12,
  },
  tipIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  tipTitle: {
    color: palette.foreground,
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
  },
  tipSub: {
    color: palette.mutedForeground,
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 2,
  },
  categoryCard: {
    backgroundColor: palette.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.border,
    overflow: "hidden",
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
  },
  categoryName: {
    flex: 1,
    fontFamily: "Inter_600SemiBold",
    color: palette.foreground,
    fontSize: 15,
  },
  countPill: {
    backgroundColor: palette.surfaceAlt,
    paddingHorizontal: 10,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  countPillText: {
    color: palette.mutedForeground,
    fontFamily: "Inter_500Medium",
    fontSize: 12,
  },
  iconBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: palette.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  itemsWrap: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    gap: 8,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surface,
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
  itemLabel: {
    flex: 1,
    color: palette.foreground,
    fontFamily: "Inter_500Medium",
    fontSize: 14,
  },
  itemLabelDone: {
    color: palette.mutedForeground,
    textDecorationLine: "line-through",
  },
  addItemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  addItemText: {
    color: palette.mutedForeground,
    fontFamily: "Inter_500Medium",
    fontSize: 14,
  },
  addItemInput: {
    flex: 1,
    color: palette.foreground,
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    paddingVertical: 0,
  },
});
