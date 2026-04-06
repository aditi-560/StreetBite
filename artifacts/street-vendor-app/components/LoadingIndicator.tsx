import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

import Colors from "@/constants/colors";

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: object;
}

function Skeleton({ width = "100%", height = 20, borderRadius = 8, style }: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: Colors.light.border,
          opacity,
        },
        style,
      ]}
    />
  );
}

export function FoodCardSkeleton() {
  return (
    <View style={styles.card}>
      <Skeleton width={64} height={64} borderRadius={14} />
      <View style={styles.info}>
        <Skeleton width="70%" height={14} />
        <Skeleton width="90%" height={11} style={{ marginTop: 6 }} />
        <Skeleton width="50%" height={11} style={{ marginTop: 4 }} />
        <View style={{ flexDirection: "row", marginTop: 8, gap: 8 }}>
          <Skeleton width="30%" height={13} />
          <Skeleton width={40} height={20} borderRadius={6} />
        </View>
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
    gap: 12,
  },
  info: {
    flex: 1,
    gap: 4,
  },
});
