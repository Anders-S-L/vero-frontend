import { useCallback, useEffect, useState } from 'react'
import {
    CreateTransactionResponse,
    Transaction,
    TransactionCostBehavior,
    TransactionRepeatFrequency,
    transactionModel,
} from '../models/transactionModel'

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

    const addTransaction = async (
        amount: number,
        date: string,
        description: string | null,
        costBehavior: TransactionCostBehavior | null = null,
        repeatMonthly = false,
        repeatUntil: string | null = null,
        categoryIdOverride?: string,
        repeatFrequency: TransactionRepeatFrequency = repeatMonthly ? 'monthly' : 'none',
    ): Promise<CreateTransactionResponse> => {
        try {
            const targetCategoryId = categoryIdOverride ?? categoryId
            const data = await transactionModel.createTransaction(
                token,
                amount,
                date,
                targetCategoryId,
                description,
                costBehavior,
                repeatMonthly,
                repeatUntil,
                repeatFrequency,
            )

            if ('recurring' in data) {
                const initialTransaction = data.transactions.find(transaction => transaction.date === date)
                    ?? data.transactions[0]

                if (initialTransaction) {
                    setTransactions(prev => [...prev, initialTransaction])
                }
            } else {
                setTransactions(prev => [...prev, data])
            }

            return data
        } catch (e) {
            setError((e as Error).message)
            throw e
        }
    }

    const updateTransaction = async (
        id: string,
        amount: number,
        date: string,
        description: string | null,
        costBehavior: TransactionCostBehavior | null = null,
    ): Promise<Transaction> => {
        try {
            const data = await transactionModel.updateTransaction(token, id, amount, date, description, costBehavior)
            setTransactions(prev => prev.map(transaction => transaction.id === id ? { ...transaction, ...data } : transaction))
            return data
        } catch (e) {
            setError((e as Error).message)
            throw e
        }
    }

    const deleteTransaction = async (id: string): Promise<void> => {
        try {
            await transactionModel.deleteTransaction(token, id)
            setTransactions(prev => prev.filter(transaction => transaction.id !== id))
        } catch (e) {
            setError((e as Error).message)
            throw e
        }
    }

    useEffect(() => { fetchTransactions() }, [fetchTransactions])

    return { transactions, isLoading, error, fetchTransactions, addTransaction, updateTransaction, deleteTransaction }
}
