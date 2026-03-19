import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { theme } from '../../constants/theme';

type Props = { active?: boolean; onPress: () => void }

export const FavoriteButton = ({ active, onPress }: Props) => (
    <TouchableOpacity style={[styles.button, active && styles.active]} onPress={onPress}>
        <Text style={[styles.icon, active && styles.iconActive]}>★</Text>
    </TouchableOpacity>
)

const styles = StyleSheet.create({
    button: {
        width: 48, height: 48, borderRadius: theme.radius.full,
        alignItems: 'center', justifyContent: 'center',
        borderWidth: theme.borderWidth.thin, borderColor: theme.colors.background.cardBorder,
        backgroundColor: theme.colors.background.card
    },
    active: { backgroundColor: theme.button.favorite.background, borderColor: theme.button.favorite.background },
    icon: { color: theme.colors.primary.blue, fontSize: 20 },
    iconActive: { color: theme.colors.white }
})