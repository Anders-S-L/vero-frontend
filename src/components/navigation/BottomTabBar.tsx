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
      style={[
        styles.container,
        { paddingBottom: insets.bottom + theme.spacing.sm },
      ]}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        const color = isActive
          ? theme.navigation.active
          : theme.navigation.inactive;

        return (
          <Pressable
            key={tab.key}
            style={styles.tab}
            onPress={() => onTabPress(tab.key)}
          >
            <Ionicons name={tab.icon} size={24} color={color} />
            <AppText variant="label" color={color} style={styles.label}>
              {tab.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: theme.navigation.background,
    borderTopWidth: theme.borderWidth.thin,
    borderTopColor: theme.navigation.border,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingTop: theme.spacing.md,
  },
  label: {
    marginTop: theme.spacing.xs,
  },
});
