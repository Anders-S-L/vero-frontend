import { getJson, putJsonAuth } from "../api/client"

export type OwnProfile = {
  id: string
  full_name: string | null
  role: "admin" | "manager" | "employee"
  department_id?: string | null
}

export const profileModel = {
  getOwnProfile: (token: string): Promise<OwnProfile> =>
    getJson<OwnProfile>("/profiles/me", token),

  updateOwnProfileName: (token: string, fullName: string): Promise<OwnProfile> =>
    putJsonAuth<OwnProfile>("/profiles/me", { fullName }, token),
}
