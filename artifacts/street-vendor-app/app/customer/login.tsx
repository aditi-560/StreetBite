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

export default function CustomerLoginScreen() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const nameRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const insets = useSafeAreaInsets();

  const handleContinue = async () => {
    if (!name.trim()) {
      setError("Please enter your name");
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (phone.length < 10) {
      setError("Please enter a valid 10-digit phone number");
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    
    setError("");
    setLoading(true);
    
    try {
      // Store customer info temporarily for OTP screen
      const phoneNumber = `+91${phone}`;
      await AsyncStorage.setItem('pendingCustomerName', name.trim());
      await AsyncStorage.setItem('pendingCustomerPhone', phoneNumber);
      
      console.log("🔥 Proceeding to OTP verification for customer:", phoneNumber);
      
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      router.push("/customer/otp");
      
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
            <Feather name="user" size={40} color={Colors.primary} />
          </View>
          <Text style={styles.title}>Welcome!</Text>
          <Text style={styles.subtitle}>
            Enter your details to start ordering delicious food
          </Text>
        </View>

        <View style={styles.formSection}>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Your Name</Text>
            <Pressable
              style={styles.inputContainer}
              onPress={() => nameRef.current?.focus()}
            >
              <Feather name="user" size={18} color={Colors.light.textMuted} />
              <TextInput
                ref={nameRef}
                style={styles.input}
                value={name}
                onChangeText={(text) => {
                  setError("");
                  setName(text);
                }}
                placeholder="Enter your name"
                placeholderTextColor={Colors.light.textMuted}
                autoCapitalize="words"
              />
            </Pressable>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Phone Number</Text>
            <Pressable
              style={styles.phoneInputContainer}
              onPress={() => phoneRef.current?.focus()}
            >
              <View style={styles.phonePrefix}>
                <Text style={styles.flag}>🇮🇳</Text>
                <Text style={styles.countryCode}>+91</Text>
              </View>
              <View style={styles.phoneDivider} />
              <TextInput
                ref={phoneRef}
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
          </View>

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
            disabled={!name.trim() || phone.length < 10 || loading}
            loading={loading}
            icon={<Feather name="arrow-right" size={18} color="#fff" />}
          />
        </View>

        <View style={styles.demoNote}>
          <Feather name="info" size={14} color={Colors.light.textMuted} />
          <Text style={styles.demoText}>
            We'll send an OTP to verify your number
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
    backgroundColor: Colors.accentLight,
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
    gap: 16,
  },
  fieldGroup: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.text,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    paddingHorizontal: 16,
    height: 56,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 17,
    fontFamily: "Inter_500Medium",
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
