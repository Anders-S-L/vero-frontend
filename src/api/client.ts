import { API_BASE_URL } from '../constants/config'

export const postJson = async <T>(path: string, body: unknown): Promise<T> => {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    })

    const payload = await response.json()

    if (!response.ok || !payload.success) {
        throw new Error(payload.error || 'Request fejlede')
    }

    return payload.data as T
}

export const getJson = async <T>(path: string, token: string): Promise<T> => {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        headers: { Authorization: `Bearer ${token}` },
    })
    const payload = await response.json()
    if (!response.ok || !payload.success) throw new Error(payload.error || 'Request fejlede')
    return payload.data as T
}

export const postJsonAuth = async <T>(path: string, body: unknown, token: string): Promise<T> => {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
    })
    const payload = await response.json()
    if (!response.ok || !payload.success) throw new Error(payload.error || 'Request fejlede')
    return payload.data as T
}

export const putJsonAuth = async <T>(path: string, body: unknown, token: string): Promise<T> => {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
    })
    const payload = await response.json()
    if (!response.ok || !payload.success) throw new Error(payload.error || 'Request fejlede')
    return payload.data as T
}

export const deleteJsonAuth = async (path: string, token: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
    })

    const payload = await response.json()
    if (!response.ok || !payload.success) throw new Error(payload.error || 'Request fejlede')
}
