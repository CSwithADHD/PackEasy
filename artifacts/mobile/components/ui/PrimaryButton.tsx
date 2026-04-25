import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from "react-native";

import { palette } from "@/constants/colors";

type Variant = "primary" | "outline" | "ghost";

type Props = {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  icon?: React.ReactNode;
};

export function PrimaryButton({
  label,
  onPress,
  variant = "primary",
  disabled,
  loading,
  style,
  icon,
}: Props) {
  const isPrimary = variant === "primary";
  const isOutline = variant === "outline";

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        isPrimary && styles.primary,
        isOutline && styles.outline,
        variant === "ghost" && styles.ghost,
        (disabled || loading) && { opacity: 0.6 },
        pressed && { transform: [{ scale: 0.99 }], opacity: 0.92 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? "#fff" : palette.primary} />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.label,
              isPrimary && { color: "#fff" },
              !isPrimary && { color: palette.foreground },
            ]}
          >
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 20,
  },
  primary: {
    backgroundColor: palette.primary,
  },
  outline: {
    borderWidth: 1.5,
    borderColor: palette.border,
    backgroundColor: palette.surface,
  },
  ghost: {
    backgroundColor: "transparent",
  },
  label: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
});
