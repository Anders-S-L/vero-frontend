const getSupabaseEnv = () => {
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Mangler EXPO_PUBLIC_SUPABASE_URL eller EXPO_PUBLIC_SUPABASE_ANON_KEY i frontend miljø.')
    }

    return { supabaseUrl, supabaseAnonKey }
}

export const updateInvitePassword = async (accessToken: string, password: string) => {
    const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv()

    const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
        method: 'PUT',
        headers: {
            apikey: supabaseAnonKey,
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
    })

    const payload = await response.json()
    if (!response.ok) {
        throw new Error(payload?.msg || payload?.error_description || payload?.error || 'Kunne ikke opdatere password.')
    }

    return payload
}

export const getInviteUserEmail = async (accessToken: string): Promise<string> => {
    const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv()

    const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
        headers: {
            apikey: supabaseAnonKey,
            Authorization: `Bearer ${accessToken}`,
        },
    })

    const payload = await response.json()
    const email = payload?.email

    if (!response.ok || !email) {
        throw new Error(payload?.msg || payload?.error_description || payload?.error || 'Kunne ikke hente invite bruger.')
    }

    return String(email)
}