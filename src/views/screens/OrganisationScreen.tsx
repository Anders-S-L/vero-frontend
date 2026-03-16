import React, { useState } from 'react'
import {
    ActivityIndicator, FlatList, SafeAreaView,
    StyleSheet, Text, TextInput, TouchableOpacity, View
} from 'react-native'
import { CategoryType } from '../../models/categoryModel'
import { useCategoryViewModel } from '../../viewmodels/useCategoryViewModel'
import { useOrganisationViewModel } from '../../viewmodels/useOrganisationViewModel'

export default function OrganisationScreen({ token }: { token: string }) {
    const { departments, isLoading, error, addDepartment } = useOrganisationViewModel(token)
    const [deptName, setDeptName] = useState('')
    const [selectedDeptId, setSelectedDeptId] = useState<string | null>(null)

    const handleAddDept = async () => {
        if (!deptName.trim()) return
        await addDepartment(deptName.trim())
        setDeptName('')
    }

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Min organisation</Text>
            <Text style={styles.subtitle}>Afdelinger</Text>

            <View style={styles.row}>
                <TextInput
                    style={styles.input}
                    placeholder="Ny afdeling"
                    value={deptName}
                    onChangeText={setDeptName}
                />
                <TouchableOpacity style={styles.button} onPress={handleAddDept}>
                    <Text style={styles.buttonText}>Tilføj</Text>
                </TouchableOpacity>
            </View>

            {error && <Text style={styles.error}>{error}</Text>}

            {isLoading
                ? <ActivityIndicator />
                : <FlatList
                    data={departments}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                        <View>
                            <TouchableOpacity
                                style={[styles.item, selectedDeptId === item.id && styles.itemSelected]}
                                onPress={() => setSelectedDeptId(selectedDeptId === item.id ? null : item.id)}
                            >
                                <Text style={styles.itemText}>{item.name}</Text>
                                <Text style={styles.chevron}>{selectedDeptId === item.id ? '▲' : '▼'}</Text>
                            </TouchableOpacity>

                            {selectedDeptId === item.id && (
                                <CategorySection token={token} departmentId={item.id} />
                            )}
                        </View>
                    )}
                    ListEmptyComponent={<Text style={styles.empty}>Ingen afdelinger endnu</Text>}
                />
            }
        </SafeAreaView>
    )
}

function CategorySection({ token, departmentId }: { token: string; departmentId: string }) {
    const { categories, isLoading, error, addCategory } = useCategoryViewModel(token, departmentId)
    const [name, setName] = useState('')
    const [type, setType] = useState<CategoryType>('expense')

    const types: CategoryType[] = ['income', 'expense', 'tax', 'depreciation']

    const handleAdd = async () => {
        if (!name.trim()) return
        await addCategory(name.trim(), type)
        setName('')
    }

    return (
        <View style={styles.categorySection}>
            <Text style={styles.categoryTitle}>Kategorier</Text>

            <View style={styles.typeRow}>
                {types.map(t => (
                    <TouchableOpacity
                        key={t}
                        style={[styles.typeBtn, type === t && styles.typeBtnActive]}
                        onPress={() => setType(t)}
                    >
                        <Text style={[styles.typeBtnText, type === t && styles.typeBtnTextActive]}>{t}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.row}>
                <TextInput
                    style={styles.input}
                    placeholder="Ny kategori"
                    value={name}
                    onChangeText={setName}
                />
                <TouchableOpacity style={styles.button} onPress={handleAdd}>
                    <Text style={styles.buttonText}>Tilføj</Text>
                </TouchableOpacity>
            </View>

            {error && <Text style={styles.error}>{error}</Text>}

            {isLoading
                ? <ActivityIndicator />
                : categories.map(cat => (
                    <View key={cat.id} style={styles.categoryItem}>
                        <Text style={styles.itemText}>{cat.name}</Text>
                        <Text style={styles.typeTag}>{cat.type}</Text>
                    </View>
                ))
            }
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 24, backgroundColor: '#f5f7fb' },
    title: { fontSize: 28, fontWeight: '700', color: '#111827', marginBottom: 4 },
    subtitle: { fontSize: 16, color: '#6b7280', marginBottom: 20 },
    row: { flexDirection: 'row', gap: 8, marginBottom: 12 },
    input: {
        flex: 1, borderWidth: 1, borderColor: '#d1d5db',
        borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12,
        backgroundColor: '#fff'
    },
    button: {
        backgroundColor: '#111827', borderRadius: 10,
        paddingHorizontal: 16, justifyContent: 'center'
    },
    buttonText: { color: '#fff', fontWeight: '600' },
    error: { color: '#b91c1c', marginBottom: 12 },
    item: {
        backgroundColor: '#fff', padding: 16, borderRadius: 10,
        marginBottom: 4, flexDirection: 'row', justifyContent: 'space-between'
    },
    itemSelected: { backgroundColor: '#e5e7eb' },
    itemText: { fontSize: 15, color: '#111827' },
    chevron: { color: '#6b7280' },
    empty: { color: '#9ca3af', textAlign: 'center', marginTop: 40 },
    categorySection: {
        backgroundColor: '#f9fafb', padding: 12,
        borderRadius: 10, marginBottom: 8, marginLeft: 8
    },
    categoryTitle: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
    typeRow: { flexDirection: 'row', gap: 6, marginBottom: 10, flexWrap: 'wrap' },
    typeBtn: {
        paddingHorizontal: 10, paddingVertical: 6,
        borderRadius: 8, borderWidth: 1, borderColor: '#d1d5db'
    },
    typeBtnActive: { backgroundColor: '#111827', borderColor: '#111827' },
    typeBtnText: { fontSize: 12, color: '#374151' },
    typeBtnTextActive: { color: '#fff' },
    categoryItem: {
        flexDirection: 'row', justifyContent: 'space-between',
        padding: 10, backgroundColor: '#fff', borderRadius: 8, marginBottom: 4
    },
    typeTag: { fontSize: 12, color: '#6b7280' }
})