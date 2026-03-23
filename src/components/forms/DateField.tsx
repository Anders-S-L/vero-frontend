import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { theme } from "../../constants/theme";
import { AppText } from "../typography/AppText";

type DateFieldProps = {
  label?: string;
  value?: string;
  placeholder?: string;
  onPress?: () => void;
  error?: string;
};

export default function DateField({
  label,
  value,
  placeholder = "Select date",
  onPress,
  error,
}: DateFieldProps) {
  return (
    <View style={styles.wrapper}>
      {label ? (
        <AppText variant="label" style={styles.label}>
          {label}
        </AppText>
      ) : null}

      <Pressable
        onPress={onPress}
        style={[styles.input, error ? styles.inputError : undefined]}
      >
        <AppText
          variant="input"
          color={value ? theme.colors.text.primary : theme.input.placeholder}
        >
          {value || placeholder}
        </AppText>
      </Pressable>

      {error ? (
        <AppText
          variant="label"
          color={theme.colors.status.error}
          style={styles.error}
        >
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: theme.spacing.xs,
  },
  label: {
    color: theme.colors.text.primary,
  },
  input: {
    minHeight: 40,
    justifyContent: "center",
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.input.background,
    borderColor: theme.input.border,
    borderWidth: theme.borderWidth.thin,
    borderRadius: theme.radius.sm,
  },
  inputError: {
    borderColor: theme.input.borderError,
  },
  error: {
    marginTop: theme.spacing.xs,
  },
});
