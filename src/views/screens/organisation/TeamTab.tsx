import React, { useState } from "react"
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  View,
} from "react-native"
import {
  AlertMessage,
  AppText,
  BaseModal,
  DropdownField,
  InputField,
  PrimaryButton,
} from "../../../components"
import { theme } from "../../../constants/theme"
import { useOrganisationViewModel } from "../../../viewmodels/useOrganisationViewModel"
import { TeamRole, useTeamViewModel } from "../../../viewmodels/useTeamViewModel"

const roleLabel = (role: TeamRole) => {
  if (role === "admin") return "Admin"
  if (role === "manager") return "Manager"
  return "Medarbejder"
}

type Props = {
  token: string
  userRole: TeamRole
}

export function TeamTab({ token, userRole }: Props) {
  const { departments } = useOrganisationViewModel(token)
  const { members, totalMembers, isLoading, error, inviteLoading, inviteEmployee } =
    useTeamViewModel(token)

  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteName, setInviteName] = useState("")
  const [inviteRole, setInviteRole] = useState<"manager" | "employee">("employee")
  const [inviteDepartmentId, setInviteDepartmentId] = useState("")

  const canInvite = userRole === "admin" || userRole === "manager"

  const departmentMemberCount = departments.map((dept) => ({
    id: dept.id,
    name: dept.name,
    count: members.filter((member) => member.departmentId === dept.id).length,
  }))

  const roleOptions =
    userRole === "admin"
      ? [
          { label: "Manager", value: "manager" },
          { label: "Employee", value: "employee" },
        ]
      : [{ label: "Employee", value: "employee" }]

  const departmentOptions = departments.map((dept) => ({
    label: dept.name,
    value: dept.id,
  }))

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !inviteName.trim() || !inviteDepartmentId) return

    await inviteEmployee({
      email: inviteEmail.trim(),
      fullName: inviteName.trim(),
      role: inviteRole,
      departmentId: inviteDepartmentId,
    })

    setInviteEmail("")
    setInviteName("")
    setInviteRole("employee")
    setInviteDepartmentId("")
    setShowInviteModal(false)
  }

  return (
    <ScrollView style={styles.tab} contentContainerStyle={styles.tabContent}>
      {error && <AlertMessage type="error" message={error} />}

      {canInvite && (
        <PrimaryButton
          label="Inviter Medarbejder"
          onPress={() => setShowInviteModal(true)}
          loading={inviteLoading}
        />
      )}

      <View style={styles.statGrid}>
        <View style={styles.statCard}>
          <AppText variant="p" color={theme.colors.text.secondary}>
            Total Medarbejdere
          </AppText>
          <AppText variant="h3">{totalMembers}</AppText>
        </View>
        {departmentMemberCount.map((item) => (
          <View key={item.id} style={styles.statCard}>
            <AppText variant="p" color={theme.colors.text.secondary}>
              {item.name}
            </AppText>
            <AppText variant="h3">{item.count}</AppText>
          </View>
        ))}
      </View>

      {isLoading ? (
        <ActivityIndicator color={theme.colors.primary.blue} />
      ) : members.length === 0 ? (
        <AppText variant="p" color={theme.colors.text.light} style={styles.center}>
          Ingen medarbejdere fundet endnu.
        </AppText>
      ) : (
        members.map((member) => (
          <View key={member.id} style={styles.memberCard}>
            <View style={styles.memberHeader}>
              <View style={styles.avatar}>
                <AppText variant="h4" color={theme.colors.white}>
                  {member.fullName
                    .split(" ")
                    .map((part) => part[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()}
                </AppText>
              </View>
              <View style={styles.flex}>
                <AppText variant="h4">{member.fullName}</AppText>
                <AppText variant="p" color={theme.colors.text.secondary}>
                  {roleLabel(member.role)}
                </AppText>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  member.status === "active" ? styles.statusActive : styles.statusPending,
                ]}
              >
                <AppText
                  variant="p"
                  color={
                    member.status === "active"
                      ? theme.colors.status.success
                      : theme.colors.status.warning
                  }
                >
                  {member.status === "active" ? "Aktiv" : "Inviteret"}
                </AppText>
              </View>
            </View>
            <AppText variant="p" color={theme.colors.text.secondary}>
              {member.email}
            </AppText>
            <AppText variant="p" color={theme.colors.text.light}>
              {departments.find((dept) => dept.id === member.departmentId)?.name ??
                member.departmentName ??
                "Ukendt afdeling"}
            </AppText>
          </View>
        ))
      )}

      {canInvite && (
        <BaseModal
          visible={showInviteModal}
          title="Inviter medarbejder"
          onClose={() => setShowInviteModal(false)}
        >
          <InputField
            label="Fulde navn"
            placeholder="fx Maria Jensen"
            value={inviteName}
            onChangeText={setInviteName}
          />
          <InputField
            label="Email"
            placeholder="fx maria@firma.dk"
            value={inviteEmail}
            onChangeText={setInviteEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <DropdownField
            label="Rolle"
            options={roleOptions}
            value={inviteRole}
            onChange={(value) => setInviteRole(value as "manager" | "employee")}
          />
          <DropdownField
            label="Afdeling"
            options={departmentOptions}
            value={inviteDepartmentId}
            onChange={setInviteDepartmentId}
          />
          <PrimaryButton
            label="Send invitation"
            onPress={handleInvite}
            loading={inviteLoading}
            disabled={!inviteName || !inviteEmail || !inviteDepartmentId}
          />
        </BaseModal>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  tab: { flex: 1 },
  tabContent: { padding: theme.spacing.xl, gap: theme.spacing.md, paddingBottom: theme.spacing.xxxl },
  flex: { flex: 1 },
  center: { textAlign: "center", alignItems: "center", justifyContent: "center" },
  statGrid: { flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.md },
  statCard: {
    width: "47%",
    minHeight: 96,
    borderRadius: theme.radius.md,
    borderWidth: theme.borderWidth.thin,
    borderColor: theme.colors.background.cardBorder,
    backgroundColor: theme.colors.background.card,
    padding: theme.spacing.lg,
    justifyContent: "space-between",
  },
  memberCard: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.radius.md,
    borderWidth: theme.borderWidth.thin,
    borderColor: theme.colors.background.cardBorder,
    padding: theme.spacing.lg,
    gap: theme.spacing.xs,
  },
  memberHeader: { flexDirection: "row", alignItems: "center", gap: theme.spacing.md },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.primary.blue,
    alignItems: "center",
    justifyContent: "center",
  },
  statusBadge: {
    borderRadius: theme.radius.full,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
  },
  statusActive: { backgroundColor: "#D1FAE5" },
  statusPending: { backgroundColor: "#FEF3C7" },
})
