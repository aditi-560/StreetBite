import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import Colors from "@/constants/colors";
import { OrderStatus } from "@/types";

interface StatusTrackerProps {
  status: OrderStatus;
}

const STEPS: { key: OrderStatus; label: string; icon: string }[] = [
  { key: "pending", label: "Order Placed", icon: "check-circle" },
  { key: "preparing", label: "Preparing", icon: "loader" },
  { key: "ready", label: "Ready!", icon: "bell" },
];

const STATUS_ORDER: OrderStatus[] = ["pending", "preparing", "ready", "delivered"];

export function StatusTracker({ status }: StatusTrackerProps) {
  const currentIndex = STATUS_ORDER.indexOf(status);

  return (
    <View style={styles.container}>
      {STEPS.map((step, index) => {
        const stepIndex = STATUS_ORDER.indexOf(step.key);
        const isCompleted = currentIndex > stepIndex;
        const isActive = currentIndex === stepIndex;
        const isPending = currentIndex < stepIndex;

        return (
          <React.Fragment key={step.key}>
            <View style={styles.step}>
              <View
                style={[
                  styles.iconCircle,
                  isCompleted && styles.iconCompleted,
                  isActive && styles.iconActive,
                  isPending && styles.iconPending,
                ]}
              >
                {isCompleted ? (
                  <Feather name="check" size={16} color="#fff" />
                ) : (
                  <Feather
                    name={step.icon as any}
                    size={16}
                    color={isActive ? "#fff" : Colors.light.textMuted}
                  />
                )}
              </View>
              <Text
                style={[
                  styles.stepLabel,
                  isActive && styles.stepLabelActive,
                  isPending && styles.stepLabelPending,
                ]}
              >
                {step.label}
              </Text>
            </View>
            {index < STEPS.length - 1 && (
              <View
                style={[
                  styles.connector,
                  isCompleted && styles.connectorCompleted,
                ]}
              />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 8,
  },
  step: {
    alignItems: "center",
    flex: 1,
    gap: 8,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  iconCompleted: {
    backgroundColor: Colors.light.success,
  },
  iconActive: {
    backgroundColor: Colors.primary,
  },
  iconPending: {
    backgroundColor: Colors.light.backgroundSecondary,
    borderWidth: 2,
    borderColor: Colors.light.border,
  },
  stepLabel: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.text,
    textAlign: "center",
  },
  stepLabelActive: {
    color: Colors.primary,
  },
  stepLabelPending: {
    color: Colors.light.textMuted,
    fontFamily: "Inter_400Regular",
  },
  connector: {
    height: 3,
    flex: 0.4,
    backgroundColor: Colors.light.border,
    marginTop: 20,
    borderRadius: 2,
  },
  connectorCompleted: {
    backgroundColor: Colors.light.success,
  },
});
