import { getJson, postJsonAuth } from '../api/client'

export type CategoryType = 'income' | 'expense' | 'tax' | 'depreciation'

export type Category = {
    id: string
    name: string
    type: CategoryType
    department_id: string
    is_active: boolean
    created_at: string
}

export const categoryModel = {
    getCategories: (token: string, departmentId: string) =>
        getJson<Category[]>(`/categories?department_id=${departmentId}`, token),

    createCategory: (token: string, name: string, type: CategoryType, departmentId: string) =>
        postJsonAuth<Category>('/categories', { name, type, department_id: departmentId }, token)
}