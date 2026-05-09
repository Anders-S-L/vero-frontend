import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { ActivityIndicator, Image, Modal, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AlertMessage, AppText, BaseModal, BottomTabBar, InputField, PrimaryButton } from "../../../components";
import { theme } from "../../../constants/theme";
import { useKpiFavoriteViewModel } from "../../../viewmodels/useKpiFavoriteViewModel";
import { useProfileViewModel } from "../../../viewmodels/useProfileViewModel";
import { TeamRole } from "../../../viewmodels/useTeamViewModel";
import { DashboardTab } from "./DashboardTab";
import { DepartmentsTab } from "./DepartmentsTab";
import { OverviewTab } from "./OverviewTab";
import { PeriodPreset, formatDanishDateForInput, getPeriodRange, TABS } from "./shared";
import { TeamTab } from "./TeamTab";
import { TransactionsTab } from "./TransactionsTab";

const roleLabel = (role: TeamRole) => {
  if (role === "admin") return "Admin";
  if (role === "manager") return "Manager";
  return "Employee";
};

type Props = {
  token: string;
  organisationName: string;
  userRole: TeamRole;
  onLogout: () => void;
};

export default function OrganisationScreen({
  token,
  organisationName,
  userRole,
  onLogout,
}: Props) {
  const bottomTabs = TABS;
  const [activeTab, setActiveTab] = useState("overblik");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [selectedPeriodPreset, setSelectedPeriodPreset] = useState<PeriodPreset>("currentMonth");
  const [appliedPeriod, setAppliedPeriod] = useState(() => getPeriodRange("currentMonth"));
  const [fromInput, setFromInput] = useState(() => formatDanishDateForInput(appliedPeriod.from));
  const [toInput, setToInput] = useState(() => formatDanishDateForInput(appliedPeriod.to));
  const [refreshKey, setRefreshKey] = useState(0);
  const insets = useSafeAreaInsets();
  const { favorites, toggleFavorite } = useKpiFavoriteViewModel(token);
  const {
    profile,
    isLoading: profileLoading,
    isSaving: profileSaving,
    error: profileError,
    fetchProfile,
    updateName,
  } = useProfileViewModel(token);

  React.useEffect(() => {
    setProfileName(profile?.full_name ?? "");
  }, [profile?.full_name]);

  const navigateFromSettings = (tab: string) => {
    if (userRole === "employee" && tab === "afdelinger") return;
    setActiveTab(tab);
    setSettingsOpen(false);
  };

  const handleLogout = () => {
    setSettingsOpen(false);
    onLogout();
  };

  const openProfile = () => {
    setSettingsOpen(false);
    setProfileOpen(true);
    fetchProfile();
  };

  const handleSaveProfile = async () => {
    if (profileName.trim().length < 2) return;
    try {
      await updateName(profileName.trim());
    } catch {
      // Error vises i modal via viewmodel.
    }
  };

  const handleTransactionChanged = () => {
    setRefreshKey((key) => key + 1);
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
              Organisationspanel
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
            userRole={userRole}
            userDepartmentId={profile?.department_id}
          />
        )}
        {activeTab === "afdelinger" && userRole !== "employee" && (
          <DepartmentsTab
            token={token}
            userRole={userRole}
            onTransactionChanged={handleTransactionChanged}
          />
        )}
        {activeTab === "transaktioner" && (
          <TransactionsTab
            token={token} userRole={userRole}
            userDepartmentId={profile?.department_id}
            onTransactionChanged={handleTransactionChanged}
          />
        )}
        {activeTab === "dashboards" && (

          <DashboardTab
            token={token}
            userRole={userRole}
            userDepartmentId={profile?.department_id}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            selectedPeriodPreset={selectedPeriodPreset}
            appliedPeriod={appliedPeriod}
            fromInput={fromInput}
            toInput={toInput}
            setSelectedPeriodPreset={setSelectedPeriodPreset}
            setAppliedPeriod={setAppliedPeriod}
            setFromInput={setFromInput}
            setToInput={setToInput}
            refreshSignal={refreshKey}
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
              onPress={openProfile}
            >
              <Ionicons
                name="person-outline"
                size={20}
                color={theme.colors.text.secondary}
              />
              <AppText variant="p">Profil</AppText>
            </Pressable>
            {userRole !== "employee" && (
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
            )}
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
            <View style={styles.menuDivider} />
            <Pressable
              style={styles.menuItem}
              onPress={handleLogout}
            >
              <Ionicons
                name="log-out-outline"
                size={20}
                color={theme.colors.status.error}
              />
              <AppText variant="p" color={theme.colors.status.error}>
                Log ud
              </AppText>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      <BottomTabBar
        tabs={bottomTabs}
        activeTab={activeTab}
        onTabPress={setActiveTab}
      />

      <BaseModal
        visible={profileOpen}
        title="Profil"
        onClose={() => setProfileOpen(false)}
      >
        {profileError && <AlertMessage type="error" message={profileError} />}
        {profileLoading ? (
          <ActivityIndicator color={theme.colors.primary.blue} />
        ) : (
          <>
            <InputField
              label="Navn"
              placeholder="Dit navn"
              value={profileName}
              onChangeText={setProfileName}
            />
            <View style={styles.profileRankRow}>
              <AppText variant="p" color={theme.colors.text.secondary}>
                Rank
              </AppText>
              <AppText variant="h4">
                {roleLabel((profile?.role ?? userRole) as TeamRole)}
              </AppText>
            </View>
            <PrimaryButton
              label="Gem navn"
              onPress={handleSaveProfile}
              loading={profileSaving}
              disabled={profileName.trim().length < 2}
            />
          </>
        )}
      </BaseModal>
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
  menuDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: theme.colors.background.cardBorder,
    marginVertical: theme.spacing.xs,
  },
  profileRankRow: {
    borderWidth: theme.borderWidth.thin,
    borderColor: theme.colors.background.cardBorder,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.background.app,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.xs,
  },
});
