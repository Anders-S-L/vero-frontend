import { getJson } from "../api/client";

export type KpiMetric = {
  label: string;
  value: number | null;
  unit: "currency" | "percentage" | "days" | "ratio";
  available: boolean;
  reason?: string;
  definition?: string | null;
  calculationExample?: string[] | null;
};

export type KpiMetrics = {
  revenue: KpiMetric;
  variableCosts: KpiMetric;
  contributionMargin: KpiMetric;
  grossProfit: KpiMetric;
  monthlyGrowthRate: KpiMetric;
  bruttofortjeneste: KpiMetric;
  grossMargin: KpiMetric;
  ebitda: KpiMetric;
  netResult: KpiMetric;
  cashFlow: KpiMetric;
  liquidityRatio: KpiMetric;
  burnRate: KpiMetric;
  debtorDays: KpiMetric;
};

export type KpiResult = {
  period: { from: string; to: string };
  metrics: KpiMetrics;
  assumptions: string[];
  transactionCount: number;
};

export const kpiModel = {
  getKpis: async (
    token: string,
    from: string,
    to: string,
  ): Promise<KpiResult> => {
    return getJson<KpiResult>(`/kpis?from=${from}&to=${to}`, token);
  },
};
