import React from "react";
import { StyleSheet, View } from "react-native";
import { theme } from "../../constants/theme";
import { AppText } from "../typography/AppText";

type Type = "success" | "warning" | "error";

type Props = {
  type: Type;
  message: string;
};

const colors = {
  success: {
    bg: theme.colors.status.success,
    text: theme.colors.white,
  },
  warning: {
    bg: theme.colors.status.warning,
    text: theme.colors.white,
  },
  error: {
    bg: theme.colors.status.error,
    text: theme.colors.white,
  },
} as const;

export const Toast = ({ type, message }: Props) => (
  <View style={[styles.container, { backgroundColor: colors[type].bg }]}>
    <AppText variant="p" color={colors[type].text}>
      {message}
    </AppText>
  </View>
);

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: theme.spacing.xl,
    left: theme.spacing.lg,
    right: theme.spacing.lg,
    borderRadius: theme.radius.sm,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    alignItems: "center",
  },
});
