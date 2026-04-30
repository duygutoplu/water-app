import { useEffect, useMemo, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";

type DrippyProps = {
  progress: number;
  color: string;
  size?: "small" | "large";
  bounceTrigger?: number;
};

export default function Drippy({
  progress,
  color,
  size = "large",
  bounceTrigger = 0,
}: DrippyProps) {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;
  const progressPulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    loop.start();
    return () => loop.stop();
  }, [floatAnim]);

  useEffect(() => {
    Animated.sequence([
      Animated.spring(bounceAnim, {
        toValue: 1.16,
        tension: 130,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.spring(bounceAnim, {
        toValue: 1,
        tension: 120,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [bounceAnim, bounceTrigger]);

  useEffect(() => {
    Animated.sequence([
      Animated.timing(progressPulseAnim, {
        toValue: 1.05,
        duration: 160,
        useNativeDriver: true,
      }),
      Animated.timing(progressPulseAnim, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  }, [progress, progressPulseAnim]);

  useEffect(() => {
    if (progress >= 100) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 0.9,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.35,
            duration: 700,
            useNativeDriver: true,
          }),
        ])
      );
      loop.start();
      return () => loop.stop();
    }

    glowAnim.setValue(0.25);
  }, [glowAnim, progress]);

  const mood = useMemo(() => {
    if (progress >= 100) {
      return { opacity: 1, scale: 1.1, status: "Legendary hydration", mouth: "excited" as const };
    }
    if (progress >= 70) {
      return { opacity: 1, scale: 1.02, status: "Drippy is energized", mouth: "happy" as const };
    }
    if (progress >= 30) {
      return { opacity: 0.92, scale: 0.96, status: "Steady hydration mode", mouth: "neutral" as const };
    }
    return { opacity: 0.66, scale: 0.88, status: "Needs more water", mouth: "sad" as const };
  }, [progress]);

  const sizeScale = size === "large" ? 1 : 0.65;
  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });

  return (
    <View style={styles.wrapper}>
      {progress >= 100 && (
        <Animated.View
          style={[
            styles.glow,
            {
              backgroundColor: color,
              opacity: glowAnim,
              transform: [{ scale: size === "large" ? 1 : 0.8 }],
            },
          ]}
        />
      )}
      <Animated.View
        style={[
          styles.body,
          {
            backgroundColor: color,
            opacity: mood.opacity,
            transform: [
              { translateY },
              { scale: bounceAnim },
              { scale: progressPulseAnim },
              { scale: mood.scale * sizeScale },
            ],
          },
        ]}
      >
        <View style={styles.bodyTop} />
        <View style={[styles.faceRow, progress >= 100 && styles.faceRowExcited]}>
          <View style={[styles.eye, progress >= 100 && styles.eyeExcited]} />
          <View style={[styles.eye, progress >= 100 && styles.eyeExcited]} />
        </View>
        <View
          style={[
            styles.mouth,
            mood.mouth === "neutral" && styles.mouthNeutral,
            mood.mouth === "happy" && styles.mouthHappy,
            mood.mouth === "sad" && styles.mouthSad,
            mood.mouth === "excited" && styles.mouthExcited,
          ]}
        />
      </Animated.View>
      <Text style={styles.name}>Drippy</Text>
      <Text style={styles.status}>{mood.status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  glow: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
  },
  body: {
    width: 126,
    height: 132,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "flex-start",
    shadowColor: "#1D3B6A",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 8 },
  },
  bodyTop: {
    width: 72,
    height: 28,
    borderRadius: 18,
    marginTop: 18,
    backgroundColor: "rgba(255,255,255,0.35)",
  },
  faceRow: {
    marginTop: 22,
    flexDirection: "row",
    gap: 24,
  },
  faceRowExcited: {
    marginTop: 19,
    gap: 20,
  },
  eye: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#163B67",
  },
  eyeExcited: {
    width: 15,
    height: 15,
    borderRadius: 8,
  },
  mouth: {
    width: 34,
    height: 12,
    marginTop: 14,
    borderBottomWidth: 4,
    borderColor: "#163B67",
  },
  mouthNeutral: {
    borderRadius: 0,
    borderBottomWidth: 3,
    height: 1,
  },
  mouthHappy: {
    borderRadius: 16,
    borderBottomWidth: 4,
    height: 12,
  },
  mouthSad: {
    borderRadius: 16,
    borderBottomWidth: 0,
    borderTopWidth: 4,
    height: 12,
  },
  mouthExcited: {
    width: 28,
    height: 14,
    borderRadius: 7,
    borderBottomWidth: 0,
    borderTopWidth: 0,
    backgroundColor: "#163B67",
  },
  name: {
    marginTop: 8,
    color: "#1D3B6A",
    fontWeight: "700",
    fontSize: 20,
  },
  status: {
    marginTop: 4,
    color: "#355C7D",
    fontWeight: "500",
    fontSize: 13,
  },
});

