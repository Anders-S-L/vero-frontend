import React from "react";
import {
    StyleProp,
    StyleSheet,
    View,
    ViewProps,
    ViewStyle,
} from "react-native";
import { theme } from "../../constants/theme";

type CardVariant = "metric" | "info" | "chart";

type Props = ViewProps & {
  children: React.ReactNode;
  variant?: CardVariant;
  style?: StyleProp<ViewStyle>;
};

const variantStyles = {
  metric: {
    backgroundColor: theme.card.metric.background,
    borderColor: theme.card.metric.border,
  },
  info: {
    backgroundColor: theme.card.info.background,
    borderColor: theme.card.info.border,
  },
  chart: {
    backgroundColor: theme.card.chart.background,
    borderColor: theme.card.chart.border,
  },
} as const;

export const BaseCard = ({
  children,
  variant = "metric",
  style,
  ...props
}: Props) => (
  <View
    style={[styles.card, variantStyles[variant] ?? variantStyles.metric, style]}
    {...props}
  >
    {children}
  </View>
);

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radius.md,
    padding: theme.spacing.lg,
    borderWidth: theme.borderWidth.thin,
  },
});
