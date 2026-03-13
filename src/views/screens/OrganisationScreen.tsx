import React, { useState } from 'react'
import {
    ActivityIndicator,
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text, TextInput, TouchableOpacity,
    View
} from 'react-native'
import { useOrganisationViewModel } from '../../viewmodels/useOrganisationViewModel'

export default function OrganisationScreen({ token }: { token: string }) {
    const { departments, isLoading, error, addDepartment } = useOrganisationViewModel(token)
    const [name, setName] = useState('')

    const handleAdd = async () => {
        if (!name.trim()) return
        await addDepartment(name.trim())
        setName('')
    }

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Min organisation</Text>
            <Text style={styles.subtitle}>Afdelinger</Text>

            <View style={styles.row}>
                <TextInput
                    style={styles.input}
                    placeholder="Ny afdeling"
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
                : <FlatList
                    data={departments}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.item}>
                            <Text style={styles.itemText}>{item.name}</Text>
                        </View>
                    )}
                    ListEmptyComponent={<Text style={styles.empty}>Ingen afdelinger endnu</Text>}
                />
            }
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 24, backgroundColor: '#f5f7fb' },
    title: { fontSize: 28, fontWeight: '700', color: '#111827', marginBottom: 4 },
    subtitle: { fontSize: 16, color: '#6b7280', marginBottom: 20 },
    row: { flexDirection: 'row', gap: 8, marginBottom: 16 },
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
        backgroundColor: '#fff', padding: 16,
        borderRadius: 10, marginBottom: 8
    },
    itemText: { fontSize: 15, color: '#111827' },
    empty: { color: '#9ca3af', textAlign: 'center', marginTop: 40 }
})