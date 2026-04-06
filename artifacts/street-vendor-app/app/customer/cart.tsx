import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
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
import { CustomButton } from "@/components/CustomButton";
import { useApp } from "@/context/AppContext";

export default function CartScreen() {
  const { cart, cartTotal, updateQuantity, removeFromCart, clearCart, vendor } = useApp();
  const insets = useSafeAreaInsets();

  if (cart.length === 0) {
    return (
      <View style={[styles.emptyContainer, { paddingTop: insets.top + 20 }]}>
        <Feather name="shopping-cart" size={72} color={Colors.light.border} />
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.emptyDesc}>Add some delicious items from the menu!</Text>
        <CustomButton
          title="Browse Menu"
          onPress={() => router.back()}
          style={{ marginTop: 20 }}
        />
      </View>
    );
  }

  const handleDecrease = async (id: string, qty: number) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updateQuantity(id, qty - 1);
  };

  const handleIncrease = async (id: string, qty: number) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updateQuantity(id, qty + 1);
  };

  const handleRemove = async (id: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    removeFromCart(id);
  };

  const taxes = Math.round(cartTotal * 0.05);
  const grandTotal = cartTotal + taxes;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.list}
        contentContainerStyle={{
          padding: 16,
          gap: 12,
          paddingBottom: 200,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Your Order</Text>
        <Text style={styles.vendorName}>{vendor.name}</Text>

        {cart.map((ci) => (
          <View key={ci.menuItem.id} style={styles.cartItem}>
            <View style={styles.itemEmoji}>
              <Text style={styles.emojiText}>{ci.menuItem.emoji}</Text>
            </View>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{ci.menuItem.name}</Text>
              <Text style={styles.itemPrice}>
                ₹{ci.menuItem.price} each
              </Text>
            </View>
            <View style={styles.itemControls}>
              <Pressable
                style={({ pressed }) => [styles.qtyBtn, pressed && { opacity: 0.7 }]}
                onPress={() => handleDecrease(ci.menuItem.id, ci.quantity)}
              >
                <Feather
                  name={ci.quantity === 1 ? "trash-2" : "minus"}
                  size={14}
                  color={ci.quantity === 1 ? Colors.light.error : Colors.primary}
                />
              </Pressable>
              <Text style={styles.qty}>{ci.quantity}</Text>
              <Pressable
                style={({ pressed }) => [
                  styles.qtyBtn,
                  styles.qtyBtnFilled,
                  pressed && { opacity: 0.7 },
                ]}
                onPress={() => handleIncrease(ci.menuItem.id, ci.quantity)}
              >
                <Feather name="plus" size={14} color="#fff" />
              </Pressable>
            </View>
            <Text style={styles.itemSubtotal}>
              ₹{ci.menuItem.price * ci.quantity}
            </Text>
          </View>
        ))}

        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>₹{cartTotal}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Taxes & Charges (5%)</Text>
            <Text style={styles.summaryValue}>₹{taxes}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Grand Total</Text>
            <Text style={styles.totalValue}>₹{grandTotal}</Text>
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.clearBtn,
            pressed && { opacity: 0.7 },
          ]}
          onPress={async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            clearCart();
          }}
        >
          <Feather name="trash-2" size={14} color={Colors.light.error} />
          <Text style={styles.clearBtnText}>Clear Cart</Text>
        </Pressable>
      </ScrollView>

      <View
        style={[
          styles.checkoutBar,
          {
            bottom: 0,
            paddingBottom:
              (Platform.OS === "web" ? 34 : insets.bottom) + 16,
          },
        ]}
      >
        <CustomButton
          title={`Place Order • ₹${grandTotal}`}
          onPress={() => router.push("/customer/order-confirmation")}
          size="lg"
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
  emptyContainer: {
    flex: 1,
    backgroundColor: Colors.light.background,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    gap: 12,
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
  list: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
    marginBottom: 2,
  },
  vendorName: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    marginBottom: 8,
  },
  cartItem: {
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  itemEmoji: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.accentLight,
    alignItems: "center",
    justifyContent: "center",
  },
  emojiText: {
    fontSize: 26,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.text,
  },
  itemPrice: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  itemControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyBtnFilled: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  qty: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
    minWidth: 20,
    textAlign: "center",
  },
  itemSubtotal: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    color: Colors.primary,
    minWidth: 42,
    textAlign: "right",
  },
  summaryCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 16,
    gap: 10,
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: Colors.light.text,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.light.border,
  },
  totalLabel: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
  },
  totalValue: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: Colors.primary,
  },
  clearBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
  },
  clearBtnText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: Colors.light.error,
  },
  checkoutBar: {
    position: "absolute",
    left: 16,
    right: 16,
    backgroundColor: Colors.light.background,
    paddingTop: 12,
  },
});
