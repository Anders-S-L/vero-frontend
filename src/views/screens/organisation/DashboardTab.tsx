import { Ionicons } from "@expo/vector-icons"
import React, { useState } from "react"
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native"
import {
  AlertMessage,
  AppText,
  BaseModal,
  DropdownField,
  InputField,
  PrimaryButton,
} from "../../../components"
import { theme } from "../../../constants/theme"
import { KpiMetric } from "../../../models/kpiModel"
import { useKpiViewModel } from "../../../viewmodels/useKpiViewModel"
import {
  PeriodPreset,
  formatDanishDateForInput,
  formatDanishDateInput,
  getPeriodRange,
  isValidDanishDate,
  toIsoDate,
} from "./shared"

// ── KPI INFO MODAL ────────────────────────────────────────────────────────────

function KpiInfoModal({
  metric,
  visible,
  onClose,
}: {
  metric: KpiMetric | null
  visible: boolean
  onClose: () => void
}) {
  const definition =
    metric?.definition?.trim() || "Definition er ikke tilgængelig for denne KPI endnu."
  const calculationExamples =
    metric?.calculationExample?.filter((example) => example?.trim()) ?? []

  return (
    <BaseModal visible={visible} title={metric?.label ?? "KPI-info"} onClose={onClose}>
      <ScrollView
        style={styles.kpiInfoScroll}
        contentContainerStyle={styles.kpiInfoContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.kpiInfoSection}>
          <AppText variant="p" style={styles.kpiInfoSectionTitle}>
            Definition
          </AppText>
          <AppText variant="p" color={theme.colors.text.secondary}>
            {definition}
          </AppText>
        </View>

        <View style={styles.kpiInfoSection}>
          <AppText variant="p" style={styles.kpiInfoSectionTitle}>
            Beregningseksempel
          </AppText>
          {calculationExamples.length > 0 ? (
            calculationExamples.map((example, index) => (
              <View key={`${metric?.label ?? "kpi"}-${index}`} style={styles.kpiInfoBulletRow}>
                <AppText variant="p" style={styles.kpiInfoBullet}>
                  •
                </AppText>
                <AppText variant="p" color={theme.colors.text.secondary} style={styles.flex}>
                  {example}
                </AppText>
              </View>
            ))
          ) : (
            <AppText variant="p" color={theme.colors.text.secondary}>
              Intet beregningseksempel tilgængeligt endnu.
            </AppText>
          )}
        </View>
      </ScrollView>
    </BaseModal>
  )
}

// ── DASHBOARD TAB ─────────────────────────────────────────────────────────────

const ALL_KPI_KEYS = [
  "revenue",
  "ebitda",
  "netResult",
  "cashFlow",
  "burnRate",
  "monthlyGrowthRate",
  "grossProfit",
  "grossMargin",
  "variableCosts",
  "contributionMargin",
  "liquidityRatio",
  "debtorDays",
] as const

type KpiKey = (typeof ALL_KPI_KEYS)[number]

const formatValue = (value: number | null, unit: string) => {
  if (value === null) return "–"
  if (unit === "currency") return `${Math.round(value).toLocaleString("da-DK")} kr`
  if (unit === "percentage") return `${value.toFixed(1)}%`
  if (unit === "days") return `${value.toFixed(0)} dage`
  if (unit === "ratio") return value.toFixed(2)
  return `${value}`
}

type Props = {
  token: string
  favorites: string[]
  toggleFavorite: (key: string) => void
}

export function DashboardTab({ token, favorites, toggleFavorite }: Props) {
  const [selectedPeriodPreset, setSelectedPeriodPreset] = useState<PeriodPreset>("currentMonth")
  const [appliedPeriod, setAppliedPeriod] = useState(() => getPeriodRange("currentMonth"))
  const [fromInput, setFromInput] = useState(() => formatDanishDateForInput(appliedPeriod.from))
  const [toInput, setToInput] = useState(() => formatDanishDateForInput(appliedPeriod.to))
  const [periodError, setPeriodError] = useState<string | null>(null)

  const { kpis, isLoading, error } = useKpiViewModel(token, appliedPeriod.from, appliedPeriod.to)

  const [selectedKpis, setSelectedKpis] = useState<KpiKey[]>([...ALL_KPI_KEYS])
  const [showSelector, setShowSelector] = useState(false)
  const [selectedKpiInfo, setSelectedKpiInfo] = useState<KpiMetric | null>(null)

  const periodOptions = [
    { label: "Denne måned", value: "currentMonth" },
    { label: "Seneste 30 dage", value: "last30Days" },
    { label: "Dette kvartal", value: "currentQuarter" },
    { label: "I år", value: "currentYear" },
    { label: "Brugerdefineret", value: "custom" },
  ]

  const toggleKpi = (key: KpiKey) => {
    setSelectedKpis((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    )
  }

  const applyPresetPeriod = (value: string) => {
    const preset = value as PeriodPreset
    if (preset === "custom") {
      setSelectedPeriodPreset("custom")
      return
    }
    const nextPeriod = getPeriodRange(preset)
    setSelectedPeriodPreset(preset)
    setFromInput(formatDanishDateForInput(nextPeriod.from))
    setToInput(formatDanishDateForInput(nextPeriod.to))
    setAppliedPeriod(nextPeriod)
    setPeriodError(null)
  }

  const applyCustomPeriod = () => {
    if (!isValidDanishDate(fromInput) || !isValidDanishDate(toInput)) {
      setPeriodError("Datoer skal være gyldige og i formatet DD-MM-YYYY.")
      return
    }
    const from = toIsoDate(fromInput)
    const to = toIsoDate(toInput)
    if (from > to) {
      setPeriodError("'Fra' dato må ikke være efter 'Til' dato.")
      return
    }
    setAppliedPeriod({ from, to })
    setSelectedPeriodPreset("custom")
    setPeriodError(null)
  }

  return (
    <ScrollView style={styles.tab} contentContainerStyle={styles.tabContent}>
      <AppText variant="h3" style={styles.pageTitle}>
        Dashboard
      </AppText>

      <View style={styles.periodCard}>
        <DropdownField
          label="Periode"
          options={periodOptions}
          value={selectedPeriodPreset}
          onChange={applyPresetPeriod}
        />
        <View style={styles.periodInputRow}>
          <View style={styles.periodInput}>
            <InputField
              label="Fra"
              placeholder="DD-MM-YYYY"
              value={fromInput}
              onChangeText={(value) => setFromInput(formatDanishDateInput(value))}
              keyboardType="number-pad"
              maxLength={10}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          <View style={styles.periodInput}>
            <InputField
              label="Til"
              placeholder="DD-MM-YYYY"
              value={toInput}
              onChangeText={(value) => setToInput(formatDanishDateInput(value))}
              keyboardType="number-pad"
              maxLength={10}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>
        {periodError && <AlertMessage type="error" message={periodError} />}
        <PrimaryButton label="Anvend periode" onPress={applyCustomPeriod} />
        <AppText variant="p" color={theme.colors.text.secondary} style={styles.periodSummary}>
          Aktiv periode: {formatDanishDateForInput(appliedPeriod.from)} – {formatDanishDateForInput(appliedPeriod.to)}
        </AppText>
      </View>

      {error && <AlertMessage type="error" message={error} />}

      {isLoading ? (
        <ActivityIndicator color={theme.colors.primary.blue} />
      ) : (
        <View style={styles.kpiGrid}>
          {selectedKpis.map((key) => {
            const metric = kpis?.metrics[key as keyof typeof kpis.metrics]
            if (!metric) return null

            return (
              <View key={key} style={styles.kpiCard}>
                <View style={styles.kpiCardHeader}>
                  <AppText variant="p" color={theme.colors.text.secondary} style={styles.kpiCardTitle}>
                    {metric.label}
                  </AppText>
                  <Pressable
                    onPress={() => toggleFavorite(key)}
                    hitSlop={8}
                    style={styles.kpiInfoButton}
                    accessibilityRole="button"
                    accessibilityLabel={`Favorit ${metric.label}`}
                  >
                    <Ionicons
                      name={favorites.includes(key) ? "star" : "star-outline"}
                      size={18}
                      color={
                        favorites.includes(key)
                          ? theme.colors.primary.blue
                          : theme.colors.text.secondary
                      }
                    />
                  </Pressable>
                  <Pressable
                    onPress={() => setSelectedKpiInfo(metric)}
                    hitSlop={8}
                    style={styles.kpiInfoButton}
                    accessibilityRole="button"
                    accessibilityLabel={`Vis info om ${metric.label}`}
                  >
                    <Ionicons
                      name="information-circle-outline"
                      size={18}
                      color={theme.colors.text.secondary}
                    />
                  </Pressable>
                </View>
                <AppText
                  variant="h4"
                  color={metric.available ? theme.colors.text.primary : theme.colors.text.light}
                >
                  {metric.available ? formatValue(metric.value, metric.unit) : "–"}
                </AppText>
                {!metric.available && (
                  <AppText variant="p" color={theme.colors.text.light} style={styles.unavailableReason}>
                    {metric.reason}
                  </AppText>
                )}
              </View>
            )
          })}
        </View>
      )}

      <KpiInfoModal
        metric={selectedKpiInfo}
        visible={selectedKpiInfo !== null}
        onClose={() => setSelectedKpiInfo(null)}
      />

      <TouchableOpacity
        style={styles.selectorToggle}
        onPress={() => setShowSelector(!showSelector)}
      >
        <AppText variant="p" color={theme.colors.text.secondary}>
          {showSelector ? "Luk" : "+ Vælg KPI'er"}
        </AppText>
      </TouchableOpacity>

      {showSelector && (
        <View style={styles.kpiSelector}>
          {ALL_KPI_KEYS.map((key) => {
            const metric = kpis?.metrics[key as keyof typeof kpis.metrics]
            const isSelected = selectedKpis.includes(key)

            return (
              <TouchableOpacity
                key={key}
                style={[
                  styles.chip,
                  isSelected && styles.chipSelected,
                  !metric?.available && styles.chipUnavailable,
                ]}
                onPress={() => toggleKpi(key)}
              >
                <AppText
                  variant="p"
                  color={isSelected ? theme.colors.white : theme.colors.text.primary}
                >
                  {metric?.label ?? key}
                </AppText>
              </TouchableOpacity>
            )
          })}
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  tab: { flex: 1 },
  tabContent: { padding: theme.spacing.xl },
  pageTitle: { marginBottom: theme.spacing.md },
  flex: { flex: 1 },
  periodCard: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.radius.md,
    padding: theme.spacing.lg,
    borderWidth: theme.borderWidth.thin,
    borderColor: theme.colors.background.cardBorder,
    marginBottom: theme.spacing.lg,
  },
  periodInputRow: { flexDirection: "row", gap: theme.spacing.md },
  periodInput: { flex: 1 },
  periodSummary: { marginTop: theme.spacing.md },
  kpiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  kpiCard: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.radius.md,
    padding: theme.spacing.lg,
    width: "47%",
    borderWidth: theme.borderWidth.thin,
    borderColor: theme.colors.background.cardBorder,
    gap: theme.spacing.xs,
  },
  kpiCardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: theme.spacing.sm,
  },
  kpiCardTitle: { flex: 1 },
  kpiInfoButton: { padding: 2 },
  unavailableReason: { fontSize: 10 },
  kpiInfoScroll: { maxHeight: 360 },
  kpiInfoContent: { gap: theme.spacing.lg, paddingBottom: theme.spacing.xs },
  kpiInfoSection: { gap: theme.spacing.sm },
  kpiInfoSectionTitle: { fontWeight: "700", color: theme.colors.text.primary },
  kpiInfoBulletRow: { flexDirection: "row", alignItems: "flex-start", gap: theme.spacing.sm },
  kpiInfoBullet: { color: theme.colors.text.primary, lineHeight: 20 },
  selectorToggle: {
    borderWidth: theme.borderWidth.thin,
    borderColor: theme.colors.background.cardBorder,
    borderRadius: theme.radius.sm,
    padding: theme.spacing.lg,
    alignItems: "center",
    marginTop: theme.spacing.sm,
    backgroundColor: theme.colors.background.card,
  },
  kpiSelector: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  chip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: 20,
    backgroundColor: theme.colors.background.card,
    borderWidth: theme.borderWidth.thin,
    borderColor: theme.colors.background.cardBorder,
  },
  chipSelected: {
    backgroundColor: theme.colors.primary.blue,
    borderColor: theme.colors.primary.blue,
  },
  chipUnavailable: { opacity: 0.4 },
})
