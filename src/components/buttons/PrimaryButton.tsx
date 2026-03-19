import React from 'react'
import { ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native'
import { theme } from '../../constants/theme'
import { AppText } from '../typography/AppText'

type Props = {
    label: string
    onPress: () => void
    loading?: boolean
    disabled?: boolean
}

export const PrimaryButton = ({ label, onPress, loading, disabled }: Props) => (
    <TouchableOpacity
        style={[styles.button, disabled && styles.disabled]}
        onPress={onPress}
        disabled={disabled || loading}
    >
        {loading
            ? <ActivityIndicator color={theme.colors.white} />
            : <AppText variant="p" color={theme.colors.white} style={styles.label}>{label}</AppText>
        }
    </TouchableOpacity>
)

const styles = StyleSheet.create({
    button: {
        backgroundColor: theme.button.primary.background,
        borderRadius: theme.radius.sm,
        padding: theme.spacing.lg,
        alignItems: 'center'
    },
    disabled: { opacity: 0.6 },
    label: { ...theme.typography.button }
})