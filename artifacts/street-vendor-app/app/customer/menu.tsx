import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
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
import { FoodCard } from "@/components/FoodCard";
import { MENU_ITEMS } from "@/data/mockData";
import { MenuItemCategory } from "@/types";

const CATEGORIES: { key: MenuItemCategory | "all"; label: string; emoji: string }[] = [
  { key: "all", label: "All", emoji: "🍽️" },
  { key: "main", label: "Main", emoji: "🍛" },
  { key: "side", label: "Sides", emoji: "🥟" },
  { key: "drink", label: "Drinks", emoji: "🍵" },
  { key: "dessert", label: "Sweets", emoji: "🍮" },
];

export default function MenuScreen() {
  const { cart, cartCount, cartTotal, vendor, setRole } = useApp();
  const [activeCategory, setActiveCategory] = useState<MenuItemCategory | "all">("all");
  const insets = useSafeAreaInsets();

  const filtered =
    activeCategory === "all"
      ? MENU_ITEMS
      : MENU_ITEMS.filter((i) => i.category === activeCategory);

  const topPadding = Platform.OS === "web" ? insets.top + 67 : insets.top;

  const handleBackToHome = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await setRole(null);
    router.replace("/");
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topPadding + 16 }]}>
        <View style={styles.headerTop}>
          <Pressable
            style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}
            onPress={handleBackToHome}
          >
            <Feather name="arrow-left" size={22} color={Colors.light.text} />
          </Pressable>
          <View style={styles.vendorInfo}>
            <Text style={styles.vendorName}>{vendor.name}</Text>
            <View style={styles.vendorMeta}>
              <Feather name="star" size={12} color={Colors.accent} />
              <Text style={styles.vendorRating}>{vendor.rating}</Text>
              <View style={styles.dot} />
              <Text style={styles.vendorCategory}>{vendor.category}</Text>
              <View style={[styles.openBadge, { marginLeft: 8 }]}>
                <Text style={styles.openText}>Open</Text>
              </View>
            </View>
          </View>
          <Pressable
            style={({ pressed }) => [styles.scanBtn, pressed && { opacity: 0.8 }]}
            onPress={() => router.push("/customer/qr-scanner")}
          >
            <Feather name="camera" size={20} color={Colors.primary} />
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryScrollContent}
        >
          {CATEGORIES.map((cat) => (
            <Pressable
              key={cat.key}
              style={[
                styles.categoryChip,
                activeCategory === cat.key && styles.categoryChipActive,
              ]}
              onPress={async () => {
                await Haptics.selectionAsync();
                setActiveCategory(cat.key);
              }}
            >
              <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
              <Text
                style={[
                  styles.categoryLabel,
                  activeCategory === cat.key && styles.categoryLabelActive,
                ]}
              >
                {cat.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.list}
        contentContainerStyle={{
          paddingTop: 8,
          paddingBottom:
            cart.length > 0
              ? 120 + (Platform.OS === "web" ? 34 : insets.bottom)
              : 24 + (Platform.OS === "web" ? 34 : insets.bottom),
        }}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🍽️</Text>
            <Text style={styles.emptyTitle}>No items in this category</Text>
          </View>
        ) : (
          filtered.map((item) => <FoodCard key={item.id} item={item} />)
        )}
      </ScrollView>

      {cart.length > 0 && (
        <View
          style={[
            styles.cartBar,
            {
              bottom:
                (Platform.OS === "web" ? 34 : insets.bottom) + 16,
            },
          ]}
        >
          <Pressable
            style={({ pressed }) => [
              styles.cartButton,
              pressed && styles.cartButtonPressed,
            ]}
            onPress={() => router.push("/customer/cart")}
          >
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartCount}</Text>
            </View>
            <Text style={styles.cartButtonText}>View Cart</Text>
            <Text style={styles.cartTotal}>₹{cartTotal}</Text>
          </Pressable>
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
  header: {
    backgroundColor: Colors.light.card,
    paddingHorizontal: 16,
    paddingBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: Colors.light.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  vendorInfo: {
    flex: 1,
  },
  vendorName: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
  },
  vendorMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 3,
  },
  vendorRating: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: Colors.light.textSecondary,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.light.textMuted,
    marginHorizontal: 4,
  },
  vendorCategory: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
  },
  openBadge: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
  },
  openText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.ready,
  },
  scanBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: Colors.accentLight,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryScroll: {
    marginHorizontal: -16,
  },
  categoryScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
  },
  categoryEmoji: {
    fontSize: 16,
  },
  categoryLabel: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: Colors.light.textSecondary,
  },
  categoryLabelActive: {
    color: "#fff",
  },
  list: {
    flex: 1,
  },
  empty: {
    alignItems: "center",
    paddingTop: 80,
    gap: 12,
  },
  emptyEmoji: {
    fontSize: 56,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: "Inter_500Medium",
    color: Colors.light.textSecondary,
  },
  cartBar: {
    position: "absolute",
    left: 16,
    right: 16,
  },
  cartButton: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  cartButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  cartBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  cartBadgeText: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  cartButtonText: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
  cartTotal: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
});
