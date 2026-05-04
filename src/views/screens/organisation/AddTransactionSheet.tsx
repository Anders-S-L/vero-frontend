import { Ionicons } from "@expo/vector-icons"
import React, { useEffect, useMemo, useState } from "react"
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native"
import { AlertMessage, AppText, DropdownField, InputField, PrimaryButton } from "../../../components"
import { theme } from "../../../constants/theme"
import { CategoryType } from "../../../models/categoryModel"
import { TransactionRepeatFrequency } from "../../../models/transactionModel"
import { useCategoryViewModel } from "../../../viewmodels/useCategoryViewModel"
import { useTransactionViewModel } from "../../../viewmodels/useTransactionViewModel"
import { formatDanishDateInput, getSignedAmount, isValidDanishDate, toIsoDate } from "./shared"
import { useOrganisationViewModel } from "../../../viewmodels/useOrganisationViewModel"
import { TeamRole } from "../../../viewmodels/useTeamViewModel"

type Props = {
  token: string
  visible: boolean
  userRole?: TeamRole
  userDepartmentId?: string | null
  initialCategoryId?: string | null
  onClose: () => void
  onSaved?: () => void | Promise<void>
}

const typeOptions = [
  { label: "Indtægt", value: "income" },
  { label: "Udgift", value: "expense" },
]

const recurrenceOptions = [
  { label: "Ingen gentagelse", value: "none" },
  { label: "Ugentligt", value: "weekly" },
  { label: "Månedligt", value: "monthly" },
  { label: "Årligt", value: "yearly" },
]

const todayDanish = () => {
  const today = new Date()
  const day = `${today.getDate()}`.padStart(2, "0")
  const month = `${today.getMonth() + 1}`.padStart(2, "0")
  return `${day}-${month}-${today.getFullYear()}`
}

const formatDanishAmount = (rawValue: string) => {
  const [integerPart, decimalPart] = rawValue.split(".")
  const formattedInteger = integerPart ? Number(integerPart).toLocaleString("da-DK") : ""
  if (decimalPart === undefined) return formattedInteger
  return `${formattedInteger},${decimalPart.slice(0, 2)}`
}

const normalizeAmountInput = (value: string) => {
  const cleaned = value.replace(/\s/g, "").replace(/\./g, "").replace(",", ".").replace(/[^0-9.]/g, "")
  const [integerPart, ...decimalParts] = cleaned.split(".")
  const decimals = decimalParts.join("").slice(0, 2)
  if (!integerPart && !decimals) return { raw: "", display: "" }
  const raw = decimalParts.length > 0 ? `${integerPart || "0"}.${decimals}` : integerPart
  return { raw, display: formatDanishAmount(raw) }
}

export function AddTransactionSheet({
  token,
  userRole = "employee",
  userDepartmentId = null,
  visible,
  initialCategoryId,
  onClose,
  onSaved,
}: Props) {
  const { departments } = useOrganisationViewModel(token)
  const { categories, error: categoryError } = useCategoryViewModel(token, "")
  const { addTransaction } = useTransactionViewModel(token, "")
  const isAdmin = userRole === "admin"
  const defaultDepartmentId = isAdmin ? "" : userDepartmentId ?? ""

  const [transactionType, setTransactionType] = useState<CategoryType>("expense")
  const [selectedCategoryId, setSelectedCategoryId] = useState(initialCategoryId ?? "")
  const [selectedDepartmentId, setSelectedDepartmentId] = useState(defaultDepartmentId)
  const [amount, setAmount] = useState("")
  const [amountDisplay, setAmountDisplay] = useState("")
  const [date, setDate] = useState(todayDanish())
  const [description, setDescription] = useState("")
  const [repeatFrequency, setRepeatFrequency] = useState<TransactionRepeatFrequency>("none")
  const [repeatUntil, setRepeatUntil] = useState("")
  const [formError, setFormError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const selectedCategory = categories.find((category) => category.id === selectedCategoryId)
  const hasRepeat = repeatFrequency !== "none"

  const departmentOptions = useMemo(
    () => departments.filter((department) => department.is_active).map((department) => ({ label: department.name, value: department.id })),
    [departments],
  )

  const categoryOptions = useMemo(
    () =>
      categories
        .filter((category) =>
          category.is_active &&
          (!selectedDepartmentId || category.department_id === selectedDepartmentId) &&
          (transactionType === "income" ? category.type === "income" : category.type !== "income"),
        )
        .map((category) => ({ label: category.name, value: category.id })),
    [categories, selectedDepartmentId, transactionType],
  )

  useEffect(() => {
    if (visible) setSelectedCategoryId(initialCategoryId ?? "")
  }, [initialCategoryId, visible])

  useEffect(() => {
    if (visible) setSelectedDepartmentId(defaultDepartmentId)
  }, [defaultDepartmentId, visible])

  useEffect(() => {
    setSelectedCategoryId("")
  }, [selectedDepartmentId])

  useEffect(() => {
    if (!selectedCategory) return
    setTransactionType(selectedCategory.type === "income" ? "income" : "expense")
  }, [selectedCategory])

  useEffect(() => {
    if (
      selectedCategoryId &&
      categories.length > 0 &&
      !categories.some((category) => category.id === selectedCategoryId)
    ) {
      setSelectedCategoryId("")
    }
  }, [categories, selectedCategoryId])

  const resetForm = () => {
    setTransactionType("expense")
    setSelectedCategoryId(initialCategoryId ?? "")
    setSelectedDepartmentId(defaultDepartmentId)
    setAmount("")
    setAmountDisplay("")
    setDate(todayDanish())
    setDescription("")
    setRepeatFrequency("none")
    setRepeatUntil("")
    setFormError(null)
  }

  const closeSheet = () => {
    if (isSaving) return
    setFormError(null)
    onClose()
  }

  const handleAmountChange = (value: string) => {
    const normalized = normalizeAmountInput(value)
    setAmount(normalized.raw)
    setAmountDisplay(normalized.display)
  }

  const parsedAmount = Number(amount)
  const canSave =
    Boolean(selectedCategoryId) &&
    amount.trim().length > 0 &&
    Number.isFinite(parsedAmount) &&
    parsedAmount > 0 &&
    isValidDanishDate(date) &&
    (!hasRepeat || (isValidDanishDate(repeatUntil) && toIsoDate(repeatUntil) >= toIsoDate(date))) &&
    description.trim().length > 0

  const handleSave = async () => {
    if (!selectedCategoryId) {
      setFormError("Vælg en kategori.")
      return
    }
    if (!selectedCategory) {
      setFormError("Den valgte kategori findes ikke længere.")
      return
    }
    if (!amount.trim() || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setFormError("Angiv et gyldigt beløb.")
      return
    }
    if (!isValidDanishDate(date)) {
      setFormError("Dato skal være en gyldig dato i formatet DD-MM-YYYY eller DD-MM-YY.")
      return
    }
    if (!description.trim()) {
      setFormError("Udfyld beskrivelse.")
      return
    }
    if (hasRepeat) {
      if (!isValidDanishDate(repeatUntil)) {
        setFormError("Gentag indtil skal være en gyldig dato i formatet DD-MM-YYYY eller DD-MM-YY.")
        return
      }
      if (toIsoDate(repeatUntil) < toIsoDate(date)) {
        setFormError("Gentag indtil skal være samme dag eller efter startdatoen.")
        return
      }
    }

    try {
      setIsSaving(true)
      setFormError(null)
      await addTransaction(
        getSignedAmount(parsedAmount, selectedCategory.type),
        toIsoDate(date),
        description.trim(),
        repeatFrequency === "monthly",
        hasRepeat ? toIsoDate(repeatUntil) : null,
        selectedCategoryId,
        repeatFrequency,
      )
      resetForm()
      await onSaved?.()
      onClose()
    } catch (e) {
      setFormError((e as Error).message || "Transaktionen kunne ikke gemmes.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={closeSheet}>
      <View style={styles.sheetOverlay}>
        <Pressable style={styles.sheetBackdrop} onPress={closeSheet} />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.sheetKeyboard}
        >
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <AppText variant="h4">Tilføj transaktion</AppText>
              <Pressable onPress={closeSheet} hitSlop={8}>
                <Ionicons name="close" size={22} color={theme.colors.text.primary} />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.sheetContent} keyboardShouldPersistTaps="handled">
              {formError && <AlertMessage type="error" message={formError} />}
              {categoryError && <AlertMessage type="error" message={categoryError} />}
              <DropdownField
                label="Type"
                options={typeOptions}
                value={transactionType}
                onChange={(value) => setTransactionType(value as CategoryType)}
              />
              <InputField
                label="Beløb"
                placeholder="fx 1.250,50"
                value={amountDisplay}
                onChangeText={handleAmountChange}
                keyboardType="decimal-pad"
              />
              {isAdmin && (
                <DropdownField
                  label="Afdeling"
                  options={departmentOptions}
                  value={selectedDepartmentId}
                  onChange={setSelectedDepartmentId}
                />
              )}
              <DropdownField
                label="Kategori"
                options={categoryOptions}
                value={selectedCategoryId}
                onChange={setSelectedCategoryId}
              />
              <InputField
                label="Dato"
                placeholder="DD-MM-YYYY / DD-MM-YY"
                value={date}
                onChangeText={(value) => setDate(formatDanishDateInput(value))}
                keyboardType="number-pad"
                maxLength={10}
              />
              <InputField
                label="Beskrivelse"
                placeholder="fx Løn marts"
                value={description}
                onChangeText={setDescription}
                multiline
              />
              <DropdownField
                label="Gentagelse"
                options={recurrenceOptions}
                value={repeatFrequency}
                onChange={(value) => setRepeatFrequency(value as TransactionRepeatFrequency)}
              />
              {hasRepeat && (
                <InputField
                  label="Gentag indtil"
                  placeholder="DD-MM-YYYY / DD-MM-YY"
                  value={repeatUntil}
                  onChangeText={(value) => setRepeatUntil(formatDanishDateInput(value))}
                  keyboardType="number-pad"
                  maxLength={10}
                />
              )}
              <PrimaryButton
                label="Gem transaktion"
                onPress={handleSave}
                loading={isSaving}
                disabled={!canSave}
              />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  sheetOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(17,24,39,0.32)",
  },
  sheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheetKeyboard: {
    justifyContent: "flex-end",
  },
  sheet: {
    maxHeight: "88%",
    backgroundColor: theme.colors.background.card,
    borderTopLeftRadius: theme.radius.lg,
    borderTopRightRadius: theme.radius.lg,
    paddingTop: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
  },
  sheetHandle: {
    alignSelf: "center",
    width: 42,
    height: 4,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.background.cardBorder,
    marginBottom: theme.spacing.lg,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing.lg,
  },
  sheetContent: {
    paddingBottom: theme.spacing.xl,
  },
})
