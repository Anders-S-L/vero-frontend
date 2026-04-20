import { getJson, putJsonAuth } from "../api/client";

export const FAVORITE_KPI_KEYS = [
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
] as const;

export type FavoriteKpiKey = (typeof FAVORITE_KPI_KEYS)[number];

const isFavoriteKpiKey = (value: unknown): value is FavoriteKpiKey =>
  typeof value === "string" &&
  FAVORITE_KPI_KEYS.includes(value as FavoriteKpiKey);

type FavoriteKpisResponse =
  | unknown[]
  | {
      favorites?: unknown[];
      favoriteKpis?: unknown[];
      kpiKeys?: unknown[];
    };

const normalizeFavoriteKpis = (
  response: FavoriteKpisResponse,
): FavoriteKpiKey[] => {
  const rawFavorites = Array.isArray(response)
    ? response
    : response.favorites ?? response.favoriteKpis ?? response.kpiKeys ?? [];

  return rawFavorites.filter(isFavoriteKpiKey).filter((key, index, keys) => {
    return keys.indexOf(key) === index;
  });
};

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

  getFavoriteKpis: async (token: string): Promise<FavoriteKpiKey[]> => {
    const response = await getJson<FavoriteKpisResponse>(
      "/kpi-favorites",
      token,
    );

    return normalizeFavoriteKpis(response);
  },

  updateFavoriteKpis: async (
    token: string,
    favorites: FavoriteKpiKey[],
  ): Promise<FavoriteKpiKey[]> => {
    const normalizedFavorites = normalizeFavoriteKpis(favorites);
    const response = await putJsonAuth<FavoriteKpisResponse>(
      "/kpi-favorites",
      { favorites: normalizedFavorites },
      token,
    );

    return normalizeFavoriteKpis(response);
  },
};
