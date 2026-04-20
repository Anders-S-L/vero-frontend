import React from "react";
import {
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import { theme } from "../../constants/theme";

type Props = {
  active?: boolean;
  onPress: () => void;
  size?: "default" | "small";
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  activeIconColor?: string;
  inactiveIconColor?: string;
};

export const FavoriteButton = ({
  active = false,
  onPress,
  size = "default",
  accessibilityLabel,
  style,
  activeIconColor = theme.colors.white,
  inactiveIconColor = theme.colors.primary.blue,
}: Props) => (
  <TouchableOpacity
    style={[
      styles.button,
      size === "small" && styles.small,
      active && styles.active,
      style,
    ]}
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={accessibilityLabel}
    accessibilityState={{ selected: active }}
    hitSlop={8}
  >
    <Text
      style={[
        styles.icon,
        size === "small" && styles.smallIcon,
        active && styles.iconActive,
        { color: active ? activeIconColor : inactiveIconColor },
      ]}
    >
      {active ? "★" : "☆"}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    width: 48,
    height: 48,
    borderRadius: theme.radius.full,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: theme.borderWidth.thin,
    borderColor: theme.colors.background.cardBorder,
    backgroundColor: theme.colors.background.card,
  },
  small: {
    width: 32,
    height: 32,
  },
  active: {
    backgroundColor: theme.button.favorite.background,
    borderColor: theme.button.favorite.background,
  },
  icon: {
    color: theme.colors.primary.blue,
    fontSize: 20,
    lineHeight: 24,
  },
  smallIcon: {
    fontSize: 18,
    lineHeight: 22,
  },
  iconActive: {
    color: theme.colors.white,
  },
});
