import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import { StatusTracker } from "@/components/StatusTracker";
import { useApp } from "@/context/AppContext";
import { OrderStatus } from "@/types";

const STATUS_MESSAGES: Record<OrderStatus, string> = {
  pending: "Your order has been received! The vendor will start preparing it soon.",
  preparing: "Your order is being freshly prepared. Hang tight!",
  ready: "Your order is ready! Head to the counter to collect it.",
  delivered: "Enjoy your meal! Hope you loved it.",
};

export default function TrackingScreen() {
  const { myOrders, orders } = useApp();
  const insets = useSafeAreaInsets();

  const latestOrder = myOrders[myOrders.length - 1];
  const currentOrder = latestOrder
    ? orders.find((o) => o.id === latestOrder.id) ?? latestOrder
    : null;

  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed((e) => e + 1);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  if (!currentOrder) {
    return (
      <View style={styles.emptyContainer}>
        <Feather name="package" size={72} color={Colors.light.border} />
        <Text style={styles.emptyTitle}>No active orders</Text>
        <Text style={styles.emptyDesc}>
          Place an order to start tracking it here
        </Text>
        <Pressable
          style={({ pressed }) => [styles.menuBtn, pressed && { opacity: 0.7 }]}
          onPress={() => router.push("/customer/menu")}
        >
          <Text style={styles.menuBtnText}>Browse Menu</Text>
        </Pressable>
      </View>
    );
  }

  const timeElapsed = Math.floor(
    (Date.now() - currentOrder.createdAt.getTime()) / 60000
  );
  const timeLeft = Math.max(0, currentOrder.estimatedTime - timeElapsed);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        padding: 20,
        paddingTop: Platform.OS === "web" ? 20 : 20,
        paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + 24,
        gap: 20,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.tokenHeader}>
        <View style={styles.tokenInfo}>
          <Text style={styles.tokenLabel}>Token</Text>
          <Text style={styles.tokenNumber}>
            #{String(currentOrder.tokenNumber).padStart(3, "0")}
          </Text>
        </View>
        <View
          style={[
            styles.statusIndicator,
            { backgroundColor: getStatusBg(currentOrder.status) },
          ]}
        >
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor: getStatusColor(currentOrder.status),
                ...(currentOrder.status === "ready" && styles.pulsingDot),
              },
            ]}
          />
          <Text
            style={[
              styles.statusLabel,
              { color: getStatusColor(currentOrder.status) },
            ]}
          >
            {getStatusLabel(currentOrder.status)}
          </Text>
        </View>
      </View>

      <View style={styles.trackerCard}>
        <StatusTracker status={currentOrder.status} />
        <Text style={styles.statusMessage}>
          {STATUS_MESSAGES[currentOrder.status]}
        </Text>
      </View>

      {currentOrder.status !== "ready" && currentOrder.status !== "delivered" && (
        <View style={styles.timeCard}>
          <Feather name="clock" size={24} color={Colors.primary} />
          <View>
            <Text style={styles.timeValue}>{timeLeft} minutes left</Text>
            <Text style={styles.timeLabel}>Estimated wait time</Text>
          </View>
        </View>
      )}

      <View style={styles.orderCard}>
        <Text style={styles.orderCardTitle}>Order Summary</Text>
        <Text style={styles.vendorName}>{currentOrder.vendorName}</Text>
        {currentOrder.items.map((ci, idx) => (
          <View key={idx} style={styles.itemRow}>
            <Text style={styles.itemEmoji}>{ci.menuItem.emoji}</Text>
            <Text style={styles.itemName}>{ci.menuItem.name}</Text>
            <Text style={styles.itemQty}>×{ci.quantity}</Text>
            <Text style={styles.itemPrice}>
              ₹{ci.menuItem.price * ci.quantity}
            </Text>
          </View>
        ))}
        <View style={styles.divider} />
        <View style={styles.itemRow}>
          <Text style={[styles.itemName, { fontFamily: "Inter_700Bold" }]}>Total</Text>
          <Text style={styles.totalPrice}>₹{currentOrder.total}</Text>
        </View>
      </View>

      {currentOrder.status === "ready" && (
        <View style={styles.readyAlert}>
          <Feather name="bell" size={24} color={Colors.light.ready} />
          <View style={{ flex: 1 }}>
            <Text style={styles.readyAlertTitle}>Ready for Pickup!</Text>
            <Text style={styles.readyAlertDesc}>
              Show your token #{String(currentOrder.tokenNumber).padStart(3, "0")} at the counter.
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

function getStatusColor(status: OrderStatus): string {
  switch (status) {
    case "pending": return Colors.light.pending;
    case "preparing": return Colors.light.preparing;
    case "ready": return Colors.light.ready;
    default: return Colors.light.textMuted;
  }
}

function getStatusBg(status: OrderStatus): string {
  switch (status) {
    case "pending": return "#FFF3E0";
    case "preparing": return "#E3F2FD";
    case "ready": return "#E8F5E9";
    default: return Colors.light.backgroundSecondary;
  }
}

function getStatusLabel(status: OrderStatus): string {
  switch (status) {
    case "pending": return "Pending";
    case "preparing": return "Preparing";
    case "ready": return "Ready!";
    default: return "Delivered";
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    gap: 12,
    backgroundColor: Colors.light.background,
  },
  emptyTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
  },
  emptyDesc: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    textAlign: "center",
  },
  menuBtn: {
    marginTop: 12,
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
  },
  menuBtnText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
  tokenHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  tokenInfo: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
  },
  tokenLabel: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
  },
  tokenNumber: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: Colors.primary,
  },
  statusIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  pulsingDot: {},
  statusLabel: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  trackerCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 20,
    padding: 20,
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  statusMessage: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  timeCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: Colors.accentLight,
    borderRadius: 16,
    padding: 16,
  },
  timeValue: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
  },
  timeLabel: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
  },
  orderCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 20,
    padding: 16,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  orderCardTitle: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
  },
  vendorName: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    marginBottom: 4,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  itemEmoji: {
    fontSize: 18,
  },
  itemName: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.light.text,
  },
  itemQty: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
  },
  itemPrice: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.text,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.light.border,
    marginVertical: 4,
  },
  totalPrice: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: Colors.primary,
  },
  readyAlert: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "#E8F5E9",
    borderRadius: 20,
    padding: 18,
  },
  readyAlertTitle: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    color: Colors.light.ready,
    marginBottom: 4,
  },
  readyAlertDesc: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    lineHeight: 19,
  },
});
