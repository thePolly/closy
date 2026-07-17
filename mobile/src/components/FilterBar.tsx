import { useState } from "react";
import { FlatList, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";

export type SortOption = "newest" | "name";

export interface FilterDimension {
  key: string;
  label: string;
  value: string | null;
  options: string[];
}

interface FilterBarProps {
  dimensions: FilterDimension[];
  onSelectDimension: (key: string, value: string | null) => void;
  sort: SortOption;
  onChangeSort: (sort: SortOption) => void;
  hasActiveFilters: boolean;
  onClear: () => void;
}

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: "Newest", value: "newest" },
  { label: "Name (A–Z)", value: "name" },
];

type OpenPicker =
  | { type: "dimension"; key: string; label: string; options: string[] }
  | { type: "sort" }
  | null;

export function FilterBar({
  dimensions,
  onSelectDimension,
  sort,
  onChangeSort,
  hasActiveFilters,
  onClear,
}: FilterBarProps) {
  const [openPicker, setOpenPicker] = useState<OpenPicker>(null);
  const closePicker = () => setOpenPicker(null);
  const sortLabel = SORT_OPTIONS.find((option) => option.value === sort)?.label ?? "Sort";

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {dimensions.map((dimension) => (
          <Pressable
            key={dimension.key}
            style={[styles.pill, dimension.value && styles.pillActive]}
            onPress={() =>
              setOpenPicker({
                type: "dimension",
                key: dimension.key,
                label: dimension.label,
                options: dimension.options,
              })
            }
          >
            <Text style={[styles.pillText, dimension.value && styles.pillTextActive]}>
              {dimension.value ?? dimension.label}
            </Text>
          </Pressable>
        ))}
        <Pressable style={styles.pill} onPress={() => setOpenPicker({ type: "sort" })}>
          <Text style={styles.pillText}>Sort: {sortLabel}</Text>
        </Pressable>
        {hasActiveFilters && (
          <Pressable style={styles.clearPill} onPress={onClear} hitSlop={8}>
            <Text style={styles.clearText}>Clear</Text>
          </Pressable>
        )}
      </ScrollView>

      <Modal
        visible={openPicker !== null}
        transparent
        animationType="fade"
        onRequestClose={closePicker}
      >
        <Pressable style={styles.backdrop} onPress={closePicker}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            {openPicker?.type === "dimension" && (
              <>
                <Text style={styles.sheetTitle}>{openPicker.label}</Text>
                <FlatList
                  style={styles.optionsList}
                  data={["All", ...openPicker.options]}
                  keyExtractor={(item) => item}
                  renderItem={({ item }) => (
                    <Pressable
                      style={styles.optionRow}
                      onPress={() => {
                        onSelectDimension(openPicker.key, item === "All" ? null : item);
                        closePicker();
                      }}
                    >
                      <Text style={styles.optionText}>{item}</Text>
                    </Pressable>
                  )}
                />
              </>
            )}
            {openPicker?.type === "sort" && (
              <>
                <Text style={styles.sheetTitle}>Sort by</Text>
                {SORT_OPTIONS.map((option) => (
                  <Pressable
                    key={option.value}
                    style={styles.optionRow}
                    onPress={() => {
                      onChangeSort(option.value);
                      closePicker();
                    }}
                  >
                    <Text style={styles.optionText}>{option.label}</Text>
                  </Pressable>
                ))}
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  row: {
    paddingHorizontal: 12,
    gap: 8,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pillActive: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
  },
  pillText: {
    fontSize: 13,
    color: colors.inkSecondary,
  },
  pillTextActive: {
    color: colors.inkPrimary,
    fontWeight: "600",
  },
  clearPill: {
    paddingHorizontal: 6,
    justifyContent: "center",
  },
  clearText: {
    fontSize: 13,
    color: colors.inkMuted,
    fontWeight: "600",
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
    paddingBottom: 32,
    maxHeight: "60%",
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.inkPrimary,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  optionsList: {
    flexShrink: 1,
  },
  optionRow: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  optionText: {
    fontSize: 15,
    color: colors.inkPrimary,
  },
});
