import { useContext, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { OnboardingContext } from "./_layout";
import { login } from "../src/api/auth";
import { Screen } from "../src/components/Screen";
import { saveSession } from "../src/storage/session";
import { saveUserName } from "../src/storage/userName";
import { colors } from "../src/theme/colors";

export default function OnboardingScreen() {
  const [loginValue, setLoginValue] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const completeOnboarding = useContext(OnboardingContext);

  const trimmedLogin = loginValue.trim();
  const trimmedName = name.trim();
  const canContinue = trimmedLogin.length > 0 && trimmedName.length > 0 && !submitting;

  const handleContinue = async () => {
    if (!canContinue) return;
    setSubmitting(true);
    setError(null);

    try {
      const session = await login(trimmedLogin);
      await saveSession(session);
      await saveUserName(trimmedName);
      completeOnboarding();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <Screen style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to Closy</Text>
        <Text style={styles.subtitle}>Let's get you set up</Text>

        <TextInput
          style={styles.input}
          value={loginValue}
          onChangeText={(value) => {
            setLoginValue(value);
            setError(null);
          }}
          placeholder="Login"
          placeholderTextColor={colors.inkMuted}
          maxLength={50}
          autoCapitalize="none"
          autoFocus
          returnKeyType="next"
        />

        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Your name"
          placeholderTextColor={colors.inkMuted}
          maxLength={50}
          returnKeyType="done"
          onSubmitEditing={handleContinue}
        />

        {error && <Text style={styles.errorText}>{error}</Text>}

        <Pressable
          style={[styles.button, !canContinue && styles.buttonDisabled]}
          onPress={handleContinue}
          disabled={!canContinue}
        >
          {submitting ? (
            <ActivityIndicator color={colors.inkPrimary} />
          ) : (
            <Text style={styles.buttonText}>Continue</Text>
          )}
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
    marginTop: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 16,
    color: colors.inkPrimary,
  },
  errorText: {
    marginTop: 12,
    fontSize: 13,
    color: colors.inkMuted,
    textAlign: "center",
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
