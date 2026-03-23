import React from "react";
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    View,
} from "react-native";
import { theme } from "../../constants/theme";
import { AppText } from "../typography/AppText";

type Props = {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
};

export const BaseModal = ({ visible, title, onClose, children }: Props) => (
  <Modal
    visible={visible}
    transparent
    animationType="fade"
    onRequestClose={onClose}
  >
    <View style={styles.overlay}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardWrapper}
      >
        <View style={styles.modal}>
          <View style={styles.header}>
            <AppText variant="h4">{title}</AppText>

            <Pressable onPress={onClose} hitSlop={8}>
              <AppText variant="p" color={theme.modal.closeIcon}>
                ✕
              </AppText>
            </Pressable>
          </View>

          {children}
        </View>
      </KeyboardAvoidingView>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: theme.spacing.xl,
  },
  keyboardWrapper: {
    width: "100%",
  },
  modal: {
    backgroundColor: theme.modal.background,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.xl,
    borderWidth: theme.borderWidth.thin,
    borderColor: theme.modal.border,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.xl,
  },
});
