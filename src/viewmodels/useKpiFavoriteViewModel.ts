import { useCallback, useEffect, useState } from 'react'
import { kpiFavoriteModel } from '../models/kpiFavoriteModel'

export const useKpiFavoriteViewModel = (token: string) => {
    const [favorites, setFavorites] = useState<string[]>([])
    const [isLoading, setIsLoading] = useState(false)

    const fetchFavorites = useCallback(async () => {
        if (!token) return
        try {
            setIsLoading(true)
            const data = await kpiFavoriteModel.getFavorites(token)
            setFavorites(data)
        } catch (e) {
            console.error('[KpiFavorites] GET fejlede:', (e as Error).message)
        } finally {
            setIsLoading(false)
        }
    }, [token])

    useEffect(() => {
        fetchFavorites()
    }, [fetchFavorites])

    const toggleFavorite = useCallback(async (kpiKey: string) => {
        const next = favorites.includes(kpiKey)
            ? favorites.filter((k) => k !== kpiKey)
            : [...favorites, kpiKey]

        setFavorites(next) // optimistic update
        try {
            const saved = await kpiFavoriteModel.replaceFavorites(token, next)
            setFavorites(saved)
        } catch (e) {
            console.error('[KpiFavorites] PUT fejlede:', (e as Error).message)
            setFavorites(favorites) // revert on error
        }
    }, [token, favorites])

    return { favorites, isLoading, toggleFavorite }
}
