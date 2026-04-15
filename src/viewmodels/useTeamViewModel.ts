import { useCallback, useEffect, useMemo, useState } from 'react'
import { getJson, postJsonAuth } from '../api/client'

export type TeamRole = 'admin' | 'manager' | 'employee' | 'auditor'

export type TeamMember = {
    id: string
    fullName: string
    email: string
    role: TeamRole
    departmentId: string
    departmentName?: string
    status: 'active' | 'pending'
}

type InviteEmployeePayload = {
    email: string
    fullName: string
    role: Exclude<TeamRole, 'admin'>
    departmentId: string
}

const normalizeMember = (raw: any): TeamMember | null => {
    if (!raw || typeof raw !== 'object') return null

    const id = String(raw.id ?? raw.profile_id ?? raw.user_id ?? raw.userId ?? '')
    const fullName = String(raw.full_name ?? raw.fullName ?? raw.name ?? raw.user_metadata?.full_name ?? '')
    const email = String(raw.email ?? raw.user_email ?? raw.invited_email ?? '')
    const role = (raw.role ?? 'employee') as TeamRole
    const departmentId = String(
        raw.department_id ?? raw.departmentId ?? raw.departments?.id ?? raw.department?.id ?? '',
    )
    const departmentName = raw.departments?.name ?? raw.department?.name ?? raw.departmentName
    const status = raw.is_active === false || raw.status === 'pending' ? 'pending' : 'active'

    if (!id || !email) return null

    return {
        id,
        fullName: fullName || email,
        email,
        role,
        departmentId,
        departmentName: departmentName ? String(departmentName) : undefined,
        status,
    }
}
const parseMembersPayload = (raw: unknown): unknown[] => {
    if (Array.isArray(raw)) return raw
    if (!raw || typeof raw !== 'object') return []

    const candidate = raw as Record<string, unknown>
    const listLike = candidate.members ?? candidate.profiles ?? candidate.items ?? candidate.results

    return Array.isArray(listLike) ? listLike : []
}
export const useTeamViewModel = (token: string) => {
    const [members, setMembers] = useState<TeamMember[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [inviteLoading, setInviteLoading] = useState(false)

    const fetchMembers = useCallback(async () => {
        setIsLoading(true)
        setError(null)

        try {
            const rawData = await getJson<unknown>('/profiles', token)
            const normalized = parseMembersPayload(rawData).map(normalizeMember).filter(Boolean) as TeamMember[]
            setMembers(normalized)
        } catch (e) {
            setMembers([])
            setError((e as Error).message || 'Kunne ikke hente medarbejdere.')
        } finally {
            setIsLoading(false)
        }
    }, [token])

    const inviteEmployee = async (payload: InviteEmployeePayload) => {
        setInviteLoading(true)
        setError(null)

        try {
            const invited = await postJsonAuth<{
                userId: string
                email: string
                fullName: string
                role: Exclude<TeamRole, 'admin'>
                departmentId: string
                status: 'pending'
            }>('/auth/invite', payload, token)

            setMembers(prev => [
                {
                    id: invited.userId,
                    email: invited.email,
                    fullName: invited.fullName,
                    role: invited.role,
                    departmentId: invited.departmentId,
                    status: invited.status,
                },
                ...prev,
            ])
        } catch (e) {
            setError((e as Error).message)
            throw e
        } finally {
            setInviteLoading(false)
        }
    }

    const totalMembers = useMemo(() => members.length, [members])

    useEffect(() => {
        fetchMembers()
    }, [fetchMembers])

    return {
        members,
        totalMembers,
        isLoading,
        error,
        inviteLoading,
        inviteEmployee,
        refresh: fetchMembers,
    }
}