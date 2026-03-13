import { authService } from '../services/authService'
import { LoginPayload, RegisterOwnerPayload } from '../types/auth'

export const authModel = {
    signupOwner: async (input: RegisterOwnerPayload) => {
        return authService.signupOwner(input)
    },

    login: async (input: LoginPayload) => {
        return authService.login(input)
    },
}