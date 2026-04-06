import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
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
import { useApp } from "@/context/AppContext";
import { Order } from "@/types";

export default function QueueDisplayScreen() {
  const { orders } = useApp();
  const insets = useSafeAreaInsets();

  const activeOrders = orders
    .filter((o) => o.status !== "delivered")
    .sort((a, b) => a.tokenNumber - b.tokenNumber);

  const readyOrders = activeOrders.filter((o) => o.status === "ready");
  const pendingOrders = activeOrders.filter((o) => o.status !== "ready");

  const getCurrentToken = () => {
    const ready = readyOrders[0];
    return ready ? ready.tokenNumber : null;
  };

  const currentToken = getCurrentToken();

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + 24,
          gap: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.nowServingCard}>
          <Text style={styles.nowServingLabel}>NOW SERVING</Text>
          {currentToken ? (
            <Text style={styles.nowServingNumber}>
              #{String(currentToken).padStart(3, "0")}
            </Text>
          ) : (
            <Text style={styles.nowServingEmpty}>–</Text>
          )}
          <Text style={styles.nowServingSubtext}>
            {currentToken ? "Ready for pickup at the counter" : "No order ready yet"}
          </Text>
        </View>

        {readyOrders.length > 0 && (
          <View>
            <View style={styles.sectionHeader}>
              <Feather name="bell" size={16} color={Colors.light.ready} />
              <Text style={[styles.sectionTitle, { color: Colors.light.ready }]}>
                Ready for Pickup ({readyOrders.length})
              </Text>
            </View>
            <View style={styles.tokenRow}>
              {readyOrders.map((order) => (
                <QueueToken key={order.id} order={order} type="ready" />
              ))}
            </View>
          </View>
        )}

        {pendingOrders.length > 0 && (
          <View>
            <View style={styles.sectionHeader}>
              <Feather name="clock" size={16} color={Colors.light.textSecondary} />
              <Text style={styles.sectionTitle}>
                In Queue ({pendingOrders.length})
              </Text>
            </View>
            <View style={styles.tokenRow}>
              {pendingOrders.map((order) => (
                <QueueToken key={order.id} order={order} type="queue" />
              ))}
            </View>
          </View>
        )}

        {activeOrders.length === 0 && (
          <View style={styles.empty}>
            <Feather name="check-circle" size={64} color={Colors.light.border} />
            <Text style={styles.emptyTitle}>Queue is clear!</Text>
            <Text style={styles.emptyDesc}>No active orders at the moment</Text>
          </View>
        )}

        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Today's Summary</Text>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>{orders.length}</Text>
              <Text style={styles.statLabel}>Total Orders</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>
                ₹{orders.reduce((s, o) => s + o.total, 0)}
              </Text>
              <Text style={styles.statLabel}>Revenue</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>
                {orders.filter((o) => o.status === "delivered").length}
              </Text>
              <Text style={styles.statLabel}>Delivered</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function QueueToken({ order, type }: { order: Order; type: "ready" | "queue" }) {
  const isReady = type === "ready";
  const statusColor = order.status === "preparing" ? Colors.light.preparing : Colors.light.pending;

  return (
    <View
      style={[
        styles.tokenCard,
        isReady ? styles.tokenCardReady : { borderColor: statusColor + "40" },
      ]}
    >
      <Text style={[styles.tokenNum, isReady && styles.tokenNumReady]}>
        #{String(order.tokenNumber).padStart(3, "0")}
      </Text>
      <Text style={styles.tokenItems}>
        {order.items.length} item{order.items.length !== 1 ? "s" : ""}
      </Text>
      {isReady ? (
        <View style={styles.readyPill}>
          <Text style={styles.readyPillText}>Ready</Text>
        </View>
      ) : (
        <View style={[styles.statusPill, { backgroundColor: statusColor + "20" }]}>
          <Text style={[styles.statusPillText, { color: statusColor }]}>
            {order.status === "preparing" ? "Cooking" : "Pending"}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  nowServingCard: {
    backgroundColor: Colors.primary,
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 12,
  },
  nowServingLabel: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: "rgba(255,255,255,0.7)",
    letterSpacing: 2,
    marginBottom: 8,
  },
  nowServingNumber: {
    fontSize: 80,
    fontFamily: "Inter_700Bold",
    color: "#fff",
    letterSpacing: -3,
  },
  nowServingEmpty: {
    fontSize: 80,
    fontFamily: "Inter_700Bold",
    color: "rgba(255,255,255,0.4)",
  },
  nowServingSubtext: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.75)",
    marginTop: 6,
    textAlign: "center",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
  },
  tokenRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  tokenCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    gap: 6,
    width: "47%",
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  tokenCardReady: {
    backgroundColor: "#F0FFF4",
    borderColor: Colors.light.ready,
  },
  tokenNum: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
  },
  tokenNumReady: {
    color: Colors.light.ready,
  },
  tokenItems: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
  },
  readyPill: {
    backgroundColor: Colors.light.ready,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 3,
  },
  readyPillText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
  statusPill: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 3,
  },
  statusPillText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  empty: {
    alignItems: "center",
    paddingVertical: 60,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
  },
  emptyDesc: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
  },
  statsCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 20,
    padding: 18,
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
  },
  statsRow: {
    flexDirection: "row",
  },
  stat: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  statNumber: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
  },
});
