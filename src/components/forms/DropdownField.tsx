import { Ionicons } from '@expo/vector-icons'
import React, { useState } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { theme } from '../../constants/theme'
import { AppText } from '../typography/AppText'

type Option = { label: string; value: string }

type Props = {
    label: string
    options: Option[]
    value: string
    onChange: (value: string) => void
}

export const DropdownField = ({ label, options, value, onChange }: Props) => {
    const [open, setOpen] = useState(false)
    const selected = options.find(o => o.value === value)

    return (
        <View style={styles.container}>
            <AppText variant="p" color={theme.colors.text.secondary} style={styles.label}>{label}</AppText>
            <TouchableOpacity style={styles.input} onPress={() => setOpen(!open)}>
                <AppText variant="p" color={selected ? theme.colors.text.primary : theme.colors.text.light}>
                    {selected ? selected.label : 'Vælg...'}
                </AppText>
                <Ionicons
                    name={open ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={theme.colors.text.secondary}
                />
            </TouchableOpacity>
            {open && (
                <View style={styles.dropdown}>
                    {options.map(o => (
                        <TouchableOpacity
                            key={o.value}
                            style={styles.option}
                            onPress={() => { onChange(o.value); setOpen(false) }}
                        >
                            <AppText variant="p" color={o.value === value ? theme.colors.primary.blue : theme.colors.text.primary}>
                                {o.label}
                            </AppText>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: { marginBottom: theme.spacing.lg },
    label: { marginBottom: theme.spacing.sm },
    input: {
        borderWidth: theme.borderWidth.thin, borderColor: theme.input.border,
        borderRadius: theme.radius.sm, padding: theme.spacing.lg,
        flexDirection: 'row', justifyContent: 'space-between',
        backgroundColor: theme.input.background
    },
    dropdown: {
        borderWidth: theme.borderWidth.thin, borderColor: theme.input.border,
        borderRadius: theme.radius.sm, backgroundColor: theme.colors.background.card, marginTop: 4
    },
    option: { padding: theme.spacing.lg, borderBottomWidth: 1, borderBottomColor: theme.colors.background.app }
})