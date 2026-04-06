import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import Colors from "@/constants/colors";
import { Order, OrderStatus } from "@/types";

interface OrderCardProps {
  order: Order;
  vendorView?: boolean;
  onAccept?: () => void;
  onPrepare?: () => void;
  onReady?: () => void;
}

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string; bg: string; icon: string }
> = {
  pending: {
    label: "Pending",
    color: Colors.light.pending,
    bg: "#FFF3E0",
    icon: "clock",
  },
  preparing: {
    label: "Preparing",
    color: Colors.light.preparing,
    bg: "#E3F2FD",
    icon: "loader",
  },
  ready: {
    label: "Ready!",
    color: Colors.light.ready,
    bg: "#E8F5E9",
    icon: "check-circle",
  },
  delivered: {
    label: "Delivered",
    color: Colors.light.textMuted,
    bg: Colors.light.backgroundSecondary,
    icon: "package",
  },
};

export function OrderCard({
  order,
  vendorView = false,
  onAccept,
  onPrepare,
  onReady,
}: OrderCardProps) {
  const statusCfg = STATUS_CONFIG[order.status];

  const handleAction = async (fn?: () => void) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    fn?.();
  };

  const timeAgo = () => {
    const diff = Date.now() - order.createdAt.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    return `${mins} min ago`;
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.tokenBadge}>
          <Text style={styles.tokenLabel}>TOKEN</Text>
          <Text style={styles.tokenNumber}>
            #{String(order.tokenNumber).padStart(3, "0")}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
          <Feather
            name={statusCfg.icon as any}
            size={12}
            color={statusCfg.color}
          />
          <Text style={[styles.statusText, { color: statusCfg.color }]}>
            {statusCfg.label}
          </Text>
        </View>
        <Text style={styles.timeAgo}>{timeAgo()}</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.itemsList}>
        {order.items.map((ci, idx) => (
          <View key={idx} style={styles.itemRow}>
            <Text style={styles.itemEmoji}>{ci.menuItem.emoji}</Text>
            <Text style={styles.itemName} numberOfLines={1}>
              {ci.menuItem.name}
            </Text>
            <Text style={styles.itemQty}>×{ci.quantity}</Text>
            <Text style={styles.itemPrice}>
              ₹{ci.menuItem.price * ci.quantity}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.divider} />

      <View style={styles.footer}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalAmount}>₹{order.total}</Text>
      </View>

      {vendorView && (
        <View style={styles.actionRow}>
          {order.status === "pending" && (
            <Pressable
              style={({ pressed }) => [
                styles.actionBtn,
                styles.acceptBtn,
                pressed && styles.btnPressed,
              ]}
              onPress={() => handleAction(onAccept)}
            >
              <Feather name="check" size={15} color="#fff" />
              <Text style={styles.actionBtnText}>Accept</Text>
            </Pressable>
          )}
          {order.status === "preparing" && (
            <Pressable
              style={({ pressed }) => [
                styles.actionBtn,
                styles.readyBtn,
                pressed && styles.btnPressed,
              ]}
              onPress={() => handleAction(onReady)}
            >
              <Feather name="bell" size={15} color="#fff" />
              <Text style={styles.actionBtnText}>Mark Ready</Text>
            </Pressable>
          )}
          {order.status === "ready" && (
            <View style={styles.readyBanner}>
              <Feather name="check-circle" size={16} color={Colors.light.ready} />
              <Text style={styles.readyBannerText}>Order Ready for Pickup</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.card,
    borderRadius: 18,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  tokenBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: "center",
  },
  tokenLabel: {
    fontSize: 9,
    fontFamily: "Inter_600SemiBold",
    color: "rgba(255,255,255,0.8)",
    letterSpacing: 1,
  },
  tokenNumber: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  timeAgo: {
    marginLeft: "auto",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.light.border,
    marginVertical: 12,
  },
  itemsList: {
    gap: 8,
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
    fontFamily: "Inter_500Medium",
    color: Colors.light.textSecondary,
  },
  itemPrice: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.text,
    minWidth: 48,
    textAlign: "right",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.textSecondary,
  },
  totalAmount: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: Colors.primary,
  },
  actionRow: {
    marginTop: 14,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
  },
  acceptBtn: {
    backgroundColor: Colors.light.preparing,
  },
  readyBtn: {
    backgroundColor: Colors.light.ready,
  },
  btnPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  actionBtnText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
  readyBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    backgroundColor: "#E8F5E9",
    borderRadius: 12,
  },
  readyBannerText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.ready,
  },
});
