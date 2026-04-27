import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { theme } from "../../constants/theme";
import { AppText } from "../typography/AppText";

type Tab = {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
};

type Props = {
  tabs: Tab[];
  activeTab: string;
  onTabPress: (key: string) => void;
};

export const BottomTabBar = ({ tabs, activeTab, onTabPress }: Props) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[styles.container, { bottom: insets.bottom + theme.spacing.xxs }]}
    >
      <View style={styles.bar}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          const color = isActive
            ? theme.navigation.active
            : theme.navigation.inactive;

          return (
            <Pressable
              key={tab.key}
              style={[styles.tab, isActive && styles.activeTab]}
              onPress={() => onTabPress(tab.key)}
            >
              <Ionicons name={tab.icon} size={22} color={color} />
              <AppText variant="label" color={color} style={styles.label}>
                {tab.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    paddingHorizontal: theme.spacing.xl,
    backgroundColor: theme.colors.transparent,
    zIndex: 10,
  },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.navigation.background,
    borderWidth: theme.borderWidth.thin,
    borderColor: theme.navigation.border,
    borderRadius: theme.radius.full,
    padding: theme.spacing.sm,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.full,
  },
  activeTab: {
    backgroundColor: `${theme.navigation.active}14`,
  },
  label: {
    marginTop: theme.spacing.xs,
  },
});
