import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

import Colors from "@/constants/colors";
import { CustomButton } from "@/components/CustomButton";

// Check if Firebase is configured
const isFirebaseConfigured = () => {
  const apiKey = process.env.EXPO_PUBLIC_FIREBASE_API_KEY;
  return apiKey && apiKey !== "demo-api-key";
};

export default function VendorLoginScreen() {
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const insets = useSafeAreaInsets();

  const handleContinue = async () => {
    if (phone.length < 10) {
      setError("Please enter a valid 10-digit phone number");
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    
    setError("");
    setLoading(true);
    
    try {
      // Store phone number with country code for Firebase
      const phoneNumber = `+91${phone}`;
      await AsyncStorage.setItem('pendingPhone', phoneNumber);
      
      console.log("🔥 Proceeding with Firebase Auth for:", phoneNumber);
      console.log("📱 If you added this as a test number in Firebase, use your test code");
      
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      router.push("/vendor/otp");
      
    } catch (err: any) {
      console.error("Error:", err);
      setError(err.message || "Failed to proceed");
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const topPadding = Platform.OS === "web" ? insets.top + 67 : insets.top + 20;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={[styles.inner, { paddingTop: topPadding }]}>
        <Pressable
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={22} color={Colors.light.text} />
        </Pressable>

        <View style={styles.heroSection}>
          <View style={styles.iconBg}>
            <Feather name="briefcase" size={40} color={Colors.accent} />
          </View>
          <Text style={styles.title}>Vendor Login</Text>
          <Text style={styles.subtitle}>
            Enter your registered phone number to continue managing your orders
          </Text>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.fieldLabel}>Phone Number</Text>
          <Pressable
            style={styles.phoneInputContainer}
            onPress={() => inputRef.current?.focus()}
          >
            <View style={styles.phonePrefix}>
              <Text style={styles.flag}>🇮🇳</Text>
              <Text style={styles.countryCode}>+91</Text>
            </View>
            <View style={styles.phoneDivider} />
            <TextInput
              ref={inputRef}
              style={styles.phoneInput}
              value={phone}
              onChangeText={(text) => {
                setError("");
                setPhone(text.replace(/[^0-9]/g, "").slice(0, 10));
              }}
              keyboardType="phone-pad"
              placeholder="Enter 10-digit number"
              placeholderTextColor={Colors.light.textMuted}
              maxLength={10}
            />
          </Pressable>
          {error ? (
            <View style={styles.errorRow}>
              <Feather name="alert-circle" size={13} color={Colors.light.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <CustomButton
            title="Send OTP"
            onPress={handleContinue}
            size="lg"
            style={{ marginTop: 8 }}
            disabled={phone.length < 10 || loading}
            loading={loading}
            icon={<Feather name="arrow-right" size={18} color="#fff" />}
          />
        </View>

        <View style={styles.demoNote}>
          <Feather name="info" size={14} color={Colors.light.textMuted} />
          <Text style={styles.demoText}>
            Enter your test code on the next screen
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: Colors.light.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },
  heroSection: {
    alignItems: "center",
    gap: 12,
    marginBottom: 40,
  },
  iconBg: {
    width: 88,
    height: 88,
    borderRadius: 24,
    backgroundColor: "#FFF3E0",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 30,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    textAlign: "center",
    lineHeight: 23,
    paddingHorizontal: 16,
  },
  formSection: {
    gap: 12,
  },
  fieldLabel: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.text,
  },
  phoneInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    overflow: "hidden",
    height: 56,
  },
  phonePrefix: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    gap: 6,
  },
  flag: {
    fontSize: 20,
  },
  countryCode: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.text,
  },
  phoneDivider: {
    width: 1,
    height: 28,
    backgroundColor: Colors.light.border,
  },
  phoneInput: {
    flex: 1,
    fontSize: 17,
    fontFamily: "Inter_500Medium",
    color: Colors.light.text,
    paddingHorizontal: 14,
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  errorText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.light.error,
  },
  demoNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    justifyContent: "center",
    marginTop: "auto",
  },
  demoText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
  },
});
