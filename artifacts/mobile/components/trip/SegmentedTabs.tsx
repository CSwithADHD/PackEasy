import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { palette } from "@/constants/colors";

type Props = {
  options: string[];
  value: string;
  onChange: (v: string) => void;
};

export function SegmentedTabs({ options, value, onChange }: Props) {
  return (
    <View style={styles.row}>
      {options.map((opt) => {
        const active = opt === value;
        return (
          <Pressable
            key={opt}
            onPress={() => onChange(opt)}
            style={styles.itemWrap}
          >
            <Text style={[styles.label, active && styles.labelActive]}>
              {opt}
            </Text>
            <View style={[styles.bar, active && styles.barActive]} />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 8,
  },
  itemWrap: {
    flex: 1,
    alignItems: "center",
    paddingTop: 6,
    gap: 8,
  },
  label: {
    color: palette.mutedForeground,
    fontFamily: "Inter_500Medium",
    fontSize: 15,
  },
  labelActive: {
    color: palette.primary,
    fontFamily: "Inter_600SemiBold",
  },
  bar: {
    width: "100%",
    height: 2,
    backgroundColor: palette.border,
  },
  barActive: {
    backgroundColor: palette.primary,
  },
});
