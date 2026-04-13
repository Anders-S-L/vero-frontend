import { postJson } from '../api/client';
import { LoginPayload, RegisterOwnerPayload } from '../types/auth';

export const authService = {
    signupOwner: (input: RegisterOwnerPayload) => {
        return postJson<{ userId: string; organisationId: string; role: 'admin' }>(
            '/auth/register-owner',
            input,
        )
    },

    login: (input: LoginPayload) => {
        return postJson<{
            userId: string
            accessToken: string
            refreshToken: string
            expiresIn: number
            tokenType: string
            fullName: string
            role: 'admin' | 'manager' | 'employee' | 'auditor'
            organisationName: string
        }>('/auth/login', input)
    },
}