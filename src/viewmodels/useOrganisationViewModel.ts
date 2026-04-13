import { useCallback, useEffect, useState } from 'react'
import { Department, departmentModel } from '../models/departmentModel'

export const useOrganisationViewModel = (token: string) => {
    const [departments, setDepartments] = useState<Department[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchDepartments = useCallback(async () => {
        try {
            setIsLoading(true)
            const data = await departmentModel.getDepartments(token)
            setDepartments(data)
        } catch (e) {
            setError((e as Error).message)
        } finally {
            setIsLoading(false)
        }
    }, [token])

    const addDepartment = async (name: string) => {
        try {
            const data = await departmentModel.createDepartment(token, name)
            setDepartments(prev => [...prev, data])
        } catch (e) {
            setError((e as Error).message)
        }
    }

    const updateDepartment = async (id: string, name: string) => {
        try {
            const data = await departmentModel.updateDepartment(token, id, name)
            setDepartments(prev => prev.map(department => department.id === id ? data : department))
        } catch (e) {
            setError((e as Error).message)
            throw e
        }
    }

    const deleteDepartment = async (id: string) => {
        try {
            await departmentModel.deleteDepartment(token, id)
            setDepartments(prev => prev.filter(department => department.id !== id))
        } catch (e) {
            setError((e as Error).message)
            throw e
        }
    }

    useEffect(() => { fetchDepartments() }, [fetchDepartments])

    return { departments, isLoading, error, addDepartment, updateDepartment, deleteDepartment }
}
