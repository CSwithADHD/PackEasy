import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { palette } from "@/constants/colors";
import { useTrips } from "@/context/TripContext";
import {
  buildRoamSystemPrompt,
  sendGroqChat,
  type GroqChatMessage,
} from "@/lib/groq";

type ChatItem = GroqChatMessage & { id: string };

const SUGGESTIONS = [
  "What should I pack for this trip?",
  "Make me a last-minute travel checklist.",
  "Suggest a 3-day itinerary.",
  "What are the most important documents to bring?",
];

function bubbleStyle(role: ChatItem["role"]) {
  return role === "user" ? styles.userBubble : styles.assistantBubble;
}

function textStyle(role: ChatItem["role"]) {
  return role === "user" ? styles.userText : styles.assistantText;
}

export default function RoamScreen() {
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<ChatItem> | null>(null);
  const { currentTrip } = useTrips();
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatItem[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "I’m Mr. Roam. Ask me about packing lists, travel plans, docs, or what to do next before you leave.",
    },
  ]);

  const tripSummary = useMemo(() => {
    if (!currentTrip) {
      return "No trip selected. I’ll keep things general until you pick a destination.";
    }

    return `${currentTrip.emoji ? `${currentTrip.emoji} ` : ""}${currentTrip.destination}${currentTrip.country ? `, ${currentTrip.country}` : ""}`;
  }, [currentTrip]);

  useEffect(() => {
    listRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const chatPayload = (nextMessages: ChatItem[]): GroqChatMessage[] => [
    { role: "system", content: buildRoamSystemPrompt(currentTrip ?? null) },
    ...nextMessages.slice(-12).map(({ role, content }) => ({ role, content })),
  ];

  const handleSend = async (overrideText?: string) => {
    const text = (overrideText ?? input).trim();
    if (!text || sending) return;

    const userMessage: ChatItem = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setError(null);
    setSending(true);

    try {
      await Haptics.selectionAsync();
      const reply = await sendGroqChat(chatPayload(nextMessages));
      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: reply,
        },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Mr. Roam is unavailable right now.");
    } finally {
      setSending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
      style={styles.root}
    >
      <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <ScreenHeader title="Mr. Roam" />

        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={[styles.bubble, bubbleStyle(item.role)]}>
              <Text style={[styles.messageText, textStyle(item.role)]}>{item.content}</Text>
            </View>
          )}
          ListHeaderComponent={
            <View style={styles.heroWrap}>
              <LinearGradient
                colors={["#123A46", "#1AA8C4", "#E3F4F8"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.hero}
              >
                <View style={styles.heroBadge}>
                  <Feather name="compass" size={14} color="#fff" />
                  <Text style={styles.heroBadgeText}>Travel guide</Text>
                </View>
                <Text style={styles.heroTitle}>Mr. Roam</Text>
                <Text style={styles.heroCopy}>
                  Your travel co-pilot for packing, planning, and last-minute trip decisions.
                </Text>
                <Text style={styles.tripText}>{tripSummary}</Text>
              </LinearGradient>

              <View style={styles.suggestionGrid}>
                {SUGGESTIONS.map((suggestion) => (
                  <Pressable
                    key={suggestion}
                    onPress={() => void handleSend(suggestion)}
                    style={styles.suggestionChip}
                  >
                    <Text style={styles.suggestionText}>{suggestion}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          }
          ListFooterComponent={
            sending ? (
              <View style={[styles.bubble, styles.assistantBubble, styles.typingBubble]}>
                <ActivityIndicator size="small" color={palette.primary} />
                <Text style={styles.typingText}>Mr. Roam is thinking…</Text>
              </View>
            ) : null
          }
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={[styles.composer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask Mr. Roam about your trip…"
            placeholderTextColor={palette.mutedForeground}
            style={styles.input}
            multiline
            onSubmitEditing={() => void handleSend()}
            returnKeyType="send"
          />
          <Pressable
            onPress={() => void handleSend()}
            disabled={sending || !input.trim()}
            style={({ pressed }) => [
              styles.sendBtn,
              (sending || !input.trim()) && styles.sendBtnDisabled,
              pressed && !sending && input.trim() ? styles.sendBtnPressed : null,
            ]}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Feather name="send" size={16} color="#fff" />
            )}
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.background,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  heroWrap: {
    gap: 12,
    paddingTop: 4,
  },
  hero: {
    borderRadius: 28,
    padding: 20,
    gap: 12,
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.18)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  heroBadgeText: {
    color: "#fff",
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    letterSpacing: 0.2,
  },
  heroTitle: {
    color: "#fff",
    fontFamily: "Inter_700Bold",
    fontSize: 30,
    letterSpacing: -0.4,
  },
  heroCopy: {
    color: "rgba(255,255,255,0.9)",
    fontFamily: "Inter_500Medium",
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 300,
  },
  tripText: {
    color: "#fff",
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    opacity: 0.95,
  },
  suggestionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  suggestionChip: {
    flexGrow: 1,
    minWidth: "48%",
    borderRadius: 18,
    backgroundColor: palette.surfaceAlt,
    borderWidth: 1,
    borderColor: palette.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  suggestionText: {
    color: palette.foreground,
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    lineHeight: 18,
  },
  bubble: {
    maxWidth: "88%",
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  assistantBubble: {
    alignSelf: "flex-start",
    backgroundColor: palette.surfaceAlt,
    borderTopLeftRadius: 8,
    borderWidth: 1,
    borderColor: palette.border,
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: palette.primary,
    borderTopRightRadius: 8,
  },
  messageText: {
    fontFamily: "Inter_500Medium",
    fontSize: 15,
    lineHeight: 21,
  },
  assistantText: {
    color: palette.foreground,
  },
  userText: {
    color: "#fff",
  },
  typingBubble: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  typingText: {
    color: palette.mutedForeground,
    fontFamily: "Inter_500Medium",
    fontSize: 13,
  },
  errorText: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    color: palette.destructive,
    fontFamily: "Inter_500Medium",
    fontSize: 13,
  },
  composer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: palette.border,
    backgroundColor: palette.background,
  },
  input: {
    flex: 1,
    minHeight: 54,
    maxHeight: 120,
    borderRadius: 18,
    backgroundColor: palette.surfaceAlt,
    borderWidth: 1,
    borderColor: palette.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: palette.foreground,
    fontFamily: "Inter_500Medium",
    fontSize: 15,
  },
  sendBtn: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: palette.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnDisabled: {
    opacity: 0.45,
  },
  sendBtnPressed: {
    transform: [{ scale: 0.98 }],
  },
});