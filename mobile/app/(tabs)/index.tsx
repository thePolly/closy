import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Card } from "../../src/components/Card";
import { Screen } from "../../src/components/Screen";
import { getUserName } from "../../src/storage/userName";
import { colors } from "../../src/theme/colors";

function getGreeting(name: string | null): string {
  const hour = new Date().getHours();
  const timeOfDay =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  return name ? `${timeOfDay}, ${name}!` : `${timeOfDay}!`;
}

export default function HomeScreen() {
  const [userName, setUserName] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      getUserName().then((value) => {
        if (active) setUserName(value);
      });
      return () => {
        active = false;
      };
    }, [])
  );

  return (
    <Screen style={styles.container}>
      <Text style={styles.greeting}>{getGreeting(userName)}</Text>
      <Text style={styles.subtitle}>Here's your look for today</Text>

      <Card style={styles.card}>
        <Text style={styles.cardLabel}>Today</Text>

        <View style={styles.placeholderImage}>
          <Ionicons name="shirt-outline" size={48} color={colors.accent} />
        </View>

        <Text style={styles.outfitTitle}>White shirt + jeans</Text>
        <Text style={styles.outfitDescription}>
          Simple, comfortable, and easy to style.
        </Text>
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
  greeting: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 26,
    color: colors.inkPrimary,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: colors.inkSecondary,
  },
  card: {
    marginTop: 24,
  },
  cardLabel: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 18,
    color: colors.inkPrimary,
  },
  placeholderImage: {
    marginTop: 16,
    height: 180,
    borderRadius: 12,
    backgroundColor: colors.accentSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  outfitTitle: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "600",
    color: colors.inkPrimary,
  },
  outfitDescription: {
    marginTop: 4,
    fontSize: 14,
    color: colors.inkSecondary,
  },
});
