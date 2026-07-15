import { useFocusEffect, useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  type ClothingItem,
  displayName,
  fetchWardrobe,
  uploadClothingItem,
} from "../../../src/api/wardrobe";
import { Screen } from "../../../src/components/Screen";
import { colors } from "../../../src/theme/colors";

export default function WardrobeScreen() {
  const router = useRouter();
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const loadItems = useCallback(async () => {
    try {
      setItems(await fetchWardrobe());
    } catch (error) {
      Alert.alert("Couldn't load wardrobe", error instanceof Error ? error.message : String(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadItems();
    }, [loadItems])
  );

  const pickFromCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Camera access needed", "Enable camera access in Settings to take a photo.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!result.canceled) {
      setPreviewUri(result.assets[0].uri);
    }
  };

  const pickFromLibrary = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Photo access needed", "Enable photo library access in Settings to choose a photo.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });
    if (!result.canceled) {
      setPreviewUri(result.assets[0].uri);
    }
  };

  const handleAddPress = () => {
    Alert.alert("Add clothing item", undefined, [
      { text: "Take Photo", onPress: pickFromCamera },
      { text: "Choose from Library", onPress: pickFromLibrary },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleCancelPreview = () => {
    setPreviewUri(null);
  };

  const handleUpload = async () => {
    if (!previewUri) return;
    setUploading(true);
    try {
      const newItem = await uploadClothingItem(previewUri);
      setItems((current) => [newItem, ...current]);
      setPreviewUri(null);
    } catch (error) {
      Alert.alert("Upload failed", error instanceof Error ? error.message : String(error));
    } finally {
      setUploading(false);
    }
  };

  if (previewUri) {
    return (
      <Screen style={styles.previewContainer}>
        <Image source={{ uri: previewUri }} style={styles.previewImage} />
        <View style={styles.previewActions}>
          <Pressable
            style={[styles.previewButton, styles.cancelButton]}
            onPress={handleCancelPreview}
            disabled={uploading}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </Pressable>
          <Pressable
            style={[styles.previewButton, styles.uploadButton]}
            onPress={handleUpload}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <Text style={styles.uploadButtonText}>Upload</Text>
            )}
          </Pressable>
        </View>
      </Screen>
    );
  }

  return (
    <Screen style={styles.container}>
      {loading ? (
        <ActivityIndicator style={styles.loading} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          numColumns={3}
          contentContainerStyle={styles.grid}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              No clothes yet. Tap + to add your first item.
            </Text>
          }
          renderItem={({ item }) => (
            <Pressable
              style={styles.card}
              onPress={() => router.push(`/wardrobe/${item.id}`)}
            >
              <View style={styles.cardImageWrapper}>
                <Image source={{ uri: item.image_url }} style={styles.cardImage} />
              </View>
              <Text style={styles.cardName} numberOfLines={1}>
                {displayName(item)}
              </Text>
            </Pressable>
          )}
        />
      )}
      <Pressable style={styles.addButton} onPress={handleAddPress}>
        <Text style={styles.addButtonText}>+</Text>
      </Pressable>
    </Screen>
  );
}

const CARD_SIZE = 110;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loading: {
    flex: 1,
  },
  grid: {
    padding: 12,
    flexGrow: 1,
  },
  emptyText: {
    marginTop: 80,
    textAlign: "center",
    color: colors.inkMuted,
    fontSize: 14,
    paddingHorizontal: 32,
  },
  card: {
    width: CARD_SIZE,
    margin: 4,
  },
  cardImageWrapper: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: colors.border,
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  cardName: {
    marginTop: 6,
    fontSize: 12,
    color: colors.inkPrimary,
  },
  addButton: {
    position: "absolute",
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surfaceDark,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  addButtonText: {
    color: colors.background,
    fontSize: 28,
    lineHeight: 30,
  },
  previewContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  previewImage: {
    flex: 1,
    resizeMode: "contain",
  },
  previewActions: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
    backgroundColor: "#000",
  },
  previewButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "#3A3A3A",
  },
  cancelButtonText: {
    color: colors.background,
    fontWeight: "600",
  },
  uploadButton: {
    backgroundColor: colors.accent,
  },
  uploadButtonText: {
    color: colors.inkPrimary,
    fontWeight: "600",
  },
});
