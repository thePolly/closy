import type { ReactNode } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { type Edge, SafeAreaView } from "react-native-safe-area-context";

interface ScreenProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  edges?: Edge[];
}

export function Screen({ children, style, edges = ["top"] }: ScreenProps) {
  return (
    <SafeAreaView style={[{ flex: 1 }, style]} edges={edges}>
      {children}
    </SafeAreaView>
  );
}
