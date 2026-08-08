import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";

interface MultiOptionPickerProps {
  options: readonly string[];
  values: string[];
  onChange: (values: string[]) => void;
}

// Multi-select pills, e.g. for style preference (people are rarely just one
// style). Tapping toggles that option in/out of the selection immediately.
export function MultiOptionPicker({ options, values, onChange }: MultiOptionPickerProps) {
  const toggle = (option: string) => {
    onChange(values.includes(option) ? values.filter((v) => v !== option) : [...values, option]);
  };

  return (
    <View style={styles.row}>
      {options.map((option) => {
        const selected = values.includes(option);
        return (
          <Pressable
            key={option}
            style={[styles.pill, selected && styles.pillSelected]}
            onPress={() => toggle(option)}
          >
            <Text style={[styles.pillText, selected && styles.pillTextSelected]}>{option}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  pillSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
  },
  pillText: {
    fontSize: 14,
    color: colors.inkSecondary,
  },
  pillTextSelected: {
    color: colors.inkPrimary,
    fontWeight: "600",
  },
});
