import { useCallback, useEffect, useState } from 'react'
import { Category, categoryModel, CategoryType, CostBehavior } from '../models/categoryModel'

export const useCategoryViewModel = (token: string, departmentId: string) => {
    const [categories, setCategories] = useState<Category[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchCategories = useCallback(async () => {
        try {
            setIsLoading(true)
            const data = await categoryModel.getCategories(token, departmentId)
            setCategories(data)
        } catch (e) {
            setError((e as Error).message)
        } finally {
            setIsLoading(false)
        }
    }, [token, departmentId])

    const addCategory = async (name: string, type: CategoryType, costBehavior: CostBehavior | null = null) => {
        try {
            const data = await categoryModel.createCategory(token, name, type, departmentId, costBehavior)
            setCategories(prev => [...prev, data])
        } catch (e) {
            setError((e as Error).message)
        }
    }

    const updateCategory = async (id: string, name: string, type: CategoryType, costBehavior: CostBehavior | null = null) => {
        try {
            const data = await categoryModel.updateCategory(token, id, name, type, costBehavior)
            setCategories(prev => prev.map(category => category.id === id ? data : category))
        } catch (e) {
            setError((e as Error).message)
            throw e
        }
    }

    const deleteCategory = async (id: string) => {
        try {
            await categoryModel.deleteCategory(token, id)
            setCategories(prev => prev.filter(category => category.id !== id))
        } catch (e) {
            setError((e as Error).message)
            throw e
        }
    }

    useEffect(() => { fetchCategories() }, [fetchCategories])

    return { categories, isLoading, error, addCategory, updateCategory, deleteCategory }
}
