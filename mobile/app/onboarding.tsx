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

type Step = "login" | "name";

export default function OnboardingScreen() {
  const [step, setStep] = useState<Step>("login");
  const [loginValue, setLoginValue] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const completeOnboarding = useContext(OnboardingContext);

  const trimmedLogin = loginValue.trim();
  const trimmedName = name.trim();

  const handleLoginSubmit = async () => {
    if (!trimmedLogin || submitting) return;
    setSubmitting(true);
    setError(null);

    try {
      const result = await login(trimmedLogin);
      await saveSession({ id: result.id, login: result.login });

      if (result.isNew) {
        setStep("name");
        setSubmitting(false);
      } else {
        completeOnboarding();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  const handleNameSubmit = async () => {
    if (!trimmedName || submitting) return;
    setSubmitting(true);
    await saveUserName(trimmedName);
    completeOnboarding();
  };

  return (
    <Screen style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to Closy</Text>

        {step === "login" ? (
          <>
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
              returnKeyType="done"
              onSubmitEditing={handleLoginSubmit}
            />

            {error && <Text style={styles.errorText}>{error}</Text>}

            <Pressable
              style={[styles.button, (!trimmedLogin || submitting) && styles.buttonDisabled]}
              onPress={handleLoginSubmit}
              disabled={!trimmedLogin || submitting}
            >
              {submitting ? (
                <ActivityIndicator color={colors.inkPrimary} />
              ) : (
                <Text style={styles.buttonText}>Continue</Text>
              )}
            </Pressable>
          </>
        ) : (
          <>
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
              onSubmitEditing={handleNameSubmit}
            />

            <Pressable
              style={[styles.button, (!trimmedName || submitting) && styles.buttonDisabled]}
              onPress={handleNameSubmit}
              disabled={!trimmedName || submitting}
            >
              {submitting ? (
                <ActivityIndicator color={colors.inkPrimary} />
              ) : (
                <Text style={styles.buttonText}>Continue</Text>
              )}
            </Pressable>
          </>
        )}
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
