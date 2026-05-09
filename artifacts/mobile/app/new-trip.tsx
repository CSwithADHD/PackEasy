import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Linking,
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
import { getSpotsForCity, Spot } from "@/constants/spots";
import {
  airbnbUrl,
  Attraction,
  bookingUrl,
  fetchAttractions,
  geocodeCity,
  googleFlightsUrl,
  skyscannerUrl,
} from "@/lib/travel-api";
import { useTrips } from "@/context/TripContext";

type TravelInfo = {
  attractions: Attraction[];
  staticSpots: Spot[];
};

export default function NewTripScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { createTrip } = useTrips();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<SuggestedCity | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [loadingInfo, setLoadingInfo] = useState(false);
  const [travelInfo, setTravelInfo] = useState<TravelInfo | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SUGGESTED_CITIES.slice(0, 6);
    return SUGGESTED_CITIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q),
    );
  }, [query]);

  useEffect(() => {
    if (!selected) {
      setTravelInfo(null);
      return;
    }

    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setLoadingInfo(true);
    setTravelInfo(null);

    const destination = `${selected.name}, ${selected.country}`;

    (async () => {
      try {
        const geo = await geocodeCity(destination, ctrl.signal);
        let attractions: Attraction[] = [];
        if (geo) {
          attractions = await fetchAttractions(geo.lat, geo.lon, ctrl.signal);
        }
        const staticSpots = getSpotsForCity(selected.name);
        setTravelInfo({ attractions, staticSpots });
      } catch (e: unknown) {
        if (e instanceof Error && e.name === "AbortError") return;
        setTravelInfo({ attractions: [], staticSpots: getSpotsForCity(selected.name) });
      } finally {
        setLoadingInfo(false);
      }
    })();

    return () => ctrl.abort();
  }, [selected]);

  const canStart = (selected?.name?.length ?? 0) > 0 || query.trim().length > 1;
  const destination = selected?.name ?? query.trim();

  const handleStart = async () => {
    if (!destination || submitting) return;
    setSubmitting(true);
    try {
      await createTrip({
        destination,
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

  const openUrl = (url: string) => Linking.openURL(url).catch(() => {});

  const placesToShow: Array<{ name: string; desc: string; emoji: string }> =
    travelInfo
      ? travelInfo.attractions.length > 0
        ? travelInfo.attractions.map((a) => ({
            name: a.name,
            desc: a.kind.charAt(0).toUpperCase() + a.kind.slice(1).replace(/_/g, " "),
            emoji: a.emoji,
          }))
        : travelInfo.staticSpots.map((s) => ({
            name: s.name,
            desc: s.description,
            emoji: s.icon,
          }))
      : [];

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

          {selected ? (
            loadingInfo ? (
              <View style={styles.loadingWrap}>
                <ActivityIndicator color={palette.primary} />
                <Text style={styles.loadingText}>Loading travel info…</Text>
              </View>
            ) : (
              <View style={{ gap: 20 }}>

                {/* FLIGHTS */}
                <View style={{ gap: 10 }}>
                  <Text style={styles.sectionLabel}>✈️  Flights</Text>
                  <View style={styles.infoCard}>
                    <View style={styles.infoCardRow}>
                      <View style={styles.infoIconBg}>
                        <Text style={{ fontSize: 20 }}>🛫</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.infoCardTitle}>Find flights to {selected.name}</Text>
                        <Text style={styles.infoCardSub}>Compare prices across airlines</Text>
                      </View>
                    </View>
                    <View style={styles.linkBtnRow}>
                      <Pressable
                        style={[styles.linkBtn, styles.linkBtnPrimary]}
                        onPress={() => openUrl(googleFlightsUrl(selected.name))}
                      >
                        <Text style={styles.linkBtnPrimaryText}>Google Flights</Text>
                        <Feather name="external-link" size={13} color="#fff" />
                      </Pressable>
                      <Pressable
                        style={styles.linkBtn}
                        onPress={() => openUrl(skyscannerUrl(selected.name))}
                      >
                        <Text style={styles.linkBtnText}>Skyscanner</Text>
                        <Feather name="external-link" size={13} color={palette.primary} />
                      </Pressable>
                    </View>
                  </View>
                </View>

                {/* HOTELS */}
                <View style={{ gap: 10 }}>
                  <Text style={styles.sectionLabel}>🏨  Hotels</Text>
                  <View style={styles.infoCard}>
                    <View style={styles.infoCardRow}>
                      <View style={styles.infoIconBg}>
                        <Text style={{ fontSize: 20 }}>🛏️</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.infoCardTitle}>Places to stay in {selected.name}</Text>
                        <Text style={styles.infoCardSub}>Hotels, apartments & more</Text>
                      </View>
                    </View>
                    <View style={styles.linkBtnRow}>
                      <Pressable
                        style={[styles.linkBtn, styles.linkBtnPrimary]}
                        onPress={() => openUrl(bookingUrl(selected.name))}
                      >
                        <Text style={styles.linkBtnPrimaryText}>Booking.com</Text>
                        <Feather name="external-link" size={13} color="#fff" />
                      </Pressable>
                      <Pressable
                        style={styles.linkBtn}
                        onPress={() => openUrl(airbnbUrl(selected.name))}
                      >
                        <Text style={styles.linkBtnText}>Airbnb</Text>
                        <Feather name="external-link" size={13} color={palette.primary} />
                      </Pressable>
                    </View>
                  </View>
                </View>

                {/* PLACES TO VISIT */}
                {placesToShow.length > 0 ? (
                  <View style={{ gap: 10 }}>
                    <View style={styles.placesHeader}>
                      <Text style={styles.sectionLabel}>🗺️  Places to visit</Text>
                      {travelInfo && travelInfo.attractions.length > 0 ? (
                        <View style={styles.liveTag}>
                          <View style={styles.liveDot} />
                          <Text style={styles.liveText}>Live</Text>
                        </View>
                      ) : null}
                    </View>
                    {placesToShow.map((p) => (
                      <View key={p.name} style={styles.placeCard}>
                        <Text style={styles.placeEmoji}>{p.emoji}</Text>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.placeName}>{p.name}</Text>
                          <Text style={styles.placeDesc}>{p.desc}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                ) : null}
              </View>
            )
          ) : null}
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
  loadingWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 32,
  },
  loadingText: {
    color: palette.mutedForeground,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
  },
  infoCard: {
    backgroundColor: palette.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 14,
    gap: 14,
  },
  infoCardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  infoIconBg: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: palette.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  infoCardTitle: {
    color: palette.foreground,
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  infoCardSub: {
    color: palette.mutedForeground,
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 2,
  },
  linkBtnRow: {
    flexDirection: "row",
    gap: 8,
  },
  linkBtn: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: palette.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  linkBtnPrimary: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
  },
  linkBtnPrimaryText: {
    color: "#fff",
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
  },
  linkBtnText: {
    color: palette.primary,
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
  },
  placesHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  liveTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#0f5132",
    paddingHorizontal: 8,
    height: 20,
    borderRadius: 10,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#4caf81",
  },
  liveText: {
    color: "#4caf81",
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
  },
  placeCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: palette.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 12,
  },
  placeEmoji: {
    fontSize: 24,
    width: 38,
    textAlign: "center",
  },
  placeName: {
    color: palette.foreground,
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  placeDesc: {
    color: palette.mutedForeground,
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 2,
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
