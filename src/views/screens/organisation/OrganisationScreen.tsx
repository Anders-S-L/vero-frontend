import React, { useState } from "react"
import { StyleSheet, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { AppText, BottomTabBar } from "../../../components"
import { theme } from "../../../constants/theme"
import { useKpiFavoriteViewModel } from "../../../viewmodels/useKpiFavoriteViewModel"
import { TeamRole } from "../../../viewmodels/useTeamViewModel"
import { DashboardTab } from "./DashboardTab"
import { DepartmentsTab } from "./DepartmentsTab"
import { OverviewTab } from "./OverviewTab"
import { TABS } from "./shared"
import { TeamTab } from "./TeamTab"
import { TransactionsTab } from "./TransactionsTab"

type Props = {
  token: string
  organisationName: string
  userRole: TeamRole
}

export default function OrganisationScreen({ token, organisationName, userRole }: Props) {
  const [activeTab, setActiveTab] = useState("overblik")
  const insets = useSafeAreaInsets()
  const { favorites, toggleFavorite } = useKpiFavoriteViewModel(token)

  return (
    <View style={styles.container}>
      <View style={[styles.topHeader, { paddingTop: insets.top + theme.spacing.md }]}>
        <AppText variant="h4">{organisationName}</AppText>
        <AppText variant="p" color={theme.colors.text.secondary}>
          Admin Panel
        </AppText>
      </View>

      <View style={styles.content}>
        {activeTab === "overblik" && (
          <OverviewTab token={token} organisationName={organisationName} favorites={favorites} />
        )}
        {activeTab === "afdelinger" && <DepartmentsTab token={token} />}
        {activeTab === "transaktioner" && <TransactionsTab token={token} />}
        {activeTab === "dashboards" && (
          <DashboardTab token={token} favorites={favorites} toggleFavorite={toggleFavorite} />
        )}
        {activeTab === "team" && <TeamTab token={token} userRole={userRole} />}
      </View>

      <BottomTabBar tabs={TABS} activeTab={activeTab} onTabPress={setActiveTab} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background.app },
  content: { flex: 1 },
  topHeader: {
    backgroundColor: theme.colors.background.card,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
    borderBottomWidth: theme.borderWidth.thin,
    borderBottomColor: theme.colors.background.cardBorder,
  },
})
