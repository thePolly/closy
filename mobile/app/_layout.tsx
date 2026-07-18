import { PlayfairDisplay_700Bold, useFonts } from "@expo-google-fonts/playfair-display";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { createContext, useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { getUserName } from "../src/storage/userName";

export const OnboardingContext = createContext(() => {});

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ PlayfairDisplay_700Bold });
  const [hasName, setHasName] = useState<boolean | null>(null);

  useEffect(() => {
    getUserName().then((name) => setHasName(!!name));
  }, []);

  useEffect(() => {
    if (fontsLoaded && hasName !== null) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, hasName]);

  if (!fontsLoaded || hasName === null) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <OnboardingContext.Provider value={() => setHasName(true)}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Protected guard={!hasName}>
            <Stack.Screen name="onboarding" />
          </Stack.Protected>
          <Stack.Protected guard={hasName}>
            <Stack.Screen name="(tabs)" />
          </Stack.Protected>
        </Stack>
      </OnboardingContext.Provider>
    </SafeAreaProvider>
  );
}
