import React from 'react'
import { StyleSheet, View } from 'react-native'
import { theme } from '../../constants/theme'
import { AppText } from '../typography/AppText'

type Props = {
    title: string
    value: string
    description?: string
    icon?: React.ReactNode
}

export const MetricCard = ({ title, value, description, icon }: Props) => (
    <View style={styles.card}>
        <View style={styles.header}>
            <AppText variant="p" color={theme.colors.text.secondary}>{title}</AppText>
            {icon && <View>{icon}</View>}
        </View>
        <AppText variant="h3">{value}</AppText>
        {description && <AppText variant="p" color={theme.colors.text.secondary}>{description}</AppText>}
    </View>
)

const styles = StyleSheet.create({
    card: {
        backgroundColor: theme.card.metric.background,
        borderRadius: theme.radius.md,
        padding: theme.spacing.lg,
        borderWidth: theme.borderWidth.thin,
        borderColor: theme.card.metric.border,
        marginBottom: theme.spacing.md
    },
    header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: theme.spacing.sm }
})