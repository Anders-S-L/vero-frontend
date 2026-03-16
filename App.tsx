import React, { useState } from 'react'
import OrganisationScreen from './src/views/screens/OrganisationScreen'
import { AuthScreen } from './src/views/screens/SignupLoginScreen'

export default function App() {
  const [token, setToken] = useState<string | null>(null)
  const [organisationName, setOrganisationName] = useState<string>('')

  if (token) return <OrganisationScreen token={token} organisationName={organisationName} />
  return <AuthScreen onLogin={(t, name) => {
    setOrganisationName(name)
    setToken(t)
  }} />
}