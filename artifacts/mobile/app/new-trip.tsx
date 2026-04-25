import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Alert } from "react-native";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { SUGGESTED_CITIES, SuggestedCity } from "@/constants/cities";
import { palette } from "@/constants/colors";
import { useTrips } from "@/context/TripContext";

export default function NewTripScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { createTrip } = useTrips();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<SuggestedCity | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SUGGESTED_CITIES.slice(0, 6);
    return SUGGESTED_CITIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q),
    );
  }, [query]);

  const canStart = (selected?.name?.length ?? 0) > 0 || query.trim().length > 1;

  const [submitting, setSubmitting] = useState(false);
  const handleStart = async () => {
    const dest = selected?.name ?? query.trim();
    if (!dest || submitting) return;
    setSubmitting(true);
    try {
      await createTrip({
        destination: dest,
        country: selected?.country,
        emoji: selected?.emoji,
      });
      router.replace("/smart-list");
    } catch (err) {
      Alert.alert(
        "Couldn't create trip",
        err instanceof Error ? err.message : "Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScreenHeader showBack />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingBottom: insets.bottom + 200,
            gap: 22,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={{ gap: 8, marginTop: 8 }}>
            <Text style={styles.title}>Where are you traveling?</Text>
            <Text style={styles.subtitle}>
              Enter your destination for personalized suggestions
            </Text>
          </View>

          <View style={styles.searchRow}>
            <Feather name="search" size={18} color={palette.mutedForeground} />
            <TextInput
              value={query}
              onChangeText={(t) => {
                setQuery(t);
                setSelected(null);
              }}
              placeholder="Destination"
              placeholderTextColor={palette.mutedForeground}
              style={styles.searchInput}
              autoCapitalize="words"
            />
          </View>

          <View style={{ gap: 10 }}>
            <Text style={styles.sectionLabel}>Suggested for you</Text>
            <View style={{ gap: 8 }}>
              {filtered.map((c) => {
                const active = selected?.name === c.name;
                return (
                  <Pressable
                    key={c.name}
                    onPress={() => {
                      setSelected(c);
                      setQuery(c.name);
                    }}
                    style={[styles.suggestion, active && styles.suggestionActive]}
                  >
                    <View style={styles.suggestionEmoji}>
                      <Text style={{ fontSize: 20 }}>{c.emoji}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.suggestionName}>{c.name}</Text>
                      <Text style={styles.suggestionCountry}>{c.country}</Text>
                    </View>
                    {active ? (
                      <Feather name="check" size={18} color={palette.primary} />
                    ) : (
                      <Feather name="chevron-right" size={18} color={palette.mutedForeground} />
                    )}
                  </Pressable>
                );
              })}
              {filtered.length === 0 ? (
                <Text style={styles.noResults}>
                  No matches — tap "Start Packing" to use "{query}"
                </Text>
              ) : null}
            </View>
          </View>
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
          <PrimaryButton
            label={submitting ? "Creating..." : "Start Packing"}
            onPress={handleStart}
            disabled={!canStart || submitting}
          />
          <PrimaryButton
            label="Join a shared trip"
            variant="outline"
            icon={<Feather name="users" size={16} color={palette.foreground} />}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.background },
  title: {
    color: palette.foreground,
    fontFamily: "Inter_700Bold",
    fontSize: 26,
  },
  subtitle: {
    color: palette.mutedForeground,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: palette.surfaceAlt,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 54,
  },
  searchInput: {
    flex: 1,
    color: palette.foreground,
    fontFamily: "Inter_500Medium",
    fontSize: 15,
    paddingVertical: 0,
  },
  sectionLabel: {
    color: palette.mutedForeground,
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  suggestion: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surface,
  },
  suggestionActive: {
    borderColor: palette.primary,
    backgroundColor: palette.primarySoft,
  },
  suggestionEmoji: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: palette.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  suggestionName: {
    color: palette.foreground,
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
  suggestionCountry: {
    color: palette.mutedForeground,
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 2,
  },
  noResults: {
    color: palette.mutedForeground,
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    textAlign: "center",
    paddingVertical: 16,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    gap: 10,
    backgroundColor: palette.background,
    borderTopWidth: 1,
    borderTopColor: palette.border,
  },
});
