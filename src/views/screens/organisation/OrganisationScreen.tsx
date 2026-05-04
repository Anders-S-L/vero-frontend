import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Image, Modal, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText, BottomTabBar } from "../../../components";
import { theme } from "../../../constants/theme";
import { useKpiFavoriteViewModel } from "../../../viewmodels/useKpiFavoriteViewModel";
import { TeamRole } from "../../../viewmodels/useTeamViewModel";
import { DashboardTab } from "./DashboardTab";
import { DepartmentsTab } from "./DepartmentsTab";
import { OverviewTab } from "./OverviewTab";
import { TABS } from "./shared";
import { TeamTab } from "./TeamTab";
import { TransactionsTab } from "./TransactionsTab";

type Props = {
  token: string;
  organisationName: string;
  userRole: TeamRole;
};

export default function OrganisationScreen({
  token,
  organisationName,
  userRole,
}: Props) {
  const allowedTabs = TABS.filter((tab) => {
    if (userRole === "admin") return true
    if (userRole === "manager") return ["afdelinger", "transaktioner", "team"].includes(tab.key)
    return tab.key === "afdelinger"
  })
  const [activeTab, setActiveTab] = useState(allowedTabs[0]?.key ?? "afdelinger");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const insets = useSafeAreaInsets();
  const { favorites, toggleFavorite } = useKpiFavoriteViewModel(token);

  const navigateFromSettings = (tab: string) => {
    setActiveTab(tab);
    setSettingsOpen(false);
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.topHeader,
          { paddingTop: insets.top + theme.spacing.md },
        ]}
      >
        <View style={styles.headerBrand}>
          <View style={styles.headerLogoSlot}>
            <Image
              source={require("../../../../assets/images/Vero-logo.png")}
              style={styles.headerLogo}
              resizeMode="contain"
            />
          </View>
          <View style={styles.headerText}>
            <AppText variant="h4" color={theme.colors.white}>
              {organisationName}
            </AppText>
            <AppText variant="p" color="rgba(255,255,255,0.82)">
              CEO Panel
            </AppText>
          </View>
        </View>
        <View style={styles.settingsButtonSlot}>
          <Pressable
            style={styles.settingsButton}
            onPress={() => setSettingsOpen(true)}
            accessibilityRole="button"
            accessibilityLabel="Åbn indstillinger"
          >
            <Ionicons
              name="menu-outline"
              size={30}
              color={theme.colors.white}
            />
          </Pressable>
        </View>
      </View>

      <View style={styles.content}>
        {activeTab === "overblik" && (
          <OverviewTab
            key={`overview-${refreshKey}`}
            token={token}
            organisationName={organisationName}
            favorites={favorites}
          />
        )}
        {activeTab === "afdelinger" && <DepartmentsTab token={token} userRole={userRole} />}
        {activeTab === "transaktioner" && (
          <TransactionsTab
            token={token} userRole={userRole}
            onTransactionSaved={() => setRefreshKey((key) => key + 1)}
          />
        )}
        {activeTab === "dashboards" && (
          <DashboardTab
            key={`dashboard-${refreshKey}`}
            token={token}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
          />
        )}
        {activeTab === "team" && <TeamTab token={token} userRole={userRole} />}
      </View>

      <Modal
        visible={settingsOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setSettingsOpen(false)}
      >
        <Pressable
          style={styles.menuOverlay}
          onPress={() => setSettingsOpen(false)}
        >
          <View style={[styles.settingsMenu, { top: insets.top + 52 }]}>
            <Pressable
              style={styles.menuItem}
              onPress={() => navigateFromSettings("afdelinger")}
            >
              <Ionicons
                name="business-outline"
                size={20}
                color={theme.colors.text.secondary}
              />
              <AppText variant="p">Afdelinger</AppText>
            </Pressable>
            <Pressable
              style={styles.menuItem}
              onPress={() => navigateFromSettings("team")}
            >
              <Ionicons
                name="people-outline"
                size={20}
                color={theme.colors.text.secondary}
              />
              <AppText variant="p">Team</AppText>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      <BottomTabBar
        tabs={TABS}
        activeTab={activeTab}
        onTabPress={setActiveTab}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background.app },
  content: { flex: 1 },
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.colors.primary.blue,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
    borderBottomWidth: theme.borderWidth.thin,
    borderBottomColor: theme.colors.primary.blueDark,
  },
  headerBrand: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  headerLogoSlot: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },
  headerLogo: {
    width: 120,
    height: 120,
  },
  headerText: { flex: 1 },
  settingsButtonSlot: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },
  settingsButton: {
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: "rgba(17,24,39,0.18)",
  },
  settingsMenu: {
    position: "absolute",
    right: theme.spacing.md,
    width: 184,
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.radius.md,
    borderWidth: theme.borderWidth.thin,
    borderColor: theme.colors.background.cardBorder,
    paddingVertical: theme.spacing.sm,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
});
