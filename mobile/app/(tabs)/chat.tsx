import { useRef, useState } from "react";
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
import { type ChatMessage, sendChatMessage } from "../../src/api/chat";
import { Screen } from "../../src/components/Screen";

interface DisplayMessage extends ChatMessage {
  id: string;
}

let nextId = 0;
function createId(): string {
  nextId += 1;
  return `msg-${nextId}`;
}

export default function ChatScreen() {
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList>(null);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || sending) return;

    const history = messages.map(({ role, content }) => ({ role, content }));
    const userMessage: DisplayMessage = { id: createId(), role: "user", content: trimmed };

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setSending(true);

    try {
      const reply = await sendChatMessage(trimmed, history);
      setMessages((current) => [
        ...current,
        { id: createId(), role: "assistant", content: reply },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: createId(),
          role: "assistant",
          content:
            error instanceof Error
              ? `Sorry, something went wrong: ${error.message}`
              : "Sorry, something went wrong.",
        },
      ]);
    } finally {
      setSending(false);
      requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
    }
  };

  return (
    <Screen style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoiding}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={80}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              Ask your stylist anything, like "What should I wear today?"
            </Text>
          }
          renderItem={({ item }) => (
            <View
              style={[
                styles.bubble,
                item.role === "user" ? styles.userBubble : styles.assistantBubble,
              ]}
            >
              <Text
                style={
                  item.role === "user" ? styles.userBubbleText : styles.assistantBubbleText
                }
              >
                {item.content}
              </Text>
            </View>
          )}
        />
        {sending && <ActivityIndicator style={styles.typingIndicator} />}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Message your stylist..."
            placeholderTextColor="#8A8578"
            multiline
          />
          <Pressable
            style={[styles.sendButton, (!input.trim() || sending) && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!input.trim() || sending}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FDF6EC",
  },
  keyboardAvoiding: {
    flex: 1,
  },
  messageList: {
    padding: 16,
    flexGrow: 1,
  },
  emptyText: {
    marginTop: 80,
    textAlign: "center",
    color: "#8A8578",
    fontSize: 14,
    paddingHorizontal: 32,
  },
  bubble: {
    maxWidth: "80%",
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#2C2A26",
  },
  assistantBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#EFE6D8",
  },
  userBubbleText: {
    color: "#FDF6EC",
  },
  assistantBubbleText: {
    color: "#2C2A26",
  },
  typingIndicator: {
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 12,
    gap: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E0D5C2",
    backgroundColor: "#FDF6EC",
  },
  input: {
    flex: 1,
    maxHeight: 100,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#EFE6D8",
    color: "#2C2A26",
  },
  sendButton: {
    height: 40,
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: "#D9A441",
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: "#2C2A26",
    fontWeight: "600",
  },
});
