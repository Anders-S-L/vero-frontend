import React from "react"
import { AppText, BaseModal, InputField, PrimaryButton } from "../../../components"

type Props = {
  visible: boolean
  amount: string
  date: string
  description: string
  onAmountChange: (value: string) => void
  onDateChange: (value: string) => void
  onDescriptionChange: (value: string) => void
  onClose: () => void
  onSave: () => void
}

export function TransactionEditModal({
  visible,
  amount,
  date,
  description,
  onAmountChange,
  onDateChange,
  onDescriptionChange,
  onClose,
  onSave,
}: Props) {
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
  )
}
