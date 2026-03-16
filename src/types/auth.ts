export type RegisterOwnerPayload = {
    email: string
    password: string
    fullName: string
    organisationName: string
    cvr?: string
    currency: string
    fiscalYearStart: number
}

export type LoginPayload = {
    email: string
    password: string
}