import React from "react";
import { StyleSheet, View } from "react-native";
import { theme } from "../../constants/theme";
import { AppText } from "../typography/AppText";
import { BaseCard } from "./BaseCard";

type Props = {
  title: string;
  value: string;
  description?: string;
  icon?: React.ReactNode;
};

export const MetricCard = ({ title, value, description, icon }: Props) => (
  <BaseCard variant="metric">
    <View style={styles.header}>
      <AppText variant="p" color={theme.colors.text.secondary}>
        {title}
      </AppText>
      {icon && <View>{icon}</View>}
    </View>

    <AppText variant="h3" style={styles.value}>
      {value}
    </AppText>

    {description && (
      <AppText variant="p" color={theme.colors.text.secondary}>
        {description}
      </AppText>
    )}
  </BaseCard>
);

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: theme.spacing.sm,
  },
  value: {
    marginBottom: theme.spacing.xs,
  },
});
