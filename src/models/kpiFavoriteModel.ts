import { getJson, putJsonAuth } from '../api/client'

export type KpiHistoryPoint = {
    id: string
    kpi_key: string
    period_start: string
    period_end: string
    value: number | null
    unit: 'currency' | 'percentage' | 'ratio' | 'days'
    available: boolean
    reason: string | null
}

export const kpiFavoriteModel = {
    getFavorites: (token: string): Promise<string[]> =>
        getJson<string[]>('/kpi-favorites', token),

    replaceFavorites: (token: string, favorites: string[]): Promise<string[]> =>
        putJsonAuth<string[]>('/kpi-favorites', { favorites }, token),

    getHistory: (token: string, kpiKey: string, from: string, to: string): Promise<KpiHistoryPoint[]> =>
        getJson<KpiHistoryPoint[]>(`/kpis/history?kpiKey=${kpiKey}&from=${from}&to=${to}`, token),
}
