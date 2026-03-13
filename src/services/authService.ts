import { postJson } from '../api/client';
import { LoginPayload, RegisterOwnerPayload } from '../types/auth';

export const authService = {
    signupOwner: (input: RegisterOwnerPayload) => {
        return postJson<{ userId: string; organizationId: string; role: 'admin' }>(
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
        }>('/auth/login', input)
    },
}