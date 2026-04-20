import React from "react";
import { StyleSheet, View } from "react-native";
import { theme } from "../../constants/theme";
import { AppText } from "../typography/AppText";
import { BaseCard } from "./BaseCard";

type Props = {
  title: string;
  text: string;
  icon?: React.ReactNode;
  tone?: "warning" | "blue";
};

export const InfoCard = ({ title, text, icon, tone = "warning" }: Props) => (
  <BaseCard variant="info" style={tone === "blue" && styles.blueCard}>
    {icon && <View style={styles.icon}>{icon}</View>}
    <AppText
      variant="h4"
      style={{
        ...styles.title,
        ...(tone === "blue" ? styles.blueTitle : {}),
      }}
    >
      {title}
    </AppText>
    <AppText variant="p" color={theme.colors.text.secondary}>
      {text}
    </AppText>
  </BaseCard>
);

const styles = StyleSheet.create({
  icon: {
    marginBottom: theme.spacing.sm,
  },
  title: {
    marginBottom: theme.spacing.xs,
  },
  blueCard: {
    backgroundColor: theme.colors.background.card,
    borderColor: theme.colors.background.cardBorder,
  },
  blueTitle: {
    color: theme.colors.text.primary,
  },
});
