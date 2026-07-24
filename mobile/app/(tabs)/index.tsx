import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import * as Location from "expo-location";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { fetchCurrentWeather, type CurrentWeather } from "../../src/api/weather";
import {
  displayName,
  fetchOutfitRecommendation,
  type OutfitRecommendation,
} from "../../src/api/wardrobe";
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

function getDayType(): "Workday" | "Weekend" {
  const day = new Date().getDay();
  return day === 0 || day === 6 ? "Weekend" : "Workday";
}

type WeatherState =
  | { status: "loading" }
  | { status: "ready"; data: CurrentWeather }
  | { status: "denied" }
  | { status: "error" };

type OutfitState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; data: OutfitRecommendation }
  | { status: "error" };

export default function HomeScreen() {
  const router = useRouter();
  const [userName, setUserName] = useState<string | null>(null);
  const [weather, setWeather] = useState<WeatherState>({ status: "loading" });
  const [outfit, setOutfit] = useState<OutfitState>({ status: "idle" });

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

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setWeather({ status: "loading" });

      (async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (!active) return;
        if (status !== "granted") {
          setWeather({ status: "denied" });
          return;
        }

        try {
          const location = await Location.getCurrentPositionAsync({});
          const data = await fetchCurrentWeather(
            location.coords.latitude,
            location.coords.longitude
          );
          if (active) setWeather({ status: "ready", data });
        } catch {
          if (active) setWeather({ status: "error" });
        }
      })();

      return () => {
        active = false;
      };
    }, [])
  );

  const handleGenerateOutfit = async () => {
    setOutfit({ status: "loading" });
    try {
      const weatherPayload =
        weather.status === "ready"
          ? { temperature: weather.data.temperature, condition: weather.data.condition }
          : null;
      const data = await fetchOutfitRecommendation(weatherPayload);
      setOutfit({ status: "ready", data });
    } catch {
      setOutfit({ status: "error" });
    }
  };

  return (
    <Screen style={styles.container}>
      <Text style={styles.greeting}>{getGreeting(userName)}</Text>
      <Text style={styles.subtitle}>Here's your look for today</Text>

      <Card style={styles.card}>
        <Text style={styles.cardLabel}>Today</Text>

        <View style={styles.todayRow}>
          {weather.status === "ready" && (
            <View style={styles.weatherRow}>
              <Ionicons name={weather.data.icon} size={18} color={colors.accent} />
              <Text style={styles.weatherText}>
                {weather.data.temperature}° {weather.data.condition}
              </Text>
            </View>
          )}
          {weather.status === "loading" && (
            <Text style={styles.weatherHint}>Loading weather…</Text>
          )}
          {(weather.status === "denied" || weather.status === "error") && (
            <Text style={styles.weatherHint}>Weather unavailable</Text>
          )}

          <View style={styles.divider} />

          <View style={styles.weatherRow}>
            <Ionicons name="briefcase-outline" size={16} color={colors.accent} />
            <Text style={styles.weatherText}>{getDayType()}</Text>
          </View>
        </View>

        {outfit.status === "idle" && (
          <View style={styles.outfitPlaceholder}>
            <Ionicons name="shirt-outline" size={40} color={colors.accent} />
            <Text style={styles.outfitHint}>Get an outfit idea from your wardrobe.</Text>
          </View>
        )}

        {outfit.status === "loading" && (
          <View style={styles.outfitPlaceholder}>
            <ActivityIndicator color={colors.accent} />
          </View>
        )}

        {outfit.status === "error" && (
          <View style={styles.outfitPlaceholder}>
            <Text style={styles.outfitHint}>
              Couldn't generate an outfit. Please try again.
            </Text>
          </View>
        )}

        {outfit.status === "ready" && (
          <>
            <Text style={styles.outfitDescription}>{outfit.data.description}</Text>

            {outfit.data.items.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.itemsRow}
              >
                {outfit.data.items.map((item) => (
                  <Pressable
                    key={item.id}
                    style={styles.itemCard}
                    onPress={() => router.push(`/wardrobe/${item.id}`)}
                  >
                    <Image source={{ uri: item.image_url }} style={styles.itemImage} />
                    <Text style={styles.itemName} numberOfLines={1}>
                      {displayName(item)}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            )}

            {outfit.data.missingSuggestions.map((suggestion) => (
              <Text key={suggestion.category} style={styles.missingText}>
                + {suggestion.description}
              </Text>
            ))}
          </>
        )}

        <Pressable
          style={styles.generateButton}
          onPress={handleGenerateOutfit}
          disabled={outfit.status === "loading"}
        >
          {outfit.status === "loading" ? (
            <ActivityIndicator color={colors.inkPrimary} />
          ) : (
            <Text style={styles.generateButtonText}>
              {outfit.status === "ready" ? "Regenerate outfit" : "Generate outfit"}
            </Text>
          )}
        </Pressable>
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
  todayRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  weatherRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  divider: {
    width: 1,
    height: 16,
    backgroundColor: colors.border,
  },
  weatherText: {
    fontSize: 14,
    color: colors.inkSecondary,
  },
  weatherHint: {
    fontSize: 13,
    color: colors.inkMuted,
  },
  outfitPlaceholder: {
    marginTop: 16,
    height: 140,
    borderRadius: 12,
    backgroundColor: colors.accentSoft,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 24,
  },
  outfitHint: {
    fontSize: 13,
    color: colors.inkMuted,
    textAlign: "center",
  },
  outfitDescription: {
    marginTop: 16,
    fontSize: 14,
    color: colors.inkSecondary,
  },
  itemsRow: {
    marginTop: 12,
    gap: 10,
  },
  itemCard: {
    width: 90,
  },
  itemImage: {
    width: 90,
    height: 90,
    borderRadius: 10,
    backgroundColor: colors.border,
  },
  itemName: {
    marginTop: 6,
    fontSize: 12,
    color: colors.inkPrimary,
  },
  missingText: {
    marginTop: 8,
    fontSize: 13,
    color: colors.inkMuted,
  },
  generateButton: {
    marginTop: 16,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  generateButtonText: {
    color: colors.inkPrimary,
    fontWeight: "600",
    fontSize: 15,
  },
});
