import React from "react";
import {
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  title: string;
  children: React.ReactNode;
  footer: React.ReactNode;
};

export function AuthShell({ title, children, footer }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <ImageBackground
      source={require("../../assets/images/bg.jpg")}
      style={styles.bg}
      resizeMode="cover"
    >
      <View style={styles.scrim} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            {
              paddingTop: insets.top + 24,
              paddingBottom: insets.bottom + 24,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>{title}</Text>

          <View style={styles.formArea}>{children}</View>

          <View style={styles.footerArea}>{footer}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: "#0e1a24",
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(8,12,18,0.55)",
  },
  scroll: {
    paddingHorizontal: 24,
    gap: 28,
    flexGrow: 1,
  },
  title: {
    color: "#ffffff",
    fontFamily: "Inter_700Bold",
    fontSize: 30,
    textAlign: "center",
    marginTop: 24,
  },
  formArea: {
    gap: 18,
  },
  footerArea: {
    gap: 22,
    marginTop: "auto",
  },
});
