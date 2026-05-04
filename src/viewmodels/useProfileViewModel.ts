import { useCallback, useEffect, useState } from "react"
import { OwnProfile, profileModel } from "../models/profileModel"

export const useProfileViewModel = (token: string) => {
  const [profile, setProfile] = useState<OwnProfile | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = useCallback(async () => {
    if (!token) return
    setIsLoading(true)
    setError(null)

    try {
      const data = await profileModel.getOwnProfile(token)
      setProfile(data)
    } catch (e) {
      setError((e as Error).message || "Kunne ikke hente profil.")
    } finally {
      setIsLoading(false)
    }
  }, [token])

  const updateName = async (fullName: string) => {
    setIsSaving(true)
    setError(null)

    try {
      const data = await profileModel.updateOwnProfileName(token, fullName)
      setProfile(data)
      return data
    } catch (e) {
      setError((e as Error).message || "Kunne ikke gemme profil.")
      throw e
    } finally {
      setIsSaving(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  return { profile, isLoading, isSaving, error, fetchProfile, updateName }
}
