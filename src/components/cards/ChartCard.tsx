import React from "react";
import { StyleSheet, View } from "react-native";
import { theme } from "../../constants/theme";
import { AppText } from "../typography/AppText";
import { BaseCard } from "./BaseCard";

type Props = {
  title: string;
  description?: string;
  children?: React.ReactNode;
  minHeight?: number;
};

export const ChartCard = ({
  title,
  description,
  children,
  minHeight = 160,
}: Props) => (
  <BaseCard variant="chart">
    <AppText variant="h4" style={styles.title}>
      {title}
    </AppText>

    <View style={[styles.chartContainer, { minHeight }]}>
      {children ?? (
        <AppText variant="h4" style={styles.placeholder}>
          Chart{"\n"}Container
        </AppText>
      )}
    </View>

    {description && (
      <AppText variant="p" color={theme.colors.text.light}>
        {description}
      </AppText>
    )}
  </BaseCard>
);

const styles = StyleSheet.create({
  title: {
    marginBottom: theme.spacing.md,
  },
  chartContainer: {
    borderRadius: theme.radius.sm,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  placeholder: {
    color: theme.colors.text.primary,
    lineHeight: 22,
    textAlign: "center",
  },
});
