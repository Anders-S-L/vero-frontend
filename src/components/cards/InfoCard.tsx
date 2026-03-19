import React from 'react'
import { StyleSheet, View } from 'react-native'
import { theme } from '../../constants/theme'
import { AppText } from '../typography/AppText'

type Props = { title: string; text: string; icon?: React.ReactNode }

export const InfoCard = ({ title, text, icon }: Props) => (
    <View style={styles.card}>
        {icon && <View style={{ marginBottom: theme.spacing.sm }}>{icon}</View>}
        <AppText variant="h4">{title}</AppText>
        <AppText variant="p" color={theme.colors.text.secondary}>{text}</AppText>
    </View>
)

const styles = StyleSheet.create({
    card: {
        backgroundColor: theme.card.info.background,
        borderRadius: theme.radius.md,
        padding: theme.spacing.lg,
        borderWidth: theme.borderWidth.thin,
        borderColor: theme.card.info.border,
        marginBottom: theme.spacing.md
    }
})