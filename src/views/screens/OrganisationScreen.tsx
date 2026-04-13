import { Ionicons } from '@expo/vector-icons'
import React, { useState } from 'react'
import { ActivityIndicator, FlatList, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { AlertMessage, AppText, BaseModal, BottomTabBar, DropdownField, InputField, PrimaryButton } from '../../components'
import { theme } from '../../constants/theme'
import { CategoryType } from '../../models/categoryModel'
import { useCategoryViewModel } from '../../viewmodels/useCategoryViewModel'
import { useOrganisationViewModel } from '../../viewmodels/useOrganisationViewModel'
import { TeamRole, useTeamViewModel } from '../../viewmodels/useTeamViewModel'
import { useTransactionViewModel } from '../../viewmodels/useTransactionViewModel'

const getSignedAmount = (amount: number, categoryType: CategoryType) => {
    const absoluteAmount = Math.abs(amount)
    return categoryType === 'income' ? absoluteAmount : -absoluteAmount
}

const TABS = [
    { key: 'overblik', label: 'Overblik', icon: 'grid-outline' as const },
    { key: 'afdelinger', label: 'Afdelinger', icon: 'business-outline' as const },
    { key: 'transaktioner', label: 'Transaktioner', icon: 'card-outline' as const },
    { key: 'dashboards', label: 'Dashboards', icon: 'stats-chart-outline' as const },
    { key: 'team', label: 'Team', icon: 'people-outline' as const },
]

export default function OrganisationScreen({
    token,
    organisationName,
    userRole,
}: {
    token: string
    organisationName: string
    userRole: TeamRole
}) {
    const [activeTab, setActiveTab] = useState('overblik')
    const insets = useSafeAreaInsets()

    return (
        <View style={styles.container}>
            <View style={[styles.topHeader, { paddingTop: insets.top + theme.spacing.md }]}>
                <AppText variant="h4">{organisationName}</AppText>
                <AppText variant="p" color={theme.colors.text.secondary}>Admin Panel</AppText>
            </View>
            <View style={styles.content}>
                {activeTab === 'overblik' && <OverblikTab token={token} organisationName={organisationName} />}
                {activeTab === 'afdelinger' && <AfdelingerTab token={token} />}
                {activeTab === 'transaktioner' && <TransaktionerTab token={token} />}
                {activeTab === 'dashboards' && <DashboardsTab />}
                {activeTab === 'team' && <TeamTab token={token} userRole={userRole} />}
            </View>
            <BottomTabBar tabs={TABS} activeTab={activeTab} onTabPress={setActiveTab} />
        </View>
    )
}

// ── OVERBLIK ──────────────────────────────────────────────────────────────────
function OverblikTab({ token, organisationName }: { token: string; organisationName: string }) {
    const { transactions, isLoading } = useTransactionViewModel(token, '')

    const totalIncome = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0)
    const totalExpense = transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0)
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
            {error && <AlertMessage type="error" message={error} />}

            {isLoading
                ? <ActivityIndicator color={theme.colors.primary.blue} />
                : <FlatList
                    data={departments}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    ListHeaderComponent={
                        <View style={styles.pageHeader}>
                            <AppText variant="h3">Afdelinger</AppText>
                            <AppText variant="p" color={theme.colors.text.secondary}>
                                Administrer afdelinger og kategorier
                            </AppText>
                            <PrimaryButton label="+ Tilføj Afdeling" onPress={() => setShowModal(true)} />
                        </View>
                    }
                    renderItem={({ item }) => (
                        <View style={styles.deptCard}>
                            <TouchableOpacity
                                style={styles.deptCardHeader}
                                onPress={() => setSelectedDeptId(selectedDeptId === item.id ? null : item.id)}
                            >
                                <AppText variant="h4" style={styles.flex}>{item.name}</AppText>
                                <Ionicons
                                    name={selectedDeptId === item.id ? 'chevron-up' : 'chevron-down'}
                                    size={20}
                                    color={theme.colors.text.secondary}
                                />
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
    const [showCatModal, setShowCatModal] = useState(false)
    const [showTxModal, setShowTxModal] = useState(false)
    const [catName, setCatName] = useState('')
    const [catType, setCatType] = useState<CategoryType>('expense')

    // Transaktion state
    const [txCategoryId, setTxCategoryId] = useState('')
    const [txAmount, setTxAmount] = useState('')
    const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0])
    const [txDescription, setTxDescription] = useState('')
    const { addTransaction } = useTransactionViewModel(token, txCategoryId)

    const categoryOptions = categories.map(c => ({ label: c.name, value: c.id }))

    const typeOptions = [
        { label: 'Indtægt', value: 'income' },
        { label: 'Udgift', value: 'expense' },
        { label: 'Skat', value: 'tax' },
        { label: 'Afskrivning', value: 'depreciation' },
    ]

    const handleAddCat = async () => {
        if (!catName.trim()) return
        await addCategory(catName.trim(), catType)
        setCatName('')
        setShowCatModal(false)
    }

    const handleAddTx = async () => {
        if (!txAmount.trim() || !txDescription.trim() || !txCategoryId) return
        const parsedAmount = parseFloat(txAmount)
        if (Number.isNaN(parsedAmount)) return

        const selectedCategory = categories.find(category => category.id === txCategoryId)
        if (!selectedCategory) return

        try {
            await addTransaction(getSignedAmount(parsedAmount, selectedCategory.type), txDate, txDescription)
            setTxAmount('')
            setTxDescription('')
            setShowTxModal(false)
        } catch {
            // Error state håndteres i viewmodel via `error`
        }
    }

    return (
        <View style={styles.categorySection}>
            <View style={styles.sectionHeader}>
                <AppText variant="p" color={theme.colors.text.secondary}>Kategorier</AppText>
                <TouchableOpacity style={styles.smallBtn} onPress={() => setShowCatModal(true)}>
                    <AppText variant="p" color={theme.colors.white}>+ Kategori</AppText>
                </TouchableOpacity>
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
                                <View style={[styles.catIndicator, {
                                    backgroundColor: cat.type === 'income'
                                        ? theme.colors.status.success
                                        : theme.colors.status.error
                                }]} />
                                <AppText variant="p" style={styles.flex}>{cat.name}</AppText>
                                <AppText variant="p" color={theme.colors.text.light}>
                                    {cat.type === 'income' ? 'Indtægt' : cat.type === 'expense' ? 'Udgift' : cat.type === 'tax' ? 'Skat' : 'Afskrivning'}
                                </AppText>
                            </TouchableOpacity>
                            {selectedCatId === cat.id && (
                                <TransactionSection token={token} categoryId={cat.id} categoryType={cat.type} />
                            )}
                        </View>
                    ))
            }

            <TouchableOpacity style={styles.addTransactionBtn} onPress={() => setShowTxModal(true)}>
                <AppText variant="p" color={theme.colors.text.secondary}>+ Tilføj Transaktion</AppText>
            </TouchableOpacity>

            <BaseModal visible={showCatModal} title="Tilføj kategori" onClose={() => setShowCatModal(false)}>
                <InputField label="Navn" placeholder="fx Løn" value={catName} onChangeText={setCatName} />
                <DropdownField label="Type" options={typeOptions} value={catType} onChange={v => setCatType(v as CategoryType)} />
                <PrimaryButton label="Tilføj" onPress={handleAddCat} />
            </BaseModal>

            <BaseModal visible={showTxModal} title="Tilføj transaktion" onClose={() => setShowTxModal(false)}>
                <DropdownField label="Kategori" options={categoryOptions} value={txCategoryId} onChange={setTxCategoryId} />
                <InputField label="Beløb" placeholder="fx 5000" value={txAmount} onChangeText={setTxAmount} keyboardType="numeric" />
                <InputField label="Dato" placeholder="YYYY-MM-DD" value={txDate} onChangeText={setTxDate} />
                <InputField label="Beskrivelse" placeholder="fx Løn marts" value={txDescription} onChangeText={setTxDescription} />
                <PrimaryButton label="Tilføj transaktion" onPress={handleAddTx} />
            </BaseModal>
        </View>
    )
}

// ── TRANSACTION SECTION ───────────────────────────────────────────────────────
function TransactionSection({ token, categoryId, categoryType }: { token: string; categoryId: string; categoryType: CategoryType }) {
    const { transactions, isLoading, addTransaction } = useTransactionViewModel(token, categoryId)
    const [showModal, setShowModal] = useState(false)
    const [amount, setAmount] = useState('')
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])
    const [description, setDescription] = useState('')

    const handleAdd = async () => {
        if (!amount.trim() || !description.trim()) return
        const parsedAmount = parseFloat(amount)
        if (Number.isNaN(parsedAmount)) return

        try {
            await addTransaction(getSignedAmount(parsedAmount, categoryType), date, description)
            setAmount('')
            setDescription('')
            setShowModal(false)
        } catch {
            // Error state håndteres i viewmodel via `error`
        }
    }

    return (
        <View style={styles.transactionSection}>
            <View style={styles.sectionHeader}>
                <AppText variant="p" color={theme.colors.text.secondary}>Transaktioner</AppText>
                <TouchableOpacity style={styles.smallBtn} onPress={() => setShowModal(true)}>
                    <AppText variant="p" color={theme.colors.white}>+ Tilføj</AppText>
                </TouchableOpacity>
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
                            <AppText variant="p" color={t.amount > 0 ? theme.colors.status.success : theme.colors.status.error}>
                                {t.amount > 0 ? '+' : ''}{t.amount.toLocaleString()} kr
                            </AppText>
                        </View>
                    ))
            }

            <BaseModal visible={showModal} title="Tilføj transaktion" onClose={() => setShowModal(false)}>
                <InputField label="Beløb" placeholder="fx 5000" value={amount} onChangeText={setAmount} keyboardType="numeric" />
                <InputField label="Dato" placeholder="YYYY-MM-DD" value={date} onChangeText={setDate} />
                <InputField label="Beskrivelse" placeholder="fx Løn marts" value={description} onChangeText={setDescription} />
                <PrimaryButton label="Tilføj transaktion" onPress={handleAdd} />
            </BaseModal>
        </View>
    )
}

// ── TRANSAKTIONER TAB ─────────────────────────────────────────────────────────
function TransaktionerTab({ token }: { token: string }) {
    const { transactions, isLoading } = useTransactionViewModel(token, '')
    const [searchQuery, setSearchQuery] = useState('')

    const normalizedSearchQuery = searchQuery.trim().toLowerCase()
    const filteredTransactions = normalizedSearchQuery.length === 0
        ? transactions
        : transactions.filter(transaction => {
            const searchableText = [
                transaction.description,
                transaction.date,
                transaction.categories?.name,
                transaction.categories?.departments?.name,
                transaction.amount.toString(),
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase()

            return searchableText.includes(normalizedSearchQuery)
        })


    return (
        <ScrollView style={styles.tab} contentContainerStyle={styles.tabContent}>
            <AppText variant="h3" style={styles.pageTitle}>Transaktioner</AppText>
            <TextInput
                style={styles.searchInput}
                placeholder="Søg på beskrivelse, dato, afdeling eller beløb"
                placeholderTextColor={theme.input.placeholder}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
                autoCorrect={false}
            />

            {isLoading
                ? <ActivityIndicator color={theme.colors.primary.blue} />
                : filteredTransactions.length === 0
                    ? <AppText variant="p" color={theme.colors.text.light} style={styles.center}>
                        {transactions.length === 0 ? 'Ingen transaktioner endnu' : 'Ingen transaktioner matcher din søgning'}
                    </AppText>
                    : filteredTransactions.map(t => (
                        <View key={t.id} style={styles.transactionRow}>
                            <View>
                                <AppText variant="p">{t.description}</AppText>
                                <AppText variant="p" color={theme.colors.text.light}>{t.date}</AppText>
                                <AppText variant="p" color={theme.colors.text.light}>{t.categories?.departments?.name} • {t.categories?.name} </AppText>
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

// ── DASHBOARDS TAB ─────────────────────────────────────────────────────────
function DashboardsTab() {
    return (
        <ScrollView style={styles.tab} contentContainerStyle={styles.tabContent}>
            <AppText variant="h3" style={styles.pageTitle}>Dashboards</AppText>

            <View style={styles.dashboardSection}>
                <AppText variant="h4">Income This Month</AppText>
                <AppText variant="p" color={theme.colors.text.secondary}>
                    Placeholder til graf eller KPI-komponent
                </AppText>
                <View style={styles.dashboardPlaceholder}>
                    <AppText variant="p" color={theme.colors.text.light}>Graph placeholder</AppText>
                </View>
            </View>

            <View style={styles.dashboardSection}>
                <AppText variant="h4">Expenses This Month</AppText>
                <AppText variant="p" color={theme.colors.text.secondary}>
                    Placeholder til udgiftsgraf eller oversigt
                </AppText>
                <View style={styles.dashboardPlaceholder}>
                    <AppText variant="p" color={theme.colors.text.light}>Chart placeholder</AppText>
                </View>
            </View>

            <View style={styles.dashboardSection}>
                <AppText variant="h4">Net Result</AppText>
                <AppText variant="p" color={theme.colors.text.secondary}>
                    Placeholder til samlet KPI, trend eller forecast
                </AppText>
                <View style={styles.dashboardPlaceholder}>
                    <AppText variant="p" color={theme.colors.text.light}>KPI placeholder</AppText>
                </View>
            </View>
        </ScrollView>
    )
}

// ── TEAM TAB ──────────────────────────────────────────────────────────────────
function TeamTab({ token, userRole }: { token: string; userRole: TeamRole }) {
    const { departments } = useOrganisationViewModel(token)
    const { members, totalMembers, isLoading, error, inviteLoading, inviteEmployee } = useTeamViewModel(token)
    const [showInviteModal, setShowInviteModal] = useState(false)
    const [inviteEmail, setInviteEmail] = useState('')
    const [inviteName, setInviteName] = useState('')
    const [inviteRole, setInviteRole] = useState<'manager' | 'employee' | 'auditor'>('employee')
    const [inviteDepartmentId, setInviteDepartmentId] = useState('')
    const canInvite = userRole === 'admin' || userRole === 'manager'

    const departmentMemberCount = departments.map(dept => ({
        id: dept.id,
        name: dept.name,
        count: members.filter(member => member.departmentId === dept.id).length,
    }))

    const roleOptions = userRole === 'admin'
        ? [
            { label: 'Manager', value: 'manager' },
            { label: 'Employee', value: 'employee' },
            { label: 'Auditor', value: 'auditor' },
        ]
        : [
            { label: 'Employee', value: 'employee' },
        ]

    const departmentOptions = departments.map(dept => ({ label: dept.name, value: dept.id }))

    const roleLabel = (role: TeamRole) => {
        if (role === 'admin') return 'Admin'
        if (role === 'manager') return 'Manager'
        if (role === 'auditor') return 'Auditor'
        return 'Medarbejder'
    }

    const handleInvite = async () => {
        if (!inviteEmail.trim() || !inviteName.trim() || !inviteDepartmentId) return

        await inviteEmployee({
            email: inviteEmail.trim(),
            fullName: inviteName.trim(),
            role: inviteRole,
            departmentId: inviteDepartmentId,
        })

        setInviteEmail('')
        setInviteName('')
        setInviteRole(userRole === 'admin' ? 'manager' : 'employee')
        setInviteDepartmentId('')
        setShowInviteModal(false)
    }
    return (
        <ScrollView style={styles.tab} contentContainerStyle={styles.teamContent}>
            {error && <AlertMessage type="error" message={error} />}

            <PrimaryButton
                label="Inviter Medarbejder"
                onPress={() => setShowInviteModal(true)}
                disabled={!canInvite}
                loading={inviteLoading}
            />
            {!canInvite && (
                <AppText variant="p" color={theme.colors.text.light} style={styles.teamHint}>
                    Kun admin eller manager kan invitere medarbejdere.
                </AppText>
            )}

            <View style={styles.teamStatGrid}>
                <View style={styles.teamStatCard}>
                    <AppText variant="p" color={theme.colors.text.secondary}>Total Medarbejdere</AppText>
                    <AppText variant="h3">{totalMembers}</AppText>
                </View>
                {departmentMemberCount.map(item => (
                    <View key={item.id} style={styles.teamStatCard}>
                        <AppText variant="p" color={theme.colors.text.secondary}>{item.name}</AppText>
                        <AppText variant="h3">{item.count}</AppText>
                    </View>
                ))}
            </View>

            {isLoading
                ? <ActivityIndicator color={theme.colors.primary.blue} />
                : members.length === 0
                    ? (
                        <AppText variant="p" color={theme.colors.text.light} style={styles.center}>
                            Ingen medarbejdere fundet endnu.
                        </AppText>
                    )
                    : members.map(member => (
                        <View key={member.id} style={styles.memberCard}>
                            <View style={styles.memberHeader}>
                                <View style={styles.memberAvatar}>
                                    <AppText variant="h4" color={theme.colors.white}>
                                        {member.fullName.split(' ').map(part => part[0]).slice(0, 2).join('').toUpperCase()}
                                    </AppText>
                                </View>
                                <View style={styles.flex}>
                                    <AppText variant="h4">{member.fullName}</AppText>
                                    <AppText variant="p" color={theme.colors.text.secondary}>
                                        {roleLabel(member.role)}
                                    </AppText>
                                </View>
                                <View style={[
                                    styles.statusBadge,
                                    member.status === 'active' ? styles.statusActive : styles.statusPending,
                                ]}
                                >
                                    <AppText
                                        variant="p"
                                        color={member.status === 'active' ? theme.colors.status.success : theme.colors.status.warning}
                                    >
                                        {member.status === 'active' ? 'Aktiv' : 'Inviteret'}
                                    </AppText>
                                </View>
                            </View>
                            <AppText variant="p" color={theme.colors.text.secondary}>{member.email}</AppText>
                            <AppText variant="p" color={theme.colors.text.light}>
                                {departments.find(dept => dept.id === member.departmentId)?.name ?? member.departmentName ?? 'Ukendt afdeling'}
                            </AppText>
                        </View>
                    ))
            }

            <BaseModal visible={showInviteModal} title="Inviter medarbejder" onClose={() => setShowInviteModal(false)}>
                <InputField label="Fulde navn" placeholder="fx Maria Jensen" value={inviteName} onChangeText={setInviteName} />
                <InputField
                    label="Email"
                    placeholder="fx maria@firma.dk"
                    value={inviteEmail}
                    onChangeText={setInviteEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />
                <DropdownField label="Rolle" options={roleOptions} value={inviteRole} onChange={value => setInviteRole(value as 'manager' | 'employee' | 'auditor')} />
                <DropdownField label="Afdeling" options={departmentOptions} value={inviteDepartmentId} onChange={setInviteDepartmentId} />
                <PrimaryButton
                    label="Send invitation"
                    onPress={handleInvite}
                    loading={inviteLoading}
                    disabled={!inviteName || !inviteEmail || !inviteDepartmentId}
                />
            </BaseModal>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background.app },
    content: { flex: 1 },
    topHeader: {
        backgroundColor: theme.colors.background.card,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.md,
        paddingBottom: theme.spacing.lg,
        borderBottomWidth: theme.borderWidth.thin,
        borderBottomColor: theme.colors.background.cardBorder,
    },
    tab: { flex: 1 },
    tabContent: { padding: theme.spacing.xl },
    pageTitle: { marginBottom: theme.spacing.md },
    searchInput: {
        borderWidth: theme.borderWidth.thin,
        borderColor: theme.input.border,
        borderRadius: theme.radius.sm,
        padding: theme.spacing.lg,
        marginBottom: theme.spacing.md,
        fontSize: theme.typography.input.fontSize,
        backgroundColor: theme.input.background,
        color: theme.input.text,
    },
    dashboardSection: {
        backgroundColor: theme.colors.background.card,
        borderRadius: theme.radius.md,
        padding: theme.spacing.lg,
        marginBottom: theme.spacing.lg,
        borderWidth: theme.borderWidth.thin,
        borderColor: theme.colors.background.cardBorder,
        gap: theme.spacing.sm,
    },
    dashboardPlaceholder: {
        height: 180,
        borderRadius: theme.radius.sm,
        borderWidth: theme.borderWidth.thin,
        borderColor: theme.colors.background.cardBorder,
        borderStyle: 'dashed',
        backgroundColor: theme.colors.background.app,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: theme.spacing.sm,
    },
    pageHeader: {
        padding: theme.spacing.xl,
        paddingBottom: theme.spacing.md,
        gap: theme.spacing.sm,
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
    listContent: { paddingHorizontal: theme.spacing.xl, paddingBottom: theme.spacing.xxxl },
    deptCard: {
        backgroundColor: theme.colors.background.card,
        borderRadius: theme.radius.md, marginBottom: theme.spacing.md,
        borderWidth: theme.borderWidth.thin, borderColor: theme.colors.background.cardBorder,
        overflow: 'hidden'
    },
    deptCardHeader: {
        flexDirection: 'row', alignItems: 'center',
        padding: theme.spacing.lg,
    },
    categorySection: {
        backgroundColor: theme.colors.background.app,
        padding: theme.spacing.md,
    },
    sectionHeader2: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: theme.spacing.md
    },
    catRow: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: theme.colors.background.card,
        padding: theme.spacing.md, borderRadius: theme.radius.sm,
        marginBottom: theme.spacing.xs,
        borderWidth: 1, borderColor: theme.colors.background.cardBorder
    },
    catRowActive: { borderColor: theme.colors.primary.blue },
    catIndicator: {
        width: 4, height: 36, borderRadius: 2, marginRight: theme.spacing.md
    },
    addTransactionBtn: {
        borderWidth: theme.borderWidth.thin, borderColor: theme.colors.background.cardBorder,
        borderRadius: theme.radius.sm, padding: theme.spacing.lg,
        alignItems: 'center', marginTop: theme.spacing.sm,
        backgroundColor: theme.colors.background.card
    },
    smallBtn: {
        backgroundColor: theme.colors.primary.blue,
        borderRadius: theme.radius.sm,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.xs,
    },
    transactionSection: {
        backgroundColor: theme.colors.background.app,
        padding: theme.spacing.md,
        marginLeft: theme.spacing.md
    },
    transactionRow: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', backgroundColor: theme.colors.background.card,
        padding: theme.spacing.md, borderRadius: theme.radius.sm,
        marginBottom: theme.spacing.xs,
        borderWidth: 1, borderColor: theme.colors.background.cardBorder
    },
    teamContent: {
        padding: theme.spacing.xl,
        gap: theme.spacing.md,
        paddingBottom: theme.spacing.xxxl,
    },
    teamHint: {
        marginTop: theme.spacing.sm,
        marginBottom: theme.spacing.md,
    },
    teamStatGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: theme.spacing.md,
    },
    teamStatCard: {
        width: '47%',
        minHeight: 96,
        borderRadius: theme.radius.md,
        borderWidth: theme.borderWidth.thin,
        borderColor: theme.colors.background.cardBorder,
        backgroundColor: theme.colors.background.card,
        padding: theme.spacing.lg,
        justifyContent: 'space-between',
    },
    memberCard: {
        backgroundColor: theme.colors.background.card,
        borderRadius: theme.radius.md,
        borderWidth: theme.borderWidth.thin,
        borderColor: theme.colors.background.cardBorder,
        padding: theme.spacing.lg,
        gap: theme.spacing.xs,
    },
    memberHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.md,
    },
    memberAvatar: {
        width: 44,
        height: 44,
        borderRadius: theme.radius.full,
        backgroundColor: theme.colors.primary.blue,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statusBadge: {
        borderRadius: theme.radius.full,
        paddingVertical: theme.spacing.xs,
        paddingHorizontal: theme.spacing.md,
    },
    statusActive: {
        backgroundColor: '#D1FAE5',
    },
    statusPending: {
        backgroundColor: '#FEF3C7',
    },
})
