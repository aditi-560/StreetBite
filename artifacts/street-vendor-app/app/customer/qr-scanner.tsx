import { Feather } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import { CustomButton } from "@/components/CustomButton";

export default function QRScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const insets = useSafeAreaInsets();
  const hasScanned = useRef(false);

  const handleBarCodeScanned = async ({
    data,
  }: {
    type: string;
    data: string;
  }) => {
    if (hasScanned.current) return;
    hasScanned.current = true;
    setScanned(true);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => {
      router.back();
    }, 800);
  };

  if (Platform.OS === "web") {
    return (
      <View style={[styles.container, { paddingTop: insets.top + 67 }]}>
        <View style={styles.webFallback}>
          <Feather name="camera-off" size={64} color={Colors.light.textMuted} />
          <Text style={styles.webTitle}>QR Scanner</Text>
          <Text style={styles.webDesc}>
            QR scanning is available on the mobile app.{"\n"}
            In this demo, vendor is pre-loaded.
          </Text>
          <CustomButton
            title="Continue to Menu"
            onPress={() => router.back()}
            style={{ marginTop: 24 }}
          />
        </View>
      </View>
    );
  }

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
        <View style={styles.permissionContainer}>
          <Feather name="camera" size={64} color={Colors.primary} />
          <Text style={styles.permissionTitle}>Camera Access Needed</Text>
          <Text style={styles.permissionDesc}>
            To scan vendor QR codes, please allow camera access.
          </Text>
          <CustomButton
            title="Allow Camera"
            onPress={requestPermission}
            style={{ marginTop: 24, width: "100%" }}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
      />

      <View style={styles.overlay}>
        <View style={[styles.topArea, { paddingTop: insets.top + 16 }]}>
          <Text style={styles.overlayTitle}>Scan Vendor QR</Text>
          <Text style={styles.overlaySubtitle}>
            Point camera at the vendor's QR code
          </Text>
        </View>

        <View style={styles.middleRow}>
          <View style={styles.sideBlur} />
          <View style={styles.scanFrame}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
            {scanned && (
              <View style={styles.successOverlay}>
                <Feather name="check-circle" size={48} color="#fff" />
                <Text style={styles.successText}>Scanned!</Text>
              </View>
            )}
          </View>
          <View style={styles.sideBlur} />
        </View>

        <View style={[styles.bottomArea, { paddingBottom: insets.bottom + 20 }]}>
          {scanned ? (
            <Text style={styles.scannedText}>
              Vendor loaded! Taking you to menu...
            </Text>
          ) : (
            <CustomButton
              title="Skip — Use Demo Vendor"
              variant="outline"
              onPress={() => router.back()}
              style={styles.skipBtn}
            />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "column",
  },
  topArea: {
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.65)",
    paddingBottom: 24,
    gap: 6,
  },
  overlayTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  overlaySubtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.7)",
  },
  middleRow: {
    flex: 1,
    flexDirection: "row",
  },
  sideBlur: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
  },
  scanFrame: {
    width: 240,
    height: 240,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  corner: {
    position: "absolute",
    width: 28,
    height: 28,
    borderColor: Colors.primary,
    borderWidth: 4,
  },
  topLeft: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
  topRight: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
  bottomLeft: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
  bottomRight: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.primary + "CC",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 4,
    gap: 8,
  },
  successText: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  bottomArea: {
    backgroundColor: "rgba(0,0,0,0.65)",
    alignItems: "center",
    paddingTop: 24,
  },
  scannedText: {
    fontSize: 16,
    fontFamily: "Inter_500Medium",
    color: Colors.light.success,
    textAlign: "center",
  },
  skipBtn: {
    borderColor: "#fff",
    paddingHorizontal: 32,
  },
  permissionContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    gap: 12,
    backgroundColor: Colors.light.background,
  },
  permissionTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
    textAlign: "center",
  },
  permissionDesc: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    textAlign: "center",
    lineHeight: 23,
  },
  webFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    gap: 12,
  },
  webTitle: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
  },
  webDesc: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    textAlign: "center",
    lineHeight: 23,
  },
});
