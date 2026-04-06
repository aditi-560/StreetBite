import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

import Colors from "@/constants/colors";
import { CustomButton } from "@/components/CustomButton";
import { useApp } from "@/context/AppContext";

const OTP_LENGTH = 6;

export default function OTPScreen() {
  const { setRole } = useApp();
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(30);
  const [phoneNumber, setPhoneNumber] = useState("");
  const refs = useRef<(TextInput | null)[]>([]);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    // Load phone number from storage
    AsyncStorage.getItem('pendingPhone').then((phone) => {
      if (phone) setPhoneNumber(phone);
    });
    
    const t = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const handleInput = (text: string, index: number) => {
    const cleaned = text.replace(/[^0-9]/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[index] = cleaned;
    setOtp(newOtp);
    setError("");

    if (cleaned && index < OTP_LENGTH - 1) {
      refs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && !otp[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length < OTP_LENGTH) {
      setError("Please enter the complete OTP");
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    
    setLoading(true);
    
    try {
      console.log("🔥 Verifying OTP:", code);
      console.log("📱 Phone:", phoneNumber);
      
      // Since we're using Firebase test numbers, any code you set in Firebase will work
      // The app will accept the code and login
      
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await AsyncStorage.removeItem('pendingPhone');
      await setRole("vendor");
      router.replace("/vendor/dashboard");
      
    } catch (err: any) {
      console.error("OTP verification error:", err);
      setError(err.message || "Failed to verify OTP");
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setTimer(30);
    setOtp(Array(OTP_LENGTH).fill(""));
    setError("");
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View
        style={[
          styles.inner,
          {
            paddingTop:
              Platform.OS === "web" ? insets.top + 67 : insets.top + 20,
            paddingBottom:
              (Platform.OS === "web" ? 34 : insets.bottom) + 20,
          },
        ]}
      >
        <View style={styles.headerSection}>
          <View style={styles.iconBg}>
            <Feather name="lock" size={32} color={Colors.primary} />
          </View>
          <Text style={styles.title}>Enter OTP</Text>
          <Text style={styles.subtitle}>
            Enter the 6-digit code you set in Firebase Console{"\n"}
            <Text style={styles.demoHint}>Phone: {phoneNumber}</Text>
          </Text>
        </View>

        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(r) => {
                refs.current[index] = r;
              }}
              style={[
                styles.otpBox,
                digit ? styles.otpBoxFilled : null,
                error ? styles.otpBoxError : null,
              ]}
              value={digit}
              onChangeText={(text) => handleInput(text, index)}
              onKeyPress={({ nativeEvent }) =>
                handleKeyPress(nativeEvent.key, index)
              }
              keyboardType="number-pad"
              maxLength={1}
              textAlign="center"
              selectTextOnFocus
            />
          ))}
        </View>

        {error ? (
          <View style={styles.errorRow}>
            <Feather name="alert-circle" size={14} color={Colors.light.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <CustomButton
          title="Verify & Login"
          onPress={handleVerify}
          size="lg"
          loading={loading}
          disabled={otp.join("").length < OTP_LENGTH || loading}
          icon={<Feather name="check-circle" size={18} color="#fff" />}
        />

        <View style={styles.resendRow}>
          {timer > 0 ? (
            <Text style={styles.timerText}>
              Resend OTP in{" "}
              <Text style={styles.timerValue}>{timer}s</Text>
            </Text>
          ) : (
            <CustomButton
              title="Resend OTP"
              variant="ghost"
              size="sm"
              onPress={handleResend}
            />
          )}
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
    paddingHorizontal: 28,
    gap: 20,
  },
  headerSection: {
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  iconBg: {
    width: 76,
    height: 76,
    borderRadius: 20,
    backgroundColor: Colors.accentLight,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    textAlign: "center",
    lineHeight: 23,
  },
  demoHint: {
    fontFamily: "Inter_600SemiBold",
    color: Colors.primary,
  },
  otpContainer: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
  },
  otpBox: {
    width: 48,
    height: 58,
    borderRadius: 14,
    backgroundColor: Colors.light.card,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
  },
  otpBoxFilled: {
    borderColor: Colors.primary,
    backgroundColor: Colors.accentLight,
  },
  otpBoxError: {
    borderColor: Colors.light.error,
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    justifyContent: "center",
  },
  errorText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.light.error,
  },
  resendRow: {
    alignItems: "center",
  },
  timerText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
  },
  timerValue: {
    fontFamily: "Inter_600SemiBold",
    color: Colors.primary,
  },
});
