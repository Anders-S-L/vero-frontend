import React from 'react'
import { KeyboardAvoidingView, Modal, Platform, StyleSheet, TouchableOpacity, View } from 'react-native'
import { theme } from '../../constants/theme'
import { AppText } from '../typography/AppText'

type Props = {
    visible: boolean
    title: string
    onClose: () => void
    children: React.ReactNode
}

export const BaseModal = ({ visible, title, onClose, children }: Props) => (
    <Modal visible={visible} transparent animationType="fade">
        <View style={styles.overlay}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <View style={styles.modal}>
                    <View style={styles.header}>
                        <AppText variant="h4">{title}</AppText>
                        <TouchableOpacity onPress={onClose}>
                            <AppText variant="p" color={theme.modal.closeIcon}>✕</AppText>
                        </TouchableOpacity>
                    </View>
                    {children}
                </View>
            </KeyboardAvoidingView>
        </View>
    </Modal>
)

const styles = StyleSheet.create({
    overlay: {
        flex: 1, backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center', padding: theme.spacing.xl
    },
    modal: {
        backgroundColor: theme.modal.background,
        borderRadius: theme.radius.lg,
        padding: theme.spacing.xl
    },
    header: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: theme.spacing.xl
    }
})