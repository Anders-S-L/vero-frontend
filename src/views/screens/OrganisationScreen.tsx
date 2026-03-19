import React, { useState } from 'react'
import { ActivityIndicator, FlatList, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { AlertMessage, AppText, BaseModal, BottomTabBar, DropdownField, InputField, PrimaryButton } from '../../components'
import { theme } from '../../constants/theme'
import { CategoryType } from '../../models/categoryModel'
import { useCategoryViewModel } from '../../viewmodels/useCategoryViewModel'
import { useOrganisationViewModel } from '../../viewmodels/useOrganisationViewModel'
import { useTransactionViewModel } from '../../viewmodels/useTransactionViewModel'

const TABS = [
    { key: 'overblik', label: 'Overblik', icon: '🏠' },
    { key: 'afdelinger', label: 'Afdelinger', icon: '🏢' },
    { key: 'transaktioner', label: 'Transaktioner', icon: '💳' },
    { key: 'team', label: 'Team', icon: '👥' },
]

export default function OrganisationScreen({ token, organisationName }: { token: string; organisationName: string }) {
    const [activeTab, setActiveTab] = useState('overblik')

    return (
        <SafeAreaProvider style={styles.container}>
            <View style={styles.content}>
                {activeTab === 'overblik' && <OverblikTab token={token} organisationName={organisationName} />}
                {activeTab === 'afdelinger' && <AfdelingerTab token={token} />}
                {activeTab === 'transaktioner' && <TransaktionerTab token={token} />}
                {activeTab === 'team' && <TeamTab />}
            </View>
            <BottomTabBar tabs={TABS} activeTab={activeTab} onTabPress={setActiveTab} />
        </SafeAreaProvider>
    )
}

// ── OVERBLIK ──────────────────────────────────────────────────────────────────
function OverblikTab({ token, organisationName }: { token: string; organisationName: string }) {
    const { transactions, isLoading } = useTransactionViewModel(token, '')

    const totalIncome = transactions
        .filter(t => t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0)

    const totalExpense = transactions
        .filter(t => t.amount < 0)
        .reduce((sum, t) => sum + t.amount, 0)

    const recent = transactions.slice(0, 5)

    return (

        <ScrollView style={styles.tab} contentContainerStyle={styles.tabContent}>
            <AppText variant="h3" style={styles.pageTitle}>{organisationName}</AppText>

            <View style={styles.metricsRow}>
                <View style={[styles.metricCard, styles.flex]}>
                    <AppText variant="p" color={theme.colors.text.secondary}>Indtægter</AppText>
                    <AppText variant="h4" color={theme.colors.status.success}>{totalIncome.toLocaleString()} kr</AppText>
                </View>
                <View style={styles.metricSpacer} />
                <View style={[styles.metricCard, styles.flex]}>
                    <AppText variant="p" color={theme.colors.text.secondary}>Udgifter</AppText>
                    <AppText variant="h4" color={theme.colors.status.error}>{Math.abs(totalExpense).toLocaleString()} kr</AppText>
                </View>
            </View>

            <AppText variant="h4" style={styles.sectionTitle}>Seneste transaktioner</AppText>

            {isLoading
                ? <ActivityIndicator color={theme.colors.primary.blue} />
                : recent.length === 0
                    ? <AppText variant="p" color={theme.colors.text.light} style={styles.center}>Ingen transaktioner endnu</AppText>
                    : recent.map(t => (
                        <View key={t.id} style={styles.transactionRow}>
                            <View>
                                <AppText variant="p">{t.description}</AppText>
                                <AppText variant="p" color={theme.colors.text.light}>{t.date}</AppText>
                            </View>
                            <AppText variant="p" color={t.amount > 0 ? theme.colors.status.success : theme.colors.status.error}>
                                {t.amount > 0 ? '+' : ''}{t.amount.toLocaleString()} kr
                            </AppText>
                        </View>
                    ))
            }
        </ScrollView>
    )
}

// ── AFDELINGER ────────────────────────────────────────────────────────────────
function AfdelingerTab({ token }: { token: string }) {
    const { departments, isLoading, error, addDepartment } = useOrganisationViewModel(token)
    const [selectedDeptId, setSelectedDeptId] = useState<string | null>(null)
    const [showModal, setShowModal] = useState(false)
    const [deptName, setDeptName] = useState('')

    const handleAdd = async () => {
        if (!deptName.trim()) return
        await addDepartment(deptName.trim())
        setDeptName('')
        setShowModal(false)
    }

    return (
        <View style={styles.tab}>
            <View style={styles.pageHeader}>
                <AppText variant="h3">Afdelinger</AppText>
                <PrimaryButton label="+ Tilføj" onPress={() => setShowModal(true)} />
            </View>

            {error && <AlertMessage type="error" message={error} />}

            {isLoading
                ? <ActivityIndicator color={theme.colors.primary.blue} />
                : <FlatList
                    data={departments}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    renderItem={({ item }) => (
                        <View>
                            <TouchableOpacity
                                style={[styles.deptRow, selectedDeptId === item.id && styles.deptRowActive]}
                                onPress={() => setSelectedDeptId(selectedDeptId === item.id ? null : item.id)}
                            >
                                <AppText variant="h4" style={styles.flex}>{item.name}</AppText>
                                <AppText variant="p" color={theme.colors.text.secondary}>
                                    {selectedDeptId === item.id ? '▲' : '▼'}
                                </AppText>
                            </TouchableOpacity>
                            {selectedDeptId === item.id && (
                                <CategorySection token={token} departmentId={item.id} />
                            )}
                        </View>
                    )}
                    ListEmptyComponent={
                        <AppText variant="p" color={theme.colors.text.light} style={styles.center}>
                            Ingen afdelinger endnu
                        </AppText>
                    }
                />
            }

            <BaseModal visible={showModal} title="Tilføj afdeling" onClose={() => setShowModal(false)}>
                <InputField label="Navn" placeholder="fx Marketing" value={deptName} onChangeText={setDeptName} />
                <PrimaryButton label="Tilføj" onPress={handleAdd} />
            </BaseModal>
        </View>
    )
}

// ── CATEGORY SECTION ──────────────────────────────────────────────────────────
function CategorySection({ token, departmentId }: { token: string; departmentId: string }) {
    const { categories, isLoading, addCategory } = useCategoryViewModel(token, departmentId)
    const [selectedCatId, setSelectedCatId] = useState<string | null>(null)
    const [showModal, setShowModal] = useState(false)
    const [catName, setCatName] = useState('')
    const [catType, setCatType] = useState<CategoryType>('expense')

    const typeOptions = [
        { label: 'Indtægt', value: 'income' },
        { label: 'Udgift', value: 'expense' },
        { label: 'Skat', value: 'tax' },
        { label: 'Afskrivning', value: 'depreciation' },
    ]

    const handleAdd = async () => {
        if (!catName.trim()) return
        await addCategory(catName.trim(), catType)
        setCatName('')
        setShowModal(false)
    }

    return (
        <View style={styles.categorySection}>
            <View style={styles.sectionHeader}>
                <AppText variant="p" color={theme.colors.text.secondary}>Kategorier</AppText>
                <PrimaryButton label="+ Kategori" onPress={() => setShowModal(true)} />
            </View>

            {isLoading
                ? <ActivityIndicator color={theme.colors.primary.blue} />
                : categories.length === 0
                    ? <AppText variant="p" color={theme.colors.text.light} style={styles.center}>Ingen kategorier endnu</AppText>
                    : categories.map(cat => (
                        <View key={cat.id}>
                            <TouchableOpacity
                                style={[styles.catRow, selectedCatId === cat.id && styles.catRowActive]}
                                onPress={() => setSelectedCatId(selectedCatId === cat.id ? null : cat.id)}
                            >
                                <AppText variant="p" style={styles.flex}>{cat.name}</AppText>
                                <AppText variant="p" color={theme.colors.text.light}>{cat.type}</AppText>
                            </TouchableOpacity>
                            {selectedCatId === cat.id && (
                                <TransactionSection token={token} categoryId={cat.id} />
                            )}
                        </View>
                    ))
            }

            <BaseModal visible={showModal} title="Tilføj kategori" onClose={() => setShowModal(false)}>
                <InputField label="Navn" placeholder="fx Løn" value={catName} onChangeText={setCatName} />
                <DropdownField label="Type" options={typeOptions} value={catType} onChange={(v) => setCatType(v as CategoryType)} />
                <PrimaryButton label="Tilføj" onPress={handleAdd} />
            </BaseModal>
        </View>
    )
}

// ── TRANSACTION SECTION ───────────────────────────────────────────────────────
function TransactionSection({ token, categoryId }: { token: string; categoryId: string }) {
    const { transactions, isLoading, addTransaction } = useTransactionViewModel(token, categoryId)
    const [showModal, setShowModal] = useState(false)
    const [amount, setAmount] = useState('')
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])
    const [description, setDescription] = useState('')

    const handleAdd = async () => {
        if (!amount.trim() || !description.trim()) return
        await addTransaction(parseFloat(amount), date, description)
        setAmount('')
        setDescription('')
        setShowModal(false)
    }

    return (
        <View style={styles.transactionSection}>
            <View style={styles.sectionHeader}>
                <AppText variant="p" color={theme.colors.text.secondary}>Transaktioner</AppText>
                <PrimaryButton label="+ Tilføj" onPress={() => setShowModal(true)} />
            </View>

            {isLoading
                ? <ActivityIndicator color={theme.colors.primary.blue} />
                : transactions.length === 0
                    ? <AppText variant="p" color={theme.colors.text.light} style={styles.center}>Ingen transaktioner endnu</AppText>
                    : transactions.map(t => (
                        <View key={t.id} style={styles.transactionRow}>
                            <View>
                                <AppText variant="p">{t.description}</AppText>
                                <AppText variant="p" color={theme.colors.text.light}>{t.date}</AppText>
                            </View>
                            <AppText variant="p" color={theme.colors.text.primary}>{t.amount.toLocaleString()} kr</AppText>
                        </View>
                    ))
            }

            <BaseModal visible={showModal} title="Tilføj transaktion" onClose={() => setShowModal(false)}>
                <InputField label="Beløb" placeholder="fx 5000" value={amount} onChangeText={setAmount} keyboardType="numeric" />
                <InputField label="Dato" placeholder="YYYY-MM-DD" value={date} onChangeText={setDate} />
                <InputField label="Beskrivelse" placeholder="fx Løn marts" value={description} onChangeText={setDescription} />
                <PrimaryButton label="Tilføj" onPress={handleAdd} />
            </BaseModal>
        </View>
    )
}

// ── TRANSAKTIONER TAB ─────────────────────────────────────────────────────────
function TransaktionerTab({ token }: { token: string }) {
    const { transactions, isLoading } = useTransactionViewModel(token, '')

    return (
        <ScrollView style={styles.tab} contentContainerStyle={styles.tabContent}>
            <AppText variant="h3" style={styles.pageTitle}>Transaktioner</AppText>

            {isLoading
                ? <ActivityIndicator color={theme.colors.primary.blue} />
                : transactions.length === 0
                    ? <AppText variant="p" color={theme.colors.text.light} style={styles.center}>Ingen transaktioner endnu</AppText>
                    : transactions.map(t => (
                        <View key={t.id} style={styles.transactionRow}>
                            <View>
                                <AppText variant="p">{t.description}</AppText>
                                <AppText variant="p" color={theme.colors.text.light}>{t.date}</AppText>
                            </View>
                            <AppText variant="p" color={t.amount > 0 ? theme.colors.status.success : theme.colors.status.error}>
                                {t.amount.toLocaleString()} kr
                            </AppText>
                        </View>
                    ))
            }
        </ScrollView>
    )
}

// ── TEAM TAB ──────────────────────────────────────────────────────────────────
function TeamTab() {
    return (
        <View style={[styles.tab, styles.center]}>
            <AppText variant="h4" color={theme.colors.text.secondary}>Team</AppText>
            <AppText variant="p" color={theme.colors.text.light}>Invite-funktion kommer snart</AppText>
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background.app },
    content: { flex: 1 },
    tab: { flex: 1 },
    tabContent: { padding: theme.spacing.xl },
    pageTitle: { marginBottom: theme.spacing.xl, marginTop: theme.spacing.xl },
    pageHeader: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', padding: theme.spacing.xl, marginTop: theme.spacing.xl
    },
    sectionTitle: { marginBottom: theme.spacing.md, marginTop: theme.spacing.xl },
    sectionHeader: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: theme.spacing.md
    },
    metricsRow: { flexDirection: 'row', marginBottom: theme.spacing.xl },
    metricCard: {
        backgroundColor: theme.colors.background.card,
        borderRadius: theme.radius.md, padding: theme.spacing.lg,
        borderWidth: 1, borderColor: theme.colors.background.cardBorder
    },
    metricSpacer: { width: theme.spacing.md },
    flex: { flex: 1 },
    center: { textAlign: 'center', alignItems: 'center', justifyContent: 'center' },
    listContent: { padding: theme.spacing.xl },
    deptRow: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: theme.colors.background.card,
        padding: theme.spacing.lg, borderRadius: theme.radius.sm,
        marginBottom: theme.spacing.sm,
        borderWidth: 1, borderColor: theme.colors.background.cardBorder
    },
    deptRowActive: { borderColor: theme.colors.primary.blue },
    categorySection: {
        backgroundColor: theme.colors.background.app,
        padding: theme.spacing.md, borderRadius: theme.radius.sm,
        marginBottom: theme.spacing.sm, marginLeft: theme.spacing.md
    },
    catRow: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: theme.colors.background.card,
        padding: theme.spacing.md, borderRadius: theme.radius.sm,
        marginBottom: theme.spacing.xs,
        borderWidth: 1, borderColor: theme.colors.background.cardBorder
    },
    catRowActive: { borderColor: theme.colors.primary.blue },
    transactionSection: {
        backgroundColor: theme.colors.background.app,
        padding: theme.spacing.md, borderRadius: theme.radius.sm,
        marginLeft: theme.spacing.xl
    },
    transactionRow: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', backgroundColor: theme.colors.background.card,
        padding: theme.spacing.md, borderRadius: theme.radius.sm,
        marginBottom: theme.spacing.xs,
        borderWidth: 1, borderColor: theme.colors.background.cardBorder
    },
})