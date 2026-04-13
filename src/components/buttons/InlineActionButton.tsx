import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    StyleProp,
    StyleSheet,
    TouchableOpacity,
    ViewStyle,
} from "react-native";
import { theme } from "../../constants/theme";
import { AppText } from "../typography/AppText";

type Props = {
  label?: string;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  variant?: "default" | "danger";
  style?: StyleProp<ViewStyle>;
};

export const InlineActionButton = ({
  label,
  onPress,
  icon,
  variant = "default",
  style,
}: Props) => {
  // Farve til ikon og tekst
  const color =
    variant === "danger"
      ? theme.colors.status.error
      : theme.colors.text.secondary;

  // Dynamisk border farve
  const borderColor =
    variant === "danger"
      ? theme.colors.status.error
      : theme.colors.background.cardBorder;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { borderColor: borderColor }, // Kun border ændres
        style,
      ]}
      onPress={onPress}
    >
      {icon ? <Ionicons name={icon} size={14} color={color} /> : null}

      {label ? (
        <AppText variant="p" color={color}>
          {label}
        </AppText>
      ) : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
    borderWidth: theme.borderWidth.thin,
    borderColor: theme.colors.background.cardBorder,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.background.card,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
});
