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

    getHistory: (token: string, kpiKey: string, from: string, to: string, departmentId?: string): Promise<KpiHistoryPoint[]> => {
        const params = new URLSearchParams({ kpiKey, from, to })
        if (departmentId) params.set('department_id', departmentId)
        return getJson<KpiHistoryPoint[]>(`/kpis/history?${params.toString()}`, token)
    },
}
