import { Ionicons } from "@expo/vector-icons"
import React, { useState } from "react"
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native"
import {
  AlertMessage,
  AppText,
  BaseModal,
  DropdownField,
  InlineActionButton,
  InputField,
  PrimaryButton,
} from "../../../components"
import { theme } from "../../../constants/theme"
import { CategoryType } from "../../../models/categoryModel"
import { Department } from "../../../models/departmentModel"
import { useCategoryViewModel } from "../../../viewmodels/useCategoryViewModel"
import { useOrganisationViewModel } from "../../../viewmodels/useOrganisationViewModel"
import { TeamRole } from "../../../viewmodels/useTeamViewModel"
import { useTransactionViewModel } from "../../../viewmodels/useTransactionViewModel"
import { AddTransactionSheet } from "./AddTransactionSheet"
import { getSignedAmount } from "./shared"
import { TransactionEditModal } from "./TransactionEditModal"

// ── MODALS ────────────────────────────────────────────────────────────────────

function DepartmentEditModal({
  visible,
  name,
  onNameChange,
  onClose,
  onSave,
}: {
  visible: boolean
  name: string
  onNameChange: (value: string) => void
  onClose: () => void
  onSave: () => void
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
  )
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
  visible: boolean
  name: string
  type: CategoryType
  typeOptions: { label: string; value: string }[]
  onNameChange: (value: string) => void
  onTypeChange: (value: CategoryType) => void
  onClose: () => void
  onSave: () => void
}) {
  return (
    <BaseModal visible={visible} title="Rediger kategori" onClose={onClose}>
      <InputField label="Navn" placeholder="fx Løn" value={name} onChangeText={onNameChange} />
      <DropdownField
        label="Type"
        options={typeOptions}
        value={type}
        onChange={(value) => onTypeChange(value as CategoryType)}
      />
      <PrimaryButton label="Gem ændringer" onPress={onSave} />
    </BaseModal>
  )
}

// ── TRANSACTION SECTION ───────────────────────────────────────────────────────

function TransactionSection({
  token,
  categoryId,
  categoryType,
  userRole,
}: {
  token: string
  categoryId: string
  categoryType: CategoryType
  userRole: TeamRole
}) {
  const {
    transactions,
    isLoading,
    error,
    fetchTransactions,
    updateTransaction,
    deleteTransaction,
  } = useTransactionViewModel(token, categoryId)
  const canManageTransactions = userRole === "admin" || userRole === "manager"

  const [showAddSheet, setShowAddSheet] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<(typeof transactions)[number] | null>(null)
  const [editAmount, setEditAmount] = useState("")
  const [editDate, setEditDate] = useState("")
  const [editDescription, setEditDescription] = useState("")

  const closeEditModal = () => {
    setEditingTransaction(null)
    setEditAmount("")
    setEditDate("")
    setEditDescription("")
  }

  const openEditModal = (transaction: (typeof transactions)[number]) => {
    setEditingTransaction(transaction)
    setEditAmount(Math.abs(transaction.amount).toString())
    setEditDate(transaction.date)
    setEditDescription(transaction.description ?? "")
  }

  const handleSaveEdit = async () => {
    if (!editingTransaction || !editAmount.trim() || !editDescription.trim()) return
    const parsedAmount = parseFloat(editAmount)
    if (Number.isNaN(parsedAmount)) return
    try {
      await updateTransaction(
        editingTransaction.id,
        getSignedAmount(parsedAmount, categoryType),
        editDate,
        editDescription.trim(),
      )
      closeEditModal()
    } catch {
      // håndteres via error i viewmodel
    }
  }

  const handleDelete = (transaction: (typeof transactions)[number]) => {
    Alert.alert("Slet transaktion", "Er du sikker på, at du vil slette transaktionen?", [
      { text: "Annuller", style: "cancel" },
      {
        text: "Slet",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteTransaction(transaction.id)
          } catch {
            // håndteres via error i viewmodel
          }
        },
      },
    ])
  }

  return (
    <View style={styles.transactionSection}>
      {error && <AlertMessage type="error" message={error} />}

      <View style={styles.sectionHeader}>
        <AppText variant="p" color={theme.colors.text.secondary}>
          Transaktioner
        </AppText>
        <TouchableOpacity style={styles.smallBtn} onPress={() => setShowAddSheet(true)}>
          <AppText variant="p" color={theme.colors.white}>
            + Tilføj
          </AppText>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator color={theme.colors.primary.blue} />
      ) : transactions.length === 0 ? (
        <AppText variant="p" color={theme.colors.text.light} style={styles.center}>
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
                color={t.amount > 0 ? theme.colors.status.success : theme.colors.status.error}
              >
                {t.amount > 0 ? "+" : ""}
                {t.amount.toLocaleString()} kr
              </AppText>
              {canManageTransactions && (
                <View style={styles.inlineActions}>
                  <InlineActionButton icon="create-outline" onPress={() => openEditModal(t)} />
                  <InlineActionButton icon="trash-outline" variant="danger" onPress={() => handleDelete(t)} />
                </View>
              )}
            </View>
          </View>
        ))
      )}

      <AddTransactionSheet
        token={token}
        visible={showAddSheet}
        initialCategoryId={categoryId}
        onClose={() => setShowAddSheet(false)}
        onSaved={fetchTransactions}
      />

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
  )
}

// ── CATEGORY SECTION ──────────────────────────────────────────────────────────

function CategorySection({
  token,
  departmentId,
  userRole,
}: {
  token: string
  departmentId: string
  userRole: TeamRole
}) {
  const {
    categories,
    isLoading,
    error,
    addCategory,
    updateCategory,
    deleteCategory,
  } = useCategoryViewModel(token, departmentId)

  const [selectedCatId, setSelectedCatId] = useState<string | null>(null)
  const [showCatModal, setShowCatModal] = useState(false)
  const [showTxModal, setShowTxModal] = useState(false)
  const [transactionRefreshKey, setTransactionRefreshKey] = useState(0)
  const [catName, setCatName] = useState("")
  const [catType, setCatType] = useState<CategoryType>("expense")
  const [editingCategory, setEditingCategory] = useState<(typeof categories)[number] | null>(null)
  const [editCatName, setEditCatName] = useState("")
  const [editCatType, setEditCatType] = useState<CategoryType>("expense")

  const [txCategoryId, setTxCategoryId] = useState("")
  const [txAmount, setTxAmount] = useState("")
  const [txDate, setTxDate] = useState(new Date().toISOString().split("T")[0])
  const [txDescription, setTxDescription] = useState("")
  const [txRepeatMonthly, setTxRepeatMonthly] = useState(false)
  const [txRepeatUntil, setTxRepeatUntil] = useState("")

  const { addTransaction } = useTransactionViewModel(token, txCategoryId)
  const canManageCategories = userRole === "admin" || userRole === "manager"

  const visibleCategories =
    userRole === "employee"
      ? categories.filter((c) => c.type === "income" || c.type === "expense")
      : categories
  const categoryOptions = visibleCategories.map((c) => ({ label: c.name, value: c.id }))
  const typeOptions = [
    { label: "Indtægt", value: "income" },
    { label: "Udgift", value: "expense" },
    { label: "Skat", value: "tax" },
    { label: "Afskrivning", value: "depreciation" },
  ]

  const handleAddCat = async () => {
    if (!catName.trim()) return
    await addCategory(catName.trim(), catType)
    setCatName("")
    setShowCatModal(false)
  }

  const closeEditModal = () => {
    setEditingCategory(null)
    setEditCatName("")
    setEditCatType("expense")
  }

  const openEditModal = (category: (typeof categories)[number]) => {
    setEditingCategory(category)
    setEditCatName(category.name)
    setEditCatType(category.type)
  }

  const handleSaveEdit = async () => {
    if (!editingCategory || !editCatName.trim()) return
    try {
      await updateCategory(editingCategory.id, editCatName.trim(), editCatType)
      closeEditModal()
    } catch {
      // håndteres via error i viewmodel
    }
  }

  const handleDeleteCat = (category: (typeof categories)[number]) => {
    Alert.alert("Slet kategori", "Er du sikker på, at du vil slette kategorien?", [
      { text: "Annuller", style: "cancel" },
      {
        text: "Slet",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteCategory(category.id)
            if (selectedCatId === category.id) setSelectedCatId(null)
          } catch {
            // håndteres via error i viewmodel
          }
        },
      },
    ])
  }

  return (
    <View style={styles.categorySection}>
      {error && <AlertMessage type="error" message={error} />}

      <View style={styles.sectionHeader}>
        <AppText variant="p" color={theme.colors.text.secondary}>
          Kategorier
        </AppText>
        {canManageCategories && (
          <TouchableOpacity style={styles.smallBtn} onPress={() => setShowCatModal(true)}>
            <AppText variant="p" color={theme.colors.white}>
              + Kategori
            </AppText>
          </TouchableOpacity>
        )}
      </View>

      {isLoading ? (
        <ActivityIndicator color={theme.colors.primary.blue} />
      ) : visibleCategories.length === 0 ? (
        <AppText variant="p" color={theme.colors.text.light} style={styles.center}>
          Ingen kategorier endnu
        </AppText>
      ) : (
        visibleCategories.map((cat) => (
          <View key={cat.id}>
            <TouchableOpacity
              style={[styles.catRow, selectedCatId === cat.id && styles.catRowActive]}
              onPress={() => setSelectedCatId(selectedCatId === cat.id ? null : cat.id)}
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
              {canManageCategories && (
                <View style={styles.inlineActions}>
                  <InlineActionButton icon="create-outline" onPress={() => openEditModal(cat)} />
                  <InlineActionButton icon="trash-outline" variant="danger" onPress={() => handleDeleteCat(cat)} />
                </View>
              )}
            </TouchableOpacity>

            {selectedCatId === cat.id && (
              <TransactionSection
                key={`${cat.id}-${transactionRefreshKey}`}
                token={token}
                categoryId={cat.id}
                categoryType={cat.type} userRole={userRole}
              />
            )}
          </View>
        ))
      )}

      <TouchableOpacity style={styles.addTransactionBtn} onPress={() => setShowTxModal(true)}>
        <AppText variant="p" color={theme.colors.white}>
          + Tilføj Transaktion
        </AppText>
      </TouchableOpacity>

      <BaseModal visible={showCatModal} title="Tilføj kategori" onClose={() => setShowCatModal(false)}>
        <InputField label="Navn" placeholder="fx Løn" value={catName} onChangeText={setCatName} />
        <DropdownField label="Type" options={typeOptions} value={catType} onChange={(v) => setCatType(v as CategoryType)} />
        <PrimaryButton label="Tilføj" onPress={handleAddCat} />
      </BaseModal>

      <AddTransactionSheet
        token={token}
        visible={showTxModal}
        initialCategoryId={selectedCatId}
        onClose={() => setShowTxModal(false)}
        onSaved={() => setTransactionRefreshKey((key) => key + 1)}
      />

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
  )
}

// ── DEPARTMENTS TAB ───────────────────────────────────────────────────────────

export function DepartmentsTab({ token, userRole }: { token: string; userRole: TeamRole }) {
  const {
    departments,
    isLoading,
    error,
    addDepartment,
    updateDepartment,
    deleteDepartment,
  } = useOrganisationViewModel(token)

  const [selectedDeptId, setSelectedDeptId] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [deptName, setDeptName] = useState("")
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null)
  const [editDeptName, setEditDeptName] = useState("")
  const canManageDepartments = userRole === "admin"

  const handleAdd = async () => {
    if (!deptName.trim()) return
    await addDepartment(deptName.trim())
    setDeptName("")
    setShowModal(false)
  }

  const closeEditModal = () => {
    setEditingDepartment(null)
    setEditDeptName("")
  }

  const openEditModal = (department: Department) => {
    setEditingDepartment(department)
    setEditDeptName(department.name)
  }

  const handleSaveEdit = async () => {
    if (!editingDepartment || !editDeptName.trim()) return
    try {
      await updateDepartment(editingDepartment.id, editDeptName.trim())
      closeEditModal()
    } catch {
      // håndteres via error i viewmodel
    }
  }

  const handleDelete = (department: Department) => {
    Alert.alert("Slet afdeling", "Er du sikker på, at du vil slette afdelingen?", [
      { text: "Annuller", style: "cancel" },
      {
        text: "Slet",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDepartment(department.id)
            if (selectedDeptId === department.id) setSelectedDeptId(null)
          } catch {
            // håndteres via error i viewmodel
          }
        },
      },
    ])
  }

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
              {canManageDepartments && (
                <PrimaryButton label="+ Tilføj Afdeling" onPress={() => setShowModal(true)} />
              )}
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.deptCard}>
              <TouchableOpacity
                style={styles.deptCardHeader}
                onPress={() => setSelectedDeptId(selectedDeptId === item.id ? null : item.id)}
              >
                <AppText variant="h4" style={styles.flex}>
                  {item.name}
                </AppText>
                {canManageDepartments && (
                  <View style={styles.inlineActions}>
                    <InlineActionButton icon="create-outline" onPress={() => openEditModal(item)} />
                    <InlineActionButton icon="trash-outline" variant="danger" onPress={() => handleDelete(item)} />
                  </View>
                )}
                <Ionicons
                  name={selectedDeptId === item.id ? "chevron-up" : "chevron-down"}
                  size={20}
                  color={theme.colors.text.secondary}
                />
              </TouchableOpacity>

              {selectedDeptId === item.id && (
                <CategorySection token={token} departmentId={item.id} userRole={userRole} />
              )}
            </View>
          )}
          ListEmptyComponent={
            <AppText variant="p" color={theme.colors.text.light} style={styles.center}>
              Ingen afdelinger endnu
            </AppText>
          }
        />
      )}

      <BaseModal visible={showModal} title="Tilføj afdeling" onClose={() => setShowModal(false)}>
        <InputField label="Navn" placeholder="fx Marketing" value={deptName} onChangeText={setDeptName} />
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
  )
}

const styles = StyleSheet.create({
  tab: { flex: 1 },
  listContent: { paddingHorizontal: theme.spacing.xl, paddingBottom: theme.spacing.xxxl },
  pageHeader: { padding: theme.spacing.xl, paddingBottom: theme.spacing.md, gap: theme.spacing.sm },
  flex: { flex: 1 },
  center: { textAlign: "center", alignItems: "center", justifyContent: "center" },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  deptCard: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.md,
    borderWidth: theme.borderWidth.thin,
    borderColor: theme.colors.background.cardBorder,
    overflow: "hidden",
  },
  deptCardHeader: { flexDirection: "row", alignItems: "center", padding: theme.spacing.lg },
  categorySection: { backgroundColor: theme.colors.background.app, padding: theme.spacing.md },
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
  catMain: { flexDirection: "row", alignItems: "center", gap: theme.spacing.md },
  catRowActive: { borderColor: theme.colors.primary.blue },
  catIndicator: { width: 4, height: 36, borderRadius: 2, marginRight: theme.spacing.md },
  addTransactionBtn: {
    borderWidth: 0,
    borderRadius: theme.radius.sm,
    padding: theme.spacing.lg,
    alignItems: "center",
    marginTop: theme.spacing.sm,
    backgroundColor: theme.colors.primary.blue,
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
  transactionActions: { alignItems: "flex-end", gap: theme.spacing.sm, marginLeft: theme.spacing.md },
  inlineActions: { flexDirection: "row", alignItems: "center", gap: theme.spacing.sm, marginLeft: theme.spacing.md },
})
