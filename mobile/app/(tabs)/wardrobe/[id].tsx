import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  type ClothingItem,
  displayName,
  fetchClothingItem,
  retryAnalysis,
} from "../../../src/api/wardrobe";
import { Card } from "../../../src/components/Card";
import { Screen } from "../../../src/components/Screen";
import { colors } from "../../../src/theme/colors";

const NOT_DETECTED = "Not detected";

function display(value: string | null): string {
  return value && value.trim().length > 0 ? value : NOT_DETECTED;
}

function displayConfidence(value: number | null): string {
  if (value === null) return NOT_DETECTED;
  return `${Math.round(value * 100)}%`;
}

interface DetailRow {
  label: string;
  value: string;
}

function buildRows(item: ClothingItem): DetailRow[] {
  return [
    { label: "Clothing type", value: display(item.clothing_type) },
    { label: "Fit", value: display(item.fit) },
    { label: "Primary color", value: display(item.primary_color) },
    { label: "Secondary color", value: display(item.secondary_color) },
    { label: "Pattern", value: display(item.pattern) },
    { label: "Season", value: display(item.season) },
    { label: "Style", value: display(item.style) },
    { label: "Material", value: display(item.material) },
    { label: "Suitable occasions", value: display(item.suitable_occasions) },
    { label: "Confidence", value: displayConfidence(item.confidence_score) },
  ];
}

export default function ClothingDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [item, setItem] = useState<ClothingItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);
  const [retryError, setRetryError] = useState<string | null>(null);

  const loadItem = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      setItem(await fetchClothingItem(id));
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : String(error));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadItem();
  }, [loadItem]);

  const handleRetry = async () => {
    setRetrying(true);
    setRetryError(null);
    try {
      setItem(await retryAnalysis(id));
    } catch (error) {
      setRetryError(error instanceof Error ? error.message : String(error));
    } finally {
      setRetrying(false);
    }
  };

  if (loading) {
    return (
      <Screen style={styles.centered} edges={[]}>
        <ActivityIndicator />
      </Screen>
    );
  }

  if (loadError || !item) {
    return (
      <Screen style={styles.centered} edges={[]}>
        <Text style={styles.errorText}>
          {loadError ?? "Couldn't find this clothing item."}
        </Text>
        <Pressable style={styles.retryButton} onPress={loadItem}>
          <Text style={styles.retryButtonText}>Try again</Text>
        </Pressable>
      </Screen>
    );
  }

  return (
    <Screen style={styles.container} edges={[]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Image source={{ uri: item.image_url }} style={styles.image} />

        <Text style={styles.name}>{displayName(item)}</Text>

        <Card style={styles.card}>
          {buildRows(item).map((row) => (
            <View key={row.label} style={styles.row}>
              <Text style={styles.rowLabel}>{row.label}</Text>
              <Text style={styles.rowValue}>{row.value}</Text>
            </View>
          ))}
        </Card>

        {item.analysis_status === "failed" && (
          <View style={styles.retrySection}>
            <Text style={styles.retryHint}>
              We couldn't analyze this item.
            </Text>
            {retryError && <Text style={styles.errorText}>{retryError}</Text>}
            <Pressable
              style={[styles.retryButton, retrying && styles.retryButtonDisabled]}
              onPress={handleRetry}
              disabled={retrying}
            >
              {retrying ? (
                <ActivityIndicator color={colors.background} />
              ) : (
                <Text style={styles.retryButtonText}>Retry analysis</Text>
              )}
            </Pressable>
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  scrollContent: {
    padding: 20,
  },
  image: {
    width: "100%",
    height: 320,
    borderRadius: 16,
    backgroundColor: colors.border,
  },
  name: {
    marginTop: 20,
    fontSize: 22,
    fontWeight: "600",
    color: colors.inkPrimary,
  },
  card: {
    marginTop: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowLabel: {
    fontSize: 14,
    color: colors.inkMuted,
  },
  rowValue: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.inkPrimary,
  },
  retrySection: {
    marginTop: 24,
    alignItems: "center",
  },
  retryHint: {
    fontSize: 14,
    color: colors.inkSecondary,
    marginBottom: 12,
    textAlign: "center",
  },
  errorText: {
    fontSize: 14,
    color: "#B3261E",
    textAlign: "center",
    marginBottom: 12,
  },
  retryButton: {
    height: 48,
    paddingHorizontal: 24,
    borderRadius: 24,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  retryButtonDisabled: {
    opacity: 0.6,
  },
  retryButtonText: {
    color: colors.inkPrimary,
    fontWeight: "600",
  },
});
