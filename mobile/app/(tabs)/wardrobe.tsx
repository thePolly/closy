import { StyleSheet, Text, View } from "react-native";

export default function WardrobeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Wardrobe</Text>
      <Text style={styles.subtitle}>
        Upload and browse your clothes here.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FDF6EC",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    color: "#8A8578",
    textAlign: "center",
    paddingHorizontal: 32,
  },
});
