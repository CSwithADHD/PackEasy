import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";

type Props = TextInputProps & {
  label: string;
  isPassword?: boolean;
};

export function AuthInput({ label, isPassword, style, ...rest }: Props) {
  const [hidden, setHidden] = useState(!!isPassword);

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.field}>
        <TextInput
          {...rest}
          secureTextEntry={isPassword ? hidden : false}
          placeholderTextColor="rgba(255,255,255,0.55)"
          style={[styles.input, style]}
        />
        {isPassword ? (
          <Pressable
            onPress={() => setHidden((h) => !h)}
            hitSlop={8}
            style={styles.eyeBtn}
          >
            <Feather
              name={hidden ? "eye-off" : "eye"}
              size={18}
              color="rgba(255,255,255,0.7)"
            />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
  },
  label: {
    color: "#ffffff",
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  field: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 8,
    paddingHorizontal: 14,
    height: 48,
  },
  input: {
    flex: 1,
    color: "#ffffff",
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    paddingVertical: 0,
  },
  eyeBtn: {
    paddingLeft: 8,
  },
});
