import { useCallback, useEffect, useState } from 'react'
import { getJson, postJsonAuth } from '../api/client'

type Department = {
    id: string
    name: string
    is_active: boolean
    created_at: string
}

export const useOrganisationViewModel = (token: string) => {
    const [departments, setDepartments] = useState<Department[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchDepartments = useCallback(async () => {
        try {
            setIsLoading(true)
            const data = await getJson<Department[]>('/departments', token)
            setDepartments(data)
        } catch (e) {
            setError((e as Error).message)
        } finally {
            setIsLoading(false)
        }
    }, [token])

    const addDepartment = async (name: string) => {
        try {
            const data = await postJsonAuth<Department>('/departments', { name }, token)
            setDepartments(prev => [...prev, data])
        } catch (e) {
            setError((e as Error).message)
        }
    }

    useEffect(() => { fetchDepartments() }, [fetchDepartments])

    return { departments, isLoading, error, addDepartment }
}