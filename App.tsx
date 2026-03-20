import React, { useState } from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import OrganisationScreen from './src/views/screens/OrganisationScreen'
import { AuthScreen } from './src/views/screens/SignupLoginScreen'

export default function App() {
  const [token, setToken] = useState<string | null>(null)
  const [organisationName, setOrganisationName] = useState<string>('')

  return (
    <SafeAreaProvider>
      {token
        ? <OrganisationScreen token={token} organisationName={organisationName} />
        : <AuthScreen onLogin={(t, name) => {
          setOrganisationName(name)
          setToken(t)
        }} />
      }
    </SafeAreaProvider>
  )
}