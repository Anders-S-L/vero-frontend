import React, { useEffect, useMemo, useState } from "react"
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native"
import { AppText, ChartCard } from "../../../components"
import { KpiLineChart } from "../../../components/charts/KpiLineChart"
import { theme } from "../../../constants/theme"
import { KpiHistoryPoint, kpiFavoriteModel } from "../../../models/kpiFavoriteModel"
import { useTransactionViewModel } from "../../../viewmodels/useTransactionViewModel"
import { KPI_COLORS, KPI_LABELS } from "./shared"

type Props = {
  token: string
  organisationName: string
  favorites: string[]
}

export function OverviewTab({ token, organisationName, favorites }: Props) {
  const { transactions, isLoading } = useTransactionViewModel(token, "")
  const { width: screenWidth } = useWindowDimensions()
  const chartWidth = screenWidth - theme.spacing.xl * 2 - theme.spacing.lg * 2

  const historyFrom = useMemo(() => {
    const d = new Date()
    d.setMonth(d.getMonth() - 5)
    d.setDate(1)
    return d.toISOString().slice(0, 10)
  }, [])

  const historyTo = useMemo(() => new Date().toISOString().slice(0, 10), [])

  const [kpiHistories, setKpiHistories] = useState<Record<string, KpiHistoryPoint[]>>({})
  const [historiesLoading, setHistoriesLoading] = useState(false)

  useEffect(() => {
    if (favorites.length === 0 || !token) {
      setKpiHistories({})
      return
    }

    let cancelled = false
    setHistoriesLoading(true)

    Promise.all(
      favorites.map(async (key) => {
        try {
          const data = await kpiFavoriteModel.getHistory(token, key, historyFrom, historyTo)
          return [key, data] as const
        } catch {
          return [key, [] as KpiHistoryPoint[]] as const
        }
      }),
    ).then((results) => {
      if (!cancelled) {
        setKpiHistories(Object.fromEntries(results))
        setHistoriesLoading(false)
      }
    })

    return () => {
      cancelled = true
    }
  }, [favorites, token, historyFrom, historyTo])

  const totalIncome = transactions
    .filter((t) => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0)
  const totalExpense = transactions
    .filter((t) => t.amount < 0)
    .reduce((sum, t) => sum + t.amount, 0)
  const recent = transactions.slice(0, 5)

  return (
    <ScrollView style={styles.tab} contentContainerStyle={styles.tabContent}>
      <AppText variant="h3" style={styles.pageTitle}>
        {organisationName}
      </AppText>

      <View style={styles.metricsRow}>
        <View style={[styles.metricCard, styles.flex]}>
          <AppText variant="p" color={theme.colors.text.secondary}>
            Indtægter
          </AppText>
          <AppText variant="h4" color={theme.colors.status.success}>
            {totalIncome.toLocaleString()} kr
          </AppText>
        </View>
        <View style={styles.metricSpacer} />
        <View style={[styles.metricCard, styles.flex]}>
          <AppText variant="p" color={theme.colors.text.secondary}>
            Udgifter
          </AppText>
          <AppText variant="h4" color={theme.colors.status.error}>
            {Math.abs(totalExpense).toLocaleString()} kr
          </AppText>
        </View>
      </View>

      <AppText variant="h4" style={styles.sectionTitle}>
        Seneste transaktioner
      </AppText>

      {isLoading ? (
        <ActivityIndicator color={theme.colors.primary.blue} />
      ) : recent.length === 0 ? (
        <AppText variant="p" color={theme.colors.text.light} style={styles.center}>
          Ingen transaktioner endnu
        </AppText>
      ) : (
        recent.map((t) => (
          <View key={t.id} style={styles.transactionRow}>
            <View>
              <AppText variant="p">{t.description}</AppText>
              <AppText variant="p" color={theme.colors.text.light}>
                {t.date}
              </AppText>
            </View>
            <AppText
              variant="p"
              color={t.amount > 0 ? theme.colors.status.success : theme.colors.status.error}
            >
              {t.amount > 0 ? "+" : ""}
              {t.amount.toLocaleString()} kr
            </AppText>
          </View>
        ))
      )}

      <AppText variant="h4" style={styles.sectionTitle}>
        Mine KPI-grafer
      </AppText>

      {favorites.length === 0 ? (
        <View style={styles.graphHint}>
          <AppText variant="p" color={theme.colors.text.light} style={styles.center}>
            Tilføj favoritter fra Dashboard-fanen for at se grafer her
          </AppText>
        </View>
      ) : historiesLoading ? (
        <ActivityIndicator color={theme.colors.primary.blue} />
      ) : (
        favorites.map((key) => (
          <ChartCard key={key} title={KPI_LABELS[key] ?? key} minHeight={150}>
            <KpiLineChart
              data={kpiHistories[key] ?? []}
              color={KPI_COLORS[key] ?? theme.colors.primary.blue}
              width={chartWidth}
            />
          </ChartCard>
        ))
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  tab: { flex: 1 },
  tabContent: { padding: theme.spacing.xl },
  pageTitle: { marginBottom: theme.spacing.md },
  sectionTitle: { marginBottom: theme.spacing.md, marginTop: theme.spacing.xl },
  metricsRow: { flexDirection: "row", marginBottom: theme.spacing.xl },
  metricCard: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.radius.md,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.background.cardBorder,
  },
  metricSpacer: { width: theme.spacing.md },
  flex: { flex: 1 },
  center: { textAlign: "center", alignItems: "center", justifyContent: "center" },
  transactionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: theme.colors.background.card,
    padding: theme.spacing.md,
    borderRadius: theme.radius.sm,
    marginBottom: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.background.cardBorder,
  },
  graphHint: {
    paddingVertical: theme.spacing.xl,
    alignItems: "center",
  },
})
