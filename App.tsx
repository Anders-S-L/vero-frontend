import React, { useState } from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import OrganisationScreen from './src/views/screens/organisation/OrganisationScreen'
import { AuthScreen } from './src/views/screens/SignupLoginScreen'

export default function App() {
  const [token, setToken] = useState<string | null>(null)
  const [organisationName, setOrganisationName] = useState<string>('')
  const [role, setRole] = useState<'admin' | 'manager' | 'employee' | 'auditor' | null>(null)

  return (
    <SafeAreaProvider>
      {token
        ? <OrganisationScreen token={token} organisationName={organisationName} userRole={role ?? 'employee'} />
        : <AuthScreen onLogin={(t, name, userRole) => {
          setOrganisationName(name)
          setRole(userRole)
          setToken(t)
        }} />
      }
    </SafeAreaProvider>
  )
}