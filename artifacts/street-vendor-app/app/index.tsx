import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import { useApp } from "@/context/AppContext";

export default function RoleSelectScreen() {
  const { role, setRole } = useApp();
  const insets = useSafeAreaInsets();
  const [hasNavigated, setHasNavigated] = React.useState(false);

  useEffect(() => {
    // Only auto-navigate if we haven't manually navigated yet
    if (!hasNavigated) {
      if (role === "customer") {
        router.replace("/customer/menu");
      } else if (role === "vendor") {
        router.replace("/vendor/dashboard");
      }
    }
  }, [role, hasNavigated]);

  const handleSelectCustomer = async () => {
    setHasNavigated(true);
    await setRole("customer");
    router.replace("/customer/menu");
  };

  const handleSelectVendor = async () => {
    setHasNavigated(true);
    // Clear any existing vendor role to force login
    await setRole(null);
    router.push("/vendor/login");
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 },
      ]}
    >
      <View style={styles.hero}>
        <View style={styles.iconContainer}>
          <Text style={styles.heroEmoji}>🍜</Text>
        </View>
        <Text style={styles.appName}>StreetBite</Text>
        <Text style={styles.tagline}>
          Street food, simplified.{"\n"}Order fresh, wait less.
        </Text>
      </View>

      <View style={styles.cardsContainer}>
        <Text style={styles.selectLabel}>I am a...</Text>

        <Pressable
          style={({ pressed }) => [
            styles.roleCard,
            styles.customerCard,
            pressed && styles.cardPressed,
          ]}
          onPress={handleSelectCustomer}
        >
          <View style={styles.roleIconBg}>
            <Feather name="shopping-bag" size={32} color={Colors.primary} />
          </View>
          <View style={styles.roleTextContainer}>
            <Text style={styles.roleTitle}>Customer</Text>
            <Text style={styles.roleDesc}>Scan QR, browse menu & order food</Text>
          </View>
          <Feather name="chevron-right" size={20} color={Colors.light.textMuted} />
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.roleCard,
            styles.vendorCard,
            pressed && styles.cardPressed,
          ]}
          onPress={handleSelectVendor}
        >
          <View style={[styles.roleIconBg, styles.vendorIconBg]}>
            <Feather name="briefcase" size={32} color={Colors.accent} />
          </View>
          <View style={styles.roleTextContainer}>
            <Text style={styles.roleTitle}>Vendor</Text>
            <Text style={styles.roleDesc}>Manage orders & your stall</Text>
          </View>
          <Feather name="chevron-right" size={20} color={Colors.light.textMuted} />
        </Pressable>
      </View>

      <Text style={styles.footer}>
        Smart Street Vendor Order Management
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    paddingHorizontal: 24,
  },
  hero: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    width: 110,
    height: 110,
    borderRadius: 28,
    backgroundColor: Colors.accentLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  heroEmoji: {
    fontSize: 56,
  },
  appName: {
    fontSize: 40,
    fontFamily: "Inter_700Bold",
    color: Colors.primary,
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    marginTop: 10,
  },
  cardsContainer: {
    gap: 14,
    paddingBottom: 20,
  },
  selectLabel: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  roleCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    borderRadius: 20,
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  customerCard: {
    backgroundColor: Colors.light.card,
    borderWidth: 1.5,
    borderColor: Colors.primaryLight + "30",
  },
  vendorCard: {
    backgroundColor: Colors.light.card,
    borderWidth: 1.5,
    borderColor: Colors.accent + "30",
  },
  cardPressed: {
    transform: [{ scale: 0.975 }],
    opacity: 0.9,
  },
  roleIconBg: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: Colors.accentLight,
    alignItems: "center",
    justifyContent: "center",
  },
  vendorIconBg: {
    backgroundColor: "#FFF3E0",
  },
  roleTextContainer: {
    flex: 1,
  },
  roleTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
  },
  roleDesc: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    marginTop: 3,
  },
  footer: {
    textAlign: "center",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
    paddingBottom: 8,
  },
});
