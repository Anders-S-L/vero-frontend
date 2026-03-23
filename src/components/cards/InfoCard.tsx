import React from "react";
import { StyleSheet, View } from "react-native";
import { theme } from "../../constants/theme";
import { AppText } from "../typography/AppText";
import { BaseCard } from "./BaseCard";

type Props = {
  title: string;
  text: string;
  icon?: React.ReactNode;
};

export const InfoCard = ({ title, text, icon }: Props) => (
  <BaseCard variant="info">
    {icon && <View style={styles.icon}>{icon}</View>}
    <AppText variant="h4" style={styles.title}>
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
});
