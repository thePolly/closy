import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import {
  type Profile,
  fetchProfile,
  parseStylePreferences,
  updateProfile,
} from "../../src/api/profile";
import { Card } from "../../src/components/Card";
import { MultiOptionPicker } from "../../src/components/MultiOptionPicker";
import { OptionPicker } from "../../src/components/OptionPicker";
import { Screen } from "../../src/components/Screen";
import { AGE_GROUPS, STYLE_PREFERENCES } from "../../src/constants/profile";
import { clearUserName, getUserName, saveUserName } from "../../src/storage/userName";
import { colors } from "../../src/theme/colors";

export default function SettingsScreen() {
  const [name, setName] = useState("");
  const [storedName, setStoredName] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [justSaved, setJustSaved] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      Promise.all([getUserName(), fetchProfile().catch(() => null)]).then(
        ([nameValue, profileValue]) => {
          if (!active) return;
          setStoredName(nameValue);
          setName(nameValue ?? "");
          setProfile(profileValue);
          setProfileError(profileValue ? null : "Couldn't load your profile.");
          setLoading(false);
        }
      );
      return () => {
        active = false;
      };
    }, [])
  );

  // Selecting a pill saves immediately — optimistic update, reverted on failure.
  const handleUpdateAgeGroup = async (age_group: string) => {
    if (!profile) return;
    const previous = profile;
    setProfile({ ...profile, age_group });
    try {
      setProfile(await updateProfile({ age_group }));
      setProfileError(null);
    } catch (error) {
      setProfile(previous);
      setProfileError(error instanceof Error ? error.message : "Couldn't save. Please try again.");
    }
  };

  const handleUpdateStylePreferences = async (stylePreferences: string[]) => {
    if (!profile) return;
    const previous = profile;
    setProfile({ ...profile, style_preference: stylePreferences.join(", ") });
    try {
      setProfile(await updateProfile({ style_preferences: stylePreferences }));
      setProfileError(null);
    } catch (error) {
      setProfile(previous);
      setProfileError(error instanceof Error ? error.message : "Couldn't save. Please try again.");
    }
  };

  // Dismisses the keyboard and persists the name in the same tap: saves a
  // trimmed non-empty value, or clears the stored name if the field was
  // emptied out. No-ops if nothing actually changed.
  const handleDismissAndSave = async () => {
    Keyboard.dismiss();
    const trimmed = name.trim();
    if (trimmed === (storedName ?? "")) return;

    if (trimmed) {
      await saveUserName(trimmed);
      setStoredName(trimmed);
      setName(trimmed);
    } else {
      await clearUserName();
      setStoredName(null);
    }
    setJustSaved(true);
  };

  if (loading) {
    return (
      <Screen style={styles.centered}>
        <ActivityIndicator />
      </Screen>
    );
  }

  return (
    <Screen style={styles.container}>
      <TouchableWithoutFeedback onPress={handleDismissAndSave} accessible={false}>
        <View style={styles.content}>
          <Text style={styles.title}>Settings</Text>

          <Card style={styles.card}>
            <Text style={styles.label}>Your name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={(value) => {
                setName(value);
                setJustSaved(false);
              }}
              placeholder="What should Closy call you?"
              placeholderTextColor={colors.inkMuted}
              maxLength={50}
              returnKeyType="done"
              onSubmitEditing={handleDismissAndSave}
            />
            <Text style={styles.hint}>
              Used to greet you on the Home screen. Tap anywhere outside to save.
            </Text>

            {justSaved && <Text style={styles.savedText}>Saved</Text>}
          </Card>

          <Card style={styles.card}>
            <Text style={styles.label}>Age group</Text>
            <OptionPicker
              options={AGE_GROUPS}
              value={profile?.age_group ?? null}
              onChange={handleUpdateAgeGroup}
            />

            <Text style={[styles.label, styles.secondLabel]}>Style preference</Text>
            <MultiOptionPicker
              options={STYLE_PREFERENCES}
              values={parseStylePreferences(profile?.style_preference ?? null)}
              onChange={handleUpdateStylePreferences}
            />

            <Text style={styles.hint}>Helps Closy tailor outfit recommendations to you.</Text>
            {profileError && <Text style={styles.errorText}>{profileError}</Text>}
          </Card>
        </View>
      </TouchableWithoutFeedback>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  // Fills the screen so a tap on empty space (not just on the card)
  // still dismisses the keyboard and saves.
  content: {
    flex: 1,
  },
  centered: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 26,
    color: colors.inkPrimary,
  },
  card: {
    marginTop: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.inkPrimary,
  },
  secondLabel: {
    marginTop: 16,
  },
  errorText: {
    marginTop: 12,
    fontSize: 13,
    color: "#B3261E",
  },
  input: {
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 16,
    color: colors.inkPrimary,
  },
  hint: {
    marginTop: 8,
    fontSize: 12,
    color: colors.inkMuted,
  },
  savedText: {
    marginTop: 12,
    textAlign: "right",
    fontSize: 13,
    color: colors.inkSecondary,
  },
});
