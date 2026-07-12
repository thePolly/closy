import { Stack } from "expo-router";
import { colors } from "../../../src/theme/colors";

export default function WardrobeLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="[id]"
        options={{
          title: "Clothing Details",
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.inkPrimary,
        }}
      />
    </Stack>
  );
}
