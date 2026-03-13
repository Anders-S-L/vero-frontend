import React, { useState } from 'react'
import OrganisationScreen from './src/views/screens/OrganisationScreen'
import { AuthScreen } from './src/views/screens/SignupLoginScreen'

export default function App() {
  const [token, setToken] = useState<string | null>(null)

  if (token) return <OrganisationScreen token={token} />
  return <AuthScreen onLogin={(t) => setToken(t)} />
}