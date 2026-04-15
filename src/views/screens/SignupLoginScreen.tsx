import React, { useMemo, useState } from 'react'
import { Button, SafeAreaView, Text, TextInput, View } from 'react-native'
import { getInviteUserEmail, updateInvitePassword } from '../../lib/supabaseAuth'
import { useAuthViewModel } from '../../viewmodels/useSignupLoginViewModel'

export const AuthScreen = ({ onLogin }: { onLogin: (token: string, organisationName: string, role: 'admin' | 'manager' | 'employee' | 'auditor') => void }) => {
    const { loading, error, message, signupOwner, login, token, organisationName: orgName, role } = useAuthViewModel()
    const [mode, setMode] = useState<'login' | 'signup'>('login')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [fullName, setFullName] = useState('')
    const [organisationName, setOrganisationName] = useState('')
    const [inviteSubmitting, setInviteSubmitting] = useState(false)
    const [inviteError, setInviteError] = useState<string | null>(null)

    const [cvr, setCvr] = useState('')

    const inviteTokens = useMemo(() => {
        const locationHash =
            typeof window !== 'undefined' && window.location && typeof window.location.hash === 'string'
                ? window.location.hash
                : ''

        if (!locationHash) return null

        const hash = locationHash.startsWith('#') ? locationHash.slice(1) : locationHash
        const params = new URLSearchParams(hash)
        const accessToken = params.get('access_token')
        const type = params.get('type')

        if (type !== 'invite' || !accessToken) return null

        return { accessToken }
    }, [])

    const isInviteFlow = Boolean(inviteTokens)


    React.useEffect(() => {
        if (token && role) onLogin(token, orgName ?? '', role)
    }, [token, onLogin, orgName, role])

    const submit = async () => {
        if (isInviteFlow && inviteTokens) {
            setInviteError(null)
            if (!password || password.length < 8) {
                setInviteError('Password skal være mindst 8 tegn.')
                return
            }

            if (password !== confirmPassword) {
                setInviteError('Passwords matcher ikke.')
                return
            }

            setInviteSubmitting(true)
            try {
                await updateInvitePassword(inviteTokens.accessToken, password)
                const inviteEmail = await getInviteUserEmail(inviteTokens.accessToken)
                await login({ email: inviteEmail, password })
            } catch (e) {
                const message = e instanceof Error ? e.message : 'Kunne ikke færdiggøre invitationen.'
                setInviteError(message)
            } finally {
                setInviteSubmitting(false)
            }
            return
        }
        if (mode === 'signup') {
            await signupOwner({
                email,
                password,
                fullName,
                organisationName,
                cvr,
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
                    {isInviteFlow ? 'Sæt dit password' : mode === 'signup' ? 'Opret virksomhed' : 'Log ind'}
                </Text>

                <Text
                    style={{
                        fontSize: 14,
                        color: '#6b7280',
                        marginBottom: 8,
                    }}
                >
                    {isInviteFlow
                        ? 'Du er inviteret som medarbejder. Vælg et password for at aktivere din bruger.'
                        : mode === 'signup'
                            ? 'Kun for virksomhedsejer: Opret ejerkonto og virksomhed.'
                            : 'Log ind på din konto for at fortsætte. Inviterede medarbejdere skal først acceptere invite-linket i mailen og derefter logge ind her.'}
                </Text>

                {!isInviteFlow && (
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
                )}

                <TextInput
                    placeholder={isInviteFlow ? 'Password (min. 8 tegn)' : 'Password'}
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
                {isInviteFlow && (
                    <TextInput
                        placeholder="Gentag password"
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
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                    />
                )}
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
                            placeholder="Organisation name"
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
                            value={organisationName}
                            onChangeText={setOrganisationName}
                        />

                        <TextInput
                            placeholder="CVR (valgfrit)"
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
                            value={cvr}
                            onChangeText={setCvr}
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
                {inviteError ? (
                    <Text
                        style={{
                            color: '#b91c1c',
                            backgroundColor: '#fee2e2',
                            padding: 10,
                            borderRadius: 8,
                        }}
                    >
                        {inviteError}
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
                    title={loading || inviteSubmitting ? 'Sender...' : isInviteFlow ? 'Aktivér bruger' : mode === 'signup' ? 'Opret konto' : 'Log ind'}
                    onPress={submit}
                />

                {!isInviteFlow && (
                    <Button
                        title={mode === 'signup' ? 'Har du allerede en bruger?' : 'Ny bruger? Opret konto'}
                        onPress={() => setMode(mode === 'signup' ? 'login' : 'signup')}
                    />
                )}
            </View>
        </SafeAreaView>
    )
}