import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
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
import { CategoryType } from "../../models/categoryModel";
import { Department } from "../../models/departmentModel";
import { Transaction } from "../../models/transactionModel";
import { useCategoryViewModel } from "../../viewmodels/useCategoryViewModel";
import { useKpiViewModel } from "../../viewmodels/useKpiViewModel";
import { useOrganisationViewModel } from "../../viewmodels/useOrganisationViewModel";
import { useTransactionViewModel } from "../../viewmodels/useTransactionViewModel";

const getSignedAmount = (amount: number, categoryType: CategoryType) => {
  const absoluteAmount = Math.abs(amount);
  return categoryType === "income" ? absoluteAmount : -absoluteAmount;
};

const TABS = [
  { key: "overblik", label: "Overblik", icon: "grid-outline" as const },
  { key: "afdelinger", label: "Afdelinger", icon: "business-outline" as const },
  {
    key: "transaktioner",
    label: "Transaktioner",
    icon: "card-outline" as const,
  },
  {
    key: "dashboards",
    label: "Dashboards",
    icon: "stats-chart-outline" as const,
  },
  { key: "team", label: "Team", icon: "people-outline" as const },
];

const getTransactionCategoryType = (transaction: Transaction): CategoryType =>
  transaction.categories?.type === "income" ||
  transaction.categories?.type === "expense" ||
  transaction.categories?.type === "tax" ||
  transaction.categories?.type === "depreciation"
    ? transaction.categories.type
    : transaction.amount >= 0
      ? "income"
      : "expense";

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

export default function OrganisationScreen({
  token,
  organisationName,
}: {
  token: string;
  organisationName: string;
}) {
  const [activeTab, setActiveTab] = useState("overblik");
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.topHeader,
          { paddingTop: insets.top + theme.spacing.md },
        ]}
      >
        <AppText variant="h4">{organisationName}</AppText>
        <AppText variant="p" color={theme.colors.text.secondary}>
          Admin Panel
        </AppText>
      </View>
      <View style={styles.content}>
        {activeTab === "overblik" && (
          <OverblikTab token={token} organisationName={organisationName} />
        )}
        {activeTab === "afdelinger" && <AfdelingerTab token={token} />}
        {activeTab === "transaktioner" && <TransaktionerTab token={token} />}
        {activeTab === "dashboards" && <DashboardsTab token={token} />}
        {activeTab === "team" && <TeamTab />}
      </View>
      <BottomTabBar
        tabs={TABS}
        activeTab={activeTab}
        onTabPress={setActiveTab}
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
  const recent = transactions.slice(0, 5);

  return (
    <ScrollView style={styles.tab} contentContainerStyle={styles.tabContent}>
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
function TransaktionerTab({ token }: { token: string }) {
  const {
    transactions,
    isLoading,
    error,
    updateTransaction,
    deleteTransaction,
  } = useTransactionViewModel(token, "");

  const [searchQuery, setSearchQuery] = useState("");
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
    </ScrollView>
  );
}

// ── DASHBOARDS TAB ────────────────────────────────────────────────────────────
function DashboardsTab({ token }: { token: string }) {
  const today = new Date();
  const from = new Date(today.getFullYear(), today.getMonth(), 1)
    .toISOString()
    .slice(0, 10);
  const to = today.toISOString().slice(0, 10);
  const { kpis, isLoading, error } = useKpiViewModel(token, from, to);

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
    "cashFlow",
    "burnRate",
  ]);
  const [showSelector, setShowSelector] = useState(false);

  const toggleKpi = (key: KpiKey) => {
    setSelectedKpis((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
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

      <AppText
        variant="p"
        color={theme.colors.text.secondary}
        style={{ marginBottom: theme.spacing.lg }}
      >
        {from} – {to}
      </AppText>

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
                <AppText variant="p" color={theme.colors.text.secondary}>
                  {metric.label}
                </AppText>
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
function TeamTab() {
  return (
    <View style={[styles.tab, styles.center]}>
      <AppText variant="h4" color={theme.colors.text.secondary}>
        Team
      </AppText>
      <AppText variant="p" color={theme.colors.text.light}>
        Invite-funktion kommer snart
      </AppText>
    </View>
  );
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
  tab: { flex: 1 },
  tabContent: { padding: theme.spacing.xl },
  pageTitle: { marginBottom: theme.spacing.md },
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
});
