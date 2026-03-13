import { useState } from 'react'
import { authModel } from '../models/authModel'

export const useAuthViewModel = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const signupOwner = async (input: {
    email: string
    password: string
    fullName: string
    organizationName: string
    cvr?: string
    currency: string
    fiscalYearStart: number
  }) => {
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      const data = await authModel.signupOwner(input)
      setMessage(`Bruger oprettet. Org ID: ${data.organizationId}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Signup fejlede')
    } finally {
      setLoading(false)
    }
  }

  const [token, setToken] = useState<string | null>(null)
  const login = async (input: { email: string; password: string }) => {
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      const data = await authModel.login(input)
      setMessage(`Login OK. User ID: ${data.userId}`)
      setToken(data.accessToken)
      // Gem token i SecureStore/Keychain i rigtig app.
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Login fejlede')
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    message,
    signupOwner,
    login,
    token
  }
}