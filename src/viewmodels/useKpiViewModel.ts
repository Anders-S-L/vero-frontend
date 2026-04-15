import { useCallback, useEffect, useState } from "react";
import { KpiResult, kpiModel } from "../models/kpiModel";

export const useKpiViewModel = (token: string, from: string, to: string) => {
  const [kpis, setKpis] = useState<KpiResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchKpis = useCallback(async () => {
    if (!token || !from || !to) return;
    try {
      setIsLoading(true);
      const data = await kpiModel.getKpis(token, from, to);
      setKpis(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [token, from, to]);

  useEffect(() => {
    fetchKpis();
  }, [fetchKpis]);

  return { kpis, isLoading, error, fetchKpis };
};
