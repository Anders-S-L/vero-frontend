import React from 'react'
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native'
import { theme } from '../../constants/theme'
import { AppText } from '../typography/AppText'

type Props = TextInputProps & { label: string; error?: string }

export const InputField = ({ label, error, ...props }: Props) => (
    <View style={styles.container}>
        <AppText variant="p" color={theme.colors.text.secondary} style={styles.label}>{label}</AppText>
        <TextInput
            style={[styles.input, error ? styles.inputError : null]}
            placeholderTextColor={theme.input.placeholder}
            {...props}
        />
        {error && <AppText variant="p" color={theme.colors.status.error}>{error}</AppText>}
    </View>
)

const styles = StyleSheet.create({
    container: { marginBottom: theme.spacing.lg },
    label: { marginBottom: theme.spacing.sm },
    input: {
        borderWidth: theme.borderWidth.thin,
        borderColor: theme.input.border,
        borderRadius: theme.radius.sm,
        padding: theme.spacing.lg,
        fontSize: theme.typography.input.fontSize,
        backgroundColor: theme.input.background,
        color: theme.input.text
    },
    inputError: { borderColor: theme.input.borderError }
})