import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  Image,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <ImageBackground
        source={require("../assets/images/bg.jpg")}
        style={styles.bg}
        resizeMode="cover"
      >
        <LinearGradient
          colors={["rgba(0,0,0,0.15)", "rgba(0,0,0,0)", "rgba(0,0,0,0.55)"]}
          locations={[0, 0.45, 1]}
          style={StyleSheet.absoluteFill}
        />

        <View style={[styles.logoWrap, { paddingTop: insets.top + 24 }]}>
          <Image
            source={require("../assets/images/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <View style={[styles.bottom, { paddingBottom: insets.bottom + 24 }]}>
          <Text style={styles.headline}>Travel Light{"\n"}Pack Easy!</Text>
          <Pressable
            onPress={() => router.push("/onboarding")}
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.buttonText}>Explore</Text>
          </Pressable>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0e2a3d",
  },
  bg: {
    flex: 1,
    justifyContent: "space-between",
  },
  logoWrap: {
    paddingHorizontal: 24,
    alignItems: "center",
  },
  logo: {
    width: 320,
    height: 96,
  },
  bottom: {
    paddingHorizontal: 24,
    gap: 20,
  },
  headline: {
    color: "#ffffff",
    fontFamily: "Inter_700Bold",
    fontSize: 36,
    lineHeight: 42,
    letterSpacing: -0.5,
  },
  button: {
    backgroundColor: "#22c46a",
    borderRadius: 32,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  buttonText: {
    color: "#ffffff",
    fontFamily: "Inter_600SemiBold",
    fontSize: 17,
    letterSpacing: 0.2,
  },
});
