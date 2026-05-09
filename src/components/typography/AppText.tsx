import React from "react";
import { StyleProp, Text, TextProps, TextStyle } from "react-native";
import { theme } from "../../constants/theme";

type Variant = "h1" | "h2" | "h3" | "h4" | "p" | "label" | "input" | "button";

type Props = TextProps & {
  variant?: Variant;
  color?: string;
  style?: StyleProp<TextStyle>;
  children: React.ReactNode;
};

const variantStyles = {
  h1: {
    ...theme.typography.headline1,
    fontFamily: theme.typography.fontFamily.primary,
  },
  h2: {
    ...theme.typography.headline2,
    fontFamily: theme.typography.fontFamily.primary,
  },
  h3: {
    ...theme.typography.headline3,
    fontFamily: theme.typography.fontFamily.primary,
  },
  h4: {
    ...theme.typography.headline4,
    fontFamily: theme.typography.fontFamily.primary,
  },
  p: {
    ...theme.typography.paragraph,
    fontFamily: theme.typography.fontFamily.primary,
  },
  label: {
    ...theme.typography.label,
    fontFamily: theme.typography.fontFamily.primary,
  },
  input: {
    ...theme.typography.input,
    fontFamily: theme.typography.fontFamily.primary,
  },
  button: {
    ...theme.typography.button,
    fontFamily: theme.typography.fontFamily.primary,
  },
};

export const AppText = ({ variant = "p", color, style, children, ...props }: Props) => (
  <Text
    {...props}
    style={[
      variantStyles[variant],
      { color: color ?? theme.colors.text.primary },
      style,
    ]}
  >
    {children}
  </Text>
);
