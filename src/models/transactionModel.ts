import { deleteJsonAuth, getJson, postJsonAuth, putJsonAuth } from '../api/client'

export type Transaction = {
    id: string
    category_id: string
    amount: number
    date: string
    description: string | null
    created_at: string
    categories?: {
        id: string
        name: string
        type: string
        departments?: {
            id: string
            name: string
        }
    }
}

export const transactionModel = {
    getTransactions: (token: string) =>
        getJson<Transaction[]>('/transactions', token),

    createTransaction: (token: string, amount: number, date: string, category_id: string, description: string | null) =>
        postJsonAuth<Transaction>('/transactions', { amount, date, category_id, description }, token)
,
    updateTransaction: (token: string, id: string, amount: number, date: string, description: string | null) =>
        putJsonAuth<Transaction>(`/transactions/${id}`, { amount, date, description }, token),

    deleteTransaction: (token: string, id: string) =>
        deleteJsonAuth(`/transactions/${id}`, token)
}
