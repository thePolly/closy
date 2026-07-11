import { StyleSheet, Text } from "react-native";
import { Screen } from "../../src/components/Screen";

export default function HomeScreen() {
  return (
    <Screen style={styles.container}>
      <Text style={styles.title}>Home</Text>
      <Text style={styles.subtitle}>Placeholder for MVP-0</Text>
    </Screen>
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
  },
});
