import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppProvider } from "@/context/AppContext";
import Colors from "@/constants/colors";

// Initialize API configuration (Firebase + API client)
import "@/config/api";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.light.card },
        headerTintColor: Colors.light.text,
        headerTitleStyle: {
          fontFamily: "Inter_600SemiBold",
          fontSize: 17,
        },
        headerShadowVisible: false,
        headerBackTitle: "Back",
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="customer/qr-scanner"
        options={{
          title: "Scan QR Code",
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="customer/menu"
        options={{ title: "Menu", headerShown: false }}
      />
      <Stack.Screen
        name="customer/cart"
        options={{ title: "Your Cart", presentation: "modal" }}
      />
      <Stack.Screen
        name="customer/order-confirmation"
        options={{
          title: "Confirm Order",
          presentation: "modal",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="customer/token"
        options={{
          title: "Your Token",
          presentation: "modal",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="customer/tracking"
        options={{ title: "Order Tracking" }}
      />
      <Stack.Screen
        name="vendor/login"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="vendor/otp"
        options={{ title: "Verify OTP" }}
      />
      <Stack.Screen
        name="vendor/dashboard"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="vendor/queue"
        options={{ title: "Queue Display" }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <AppProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <RootLayoutNav />
            </GestureHandlerRootView>
          </AppProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
