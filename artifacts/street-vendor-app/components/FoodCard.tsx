import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import Colors from "@/constants/colors";
import { useApp } from "@/context/AppContext";
import { MenuItem } from "@/types";

interface FoodCardProps {
  item: MenuItem;
}

export function FoodCard({ item }: FoodCardProps) {
  const { cart, addToCart, updateQuantity, removeFromCart } = useApp();
  const cartItem = cart.find((ci) => ci.menuItem.id === item.id);
  const quantity = cartItem?.quantity ?? 0;

  const handleAdd = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    addToCart(item);
  };

  const handleDecrease = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (quantity === 1) {
      removeFromCart(item.id);
    } else {
      updateQuantity(item.id, quantity - 1);
    }
  };

  return (
    <View style={[styles.card, !item.available && styles.unavailable]}>
      <View style={styles.emojiContainer}>
        <Text style={styles.emoji}>{item.emoji}</Text>
      </View>
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>
          {!item.available && (
            <View style={styles.unavailableBadge}>
              <Text style={styles.unavailableText}>Unavailable</Text>
            </View>
          )}
        </View>
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.meta}>
          <View style={styles.ratingRow}>
            <Feather name="star" size={12} color={Colors.accent} />
            <Text style={styles.rating}>{item.rating}</Text>
            <Feather name="clock" size={12} color={Colors.light.textMuted} style={{ marginLeft: 8 }} />
            <Text style={styles.prepTime}>{item.prepTime} min</Text>
          </View>
          <Text style={styles.price}>₹{item.price}</Text>
        </View>
      </View>
      <View style={styles.actionArea}>
        {quantity === 0 ? (
          <Pressable
            onPress={handleAdd}
            disabled={!item.available}
            style={({ pressed }) => [
              styles.addButton,
              pressed && styles.addButtonPressed,
              !item.available && styles.addButtonDisabled,
            ]}
          >
            <Feather name="plus" size={18} color="#fff" />
          </Pressable>
        ) : (
          <View style={styles.quantityControl}>
            <Pressable
              onPress={handleDecrease}
              style={({ pressed }) => [
                styles.qtyButton,
                pressed && styles.qtyButtonPressed,
              ]}
            >
              <Feather name="minus" size={14} color={Colors.primary} />
            </Pressable>
            <Text style={styles.qty}>{quantity}</Text>
            <Pressable
              onPress={handleAdd}
              style={({ pressed }) => [
                styles.qtyButton,
                styles.qtyButtonFilled,
                pressed && styles.qtyButtonPressed,
              ]}
            >
              <Feather name="plus" size={14} color="#fff" />
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    flexDirection: "row",
    padding: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  unavailable: {
    opacity: 0.55,
  },
  emojiContainer: {
    width: 64,
    height: 64,
    borderRadius: 14,
    backgroundColor: Colors.accentLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  emoji: {
    fontSize: 32,
  },
  info: {
    flex: 1,
    gap: 4,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  name: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.text,
    flex: 1,
  },
  unavailableBadge: {
    backgroundColor: Colors.light.backgroundSecondary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  unavailableText: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
    color: Colors.light.textMuted,
  },
  description: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    lineHeight: 17,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  rating: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: Colors.light.textSecondary,
  },
  prepTime: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
  },
  price: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: Colors.primary,
  },
  actionArea: {
    marginLeft: 12,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
  addButtonDisabled: {
    backgroundColor: Colors.light.textMuted,
  },
  quantityControl: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  qtyButton: {
    width: 30,
    height: 30,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyButtonFilled: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  qtyButtonPressed: {
    opacity: 0.75,
  },
  qty: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
    minWidth: 20,
    textAlign: "center",
  },
});
