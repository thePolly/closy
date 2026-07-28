import { PlayfairDisplay_700Bold, useFonts } from "@expo-google-fonts/playfair-display";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { createContext, useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { getSession } from "../src/storage/session";

export const OnboardingContext = createContext(() => {});

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ PlayfairDisplay_700Bold });
  const [hasSession, setHasSession] = useState<boolean | null>(null);

  useEffect(() => {
    getSession().then((session) => setHasSession(!!session));
  }, []);

  useEffect(() => {
    if (fontsLoaded && hasSession !== null) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, hasSession]);

  if (!fontsLoaded || hasSession === null) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <OnboardingContext.Provider value={() => setHasSession(true)}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Protected guard={!hasSession}>
            <Stack.Screen name="onboarding" />
          </Stack.Protected>
          <Stack.Protected guard={hasSession}>
            <Stack.Screen name="(tabs)" />
          </Stack.Protected>
        </Stack>
      </OnboardingContext.Provider>
    </SafeAreaProvider>
  );
}
