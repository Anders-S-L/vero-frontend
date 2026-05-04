import React, { useState } from "react"
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native"
import { AlertMessage, AppText, InlineActionButton } from "../../../components"
import { theme } from "../../../constants/theme"
import { TeamRole } from "../../../viewmodels/useTeamViewModel"
import { useTransactionViewModel } from "../../../viewmodels/useTransactionViewModel"
import { getSignedAmount, getTransactionCategoryType, isValidIsoDate } from "./shared"
import { TransactionEditModal } from "./TransactionEditModal"

export function TransactionsTab({ token, userRole }: { token: string; userRole: TeamRole }) {
  const {
    transactions,
    isLoading,
    error,
    updateTransaction,
    deleteTransaction,
  } = useTransactionViewModel(token, "")
  const canManageTransactions = userRole === "admin" || userRole === "manager"

  const [searchQuery, setSearchQuery] = useState("")
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
        getSignedAmount(parsedAmount, getTransactionCategoryType(editingTransaction)),
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

  const normalizedQuery = searchQuery.trim().toLowerCase()
  const filteredTransactions =
    normalizedQuery.length === 0
      ? transactions
      : transactions.filter((t) =>
          [t.description, t.date, t.categories?.name, t.categories?.departments?.name, t.amount.toString()]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery),
        )

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
        <AppText variant="p" color={theme.colors.text.light} style={styles.center}>
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
  )
}

const styles = StyleSheet.create({
  tab: { flex: 1 },
  tabContent: { padding: theme.spacing.xl },
  pageTitle: { marginBottom: theme.spacing.md },
  flex: { flex: 1 },
  center: { textAlign: "center", alignItems: "center", justifyContent: "center" },
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
