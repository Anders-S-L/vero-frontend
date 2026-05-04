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
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: theme.spacing.lg,
    zIndex: 20,
  },
  container: {
    flexDirection: "row",
    backgroundColor: theme.navigation.background,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.sm,
    borderWidth: theme.borderWidth.thin,
    borderColor: theme.navigation.border,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 8,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.md,
  },
  activeTab: {
    backgroundColor: theme.colors.background.app,
  },
  label: {
    marginTop: theme.spacing.xs,
  },
});
