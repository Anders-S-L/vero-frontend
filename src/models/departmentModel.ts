import { deleteJsonAuth, getJson, postJsonAuth, putJsonAuth } from '../api/client'

export type Department = {
    id: string
    name: string
    is_active: boolean
    created_at: string
}

export const departmentModel = {
    getDepartments: (token: string) =>
        getJson<Department[]>('/departments', token),

    createDepartment: (token: string, name: string) =>
        postJsonAuth<Department>('/departments', { name }, token),

    updateDepartment: (token: string, id: string, name: string) =>
        putJsonAuth<Department>(`/departments/${id}`, { name }, token),

    deleteDepartment: (token: string, id: string) =>
        deleteJsonAuth(`/departments/${id}`, token),
}
