import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import { CustomButton } from "@/components/CustomButton";
import { useApp } from "@/context/AppContext";

export default function OrderConfirmationScreen() {
  const { cart, cartTotal, vendor, placeOrder } = useApp();
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();

  const taxes = Math.round(cartTotal * 0.05);
  const grandTotal = cartTotal + taxes;
  const topPadding = Platform.OS === "web" ? insets.top + 67 : insets.top;

  const handleConfirm = async () => {
    setLoading(true);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await new Promise((resolve) => setTimeout(resolve, 800));
    placeOrder(vendor.id, vendor.name);
    setLoading(false);
    router.replace("/customer/token");
  };

  return (
    <View style={[styles.container, { paddingTop: topPadding + 20 }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 120 + (Platform.OS === "web" ? 34 : insets.bottom),
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Review Order</Text>
        <Text style={styles.subtitle}>Please confirm your order below</Text>

        <View style={styles.vendorCard}>
          <View style={styles.vendorIconBg}>
            <Feather name="map-pin" size={20} color={Colors.primary} />
          </View>
          <View>
            <Text style={styles.vendorCardName}>{vendor.name}</Text>
            <Text style={styles.vendorCardMeta}>{vendor.category} Street Food</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Order Items</Text>
          {cart.map((ci) => (
            <View key={ci.menuItem.id} style={styles.orderRow}>
              <Text style={styles.orderEmoji}>{ci.menuItem.emoji}</Text>
              <View style={styles.orderInfo}>
                <Text style={styles.orderName}>{ci.menuItem.name}</Text>
                <Text style={styles.orderQty}>×{ci.quantity}</Text>
              </View>
              <Text style={styles.orderPrice}>
                ₹{ci.menuItem.price * ci.quantity}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Bill Summary</Text>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Item Total</Text>
            <Text style={styles.billValue}>₹{cartTotal}</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Taxes (5%)</Text>
            <Text style={styles.billValue}>₹{taxes}</Text>
          </View>
          <View style={[styles.billRow, styles.billTotal]}>
            <Text style={styles.billTotalLabel}>Total Amount</Text>
            <Text style={styles.billTotalValue}>₹{grandTotal}</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Feather name="info" size={16} color={Colors.light.preparing} />
          <Text style={styles.infoText}>
            You'll receive a token number after placing the order. Show it to the
            vendor when picking up your food.
          </Text>
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            paddingBottom:
              (Platform.OS === "web" ? 34 : insets.bottom) + 16,
          },
        ]}
      >
        <CustomButton
          title="Place Order"
          size="lg"
          loading={loading}
          onPress={handleConfirm}
          icon={<Feather name="check-circle" size={18} color="#fff" />}
        />
        <CustomButton
          title="Edit Cart"
          variant="ghost"
          size="md"
          onPress={() => router.back()}
          style={{ marginTop: 6 }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scroll: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    marginBottom: 20,
  },
  vendorCard: {
    backgroundColor: Colors.accentLight,
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  vendorIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  vendorCardName: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
  },
  vendorCardMeta: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
  },
  card: {
    backgroundColor: Colors.light.card,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
    marginBottom: 4,
  },
  orderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  orderEmoji: {
    fontSize: 22,
  },
  orderInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  orderName: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: Colors.light.text,
    flex: 1,
  },
  orderQty: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
  },
  orderPrice: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.text,
  },
  billRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  billTotal: {
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    paddingTop: 10,
    marginTop: 4,
  },
  billLabel: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
  },
  billValue: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: Colors.light.text,
  },
  billTotalLabel: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
  },
  billTotalValue: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: Colors.primary,
  },
  infoCard: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: "#E3F2FD",
    borderRadius: 14,
    padding: 14,
    alignItems: "flex-start",
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: Colors.light.background,
    gap: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 8,
  },
});
