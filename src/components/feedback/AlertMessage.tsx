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
  success: { bg: "#D1FAE5", text: theme.colors.status.success },
  warning: { bg: "#FEF3C7", text: theme.colors.status.warning },
  error: { bg: "#FEE2E2", text: theme.colors.status.error },
} as const;

export const AlertMessage = ({ type, message }: Props) => (
  <View style={[styles.container, { backgroundColor: colors[type].bg }]}>
    <AppText variant="p" color={colors[type].text}>
      {message}
    </AppText>
  </View>
);

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.radius.sm,
    padding: theme.spacing.md,
  },
});
