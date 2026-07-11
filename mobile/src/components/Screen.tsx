import type { ReactNode } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ScreenProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function Screen({ children, style }: ScreenProps) {
  return (
    <SafeAreaView style={[{ flex: 1 }, style]} edges={["top"]}>
      {children}
    </SafeAreaView>
  );
}
