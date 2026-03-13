import React, { useState } from 'react'
import { Button, SafeAreaView, Text, TextInput, View } from 'react-native'
import { useAuthViewModel } from '../../viewmodels/useSignupLoginViewModel'

export const AuthScreen = () => {
    const { loading, error, message, signupOwner, login } = useAuthViewModel()
    const [mode, setMode] = useState<'login' | 'signup'>('signup')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [fullName, setFullName] = useState('')
    const [organizationName, setOrganizationName] = useState('')

    const submit = async () => {
        if (mode === 'signup') {
            await signupOwner({
                email,
                password,
                fullName,
                organizationName,
                currency: 'DKK',
                fiscalYearStart: 1,
            })
            return
        }

        await login({ email, password })
    }

    return (
        <SafeAreaView
            style={{
                flex: 1,
                backgroundColor: '#f5f7fb',
                justifyContent: 'center',
                padding: 20,
            }}
        >
            <View
                style={{
                    backgroundColor: '#ffffff',
                    borderRadius: 16,
                    padding: 20,
                    gap: 12,
                    shadowColor: '#000',
                    shadowOpacity: 0.08,
                    shadowRadius: 8,
                    shadowOffset: { width: 0, height: 4 },
                    elevation: 3,
                }}
            >
                <Text
                    style={{
                        fontSize: 28,
                        fontWeight: '700',
                        color: '#111827',
                        marginBottom: 4,
                    }}
                >
                    {mode === 'signup' ? 'Opret virksomhed' : 'Log ind'}
                </Text>

                <Text
                    style={{
                        fontSize: 14,
                        color: '#6b7280',
                        marginBottom: 8,
                    }}
                >
                    {mode === 'signup'
                        ? 'Opret ejerkonto og virksomhed for at komme i gang.'
                        : 'Log ind på din konto for at fortsætte.'}
                </Text>

                <TextInput
                    placeholder="Email"
                    placeholderTextColor="#9ca3af"
                    style={{
                        borderWidth: 1,
                        borderColor: '#d1d5db',
                        borderRadius: 10,
                        paddingHorizontal: 14,
                        paddingVertical: 12,
                        color: '#111827',
                        backgroundColor: '#ffffff',
                    }}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />

                <TextInput
                    placeholder="Password"
                    placeholderTextColor="#9ca3af"
                    style={{
                        borderWidth: 1,
                        borderColor: '#d1d5db',
                        borderRadius: 10,
                        paddingHorizontal: 14,
                        paddingVertical: 12,
                        color: '#111827',
                        backgroundColor: '#ffffff',
                    }}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />

                {mode === 'signup' && (
                    <View style={{ gap: 12 }}>
                        <TextInput
                            placeholder="Full name"
                            placeholderTextColor="#9ca3af"
                            style={{
                                borderWidth: 1,
                                borderColor: '#d1d5db',
                                borderRadius: 10,
                                paddingHorizontal: 14,
                                paddingVertical: 12,
                                color: '#111827',
                                backgroundColor: '#ffffff',
                            }}
                            value={fullName}
                            onChangeText={setFullName}
                        />

                        <TextInput
                            placeholder="Organization name"
                            placeholderTextColor="#9ca3af"
                            style={{
                                borderWidth: 1,
                                borderColor: '#d1d5db',
                                borderRadius: 10,
                                paddingHorizontal: 14,
                                paddingVertical: 12,
                                color: '#111827',
                                backgroundColor: '#ffffff',
                            }}
                            value={organizationName}
                            onChangeText={setOrganizationName}
                        />
                    </View>
                )}

                {error ? (
                    <Text
                        style={{
                            color: '#b91c1c',
                            backgroundColor: '#fee2e2',
                            padding: 10,
                            borderRadius: 8,
                        }}
                    >
                        {error}
                    </Text>
                ) : null}

                {message ? (
                    <Text
                        style={{
                            color: '#166534',
                            backgroundColor: '#dcfce7',
                            padding: 10,
                            borderRadius: 8,
                        }}
                    >
                        {message}
                    </Text>
                ) : null}

                <Button
                    title={loading ? 'Sender...' : mode === 'signup' ? 'Opret konto' : 'Log ind'}
                    onPress={submit}
                />

                <Button
                    title={mode === 'signup' ? 'Har du allerede en bruger?' : 'Ny bruger? Opret konto'}
                    onPress={() => setMode(mode === 'signup' ? 'login' : 'signup')}
                />
            </View>
        </SafeAreaView>
    )
}