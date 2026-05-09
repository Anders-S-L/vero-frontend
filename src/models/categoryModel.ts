import { deleteJsonAuth, getJson, postJsonAuth, putJsonAuth } from '../api/client'

export type CategoryType = 'income' | 'expense' | 'tax' | 'depreciation'
export type CostBehavior = 'variable' | 'fixed'

export type Category = {
    id: string
    name: string
    type: CategoryType
    cost_behavior: CostBehavior | null
    statement_section?: string | null
    is_cash?: boolean
    department_id: string
    is_active: boolean
    created_at: string
}

export const categoryModel = {
    getCategories: (token: string, departmentId: string) =>
        getJson<Category[]>(departmentId ? `/categories?department_id=${departmentId}` : '/categories', token),

    createCategory: (token: string, name: string, type: CategoryType, departmentId: string, costBehavior: CostBehavior | null = null) =>
        postJsonAuth<Category>('/categories', { name, type, department_id: departmentId, cost_behavior: costBehavior }, token),

    updateCategory: (token: string, id: string, name: string, type: CategoryType, costBehavior: CostBehavior | null = null) =>
        putJsonAuth<Category>(`/categories/${id}`, { name, type, cost_behavior: costBehavior }, token),

    deleteCategory: (token: string, id: string) =>
        deleteJsonAuth(`/categories/${id}`, token)
}
