import { useContext, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { OnboardingContext } from "./_layout";
import { Screen } from "../src/components/Screen";
import { saveUserName } from "../src/storage/userName";
import { colors } from "../src/theme/colors";

export default function OnboardingScreen() {
  const [name, setName] = useState("");
  const completeOnboarding = useContext(OnboardingContext);

  const trimmed = name.trim();

  const handleContinue = async () => {
    if (!trimmed) return;
    await saveUserName(trimmed);
    completeOnboarding();
  };

  return (
    <Screen style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to Closy</Text>
        <Text style={styles.subtitle}>What should we call you?</Text>

        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Your name"
          placeholderTextColor={colors.inkMuted}
          maxLength={50}
          autoFocus
          returnKeyType="done"
          onSubmitEditing={handleContinue}
        />

        <Pressable
          style={[styles.button, !trimmed && styles.buttonDisabled]}
          onPress={handleContinue}
          disabled={!trimmed}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 24,
  },
  content: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 28,
    color: colors.inkPrimary,
    textAlign: "center",
  },
  subtitle: {
    marginTop: 8,
    fontSize: 15,
    color: colors.inkSecondary,
    textAlign: "center",
  },
  input: {
    marginTop: 32,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 16,
    color: colors.inkPrimary,
  },
  button: {
    marginTop: 16,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: colors.inkPrimary,
    fontWeight: "600",
    fontSize: 16,
  },
});
