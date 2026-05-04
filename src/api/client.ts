import { API_BASE_URL } from '../constants/config'

type ApiPayload = {
    success?: boolean
    error?: string
    data?: unknown
}

const parseResponsePayload = async (response: Response, requestUrl: string): Promise<ApiPayload> => {
    const rawText = await response.text()
    try {
        return rawText ? JSON.parse(rawText) : {}
    } catch {
        const preview = rawText.slice(0, 300)
        throw new Error(`Server returnerede ikke JSON fra ${requestUrl} (status ${response.status}). Svar starter med: ${preview}`)
    }
}

export const postJson = async <T>(path: string, body: unknown): Promise<T> => {
    const requestUrl = `${API_BASE_URL}${path}`
    const response = await fetch(requestUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    })

    const payload = await parseResponsePayload(response, requestUrl)

    if (!response.ok || !payload.success) {
        throw new Error(payload.error || 'Request fejlede')
    }

    return payload.data as T
}

export const getJson = async <T>(path: string, token: string): Promise<T> => {
    const requestUrl = `${API_BASE_URL}${path}`
    const response = await fetch(requestUrl, {
        headers: { Authorization: `Bearer ${token}` },
    })
    const payload = await parseResponsePayload(response, requestUrl)

    if (!response.ok || !payload.success) throw new Error(payload.error || 'Request fejlede')
    return payload.data as T
}

export const postJsonAuth = async <T>(path: string, body: unknown, token: string): Promise<T> => {
    const requestUrl = `${API_BASE_URL}${path}`
    const response = await fetch(requestUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
    })
    const payload = await parseResponsePayload(response, requestUrl)

    if (!response.ok || !payload.success) throw new Error(payload.error || 'Request fejlede')
    return payload.data as T
}

export const putJsonAuth = async <T>(path: string, body: unknown, token: string): Promise<T> => {
    const requestUrl = `${API_BASE_URL}${path}`
    const response = await fetch(requestUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
    })
    const payload = await parseResponsePayload(response, requestUrl)
    if (!response.ok || !payload.success) throw new Error(payload.error || 'Request fejlede')
    return payload.data as T
}

export const deleteJsonAuth = async (path: string, token: string): Promise<void> => {
    const requestUrl = `${API_BASE_URL}${path}`
    const response = await fetch(requestUrl, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
    })

    const payload = await parseResponsePayload(response, requestUrl)
    if (!response.ok || !payload.success) throw new Error(payload.error || 'Request fejlede')
}
