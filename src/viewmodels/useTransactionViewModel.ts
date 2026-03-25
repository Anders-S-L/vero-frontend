import { useCallback, useEffect, useState } from 'react'
import { Transaction, transactionModel } from '../models/transactionModel'

export const useTransactionViewModel = (token: string, categoryId: string) => {
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchTransactions = useCallback(async () => {
        try {
            setIsLoading(true)
            const data = await transactionModel.getTransactions(token)
            setTransactions(categoryId ? data.filter(t => t.category_id === categoryId) : data)
        } catch (e) {
            setError((e as Error).message)
        } finally {
            setIsLoading(false)
        }
    }, [token, categoryId])

    const addTransaction = async (amount: number, date: string, description: string | null): Promise<Transaction> => {
        try {
            const data = await transactionModel.createTransaction(token, amount, date, categoryId, description)
            setTransactions(prev => [...prev, data])
            return data
        } catch (e) {
            setError((e as Error).message)
            throw e
        }
    }

    useEffect(() => { fetchTransactions() }, [fetchTransactions])

    return { transactions, isLoading, error, addTransaction }
}