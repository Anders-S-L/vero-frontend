import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  AlertMessage,
  AppText,
  BaseModal,
  BottomTabBar,
  DropdownField,
  InlineActionButton,
  InputField,
  PrimaryButton,
} from "../../components";
import { theme } from "../../constants/theme";
import { categoryModel, CategoryType } from "../../models/categoryModel";
import { Department } from "../../models/departmentModel";
import { KpiMetric } from "../../models/kpiModel";
import { Transaction } from "../../models/transactionModel";
import { useCategoryViewModel } from "../../viewmodels/useCategoryViewModel";
import { useKpiViewModel } from "../../viewmodels/useKpiViewModel";
import { useOrganisationViewModel } from "../../viewmodels/useOrganisationViewModel";
import { TeamRole, useTeamViewModel } from "../../viewmodels/useTeamViewModel";
import { useTransactionViewModel } from "../../viewmodels/useTransactionViewModel";

const getSignedAmount = (amount: number, categoryType: CategoryType) => {
  const absoluteAmount = Math.abs(amount);
  return categoryType === "income" ? absoluteAmount : -absoluteAmount;
};

const TABS = [
  { key: "overblik", label: "Home", icon: "home-outline" as const },
  {
    key: "transaktioner",
    label: "Transaktioner",
    icon: "card-outline" as const,
  },
  {
    key: "dashboards",
    label: "KPIs",
    icon: "stats-chart-outline" as const,
  },
];

const SETTINGS_DESTINATIONS = [
  {
    key: "afdelinger",
    label: "Afdelinger",
    description: "Administrer afdelinger og kategorier",
    icon: "business-outline" as const,
  },
  { key: "team", label: "Team", icon: "people-outline" as const },
];

const SCREEN_META = {
  overblik: {
    title: "Home",
    subtitle: "Overblik over organisationen",
  },
  dashboards: {
    title: "KPIs",
    subtitle: "Nøgletal og performance",
  },
  transaktioner: {
    title: "Transaktioner",
    subtitle: "Søg og administrer transaktioner",
  },
  afdelinger: {
    title: "Afdelinger",
    subtitle: "Administrer afdelinger og kategorier",
  },
  team: {
    title: "Team",
    subtitle: "Inviter og se medarbejdere",
  },
} as const;

type ScreenKey = keyof typeof SCREEN_META;

type TransactionType = "income" | "expense";

type OrganisationCategoryOption = {
  label: string;
  value: string;
  type: CategoryType;
};

const getTransactionTypeFromCategory = (
  categoryType: CategoryType,
): TransactionType => (categoryType === "income" ? "income" : "expense");

const normalizeAmountInputToRaw = (value: string) => {
  const sanitized = value.replace(/\s/g, "").replace(/\./g, "");
  const [integerRaw, ...decimalParts] = sanitized.split(",");
  const integerDigits = integerRaw.replace(/\D/g, "");
  const decimalDigits = decimalParts.join("").replace(/\D/g, "").slice(0, 2);
  const hasDecimalSeparator = sanitized.includes(",");

  if (!integerDigits && !hasDecimalSeparator) {
    return "";
  }

  const normalizedInteger = integerDigits.replace(/^0+(?=\d)/, "") || "0";

  if (!hasDecimalSeparator) {
    return normalizedInteger;
  }

  if (decimalDigits.length === 0) {
    return `${normalizedInteger}.`;
  }

  return `${normalizedInteger}.${decimalDigits}`;
};

const formatRawAmountForDisplay = (rawValue: string) => {
  if (!rawValue) return "";

  const [integerRaw, decimalRaw] = rawValue.split(".");
  const integerDigits = integerRaw.replace(/\D/g, "");

  if (!integerDigits) return "";

  const formattedInteger = Number(integerDigits).toLocaleString("da-DK");

  if (decimalRaw === undefined) {
    return formattedInteger;
  }

  return `${formattedInteger},${decimalRaw}`;
};

const formatDisplayDate = (date: Date) => {
  const day = `${date.getDate()}`.padStart(2, "0");
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const formatDateInput = (value: string) => {
  const digitsOnly = value.replace(/\D/g, "").slice(0, 8);

  if (digitsOnly.length <= 2) return digitsOnly;
  if (digitsOnly.length <= 4) {
    return `${digitsOnly.slice(0, 2)}-${digitsOnly.slice(2)}`;
  }

  return `${digitsOnly.slice(0, 2)}-${digitsOnly.slice(2, 4)}-${digitsOnly.slice(4)}`;
};

const isValidDisplayDate = (value: string) => {
  if (!/^\d{2}-\d{2}-\d{4}$/.test(value)) return false;

  const [day, month, year] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return (
    !Number.isNaN(date.getTime()) &&
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
};

const toApiDate = (value: string) => {
  const [day, month, year] = value.split("-");
  return `${year}-${month}-${day}`;
};

function TransactionTypeSegmentedControl({
  value,
  onChange,
}: {
  value: TransactionType;
  onChange: (value: TransactionType) => void;
}) {
  return (
    <View style={styles.formField}>
      <AppText
        variant="p"
        color={theme.colors.text.secondary}
        style={styles.fieldLabel}
      >
        Type
      </AppText>
      <View style={styles.segmentedControl}>
        {[
          { label: "Indtægt", value: "income" as const },
          { label: "Udgift", value: "expense" as const },
        ].map((option) => {
          const isActive = option.value === value;

          return (
            <Pressable
              key={option.value}
              style={[
                styles.segmentedOption,
                isActive && styles.segmentedOptionActive,
              ]}
              onPress={() => onChange(option.value)}
            >
              <AppText
                variant="p"
                color={
                  isActive ? theme.colors.white : theme.colors.text.secondary
                }
                style={styles.segmentedOptionLabel}
              >
                {option.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function useOrganisationCategoryOptions(token: string) {
  const { departments } = useOrganisationViewModel(token);
  const [categories, setCategories] = useState<OrganisationCategoryOption[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(false);

  const fetchCategoryOptions = useCallback(async () => {
    if (!token || departments.length === 0) {
      setCategories([]);
      return;
    }

    try {
      setIsLoading(true);
      const categoryGroups = await Promise.all(
        departments.map(async (department) => {
          const departmentCategories = await categoryModel.getCategories(
            token,
            department.id,
          );

          return departmentCategories.map((category) => ({
            label: `${department.name} • ${category.name}`,
            value: category.id,
            type: category.type,
          }));
        }),
      );

      setCategories(categoryGroups.flat());
    } catch {
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  }, [departments, token]);

  useEffect(() => {
    fetchCategoryOptions();
  }, [fetchCategoryOptions]);

  return { categories, isLoading };
}

function CreateTransactionSheet({
  visible,
  onClose,
  transactionType,
  onTransactionTypeChange,
  amount,
  onAmountChange,
  categoryId,
  onCategoryChange,
  categoryOptions,
  categoryLoading,
  date,
  onDateChange,
  description,
  onDescriptionChange,
  onSubmit,
  isSubmitting,
  submitDisabled,
  errorMessage,
}: {
  visible: boolean;
  onClose: () => void;
  transactionType: TransactionType;
  onTransactionTypeChange: (value: TransactionType) => void;
  amount: string;
  onAmountChange: (value: string) => void;
  categoryId: string;
  onCategoryChange: (value: string) => void;
  categoryOptions: { label: string; value: string }[];
  categoryLoading: boolean;
  date: string;
  onDateChange: (value: string) => void;
  description: string;
  onDescriptionChange: (value: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  submitDisabled: boolean;
  errorMessage: string | null;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.sheetOverlay}>
        <Pressable style={styles.sheetBackdrop} onPress={onClose} />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.sheetKeyboardWrapper}
          pointerEvents="box-none"
        >
          <View style={styles.sheetContainer}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <AppText variant="h4">Tilføj transaktion</AppText>
              <Pressable
                onPress={onClose}
                hitSlop={8}
                style={styles.sheetCloseButton}
              >
                <Ionicons
                  name="close"
                  size={22}
                  color={theme.colors.text.primary}
                />
              </Pressable>
            </View>

            <ScrollView
              style={styles.sheetScroll}
              contentContainerStyle={styles.sheetContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="interactive"
              nestedScrollEnabled
            >
              {errorMessage ? (
                <AlertMessage type="error" message={errorMessage} />
              ) : null}

              <TransactionTypeSegmentedControl
                value={transactionType}
                onChange={onTransactionTypeChange}
              />

              <InputField
                label="Beløb"
                placeholder="fx 5000"
                value={amount}
                onChangeText={onAmountChange}
                keyboardType="decimal-pad"
              />

              {categoryLoading ? (
                <View style={styles.formField}>
                  <AppText
                    variant="p"
                    color={theme.colors.text.secondary}
                    style={styles.fieldLabel}
                  >
                    Kategori
                  </AppText>
                  <View style={styles.loadingField}>
                    <ActivityIndicator color={theme.colors.primary.blue} />
                  </View>
                </View>
              ) : (
                <DropdownField
                  label="Kategori"
                  options={categoryOptions}
                  value={categoryId}
                  onChange={onCategoryChange}
                />
              )}

              <InputField
                label="Dato"
                placeholder="DD-MM-YYYY"
                value={date}
                onChangeText={onDateChange}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="number-pad"
              />

              <InputField
                label="Beskrivelse"
                placeholder="Beskrivelse"
                value={description}
                onChangeText={onDescriptionChange}
              />
            </ScrollView>

            <View style={styles.sheetFooter}>
              <PrimaryButton
                label="Gem transaktion"
                onPress={onSubmit}
                loading={isSubmitting}
                disabled={submitDisabled}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

function SettingsMenu({
  visible,
  onClose,
  onSelect,
}: {
  visible: boolean;
  onClose: () => void;
  onSelect: (key: ScreenKey) => void;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.settingsOverlay} onPress={onClose}>
        <Pressable
          style={styles.settingsCard}
          onPress={(event) => event.stopPropagation()}
        >
          <View style={styles.settingsHeader}>
            <AppText variant="h4">Indstillinger</AppText>
            <Pressable
              onPress={onClose}
              hitSlop={8}
              style={styles.settingsCloseButton}
            >
              <Ionicons
                name="close"
                size={20}
                color={theme.colors.text.primary}
              />
            </Pressable>
          </View>

          {SETTINGS_DESTINATIONS.map((item) => (
            <Pressable
              key={item.key}
              style={styles.settingsItem}
              onPress={() => onSelect(item.key as ScreenKey)}
            >
              <View style={styles.settingsItemIcon}>
                <Ionicons
                  name={item.icon}
                  size={20}
                  color={theme.colors.primary.blue}
                />
              </View>
              <View style={styles.flex}>
                <AppText variant="p" style={styles.settingsItemTitle}>
                  {item.label}
                </AppText>
                {"description" in item ? (
                  <AppText variant="p" color={theme.colors.text.secondary}>
                    {item.description}
                  </AppText>
                ) : (
                  <AppText variant="p" color={theme.colors.text.secondary}>
                    Inviter og administrer medarbejdere
                  </AppText>
                )}
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={theme.colors.text.light}
              />
            </Pressable>
          ))}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const getTransactionCategoryType = (transaction: Transaction): CategoryType =>
  transaction.categories?.type === "income" ||
  transaction.categories?.type === "expense" ||
  transaction.categories?.type === "tax" ||
  transaction.categories?.type === "depreciation"
    ? transaction.categories.type
    : transaction.amount >= 0
      ? "income"
      : "expense";

type PeriodPreset =
  | "currentMonth"
  | "last30Days"
  | "currentQuarter"
  | "currentYear"
  | "custom";

const formatDateForInput = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getQuarterStart = (date: Date) =>
  new Date(date.getFullYear(), Math.floor(date.getMonth() / 3) * 3, 1);

const getPeriodRange = (preset: PeriodPreset) => {
  const today = new Date();

  switch (preset) {
    case "last30Days": {
      const from = new Date(today);
      from.setDate(from.getDate() - 29);
      return { from: formatDateForInput(from), to: formatDateForInput(today) };
    }
    case "currentQuarter":
      return {
        from: formatDateForInput(getQuarterStart(today)),
        to: formatDateForInput(today),
      };
    case "currentYear":
      return {
        from: formatDateForInput(new Date(today.getFullYear(), 0, 1)),
        to: formatDateForInput(today),
      };
    case "currentMonth":
    default:
      return {
        from: formatDateForInput(
          new Date(today.getFullYear(), today.getMonth(), 1),
        ),
        to: formatDateForInput(today),
      };
  }
};

const isValidIsoDate = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00`);
  return !Number.isNaN(date.getTime()) && formatDateForInput(date) === value;
};

function TransactionEditModal({
  visible,
  amount,
  date,
  description,
  onAmountChange,
  onDateChange,
  onDescriptionChange,
  onClose,
  onSave,
}: {
  visible: boolean;
  amount: string;
  date: string;
  description: string;
  onAmountChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  return (
    <BaseModal visible={visible} title="Rediger transaktion" onClose={onClose}>
      <InputField
        label="Beløb"
        placeholder="fx 5000"
        value={amount}
        onChangeText={onAmountChange}
        keyboardType="numeric"
      />
      <InputField
        label="Dato"
        placeholder="YYYY-MM-DD"
        value={date}
        onChangeText={onDateChange}
      />
      <InputField
        label="Beskrivelse"
        placeholder="fx Løn marts"
        value={description}
        onChangeText={onDescriptionChange}
      />
      <PrimaryButton label="Gem ændringer" onPress={onSave} />
    </BaseModal>
  );
}

function DepartmentEditModal({
  visible,
  name,
  onNameChange,
  onClose,
  onSave,
}: {
  visible: boolean;
  name: string;
  onNameChange: (value: string) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  return (
    <BaseModal visible={visible} title="Rediger afdeling" onClose={onClose}>
      <InputField
        label="Navn"
        placeholder="fx Marketing"
        value={name}
        onChangeText={onNameChange}
      />
      <PrimaryButton label="Gem ændringer" onPress={onSave} />
    </BaseModal>
  );
}

function CategoryEditModal({
  visible,
  name,
  type,
  typeOptions,
  onNameChange,
  onTypeChange,
  onClose,
  onSave,
}: {
  visible: boolean;
  name: string;
  type: CategoryType;
  typeOptions: { label: string; value: string }[];
  onNameChange: (value: string) => void;
  onTypeChange: (value: CategoryType) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  return (
    <BaseModal visible={visible} title="Rediger kategori" onClose={onClose}>
      <InputField
        label="Navn"
        placeholder="fx Løn"
        value={name}
        onChangeText={onNameChange}
      />
      <DropdownField
        label="Type"
        options={typeOptions}
        value={type}
        onChange={(value) => onTypeChange(value as CategoryType)}
      />
      <PrimaryButton label="Gem ændringer" onPress={onSave} />
    </BaseModal>
  );
}

function KpiInfoModal({
  metric,
  visible,
  onClose,
}: {
  metric: KpiMetric | null;
  visible: boolean;
  onClose: () => void;
}) {
  const definition =
    metric?.definition?.trim() ||
    "Definition er ikke tilgængelig for denne KPI endnu.";
  const calculationExamples =
    metric?.calculationExample?.filter((example) => example?.trim()) ?? [];

  return (
    <BaseModal
      visible={visible}
      title={metric?.label ?? "KPI-info"}
      onClose={onClose}
    >
      <ScrollView
        style={styles.kpiInfoScroll}
        contentContainerStyle={styles.kpiInfoContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.kpiInfoSection}>
          <AppText variant="p" style={styles.kpiInfoSectionTitle}>
            Definition
          </AppText>
          <AppText variant="p" color={theme.colors.text.secondary}>
            {definition}
          </AppText>
        </View>

        <View style={styles.kpiInfoSection}>
          <AppText variant="p" style={styles.kpiInfoSectionTitle}>
            Beregningseksempel
          </AppText>

          {calculationExamples.length > 0 ? (
            calculationExamples.map((example, index) => (
              <View
                key={`${metric?.label ?? "kpi"}-${index}`}
                style={styles.kpiInfoBulletRow}
              >
                <AppText variant="p" style={styles.kpiInfoBullet}>
                  •
                </AppText>
                <AppText
                  variant="p"
                  color={theme.colors.text.secondary}
                  style={styles.kpiInfoBulletText}
                >
                  {example}
                </AppText>
              </View>
            ))
          ) : (
            <AppText variant="p" color={theme.colors.text.secondary}>
              Intet beregningseksempel tilgængeligt endnu.
            </AppText>
          )}
        </View>
      </ScrollView>
    </BaseModal>
  );
}

export default function OrganisationScreen({
  token,
  organisationName,
  userRole,
}: {
  token: string;
  organisationName: string;
  userRole: TeamRole;
}) {
  const [activeTab, setActiveTab] = useState<ScreenKey>("overblik");
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [showCreateTransactionSheet, setShowCreateTransactionSheet] =
    useState(false);
  const [transactionType, setTransactionType] =
    useState<TransactionType>("expense");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [transactionAmountRaw, setTransactionAmountRaw] = useState("");
  const [transactionDate, setTransactionDate] = useState(() =>
    formatDisplayDate(new Date()),
  );
  const [transactionDescription, setTransactionDescription] = useState("");
  const [isSavingTransaction, setIsSavingTransaction] = useState(false);
  const [createTransactionError, setCreateTransactionError] = useState<
    string | null
  >(null);
  const [transactionRefreshVersion, setTransactionRefreshVersion] = useState(0);
  const [dashboardRefreshVersion, setDashboardRefreshVersion] = useState(0);
  const insets = useSafeAreaInsets();
  const activeScreenMeta = SCREEN_META[activeTab];
  const { addTransaction, fetchTransactions } = useTransactionViewModel(
    token,
    "",
  );
  const { categories, isLoading: isLoadingCategories } =
    useOrganisationCategoryOptions(token);
  const categoryOptions = useMemo(
    () =>
      categories
        .filter(
          (category) =>
            getTransactionTypeFromCategory(category.type) === transactionType,
        )
        .map((category) => ({
          label: category.label,
          value: category.value,
        })),
    [categories, transactionType],
  );

  useEffect(() => {
    if (
      selectedCategoryId &&
      categoryOptions.some((category) => category.value === selectedCategoryId)
    ) {
      return;
    }

    setSelectedCategoryId(categoryOptions[0]?.value ?? "");
  }, [categoryOptions, selectedCategoryId]);

  const handleSelectSettingsDestination = (screen: ScreenKey) => {
    setActiveTab(screen);
    setSettingsVisible(false);
  };

  const resetCreateTransactionForm = () => {
    setTransactionAmountRaw("");
    setTransactionDescription("");
    setTransactionDate(formatDisplayDate(new Date()));
    setTransactionType("expense");
    setSelectedCategoryId("");
    setCreateTransactionError(null);
  };

  const openCreateTransactionSheet = () => {
    resetCreateTransactionForm();
    setShowCreateTransactionSheet(true);
  };

  const closeCreateTransactionSheet = () => {
    setShowCreateTransactionSheet(false);
    resetCreateTransactionForm();
  };

  const handleTransactionAmountChange = (value: string) => {
    setTransactionAmountRaw(normalizeAmountInputToRaw(value));
    if (createTransactionError) {
      setCreateTransactionError(null);
    }
  };

  const handleTransactionDateChange = (value: string) => {
    setTransactionDate(formatDateInput(value));
    if (createTransactionError) {
      setCreateTransactionError(null);
    }
  };

  const handleCreateTransaction = async () => {
    setCreateTransactionError(null);

    if (!selectedCategoryId) {
      setCreateTransactionError("Vælg en kategori før du gemmer.");
      return;
    }

    if (!transactionAmountRaw.trim()) {
      setCreateTransactionError("Indtast et beløb før du gemmer.");
      return;
    }

    if (!transactionDescription.trim()) {
      setCreateTransactionError("Indtast en beskrivelse før du gemmer.");
      return;
    }

    const parsedAmount = Number(transactionAmountRaw);
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setCreateTransactionError("Beløb skal være et gyldigt tal større end 0.");
      return;
    }

    if (!isValidDisplayDate(transactionDate)) {
      setCreateTransactionError(
        "Dato skal være gyldig og i formatet DD-MM-YYYY.",
      );
      return;
    }

    const selectedCategory = categories.find(
      (category) => category.value === selectedCategoryId,
    );
    if (!selectedCategory) {
      setCreateTransactionError("Den valgte kategori kunne ikke findes.");
      return;
    }

    if (
      getTransactionTypeFromCategory(selectedCategory.type) !== transactionType
    ) {
      setCreateTransactionError(
        "Den valgte kategori matcher ikke den valgte type.",
      );
      return;
    }

    try {
      setIsSavingTransaction(true);
      await addTransaction(
        getSignedAmount(parsedAmount, selectedCategory.type),
        toApiDate(transactionDate),
        transactionDescription.trim() || null,
        selectedCategoryId,
      );
      await fetchTransactions();
      setTransactionRefreshVersion((current) => current + 1);
      setDashboardRefreshVersion((current) => current + 1);
      closeCreateTransactionSheet();
    } catch (error) {
      setCreateTransactionError(
        (error as Error).message ||
          "Transaktionen kunne ikke gemmes. Prøv igen.",
      );
    } finally {
      setIsSavingTransaction(false);
    }
  };

  const renderActiveScreen = () => {
    if (activeTab === "overblik") {
      return <OverblikTab token={token} organisationName={organisationName} />;
    }

    if (activeTab === "afdelinger") {
      return <AfdelingerTab token={token} />;
    }

    if (activeTab === "transaktioner") {
      return (
        <TransaktionerTab
          token={token}
          refreshVersion={transactionRefreshVersion}
          onOpenCreateTransaction={openCreateTransactionSheet}
        />
      );
    }

    if (activeTab === "dashboards") {
      return (
        <DashboardsTab token={token} refreshVersion={dashboardRefreshVersion} />
      );
    }

    return <TeamTab token={token} userRole={userRole} />;
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.topHeader,
          { paddingTop: insets.top + theme.spacing.md },
        ]}
      >
        <View style={styles.headerContent}>
          <View style={styles.flex}>
            <AppText variant="h4">{organisationName}</AppText>
            <AppText variant="p" color={theme.colors.text.secondary}>
              {activeScreenMeta.subtitle}
            </AppText>
          </View>

          <Pressable
            style={styles.settingsTrigger}
            onPress={() => setSettingsVisible(true)}
            hitSlop={8}
          >
            <Ionicons
              name="settings-outline"
              size={22}
              color={theme.colors.text.primary}
            />
          </Pressable>
        </View>
      </View>
      <View style={styles.content}>{renderActiveScreen()}</View>
      <BottomTabBar
        tabs={TABS}
        activeTab={activeTab}
        onTabPress={(key) => setActiveTab(key as ScreenKey)}
      />
      <SettingsMenu
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
        onSelect={handleSelectSettingsDestination}
      />
      <CreateTransactionSheet
        visible={showCreateTransactionSheet}
        onClose={closeCreateTransactionSheet}
        transactionType={transactionType}
        onTransactionTypeChange={setTransactionType}
        amount={formatRawAmountForDisplay(transactionAmountRaw)}
        onAmountChange={handleTransactionAmountChange}
        categoryId={selectedCategoryId}
        onCategoryChange={setSelectedCategoryId}
        categoryOptions={categoryOptions}
        categoryLoading={isLoadingCategories}
        date={transactionDate}
        onDateChange={handleTransactionDateChange}
        description={transactionDescription}
        onDescriptionChange={(value) => {
          setTransactionDescription(value);
          if (createTransactionError) {
            setCreateTransactionError(null);
          }
        }}
        onSubmit={handleCreateTransaction}
        isSubmitting={isSavingTransaction}
        submitDisabled={
          !selectedCategoryId ||
          !transactionAmountRaw.trim() ||
          !transactionDescription.trim() ||
          isLoadingCategories ||
          isSavingTransaction
        }
        errorMessage={createTransactionError}
      />
    </View>
  );
}

// ── OVERBLIK ──────────────────────────────────────────────────────────────────
function OverblikTab({
  token,
  organisationName,
}: {
  token: string;
  organisationName: string;
}) {
  const { transactions, isLoading } = useTransactionViewModel(token, "");

  const totalIncome = transactions
    .filter((t) => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.amount < 0)
    .reduce((sum, t) => sum + t.amount, 0);
  const recent = [...transactions]
    .sort((a, b) => {
      const createdAtA = new Date(a.created_at).getTime();
      const createdAtB = new Date(b.created_at).getTime();

      if (Number.isNaN(createdAtA) || Number.isNaN(createdAtB)) {
        return 0;
      }

      return createdAtB - createdAtA;
    })
    .slice(0, 5);

  return (
    <ScrollView
      style={styles.tab}
      contentContainerStyle={styles.homeTabContent}
    >
      <AppText variant="h3" style={styles.pageTitle}>
        {organisationName}
      </AppText>

      <View style={styles.metricsRow}>
        <View style={[styles.metricCard, styles.flex]}>
          <AppText variant="p" color={theme.colors.text.secondary}>
            Indtægter
          </AppText>
          <AppText variant="h4" color={theme.colors.status.success}>
            {totalIncome.toLocaleString()} kr
          </AppText>
        </View>
        <View style={styles.metricSpacer} />
        <View style={[styles.metricCard, styles.flex]}>
          <AppText variant="p" color={theme.colors.text.secondary}>
            Udgifter
          </AppText>
          <AppText variant="h4" color={theme.colors.status.error}>
            {Math.abs(totalExpense).toLocaleString()} kr
          </AppText>
        </View>
      </View>

      <AppText variant="h4" style={styles.sectionTitle}>
        Seneste transaktioner
      </AppText>

      {isLoading ? (
        <ActivityIndicator color={theme.colors.primary.blue} />
      ) : recent.length === 0 ? (
        <AppText
          variant="p"
          color={theme.colors.text.light}
          style={styles.center}
        >
          Ingen transaktioner endnu
        </AppText>
      ) : (
        recent.map((t) => (
          <View key={t.id} style={styles.transactionRow}>
            <View>
              <AppText variant="p">{t.description}</AppText>
              <AppText variant="p" color={theme.colors.text.light}>
                {t.date}
              </AppText>
            </View>
            <AppText
              variant="p"
              color={
                t.amount > 0
                  ? theme.colors.status.success
                  : theme.colors.status.error
              }
            >
              {t.amount > 0 ? "+" : ""}
              {t.amount.toLocaleString()} kr
            </AppText>
          </View>
        ))
      )}
    </ScrollView>
  );
}

// ── AFDELINGER ────────────────────────────────────────────────────────────────
function AfdelingerTab({ token }: { token: string }) {
  const {
    departments,
    isLoading,
    error,
    addDepartment,
    updateDepartment,
    deleteDepartment,
  } = useOrganisationViewModel(token);

  const [selectedDeptId, setSelectedDeptId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [deptName, setDeptName] = useState("");
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(
    null,
  );
  const [editDeptName, setEditDeptName] = useState("");

  const handleAdd = async () => {
    if (!deptName.trim()) return;
    await addDepartment(deptName.trim());
    setDeptName("");
    setShowModal(false);
  };

  const closeEditModal = () => {
    setEditingDepartment(null);
    setEditDeptName("");
  };

  const openEditModal = (department: Department) => {
    setEditingDepartment(department);
    setEditDeptName(department.name);
  };

  const handleSaveEdit = async () => {
    if (!editingDepartment || !editDeptName.trim()) return;

    try {
      await updateDepartment(editingDepartment.id, editDeptName.trim());
      closeEditModal();
    } catch {
      // håndteres via error i viewmodel
    }
  };

  const handleDelete = (department: Department) => {
    Alert.alert(
      "Slet afdeling",
      "Er du sikker på, at du vil slette afdelingen?",
      [
        { text: "Annuller", style: "cancel" },
        {
          text: "Slet",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDepartment(department.id);
              if (selectedDeptId === department.id) {
                setSelectedDeptId(null);
              }
            } catch {
              // håndteres via error i viewmodel
            }
          },
        },
      ],
    );
  };

  return (
    <View style={styles.tab}>
      {error && <AlertMessage type="error" message={error} />}

      {isLoading ? (
        <ActivityIndicator color={theme.colors.primary.blue} />
      ) : (
        <FlatList
          data={departments}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View style={styles.pageHeader}>
              <AppText variant="h3">Afdelinger</AppText>
              <AppText variant="p" color={theme.colors.text.secondary}>
                Administrer afdelinger og kategorier
              </AppText>
              <PrimaryButton
                label="+ Tilføj Afdeling"
                onPress={() => setShowModal(true)}
              />
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.deptCard}>
              <TouchableOpacity
                style={styles.deptCardHeader}
                onPress={() =>
                  setSelectedDeptId(selectedDeptId === item.id ? null : item.id)
                }
              >
                <AppText variant="h4" style={styles.flex}>
                  {item.name}
                </AppText>

                <View style={styles.inlineActions}>
                  <InlineActionButton
                    icon="create-outline"
                    onPress={() => openEditModal(item)}
                  />
                  <InlineActionButton
                    icon="trash-outline"
                    variant="danger"
                    onPress={() => handleDelete(item)}
                  />
                </View>

                <Ionicons
                  name={
                    selectedDeptId === item.id ? "chevron-up" : "chevron-down"
                  }
                  size={20}
                  color={theme.colors.text.secondary}
                />
              </TouchableOpacity>

              {selectedDeptId === item.id && (
                <CategorySection token={token} departmentId={item.id} />
              )}
            </View>
          )}
          ListEmptyComponent={
            <AppText
              variant="p"
              color={theme.colors.text.light}
              style={styles.center}
            >
              Ingen afdelinger endnu
            </AppText>
          }
        />
      )}

      <BaseModal
        visible={showModal}
        title="Tilføj afdeling"
        onClose={() => setShowModal(false)}
      >
        <InputField
          label="Navn"
          placeholder="fx Marketing"
          value={deptName}
          onChangeText={setDeptName}
        />
        <PrimaryButton label="Tilføj" onPress={handleAdd} />
      </BaseModal>

      <DepartmentEditModal
        visible={editingDepartment !== null}
        name={editDeptName}
        onNameChange={setEditDeptName}
        onClose={closeEditModal}
        onSave={handleSaveEdit}
      />
    </View>
  );
}

// ── CATEGORY SECTION ──────────────────────────────────────────────────────────
function CategorySection({
  token,
  departmentId,
}: {
  token: string;
  departmentId: string;
}) {
  const {
    categories,
    isLoading,
    error,
    addCategory,
    updateCategory,
    deleteCategory,
  } = useCategoryViewModel(token, departmentId);

  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
  const [showCatModal, setShowCatModal] = useState(false);
  const [showTxModal, setShowTxModal] = useState(false);
  const [catName, setCatName] = useState("");
  const [catType, setCatType] = useState<CategoryType>("expense");
  const [editingCategory, setEditingCategory] = useState<
    (typeof categories)[number] | null
  >(null);
  const [editCatName, setEditCatName] = useState("");
  const [editCatType, setEditCatType] = useState<CategoryType>("expense");

  const [txCategoryId, setTxCategoryId] = useState("");
  const [txAmount, setTxAmount] = useState("");
  const [txDate, setTxDate] = useState(new Date().toISOString().split("T")[0]);
  const [txDescription, setTxDescription] = useState("");

  const { addTransaction } = useTransactionViewModel(token, txCategoryId);

  const categoryOptions = categories.map((c) => ({
    label: c.name,
    value: c.id,
  }));

  const typeOptions = [
    { label: "Indtægt", value: "income" },
    { label: "Udgift", value: "expense" },
    { label: "Skat", value: "tax" },
    { label: "Afskrivning", value: "depreciation" },
  ];

  const handleAddCat = async () => {
    if (!catName.trim()) return;
    await addCategory(catName.trim(), catType);
    setCatName("");
    setShowCatModal(false);
  };

  const closeEditModal = () => {
    setEditingCategory(null);
    setEditCatName("");
    setEditCatType("expense");
  };

  const openEditModal = (category: (typeof categories)[number]) => {
    setEditingCategory(category);
    setEditCatName(category.name);
    setEditCatType(category.type);
  };

  const handleSaveEdit = async () => {
    if (!editingCategory || !editCatName.trim()) return;

    try {
      await updateCategory(editingCategory.id, editCatName.trim(), editCatType);
      closeEditModal();
    } catch {
      // håndteres via error i viewmodel
    }
  };

  const handleDelete = (category: (typeof categories)[number]) => {
    Alert.alert(
      "Slet kategori",
      "Er du sikker på, at du vil slette kategorien?",
      [
        { text: "Annuller", style: "cancel" },
        {
          text: "Slet",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteCategory(category.id);
              if (selectedCatId === category.id) {
                setSelectedCatId(null);
              }
            } catch {
              // håndteres via error i viewmodel
            }
          },
        },
      ],
    );
  };

  const handleAddTx = async () => {
    if (!txAmount.trim() || !txDescription.trim() || !txCategoryId) return;

    const parsedAmount = parseFloat(txAmount);
    if (Number.isNaN(parsedAmount)) return;

    const selectedCategory = categories.find(
      (category) => category.id === txCategoryId,
    );
    if (!selectedCategory) return;

    try {
      await addTransaction(
        getSignedAmount(parsedAmount, selectedCategory.type),
        txDate,
        txDescription,
      );
      setTxAmount("");
      setTxDescription("");
      setShowTxModal(false);
    } catch {
      // håndteres via error i viewmodel
    }
  };

  return (
    <View style={styles.categorySection}>
      {error && <AlertMessage type="error" message={error} />}

      <View style={styles.sectionHeader}>
        <AppText variant="p" color={theme.colors.text.secondary}>
          Kategorier
        </AppText>
        <TouchableOpacity
          style={styles.smallBtn}
          onPress={() => setShowCatModal(true)}
        >
          <AppText variant="p" color={theme.colors.white}>
            + Kategori
          </AppText>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator color={theme.colors.primary.blue} />
      ) : categories.length === 0 ? (
        <AppText
          variant="p"
          color={theme.colors.text.light}
          style={styles.center}
        >
          Ingen kategorier endnu
        </AppText>
      ) : (
        categories.map((cat) => (
          <View key={cat.id}>
            <TouchableOpacity
              style={[
                styles.catRow,
                selectedCatId === cat.id && styles.catRowActive,
              ]}
              onPress={() =>
                setSelectedCatId(selectedCatId === cat.id ? null : cat.id)
              }
            >
              <View style={[styles.catMain, styles.flex]}>
                <View
                  style={[
                    styles.catIndicator,
                    {
                      backgroundColor:
                        cat.type === "income"
                          ? theme.colors.status.success
                          : theme.colors.status.error,
                    },
                  ]}
                />
                <AppText variant="p" style={styles.flex}>
                  {cat.name}
                </AppText>
                <AppText variant="p" color={theme.colors.text.light}>
                  {cat.type === "income"
                    ? "Indtægt"
                    : cat.type === "expense"
                      ? "Udgift"
                      : cat.type === "tax"
                        ? "Skat"
                        : "Afskrivning"}
                </AppText>
              </View>

              <View style={styles.inlineActions}>
                <InlineActionButton
                  icon="create-outline"
                  onPress={() => openEditModal(cat)}
                />
                <InlineActionButton
                  icon="trash-outline"
                  variant="danger"
                  onPress={() => handleDelete(cat)}
                />
              </View>
            </TouchableOpacity>

            {selectedCatId === cat.id && (
              <TransactionSection
                token={token}
                categoryId={cat.id}
                categoryType={cat.type}
              />
            )}
          </View>
        ))
      )}

      <TouchableOpacity
        style={styles.addTransactionBtn}
        onPress={() => setShowTxModal(true)}
      >
        <AppText variant="p" color={theme.colors.text.secondary}>
          + Tilføj Transaktion
        </AppText>
      </TouchableOpacity>

      <BaseModal
        visible={showCatModal}
        title="Tilføj kategori"
        onClose={() => setShowCatModal(false)}
      >
        <InputField
          label="Navn"
          placeholder="fx Løn"
          value={catName}
          onChangeText={setCatName}
        />
        <DropdownField
          label="Type"
          options={typeOptions}
          value={catType}
          onChange={(v) => setCatType(v as CategoryType)}
        />
        <PrimaryButton label="Tilføj" onPress={handleAddCat} />
      </BaseModal>

      <BaseModal
        visible={showTxModal}
        title="Tilføj transaktion"
        onClose={() => setShowTxModal(false)}
      >
        <DropdownField
          label="Kategori"
          options={categoryOptions}
          value={txCategoryId}
          onChange={setTxCategoryId}
        />
        <InputField
          label="Beløb"
          placeholder="fx 5000"
          value={txAmount}
          onChangeText={setTxAmount}
          keyboardType="numeric"
        />
        <InputField
          label="Dato"
          placeholder="YYYY-MM-DD"
          value={txDate}
          onChangeText={setTxDate}
        />
        <InputField
          label="Beskrivelse"
          placeholder="fx Løn marts"
          value={txDescription}
          onChangeText={setTxDescription}
        />
        <PrimaryButton label="Tilføj transaktion" onPress={handleAddTx} />
      </BaseModal>

      <CategoryEditModal
        visible={editingCategory !== null}
        name={editCatName}
        type={editCatType}
        typeOptions={typeOptions}
        onNameChange={setEditCatName}
        onTypeChange={setEditCatType}
        onClose={closeEditModal}
        onSave={handleSaveEdit}
      />
    </View>
  );
}

// ── TRANSACTION SECTION ───────────────────────────────────────────────────────
function TransactionSection({
  token,
  categoryId,
  categoryType,
}: {
  token: string;
  categoryId: string;
  categoryType: CategoryType;
}) {
  const {
    transactions,
    isLoading,
    error,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  } = useTransactionViewModel(token, categoryId);

  const [showModal, setShowModal] = useState(false);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState("");
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const closeEditModal = () => {
    setEditingTransaction(null);
    setEditAmount("");
    setEditDate("");
    setEditDescription("");
  };

  const openEditModal = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setEditAmount(Math.abs(transaction.amount).toString());
    setEditDate(transaction.date);
    setEditDescription(transaction.description ?? "");
  };

  const handleAdd = async () => {
    if (!amount.trim() || !description.trim()) return;
    const parsedAmount = parseFloat(amount);
    if (Number.isNaN(parsedAmount)) return;

    try {
      await addTransaction(
        getSignedAmount(parsedAmount, categoryType),
        date,
        description,
      );
      setAmount("");
      setDescription("");
      setShowModal(false);
    } catch {
      // håndteres via error i viewmodel
    }
  };

  const handleSaveEdit = async () => {
    if (!editingTransaction || !editAmount.trim() || !editDescription.trim()) {
      return;
    }

    const parsedAmount = parseFloat(editAmount);
    if (Number.isNaN(parsedAmount)) return;

    try {
      await updateTransaction(
        editingTransaction.id,
        getSignedAmount(parsedAmount, categoryType),
        editDate,
        editDescription.trim(),
      );
      closeEditModal();
    } catch {
      // håndteres via error i viewmodel
    }
  };

  const handleDelete = (transaction: Transaction) => {
    Alert.alert(
      "Slet transaktion",
      "Er du sikker på, at du vil slette transaktionen?",
      [
        { text: "Annuller", style: "cancel" },
        {
          text: "Slet",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteTransaction(transaction.id);
            } catch {
              // håndteres via error i viewmodel
            }
          },
        },
      ],
    );
  };

  return (
    <View style={styles.transactionSection}>
      {error && <AlertMessage type="error" message={error} />}

      <View style={styles.sectionHeader}>
        <AppText variant="p" color={theme.colors.text.secondary}>
          Transaktioner
        </AppText>
        <TouchableOpacity
          style={styles.smallBtn}
          onPress={() => setShowModal(true)}
        >
          <AppText variant="p" color={theme.colors.white}>
            + Tilføj
          </AppText>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator color={theme.colors.primary.blue} />
      ) : transactions.length === 0 ? (
        <AppText
          variant="p"
          color={theme.colors.text.light}
          style={styles.center}
        >
          Ingen transaktioner endnu
        </AppText>
      ) : (
        transactions.map((t) => (
          <View key={t.id} style={styles.transactionRow}>
            <View style={styles.flex}>
              <AppText variant="p">{t.description}</AppText>
              <AppText variant="p" color={theme.colors.text.light}>
                {t.date}
              </AppText>
            </View>

            <View style={styles.transactionActions}>
              <AppText
                variant="p"
                color={
                  t.amount > 0
                    ? theme.colors.status.success
                    : theme.colors.status.error
                }
              >
                {t.amount > 0 ? "+" : ""}
                {t.amount.toLocaleString()} kr
              </AppText>

              <View style={styles.inlineActions}>
                <InlineActionButton
                  icon="create-outline"
                  onPress={() => openEditModal(t)}
                />
                <InlineActionButton
                  icon="trash-outline"
                  variant="danger"
                  onPress={() => handleDelete(t)}
                />
              </View>
            </View>
          </View>
        ))
      )}

      <BaseModal
        visible={showModal}
        title="Tilføj transaktion"
        onClose={() => setShowModal(false)}
      >
        <InputField
          label="Beløb"
          placeholder="fx 5000"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
        />
        <InputField
          label="Dato"
          placeholder="YYYY-MM-DD"
          value={date}
          onChangeText={setDate}
        />
        <InputField
          label="Beskrivelse"
          placeholder="fx Løn marts"
          value={description}
          onChangeText={setDescription}
        />
        <PrimaryButton label="Tilføj transaktion" onPress={handleAdd} />
      </BaseModal>

      <TransactionEditModal
        visible={editingTransaction !== null}
        amount={editAmount}
        date={editDate}
        description={editDescription}
        onAmountChange={setEditAmount}
        onDateChange={setEditDate}
        onDescriptionChange={setEditDescription}
        onClose={closeEditModal}
        onSave={handleSaveEdit}
      />
    </View>
  );
}

// ── TRANSAKTIONER TAB ─────────────────────────────────────────────────────────
function TransaktionerTab({
  token,
  refreshVersion,
  onOpenCreateTransaction,
}: {
  token: string;
  refreshVersion: number;
  onOpenCreateTransaction: () => void;
}) {
  const {
    transactions,
    isLoading,
    error,
    fetchTransactions,
    updateTransaction,
    deleteTransaction,
  } = useTransactionViewModel(token, "");

  const [searchQuery, setSearchQuery] = useState("");
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editDescription, setEditDescription] = useState("");

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions, refreshVersion]);

  const closeEditModal = () => {
    setEditingTransaction(null);
    setEditAmount("");
    setEditDate("");
    setEditDescription("");
  };

  const openEditModal = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setEditAmount(Math.abs(transaction.amount).toString());
    setEditDate(transaction.date);
    setEditDescription(transaction.description ?? "");
  };

  const handleSaveEdit = async () => {
    if (!editingTransaction || !editAmount.trim() || !editDescription.trim()) {
      return;
    }

    const parsedAmount = parseFloat(editAmount);
    if (Number.isNaN(parsedAmount)) return;

    try {
      await updateTransaction(
        editingTransaction.id,
        getSignedAmount(
          parsedAmount,
          getTransactionCategoryType(editingTransaction),
        ),
        editDate,
        editDescription.trim(),
      );
      closeEditModal();
    } catch {
      // håndteres via error i viewmodel
    }
  };

  const handleDelete = (transaction: Transaction) => {
    Alert.alert(
      "Slet transaktion",
      "Er du sikker på, at du vil slette transaktionen?",
      [
        { text: "Annuller", style: "cancel" },
        {
          text: "Slet",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteTransaction(transaction.id);
            } catch {
              // håndteres via error i viewmodel
            }
          },
        },
      ],
    );
  };

  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const filteredTransactions =
    normalizedSearchQuery.length === 0
      ? transactions
      : transactions.filter((transaction) => {
          const searchableText = [
            transaction.description,
            transaction.date,
            transaction.categories?.name,
            transaction.categories?.departments?.name,
            transaction.amount.toString(),
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return searchableText.includes(normalizedSearchQuery);
        });

  return (
    <View style={styles.tab}>
      <ScrollView style={styles.tab} contentContainerStyle={styles.tabContent}>
        <AppText variant="h3" style={styles.pageTitle}>
          Transaktioner
        </AppText>

        <TextInput
          style={styles.searchInput}
          placeholder="Søg på beskrivelse, dato, afdeling eller beløb"
          placeholderTextColor={theme.input.placeholder}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />

        {error && <AlertMessage type="error" message={error} />}

        {isLoading ? (
          <ActivityIndicator color={theme.colors.primary.blue} />
        ) : filteredTransactions.length === 0 ? (
          <AppText
            variant="p"
            color={theme.colors.text.light}
            style={styles.center}
          >
            {transactions.length === 0
              ? "Ingen transaktioner endnu"
              : "Ingen transaktioner matcher din søgning"}
          </AppText>
        ) : (
          filteredTransactions.map((t) => (
            <View key={t.id} style={styles.transactionRow}>
              <View style={styles.flex}>
                <AppText variant="p">{t.description}</AppText>
                <AppText variant="p" color={theme.colors.text.light}>
                  {t.date}
                </AppText>
                <AppText variant="p" color={theme.colors.text.light}>
                  {t.categories?.departments?.name} • {t.categories?.name}
                </AppText>
              </View>

              <View style={styles.transactionActions}>
                <AppText
                  variant="p"
                  color={
                    t.amount > 0
                      ? theme.colors.status.success
                      : theme.colors.status.error
                  }
                >
                  {t.amount > 0 ? "+" : ""}
                  {t.amount.toLocaleString()} kr
                </AppText>

                <View style={styles.inlineActions}>
                  <InlineActionButton
                    icon="create-outline"
                    onPress={() => openEditModal(t)}
                  />
                  <InlineActionButton
                    icon="trash-outline"
                    variant="danger"
                    onPress={() => handleDelete(t)}
                  />
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <Pressable style={styles.fab} onPress={onOpenCreateTransaction}>
        <Ionicons name="add" size={28} color={theme.colors.white} />
      </Pressable>

      <TransactionEditModal
        visible={editingTransaction !== null}
        amount={editAmount}
        date={editDate}
        description={editDescription}
        onAmountChange={setEditAmount}
        onDateChange={setEditDate}
        onDescriptionChange={setEditDescription}
        onClose={closeEditModal}
        onSave={handleSaveEdit}
      />
    </View>
  );
}

// ── DASHBOARDS TAB ────────────────────────────────────────────────────────────
function DashboardsTab({
  token,
  refreshVersion,
}: {
  token: string;
  refreshVersion: number;
}) {
  const [selectedPeriodPreset, setSelectedPeriodPreset] =
    useState<PeriodPreset>("currentMonth");
  const [appliedPeriod, setAppliedPeriod] = useState(() =>
    getPeriodRange("currentMonth"),
  );
  const [fromInput, setFromInput] = useState(() => appliedPeriod.from);
  const [toInput, setToInput] = useState(() => appliedPeriod.to);
  const [periodError, setPeriodError] = useState<string | null>(null);
  const { kpis, isLoading, error, fetchKpis } = useKpiViewModel(
    token,
    appliedPeriod.from,
    appliedPeriod.to,
  );

  useEffect(() => {
    fetchKpis();
  }, [fetchKpis, refreshVersion]);

  const ALL_KPI_KEYS = [
    "revenue",
    "ebitda",
    "netResult",
    "cashFlow",
    "burnRate",
    "monthlyGrowthRate",
    "grossProfit",
    "grossMargin",
    "variableCosts",
    "contributionMargin",
    "liquidityRatio",
    "debtorDays",
  ] as const;

  type KpiKey = (typeof ALL_KPI_KEYS)[number];

  const [selectedKpis, setSelectedKpis] = useState<KpiKey[]>([
    "revenue",
    "ebitda",
    "netResult",
    "cashFlow",
    "burnRate",
    "monthlyGrowthRate",
    "grossProfit",
    "grossMargin",
    "variableCosts",
    "contributionMargin",
    "liquidityRatio",
    "debtorDays",
  ]);
  const [showSelector, setShowSelector] = useState(false);
  const [selectedKpiInfo, setSelectedKpiInfo] = useState<KpiMetric | null>(
    null,
  );

  const periodOptions = [
    { label: "Denne måned", value: "currentMonth" },
    { label: "Seneste 30 dage", value: "last30Days" },
    { label: "Dette kvartal", value: "currentQuarter" },
    { label: "I år", value: "currentYear" },
    { label: "Brugerdefineret", value: "custom" },
  ];

  const toggleKpi = (key: KpiKey) => {
    setSelectedKpis((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  const applyPresetPeriod = (value: string) => {
    const preset = value as PeriodPreset;
    if (preset === "custom") {
      setSelectedPeriodPreset("custom");
      return;
    }

    const nextPeriod = getPeriodRange(preset);

    setSelectedPeriodPreset(preset);
    setFromInput(nextPeriod.from);
    setToInput(nextPeriod.to);
    setAppliedPeriod(nextPeriod);
    setPeriodError(null);
  };

  const applyCustomPeriod = () => {
    if (!isValidIsoDate(fromInput) || !isValidIsoDate(toInput)) {
      setPeriodError("Datoer skal være i formatet YYYY-MM-DD.");
      return;
    }

    if (fromInput > toInput) {
      setPeriodError("'Fra' dato må ikke være efter 'Til' dato.");
      return;
    }

    setAppliedPeriod({ from: fromInput, to: toInput });
    setSelectedPeriodPreset("custom");
    setPeriodError(null);
  };

  const formatValue = (value: number | null, unit: string) => {
    if (value === null) return "–";
    if (unit === "currency")
      return `${Math.round(value).toLocaleString("da-DK")} kr`;
    if (unit === "percentage") return `${value.toFixed(1)}%`;
    if (unit === "days") return `${value.toFixed(0)} dage`;
    if (unit === "ratio") return value.toFixed(2);
    return `${value}`;
  };

  return (
    <ScrollView style={styles.tab} contentContainerStyle={styles.tabContent}>
      <AppText variant="h3" style={styles.pageTitle}>
        Dashboard
      </AppText>

      <View style={styles.periodCard}>
        <DropdownField
          label="Periode"
          options={periodOptions}
          value={selectedPeriodPreset}
          onChange={applyPresetPeriod}
        />

        <View style={styles.periodInputRow}>
          <View style={styles.periodInput}>
            <InputField
              label="Fra"
              placeholder="YYYY-MM-DD"
              value={fromInput}
              onChangeText={setFromInput}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          <View style={styles.periodInput}>
            <InputField
              label="Til"
              placeholder="YYYY-MM-DD"
              value={toInput}
              onChangeText={setToInput}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>

        {periodError && <AlertMessage type="error" message={periodError} />}

        <PrimaryButton label="Anvend periode" onPress={applyCustomPeriod} />

        <AppText
          variant="p"
          color={theme.colors.text.secondary}
          style={styles.periodSummary}
        >
          Aktiv periode: {appliedPeriod.from} – {appliedPeriod.to}
        </AppText>
      </View>

      {error && <AlertMessage type="error" message={error} />}

      {isLoading ? (
        <ActivityIndicator color={theme.colors.primary.blue} />
      ) : (
        <View style={styles.kpiGrid}>
          {selectedKpis.map((key) => {
            const metric = kpis?.metrics[key as keyof typeof kpis.metrics];
            if (!metric) return null;

            return (
              <View key={key} style={styles.kpiCard}>
                <View style={styles.kpiCardHeader}>
                  <AppText
                    variant="p"
                    color={theme.colors.text.secondary}
                    style={styles.kpiCardTitle}
                  >
                    {metric.label}
                  </AppText>
                  <Pressable
                    onPress={() => setSelectedKpiInfo(metric)}
                    hitSlop={8}
                    style={styles.kpiInfoButton}
                    accessibilityRole="button"
                    accessibilityLabel={`Vis info om ${metric.label}`}
                  >
                    <Ionicons
                      name="information-circle-outline"
                      size={18}
                      color={theme.colors.text.secondary}
                    />
                  </Pressable>
                </View>
                <AppText
                  variant="h4"
                  color={
                    metric.available
                      ? theme.colors.text.primary
                      : theme.colors.text.light
                  }
                >
                  {metric.available
                    ? formatValue(metric.value, metric.unit)
                    : "–"}
                </AppText>
                {!metric.available && (
                  <AppText
                    variant="p"
                    color={theme.colors.text.light}
                    style={{ fontSize: 10 }}
                  >
                    {metric.reason}
                  </AppText>
                )}
              </View>
            );
          })}
        </View>
      )}

      <KpiInfoModal
        metric={selectedKpiInfo}
        visible={selectedKpiInfo !== null}
        onClose={() => setSelectedKpiInfo(null)}
      />

      <TouchableOpacity
        style={styles.addTransactionBtn}
        onPress={() => setShowSelector(!showSelector)}
      >
        <AppText variant="p" color={theme.colors.text.secondary}>
          {showSelector ? "Luk" : "+ Vælg KPI'er"}
        </AppText>
      </TouchableOpacity>

      {showSelector && (
        <View style={styles.kpiSelector}>
          {ALL_KPI_KEYS.map((key) => {
            const metric = kpis?.metrics[key as keyof typeof kpis.metrics];
            const isSelected = selectedKpis.includes(key);

            return (
              <TouchableOpacity
                key={key}
                style={[
                  styles.chip,
                  isSelected && styles.chipSelected,
                  !metric?.available && styles.chipUnavailable,
                ]}
                onPress={() => toggleKpi(key)}
              >
                <AppText
                  variant="p"
                  color={
                    isSelected ? theme.colors.white : theme.colors.text.primary
                  }
                >
                  {metric?.label ?? key}
                </AppText>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

// ── TEAM TAB ──────────────────────────────────────────────────────────────────
function TeamTab({ token, userRole }: { token: string; userRole: TeamRole }) {
  const { departments } = useOrganisationViewModel(token);
  const {
    members,
    totalMembers,
    isLoading,
    error,
    inviteLoading,
    inviteEmployee,
  } = useTeamViewModel(token);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState<
    "manager" | "employee" | "auditor"
  >("employee");
  const [inviteDepartmentId, setInviteDepartmentId] = useState("");
  const canInvite = userRole === "admin" || userRole === "manager";

  const departmentMemberCount = departments.map((dept) => ({
    id: dept.id,
    name: dept.name,
    count: members.filter((member) => member.departmentId === dept.id).length,
  }));

  const roleOptions =
    userRole === "admin"
      ? [
          { label: "Manager", value: "manager" },
          { label: "Employee", value: "employee" },
          { label: "Auditor", value: "auditor" },
        ]
      : [{ label: "Employee", value: "employee" }];

  const departmentOptions = departments.map((dept) => ({
    label: dept.name,
    value: dept.id,
  }));

  const roleLabel = (role: TeamRole) => {
    if (role === "admin") return "Admin";
    if (role === "manager") return "Manager";
    if (role === "auditor") return "Auditor";
    return "Medarbejder";
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !inviteName.trim() || !inviteDepartmentId)
      return;

    await inviteEmployee({
      email: inviteEmail.trim(),
      fullName: inviteName.trim(),
      role: inviteRole,
      departmentId: inviteDepartmentId,
    });

    setInviteEmail("");
    setInviteName("");
    setInviteRole(userRole === "admin" ? "manager" : "employee");
    setInviteDepartmentId("");
    setShowInviteModal(false);
  };
  return (
    <ScrollView style={styles.tab} contentContainerStyle={styles.teamContent}>
      {error && <AlertMessage type="error" message={error} />}

      <PrimaryButton
        label="Inviter Medarbejder"
        onPress={() => setShowInviteModal(true)}
        disabled={!canInvite}
        loading={inviteLoading}
      />
      {!canInvite && (
        <AppText
          variant="p"
          color={theme.colors.text.light}
          style={styles.teamHint}
        >
          Kun admin eller manager kan invitere medarbejdere.
        </AppText>
      )}

      <View style={styles.teamStatGrid}>
        <View style={styles.teamStatCard}>
          <AppText variant="p" color={theme.colors.text.secondary}>
            Total Medarbejdere
          </AppText>
          <AppText variant="h3">{totalMembers}</AppText>
        </View>
        {departmentMemberCount.map((item) => (
          <View key={item.id} style={styles.teamStatCard}>
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
        <AppText
          variant="p"
          color={theme.colors.text.light}
          style={styles.center}
        >
          Ingen medarbejdere fundet endnu.
        </AppText>
      ) : (
        members.map((member) => (
          <View key={member.id} style={styles.memberCard}>
            <View style={styles.memberHeader}>
              <View style={styles.memberAvatar}>
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
                  member.status === "active"
                    ? styles.statusActive
                    : styles.statusPending,
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
              {departments.find((dept) => dept.id === member.departmentId)
                ?.name ??
                member.departmentName ??
                "Ukendt afdeling"}
            </AppText>
          </View>
        ))
      )}

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
          onChange={(value) =>
            setInviteRole(value as "manager" | "employee" | "auditor")
          }
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background.app },
  content: { flex: 1 },
  formField: {
    marginBottom: theme.spacing.lg,
  },
  fieldLabel: {
    marginBottom: theme.spacing.sm,
  },
  segmentedControl: {
    flexDirection: "row",
    padding: theme.spacing.xs,
    borderRadius: theme.radius.full,
    borderWidth: theme.borderWidth.thin,
    borderColor: theme.colors.background.cardBorder,
    backgroundColor: theme.colors.background.app,
    gap: theme.spacing.xs,
  },
  segmentedOption: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.full,
  },
  segmentedOptionActive: {
    backgroundColor: theme.colors.primary.blue,
  },
  segmentedOptionLabel: {
    fontWeight: "600",
  },
  loadingField: {
    minHeight: 56,
    borderWidth: theme.borderWidth.thin,
    borderColor: theme.input.border,
    borderRadius: theme.radius.sm,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.input.background,
  },
  sheetOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(17,24,39,0.24)",
  },
  sheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheetKeyboardWrapper: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheetContainer: {
    flexShrink: 1,
    backgroundColor: theme.colors.background.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xl,
    borderTopWidth: theme.borderWidth.thin,
    borderColor: theme.colors.background.cardBorder,
    maxHeight: "86%",
  },
  sheetHandle: {
    alignSelf: "center",
    width: 44,
    height: 5,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.background.cardBorder,
    marginBottom: theme.spacing.md,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing.lg,
  },
  sheetCloseButton: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.background.app,
  },
  sheetScroll: {
    maxHeight: 420,
    marginBottom: theme.spacing.md,
  },
  sheetContent: {
    flexGrow: 1,
    paddingBottom: theme.spacing.lg,
  },
  sheetFooter: {
    paddingTop: theme.spacing.sm,
  },
  topHeader: {
    backgroundColor: theme.colors.background.card,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
    borderBottomWidth: theme.borderWidth.thin,
    borderBottomColor: theme.colors.background.cardBorder,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  settingsTrigger: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.background.app,
    borderWidth: theme.borderWidth.thin,
    borderColor: theme.colors.background.cardBorder,
  },
  settingsOverlay: {
    flex: 1,
    backgroundColor: "rgba(17,24,39,0.24)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: theme.spacing.hero + theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  settingsCard: {
    width: "82%",
    maxWidth: 320,
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.radius.lg,
    borderWidth: theme.borderWidth.thin,
    borderColor: theme.colors.background.cardBorder,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
  },
  settingsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: theme.spacing.xs,
  },
  settingsCloseButton: {
    width: 32,
    height: 32,
    borderRadius: theme.radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.background.app,
  },
  settingsItemIcon: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: `${theme.colors.primary.blue}14`,
  },
  settingsItemTitle: {
    color: theme.colors.text.primary,
    fontWeight: "600",
  },
  tab: { flex: 1 },
  tabContent: { padding: theme.spacing.xl, paddingBottom: 140 },
  homeTabContent: {
    padding: theme.spacing.xl,
    paddingBottom: 140,
  },
  pageTitle: { marginBottom: theme.spacing.md },
  fab: {
    position: "absolute",
    right: theme.spacing.xl,
    bottom: 120,
    width: 60,
    height: 60,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.primary.blue,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 10,
    zIndex: 20,
  },
  searchInput: {
    borderWidth: theme.borderWidth.thin,
    borderColor: theme.input.border,
    borderRadius: theme.radius.sm,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    fontSize: theme.typography.input.fontSize,
    backgroundColor: theme.input.background,
    color: theme.input.text,
  },
  pageHeader: {
    padding: theme.spacing.xl,
    paddingBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  sectionTitle: { marginBottom: theme.spacing.md, marginTop: theme.spacing.xl },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  metricsRow: { flexDirection: "row", marginBottom: theme.spacing.xl },
  metricCard: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.radius.md,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.background.cardBorder,
  },
  metricSpacer: { width: theme.spacing.md },
  flex: { flex: 1 },
  center: {
    textAlign: "center",
    alignItems: "center",
    justifyContent: "center",
  },
  listContent: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xxxl,
  },
  deptCard: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.md,
    borderWidth: theme.borderWidth.thin,
    borderColor: theme.colors.background.cardBorder,
    overflow: "hidden",
  },
  deptCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: theme.spacing.lg,
  },
  categorySection: {
    backgroundColor: theme.colors.background.app,
    padding: theme.spacing.md,
  },
  catRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.background.card,
    padding: theme.spacing.md,
    borderRadius: theme.radius.sm,
    marginBottom: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.background.cardBorder,
  },
  catMain: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  catRowActive: { borderColor: theme.colors.primary.blue },
  catIndicator: {
    width: 4,
    height: 36,
    borderRadius: 2,
    marginRight: theme.spacing.md,
  },
  addTransactionBtn: {
    borderWidth: theme.borderWidth.thin,
    borderColor: theme.colors.background.cardBorder,
    borderRadius: theme.radius.sm,
    padding: theme.spacing.lg,
    alignItems: "center",
    marginTop: theme.spacing.sm,
    backgroundColor: theme.colors.background.card,
  },
  smallBtn: {
    backgroundColor: theme.colors.primary.blue,
    borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  transactionSection: {
    backgroundColor: theme.colors.background.app,
    padding: theme.spacing.md,
    marginLeft: theme.spacing.md,
  },
  transactionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: theme.colors.background.card,
    padding: theme.spacing.md,
    borderRadius: theme.radius.sm,
    marginBottom: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.background.cardBorder,
  },
  transactionActions: {
    alignItems: "flex-end",
    gap: theme.spacing.sm,
    marginLeft: theme.spacing.md,
  },
  inlineActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    marginLeft: theme.spacing.md,
  },
  kpiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  kpiCard: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.radius.md,
    padding: theme.spacing.lg,
    width: "47%",
    borderWidth: theme.borderWidth.thin,
    borderColor: theme.colors.background.cardBorder,
    gap: theme.spacing.xs,
  },
  kpiCardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: theme.spacing.sm,
  },
  kpiCardTitle: {
    flex: 1,
  },
  kpiInfoButton: {
    padding: 2,
  },
  kpiInfoScroll: {
    maxHeight: 360,
  },
  kpiInfoContent: {
    gap: theme.spacing.lg,
    paddingBottom: theme.spacing.xs,
  },
  kpiInfoSection: {
    gap: theme.spacing.sm,
  },
  kpiInfoSectionTitle: {
    fontWeight: "700",
    color: theme.colors.text.primary,
  },
  kpiInfoBulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.spacing.sm,
  },
  kpiInfoBullet: {
    color: theme.colors.text.primary,
    lineHeight: 20,
  },
  kpiInfoBulletText: {
    flex: 1,
  },
  periodCard: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.radius.md,
    padding: theme.spacing.lg,
    borderWidth: theme.borderWidth.thin,
    borderColor: theme.colors.background.cardBorder,
    marginBottom: theme.spacing.lg,
  },
  periodInputRow: {
    flexDirection: "row",
    gap: theme.spacing.md,
  },
  periodInput: {
    flex: 1,
  },
  periodSummary: {
    marginTop: theme.spacing.md,
  },
  kpiSelector: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  chip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: 20,
    backgroundColor: theme.colors.background.card,
    borderWidth: theme.borderWidth.thin,
    borderColor: theme.colors.background.cardBorder,
  },
  chipSelected: {
    backgroundColor: theme.colors.primary.blue,
    borderColor: theme.colors.primary.blue,
  },
  chipUnavailable: {
    opacity: 0.4,
  },
  teamContent: {
    padding: theme.spacing.xl,
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.xxxl,
  },
  teamHint: {
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  teamStatGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.md,
  },
  teamStatCard: {
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
  memberHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  memberAvatar: {
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
  statusActive: {
    backgroundColor: "#D1FAE5",
  },
  statusPending: {
    backgroundColor: "#FEF3C7",
  },
});
