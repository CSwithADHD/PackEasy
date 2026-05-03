import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AuthProvider, useAuth } from "@/context/AuthContext";
import { TripProvider } from "@/context/TripContext";

SplashScreen.preventAutoHideAsync().catch(() => {});

const queryClient = new QueryClient();

const PROTECTED_PREFIXES = ["(tabs)", "new-trip", "smart-list"];

function AuthGate() {
  const { token, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;
    const top = segments[0] ?? "";
    const inProtected = PROTECTED_PREFIXES.some((p) => top === p);
    const inAuth = top === "(auth)" || top === "";
    if (token && inAuth) {
      router.replace("/(tabs)");
    } else if (!token && inProtected) {
      router.replace("/(auth)/login");
    }
  }, [loading, token, segments, router]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="smart-list"
        options={{ presentation: "transparentModal", animation: "fade" }}
      />
    </Stack>
  );
}

function KeyboardWrapper({ children }: { children: React.ReactNode }) {
  if (Platform.OS === "web") return <>{children}</>;
  try {
    const { KeyboardProvider } = require("react-native-keyboard-controller");
    return <KeyboardProvider>{children}</KeyboardProvider>;
  } catch {
    return <>{children}</>;
  }
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const [timedOut, setTimedOut] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => setTimedOut(true), 2500);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const ready = fontsLoaded || !!fontError || timedOut;

  useEffect(() => {
    if (ready) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [ready]);

  if (!ready) return null;

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TripProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <KeyboardWrapper>
                <AuthGate />
              </KeyboardWrapper>
            </GestureHandlerRootView>
          </TripProvider>
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
