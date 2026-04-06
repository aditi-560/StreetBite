import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Animated, Platform, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import { CustomButton } from "@/components/CustomButton";
import { useApp } from "@/context/AppContext";

export default function TokenScreen() {
  const { myOrders, orders } = useApp();
  const insets = useSafeAreaInsets();

  const latestOrder = myOrders[myOrders.length - 1];
  const currentOrder = latestOrder
    ? orders.find((o) => o.id === latestOrder.id) ?? latestOrder
    : null;

  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  if (!currentOrder) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No order found</Text>
        <CustomButton title="Go to Menu" onPress={() => router.replace("/customer/menu")} />
      </View>
    );
  }

  const pendingCount = orders.filter(
    (o) =>
      o.status !== "ready" &&
      o.status !== "delivered" &&
      o.tokenNumber < currentOrder.tokenNumber
  ).length;

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: Platform.OS === "web" ? insets.top + 67 : insets.top + 20,
          paddingBottom:
            (Platform.OS === "web" ? 34 : insets.bottom) + 20,
        },
      ]}
    >
      <Animated.View style={[styles.content, { opacity: opacityAnim }]}>
        <View style={styles.successBanner}>
          <Feather name="check-circle" size={20} color={Colors.light.ready} />
          <Text style={styles.successText}>Order Placed Successfully!</Text>
        </View>

        <Animated.View
          style={[
            styles.tokenCard,
            {
              transform: [{ scale: scaleAnim }, { scale: pulseAnim }],
            },
          ]}
        >
          <Text style={styles.tokenLabel}>YOUR TOKEN</Text>
          <Text style={styles.tokenNumber}>
            #{String(currentOrder.tokenNumber).padStart(3, "0")}
          </Text>
          <View style={styles.tokenDivider} />
          <Text style={styles.tokenSubtext}>Show this at the counter</Text>
        </Animated.View>

        <View style={styles.infoCards}>
          <View style={styles.infoCard}>
            <Feather name="clock" size={22} color={Colors.primary} />
            <Text style={styles.infoValue}>{currentOrder.estimatedTime} min</Text>
            <Text style={styles.infoLabel}>Estimated Time</Text>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoCard}>
            <Feather name="users" size={22} color={Colors.primary} />
            <Text style={styles.infoValue}>{pendingCount}</Text>
            <Text style={styles.infoLabel}>Orders Before You</Text>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoCard}>
            <Feather name="package" size={22} color={Colors.primary} />
            <Text style={styles.infoValue}>
              {currentOrder.items.reduce((s, ci) => s + ci.quantity, 0)}
            </Text>
            <Text style={styles.infoLabel}>Items</Text>
          </View>
        </View>

        <View style={styles.vendorNote}>
          <Feather name="map-pin" size={14} color={Colors.primary} />
          <Text style={styles.vendorNoteText}>{currentOrder.vendorName}</Text>
        </View>

        <View style={styles.actions}>
          <CustomButton
            title="Track Order"
            onPress={() => router.push("/customer/tracking")}
            size="lg"
            icon={<Feather name="activity" size={18} color="#fff" />}
          />
          <CustomButton
            title="Back to Menu"
            variant="outline"
            onPress={() => router.replace("/customer/menu")}
            size="md"
          />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    paddingHorizontal: 24,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
  },
  successBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  successText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.ready,
  },
  tokenCard: {
    width: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 28,
    padding: 36,
    alignItems: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.45,
    shadowRadius: 24,
    elevation: 16,
  },
  tokenLabel: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "rgba(255,255,255,0.7)",
    letterSpacing: 3,
    marginBottom: 8,
  },
  tokenNumber: {
    fontSize: 72,
    fontFamily: "Inter_700Bold",
    color: "#fff",
    letterSpacing: -2,
  },
  tokenDivider: {
    width: 60,
    height: 2,
    backgroundColor: "rgba(255,255,255,0.3)",
    marginVertical: 14,
  },
  tokenSubtext: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.8)",
  },
  infoCards: {
    flexDirection: "row",
    backgroundColor: Colors.light.card,
    borderRadius: 20,
    width: "100%",
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  infoCard: {
    flex: 1,
    alignItems: "center",
    gap: 6,
  },
  infoDivider: {
    width: 1,
    backgroundColor: Colors.light.border,
    marginHorizontal: 12,
  },
  infoValue: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
  },
  infoLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
    textAlign: "center",
  },
  vendorNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  vendorNoteText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: Colors.light.textSecondary,
  },
  actions: {
    width: "100%",
    gap: 10,
  },
  errorText: {
    fontSize: 18,
    fontFamily: "Inter_500Medium",
    color: Colors.light.text,
    marginBottom: 20,
  },
});
