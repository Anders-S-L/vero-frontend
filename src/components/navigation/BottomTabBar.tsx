import React from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { theme } from '../../constants/theme'
import { AppText } from '../typography/AppText'

type Tab = { key: string; label: string; icon: string }

type Props = {
    tabs: Tab[]
    activeTab: string
    onTabPress: (key: string) => void
}

export const BottomTabBar = ({ tabs, activeTab, onTabPress }: Props) => (
    <View style={styles.container}>
        {tabs.map(tab => (
            <TouchableOpacity key={tab.key} style={styles.tab} onPress={() => onTabPress(tab.key)}>
                <AppText
                    variant="p"
                    style={styles.icon}
                    color={activeTab === tab.key ? theme.navigation.active : theme.navigation.inactive}
                >
                    {tab.icon}
                </AppText>
                <AppText
                    variant="p"
                    color={activeTab === tab.key ? theme.navigation.active : theme.navigation.inactive}
                    style={styles.label}
                >
                    {tab.label}
                </AppText>
            </TouchableOpacity>
        ))}
    </View>
)

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: theme.navigation.background,
        borderTopWidth: theme.borderWidth.thin,
        borderTopColor: theme.navigation.border,
        paddingBottom: theme.spacing.xl
    },
    tab: { flex: 1, alignItems: 'center', paddingTop: theme.spacing.md },
    icon: { fontSize: 20, marginBottom: theme.spacing.xs },
    label: { ...theme.typography.label }
})