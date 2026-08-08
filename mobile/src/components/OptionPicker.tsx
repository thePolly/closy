import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";

interface OptionPickerProps {
  options: readonly string[];
  value: string | null;
  onChange: (value: string) => void;
}

// Single-select pills, e.g. for age group / style preference. Tapping an
// option selects it immediately — there's no separate save step.
export function OptionPicker({ options, value, onChange }: OptionPickerProps) {
  return (
    <View style={styles.row}>
      {options.map((option) => {
        const selected = option === value;
        return (
          <Pressable
            key={option}
            style={[styles.pill, selected && styles.pillSelected]}
            onPress={() => onChange(option)}
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
