import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

import Colors from "@/constants/colors";
import { OrderCard } from "@/components/OrderCard";
import { useApp } from "@/context/AppContext";
import { OrderStatus } from "@/types";

type FilterTab = "all" | OrderStatus;

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "preparing", label: "Preparing" },
  { key: "ready", label: "Ready" },
];

export default function VendorDashboardScreen() {
  const { orders, updateOrderStatus, setRole, vendor } = useApp();
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();

  const topPadding = Platform.OS === "web" ? insets.top + 67 : insets.top;

  const filtered =
    activeFilter === "all"
      ? orders.filter((o) => o.status !== "delivered")
      : orders.filter((o) => o.status === activeFilter);

  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const preparingCount = orders.filter((o) => o.status === "preparing").length;
  const readyCount = orders.filter((o) => o.status === "ready").length;

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 1200));
    setRefreshing(false);
  };

  const handleAccept = async (orderId: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    updateOrderStatus(orderId, "preparing");
  };

  const handleReady = async (orderId: string) => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    updateOrderStatus(orderId, "ready");
  };

  const handleLogout = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            
            // Clear all stored data
            await AsyncStorage.multiRemove([
              'role',
              'authToken',
              'vendorData',
              'pendingPhone',
            ]);
            
            // Clear role in context
            await setRole(null);
            
            // Navigate to home screen
            router.replace("/");
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topPadding + 16 }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.welcomeText}>Welcome back</Text>
            <Text style={styles.vendorName}>{vendor.name}</Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable
              style={({ pressed }) => [
                styles.headerBtn,
                pressed && { opacity: 0.7 },
              ]}
              onPress={() => router.push("/vendor/queue")}
            >
              <Feather name="list" size={20} color={Colors.light.text} />
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.headerBtn,
                styles.logoutBtn,
                pressed && { opacity: 0.7 },
              ]}
              onPress={handleLogout}
            >
              <Feather name="log-out" size={18} color={Colors.light.error} />
            </Pressable>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: "#FFF3E0" }]}>
            <Text style={[styles.statNum, { color: Colors.light.pending }]}>
              {pendingCount}
            </Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: "#E3F2FD" }]}>
            <Text style={[styles.statNum, { color: Colors.light.preparing }]}>
              {preparingCount}
            </Text>
            <Text style={styles.statLabel}>Preparing</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: "#E8F5E9" }]}>
            <Text style={[styles.statNum, { color: Colors.light.ready }]}>
              {readyCount}
            </Text>
            <Text style={styles.statLabel}>Ready</Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterScrollContent}
        >
          {FILTER_TABS.map((tab) => {
            const count =
              tab.key === "all"
                ? orders.filter((o) => o.status !== "delivered").length
                : orders.filter((o) => o.status === tab.key).length;
            return (
              <Pressable
                key={tab.key}
                style={[
                  styles.filterTab,
                  activeFilter === tab.key && styles.filterTabActive,
                ]}
                onPress={async () => {
                  await Haptics.selectionAsync();
                  setActiveFilter(tab.key);
                }}
              >
                <Text
                  style={[
                    styles.filterTabText,
                    activeFilter === tab.key && styles.filterTabTextActive,
                  ]}
                >
                  {tab.label}
                </Text>
                {count > 0 && (
                  <View
                    style={[
                      styles.filterBadge,
                      activeFilter === tab.key && styles.filterBadgeActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterBadgeText,
                        activeFilter === tab.key && styles.filterBadgeTextActive,
                      ]}
                    >
                      {count}
                    </Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.orderList}
        contentContainerStyle={{
          paddingTop: 8,
          paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + 24,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.primary}
          />
        }
      >
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Feather name="inbox" size={64} color={Colors.light.border} />
            <Text style={styles.emptyTitle}>No orders here</Text>
            <Text style={styles.emptyDesc}>
              {activeFilter === "all"
                ? "Waiting for customers to place orders"
                : `No ${activeFilter} orders right now`}
            </Text>
          </View>
        ) : (
          filtered.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              vendorView
              onAccept={() => handleAccept(order.id)}
              onReady={() => handleReady(order.id)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    backgroundColor: Colors.light.card,
    paddingHorizontal: 16,
    paddingBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
  },
  vendorName: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.light.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  logoutBtn: {
    backgroundColor: "#FFF0EF",
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  statCard: {
    flex: 1,
    borderRadius: 14,
    padding: 12,
    alignItems: "center",
    gap: 4,
  },
  statNum: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
  },
  filterScroll: {
    marginHorizontal: -16,
  },
  filterScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterTab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  filterTabActive: {
    backgroundColor: Colors.primary,
  },
  filterTabText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: Colors.light.textSecondary,
  },
  filterTabTextActive: {
    color: "#fff",
  },
  filterBadge: {
    backgroundColor: Colors.light.border,
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 1,
  },
  filterBadgeActive: {
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  filterBadgeText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.textSecondary,
  },
  filterBadgeTextActive: {
    color: "#fff",
  },
  orderList: {
    flex: 1,
  },
  empty: {
    alignItems: "center",
    paddingTop: 80,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.text,
  },
  emptyDesc: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    textAlign: "center",
    paddingHorizontal: 40,
  },
});
