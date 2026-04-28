import { CategoryType } from "../../../models/categoryModel"
import { Transaction } from "../../../models/transactionModel"
import { theme } from "../../../constants/theme"

export type PeriodPreset =
  | "currentMonth"
  | "last30Days"
  | "currentQuarter"
  | "currentYear"
  | "custom"

export const KPI_LABELS: Record<string, string> = {
  revenue: "Omsætning",
  ebitda: "EBITDA",
  netResult: "Nettoresultat",
  cashFlow: "Cash Flow",
  burnRate: "Burn Rate",
  monthlyGrowthRate: "Månedlig vækst",
  grossProfit: "Bruttofortjeneste",
  grossMargin: "Bruttomargin",
  variableCosts: "Variable omkostninger",
  contributionMargin: "Dækningsbidrag",
  liquidityRatio: "Likviditetsgrad",
  debtorDays: "Debitordage",
}

export const KPI_COLORS: Record<string, string> = {
  revenue: theme.colors.kpi.revenue,
  ebitda: theme.colors.kpi.profitEbitda,
  netResult: theme.colors.kpi.profitEbitda,
  cashFlow: theme.colors.kpi.cashFlow,
  burnRate: theme.colors.kpi.burnRate,
  monthlyGrowthRate: theme.colors.kpi.monthlyGrowthRate,
  grossProfit: theme.colors.kpi.grossProfit,
  grossMargin: theme.colors.kpi.profitEbitda,
  variableCosts: theme.colors.kpi.variableCosts,
  contributionMargin: theme.colors.kpi.contributionMargin,
  liquidityRatio: theme.colors.primary.blue,
  debtorDays: theme.colors.primary.blue,
}

export const TABS = [
  { key: "overblik", label: "Overblik", icon: "grid-outline" as const },
  { key: "afdelinger", label: "Afdelinger", icon: "business-outline" as const },
  { key: "transaktioner", label: "Transaktioner", icon: "card-outline" as const },
  { key: "dashboards", label: "Dashboards", icon: "stats-chart-outline" as const },
  { key: "team", label: "Team", icon: "people-outline" as const },
]

export const getSignedAmount = (amount: number, categoryType: CategoryType) => {
  const absoluteAmount = Math.abs(amount)
  return categoryType === "income" ? absoluteAmount : -absoluteAmount
}

export const getTransactionCategoryType = (transaction: Transaction): CategoryType =>
  transaction.categories?.type === "income" ||
    transaction.categories?.type === "expense" ||
    transaction.categories?.type === "tax" ||
    transaction.categories?.type === "depreciation"
    ? transaction.categories.type
    : transaction.amount >= 0
      ? "income"
      : "expense"

export const formatDateForInput = (date: Date) => {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, "0")
  const day = `${date.getDate()}`.padStart(2, "0")
  return `${year}-${month}-${day}`
}

const getQuarterStart = (date: Date) =>
  new Date(date.getFullYear(), Math.floor(date.getMonth() / 3) * 3, 1)

export const getPeriodRange = (preset: PeriodPreset) => {
  const today = new Date()
  switch (preset) {
    case "last30Days": {
      const from = new Date(today)
      from.setDate(from.getDate() - 29)
      return { from: formatDateForInput(from), to: formatDateForInput(today) }
    }
    case "currentQuarter":
      return {
        from: formatDateForInput(getQuarterStart(today)),
        to: formatDateForInput(today),
      }
    case "currentYear":
      return {
        from: formatDateForInput(new Date(today.getFullYear(), 0, 1)),
        to: formatDateForInput(today),
      }
    case "currentMonth":
    default:
      return {
        from: formatDateForInput(new Date(today.getFullYear(), today.getMonth(), 1)),
        to: formatDateForInput(today),
      }
  }
}

export const isValidIsoDate = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00`)
  return !Number.isNaN(date.getTime()) && formatDateForInput(date) === value
}
