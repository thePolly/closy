import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Card } from "../../src/components/Card";
import { Screen } from "../../src/components/Screen";
import { clearUserName, getUserName, saveUserName } from "../../src/storage/userName";
import { colors } from "../../src/theme/colors";

export default function SettingsScreen() {
  const [name, setName] = useState("");
  const [storedName, setStoredName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      getUserName().then((value) => {
        if (!active) return;
        setStoredName(value);
        setName(value ?? "");
        setLoading(false);
      });
      return () => {
        active = false;
      };
    }, [])
  );

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setSaving(true);
    try {
      await saveUserName(trimmed);
      setStoredName(trimmed);
      setName(trimmed);
      setJustSaved(true);
    } finally {
      setSaving(false);
    }
  };

  const handleClear = async () => {
    setSaving(true);
    try {
      await clearUserName();
      setStoredName(null);
      setName("");
      setJustSaved(false);
    } finally {
      setSaving(false);
    }
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
        />
        <Text style={styles.hint}>Used to greet you on the Home screen.</Text>

        <View style={styles.actions}>
          {storedName && (
            <Pressable onPress={handleClear} disabled={saving} hitSlop={8}>
              <Text style={styles.clearText}>Clear</Text>
            </Pressable>
          )}
          <Pressable
            style={[styles.saveButton, (!name.trim() || saving) && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={!name.trim() || saving}
          >
            {saving ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <Text style={styles.saveButtonText}>Save</Text>
            )}
          </Pressable>
        </View>

        {justSaved && <Text style={styles.savedText}>Saved</Text>}
      </Card>
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
  actions: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 20,
  },
  clearText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.inkMuted,
  },
  saveButton: {
    height: 44,
    paddingHorizontal: 24,
    borderRadius: 22,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: colors.inkPrimary,
    fontWeight: "600",
  },
  savedText: {
    marginTop: 12,
    textAlign: "right",
    fontSize: 13,
    color: colors.inkSecondary,
  },
});
