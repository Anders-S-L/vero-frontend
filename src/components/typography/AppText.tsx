import React from 'react'
import { Text, TextStyle } from 'react-native'
import { theme } from '../../constants/theme'

type Variant = 'h1' | 'h2' | 'h3' | 'h4' | 'p'

type Props = {
    variant?: Variant
    color?: string
    style?: TextStyle
    children: React.ReactNode
}

const variantStyles = {
    h1: { ...theme.typography.headline1, fontFamily: theme.typography.fontFamily.primary },
    h2: { ...theme.typography.headline2, fontFamily: theme.typography.fontFamily.primary },
    h3: { ...theme.typography.headline3, fontFamily: theme.typography.fontFamily.primary },
    h4: { ...theme.typography.headline4, fontFamily: theme.typography.fontFamily.primary },
    p: { ...theme.typography.paragraph, fontFamily: theme.typography.fontFamily.primary },
}

export const AppText = ({ variant = 'p', color, style, children }: Props) => (
    <Text style={[variantStyles[variant], { color: color ?? theme.colors.text.primary }, style]}>
        {children}
    </Text>
)