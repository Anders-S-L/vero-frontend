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
        styles.wrapper,
        { paddingBottom: insets.bottom },
      ]}
    >
      <View style={styles.container}>
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
              <Ionicons name={isActive ? tab.icon.replace("-outline", "") as keyof typeof Ionicons.glyphMap : tab.icon} size={22} color={color} />
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
  wrapper: {
    backgroundColor: theme.navigation.background,
    borderTopWidth: theme.borderWidth.thin,
    borderTopColor: theme.navigation.border,
  },
  container: {
    flexDirection: "row",
    paddingHorizontal: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.sm,
  },
  activeTab: {
    backgroundColor: theme.colors.background.app,
  },
  label: {
    marginTop: theme.spacing.xs,
  },
});
