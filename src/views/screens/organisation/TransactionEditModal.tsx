import React from "react"
import { BaseModal, DropdownField, InputField, PrimaryButton } from "../../../components"
import { TransactionCostBehavior } from "../../../models/transactionModel"

type Props = {
  visible: boolean
  amount: string
  date: string
  description: string
  costBehavior: TransactionCostBehavior
  showCostBehavior: boolean
  onAmountChange: (value: string) => void
  onDateChange: (value: string) => void
  onDescriptionChange: (value: string) => void
  onCostBehaviorChange: (value: TransactionCostBehavior) => void
  onClose: () => void
  onSave: () => void
}

const costBehaviorOptions = [
  { label: "Variabel", value: "variable" },
  { label: "Fast", value: "fixed" },
]

export function TransactionEditModal({
  visible,
  amount,
  date,
  description,
  costBehavior,
  showCostBehavior,
  onAmountChange,
  onDateChange,
  onDescriptionChange,
  onCostBehaviorChange,
  onClose,
  onSave,
}: Props) {
  return (
    <BaseModal visible={visible} title="Rediger transaktion" onClose={onClose}>
      <InputField
        label="Beloeb"
        placeholder="fx 5000"
        value={amount}
        onChangeText={onAmountChange}
        keyboardType="numeric"
      />
      <InputField
        label="Dato"
        placeholder="DD-MM-YYYY"
        value={date}
        onChangeText={onDateChange}
        keyboardType="number-pad"
        maxLength={10}
      />
      <InputField
        label="Beskrivelse"
        placeholder="fx Loen marts"
        value={description}
        onChangeText={onDescriptionChange}
      />
      {showCostBehavior && (
        <DropdownField
          label="Omkostningstype"
          options={costBehaviorOptions}
          value={costBehavior}
          onChange={(value) => onCostBehaviorChange(value as TransactionCostBehavior)}
        />
      )}
      <PrimaryButton label="Gem ændringer" onPress={onSave} />
    </BaseModal>
  )
}
