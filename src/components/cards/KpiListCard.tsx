import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { theme } from "../../constants/theme";
import { FavoriteKpiKey } from "../../models/kpiModel";
import { FavoriteButton } from "../buttons/FavoriteButton";
import { AppText } from "../typography/AppText";
import { BaseCard } from "./BaseCard";

type KpiCardPresentation = {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  description: string;
};

const KPI_CARD_PRESENTATION: Record<FavoriteKpiKey, KpiCardPresentation> = {
  revenue: {
    icon: "add",
    color: theme.colors.kpi.revenue,
    description: "Current month",
  },
  ebitda: {
    icon: "pulse",
    color: theme.colors.kpi.profitEbitda,
    description: "Current month",
  },
  netResult: {
    icon: "trending-up",
    color: theme.colors.kpi.netResult,
    description: "Resultat efter omkostninger",
  },
  cashFlow: {
    icon: "water",
    color: theme.colors.kpi.cashFlow,
    description: "Pengestrøm",
  },
  burnRate: {
    icon: "flame",
    color: theme.colors.kpi.burnRate,
    description: "Forbrug pr. måned",
  },
  monthlyGrowthRate: {
    icon: "analytics",
    color: theme.colors.kpi.monthlyGrowthRate,
    description: "Månedlig vækst",
  },
  grossProfit: {
    icon: "trending-up",
    color: theme.colors.kpi.grossProfit,
    description: "Revenue - Variable Costs",
  },
  grossMargin: {
    icon: "pie-chart",
    color: theme.colors.kpi.grossMargin,
    description: "Bruttomargin",
  },
  variableCosts: {
    icon: "remove",
    color: theme.colors.kpi.variableCosts,
    description: "Variable omkostninger",
  },
  contributionMargin: {
    icon: "add",
    color: theme.colors.kpi.contributionMargin,
    description: "Dækningsgrad",
  },
  liquidityRatio: {
    icon: "shield-checkmark",
    color: theme.colors.kpi.liquidityRatio,
    description: "Likviditet",
  },
  debtorDays: {
    icon: "calendar",
    color: theme.colors.kpi.debtorDays,
    description: "Debitor dage",
  },
};

type Props = {
  kpiKey: FavoriteKpiKey;
  title: string;
  value: string;
  available: boolean;
  reason?: string;
  isFavorite: boolean;
  onPress: () => void;
  onToggleFavorite: () => void;
};

export const KpiListCard = ({
  kpiKey,
  title,
  value,
  available,
  reason,
  isFavorite,
  onPress,
  onToggleFavorite,
}: Props) => {
  const presentation = KPI_CARD_PRESENTATION[kpiKey];
  const description = available
    ? presentation.description
    : reason || presentation.description;

  return (
    <BaseCard variant="metric" style={styles.card}>
      <Pressable
        style={styles.content}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`Vis info om ${title}`}
      >
        <View style={styles.copy}>
          <AppText variant="p" style={styles.title}>
            {title}
          </AppText>
          <AppText
            variant="h3"
            color={
              available ? theme.colors.text.primary : theme.colors.text.light
            }
            style={styles.value}
          >
            {value}
          </AppText>
          <AppText variant="p" color={theme.colors.text.secondary}>
            {description}
          </AppText>
        </View>

        <View style={[styles.iconTile, { borderColor: presentation.color }]}>
          <Ionicons
            name={presentation.icon}
            size={28}
            color={presentation.color}
          />
        </View>
      </Pressable>

      <FavoriteButton
        active={isFavorite}
        size="small"
        onPress={onToggleFavorite}
        style={styles.favorite}
        activeIconColor={theme.colors.primary.blue}
        inactiveIconColor={theme.colors.text.light}
        accessibilityLabel={
          isFavorite
            ? `Fjern ${title} fra favoritter`
            : `Tilføj ${title} til favoritter`
        }
      />
    </BaseCard>
  );
};

const styles = StyleSheet.create({
  card: {
    minHeight: 148,
    borderRadius: theme.radius.sm,
    padding: theme.spacing.lg,
  },
  content: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.lg,
  },
  copy: {
    flex: 1,
  },
  title: {
    color: theme.colors.text.secondary,
    fontWeight: "500",
    marginBottom: theme.spacing.xs,
  },
  value: {
    marginBottom: theme.spacing.xs,
  },
  iconTile: {
    width: 56,
    height: 56,
    borderRadius: theme.radius.sm,
    borderWidth: theme.borderWidth.thin,
    backgroundColor: theme.colors.background.app,
    alignItems: "center",
    justifyContent: "center",
  },
  favorite: {
    position: "absolute",
    top: theme.spacing.md,
    right: theme.spacing.md,
    width: 40,
    height: 40,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.background.card,
    borderColor: theme.colors.background.cardBorder,
  },
});
