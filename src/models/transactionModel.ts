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

export type CreateTransactionResponse =
    | Transaction
    | {
        recurring: true
        created_count: number
        repeat_until: string | null
        transactions: Transaction[]
    }

export type TransactionRepeatFrequency = 'none' | 'weekly' | 'monthly' | 'yearly'

export const transactionModel = {
    getTransactions: (token: string) =>
        getJson<Transaction[]>('/transactions', token),

    createTransaction: (
        token: string,
        amount: number,
        date: string,
        category_id: string,
        description: string | null,
        repeat_monthly = false,
        repeat_until: string | null = null,
        repeat_frequency: TransactionRepeatFrequency = 'none',
    ) =>
        postJsonAuth<CreateTransactionResponse>(
            '/transactions',
            {
                amount,
                date,
                category_id,
                description,
                repeat_monthly,
                repeat_until,
                repeat_frequency: repeat_frequency === 'none' ? null : repeat_frequency,
            },
            token,
        ),

    updateTransaction: (token: string, id: string, amount: number, date: string, description: string | null) =>
        putJsonAuth<Transaction>(`/transactions/${id}`, { amount, date, description }, token),

    deleteTransaction: (token: string, id: string) =>
        deleteJsonAuth(`/transactions/${id}`, token)
}
