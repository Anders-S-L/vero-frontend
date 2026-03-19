import React from 'react'
import { StyleSheet, Text, TouchableOpacity } from 'react-native'
import { theme } from '../../constants/theme'

type Props = { onPress: () => void }

export const AddButton = ({ onPress }: Props) => (
    <TouchableOpacity style={styles.button} onPress={onPress}>
        <Text style={styles.icon}>+</Text>
    </TouchableOpacity>
)

const styles = StyleSheet.create({
    button: {
        backgroundColor: theme.button.add.background,
        width: 48, height: 48,
        borderRadius: theme.radius.full,
        alignItems: 'center', justifyContent: 'center'
    },
    icon: { color: theme.button.add.icon, fontSize: 24, fontWeight: '300' }
})