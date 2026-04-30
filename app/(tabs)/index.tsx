import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import {
  Animated,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { useProfile } from "@/context/ProfileContext";
import {
  BUTTON_GRADIENT,
  CARD_GRADIENT,
  DRIPPY_COLOR_MAP,
} from "@/constants/drippy-theme";
import { mlToOz } from "@/utils/conversion";
import Drippy from "../../components/Drippy";

type WaterItem = {
  id: number;
  amount: number;
  date: string;
};

type DrinkOption = {
  key: string;
  label: string;
  amountMl: number;
};

const API_URL = "http://192.168.0.138:8080";
const DRINK_OPTIONS: DrinkOption[] = [
  { key: "glass", label: "Glass", amountMl: 250 },
  { key: "bottle", label: "Bottle", amountMl: 500 },
  { key: "mug", label: "Mug", amountMl: 330 },
];

export default function HomeScreen() {
  const { profile, drippyColor, isLoading } = useProfile();
  const insets = useSafeAreaInsets();
  const [waterList, setWaterList] = useState<WaterItem[]>([]);
  const [total, setTotal] = useState(0);
  const [progress, setProgress] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(2000);
  const [drinkAnimationTick, setDrinkAnimationTick] = useState(0);
  const [drinkFeedback, setDrinkFeedback] = useState("");
  const feedbackOpacity = useRef(new Animated.Value(0)).current;
  const waterLevelAnim = useRef(new Animated.Value(0.1)).current;

  const fetchData = async () => {
    try {
      const waterResponse = await fetch(`${API_URL}/water`);
      const waterData = await waterResponse.json();

      const totalResponse = await fetch(`${API_URL}/water/total`);
      const totalData = await totalResponse.json();

      const progressResponse = await fetch(`${API_URL}/water/progress`);
      const progressData = await progressResponse.json();

      const goalResponse = await fetch(`${API_URL}/goal`);
      const goalData = await goalResponse.json();

      setWaterList(waterData);
      setTotal(totalData);
      setProgress(progressData);
      setDailyGoal(goalData);
    } catch (error) {
      console.log(error);
    }
  };

  const addWater = async (amountMl: number) => {
    try {
      await fetch(`${API_URL}/water`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amountMl,
          date: new Date().toISOString().slice(0, 10),
        }),
      });

      setDrinkAnimationTick((prev) => prev + 1);
      setDrinkFeedback(`+${toDisplayAmount(amountMl)}`);
      feedbackOpacity.setValue(1);
      Animated.timing(feedbackOpacity, {
        toValue: 0,
        duration: 900,
        useNativeDriver: true,
      }).start();
      fetchData();
    } catch (error) {
      console.log(error);
    }
  };

  const resetDay = async () => {
    try {
      await fetch(`${API_URL}/water`, {
        method: "DELETE",
      });

      fetchData();
    } catch (error) {
      console.log(error);
    }
  };

  const deleteWaterRecord = async (id: number) => {
    try {
      await fetch(`${API_URL}/water/${id}`, {
        method: "DELETE",
      });

      fetchData();
    } catch (error) {
      console.log(error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (!isLoading && !profile) {
        router.replace("/onboarding");
        return;
      }

      fetchData();
    }, [isLoading, profile])
  );

  const unit = profile?.preferredWaterUnit ?? "ml";
  const drippyTint = DRIPPY_COLOR_MAP[drippyColor];
  const toDisplayAmount = (amountMl: number) =>
    unit === "oz" ? `${mlToOz(amountMl).toFixed(1)} oz` : `${amountMl} ml`;
  const remaining = Math.max(dailyGoal - total, 0);
  const progressWidth = Math.min(progress, 100);
  const waterLevelPercent = Math.max(progressWidth, 7);

  useEffect(() => {
    Animated.timing(waterLevelAnim, {
      toValue: waterLevelPercent / 100,
      duration: 650,
      useNativeDriver: false,
    }).start();
  }, [waterLevelAnim, waterLevelPercent]);

  const waterHeight = waterLevelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={["#EFFFFF", "#CFEFFF", "#7ABDE9"]}
        locations={[0, 0.45, 1]}
        style={styles.container}
      >
        <Animated.View style={[styles.waterLayerWrap, { height: waterHeight }]}>
          <LinearGradient
            colors={["rgba(120,202,247,0.16)", "rgba(86,179,235,0.28)", "rgba(50,141,210,0.42)"]}
            locations={[0, 0.55, 1]}
            style={styles.waterLayer}
          />
        </Animated.View>
        <Animated.View style={[styles.waterFoamWrap, { height: waterHeight }]}>
          <LinearGradient
            colors={["rgba(255,255,255,0.26)", "rgba(255,255,255,0.10)", "rgba(255,255,255,0)"]}
            style={styles.waterFoam}
          />
        </Animated.View>

        <FlatList
          data={waterList}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 90 },
          ]}
          ListHeaderComponent={
            <>
              <Text style={styles.header}>Pixel Water Quest</Text>
              <Text style={styles.subtitle}>Daily quest: help Drippy hit hydration level 100</Text>

              <View style={styles.mascotArea}>
                {drinkFeedback ? (
                  <Animated.Text style={[styles.drinkFeedback, { opacity: feedbackOpacity }]}>
                    {drinkFeedback}
                  </Animated.Text>
                ) : null}
                <Drippy
                  progress={progress}
                  color={drippyTint}
                  size="large"
                  bounceTrigger={drinkAnimationTick}
                />
              </View>

              <LinearGradient colors={CARD_GRADIENT} style={styles.progressPill}>
                <Text style={styles.cardTitle}>Hydration Level</Text>
                <Text style={styles.percentText}>{progressWidth.toFixed(0)}%</Text>

                <Text style={styles.bigText}>
                  {toDisplayAmount(total)} / {toDisplayAmount(dailyGoal)}
                </Text>

                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${progressWidth}%` }]} />
                </View>

                <Text style={styles.remainingText}>
                  {remaining === 0
                    ? "Quest completed"
                    : `${toDisplayAmount(remaining)} left`}
                </Text>
              </LinearGradient>

              <Text style={styles.sectionTitle}>Choose your drink</Text>
              <View style={styles.drinkRow}>
                {DRINK_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.key}
                    style={styles.drinkButton}
                    onPress={() => addWater(option.amountMl)}
                  >
                    <LinearGradient colors={BUTTON_GRADIENT} style={styles.drinkButtonGradient}>
                      <Text style={styles.drinkButtonTitle}>{option.label}</Text>
                      <Text style={styles.drinkButtonAmount}>{toDisplayAmount(option.amountMl)}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={styles.resetButton} onPress={resetDay}>
                <LinearGradient colors={BUTTON_GRADIENT} style={styles.resetButtonGradient}>
                  <Text style={styles.resetButtonText}>Reset Day</Text>
                </LinearGradient>
              </TouchableOpacity>

              <Text style={styles.historyTitle}>Today’s Records</Text>
            </>
          }
          renderItem={({ item }) => (
            <LinearGradient colors={CARD_GRADIENT} style={styles.recordBubble}>
              <View>
                <Text style={styles.recordAmount}>{toDisplayAmount(item.amount)}</Text>
                <Text style={styles.recordDate}>{item.date}</Text>
              </View>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteWaterRecord(item.id)}
              >
                <Text style={styles.deleteButtonText}>Remove</Text>
              </TouchableOpacity>
            </LinearGradient>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>No water added yet.</Text>}
        />
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#EAF7FF",
  },
  container: {
    flex: 1,
  },
  waterLayerWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  waterLayer: {
    flex: 1,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  waterFoamWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  waterFoam: {
    height: 46,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  listContent: {
    padding: 22,
    zIndex: 1,
  },
  header: {
    fontSize: 32,
    fontWeight: "700",
    color: "#153A63",
    textAlign: "center",
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 15,
    color: "#4B6B92",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 18,
    lineHeight: 22,
  },
  mascotArea: {
    alignItems: "center",
    marginBottom: 8,
  },
  drinkFeedback: {
    position: "absolute",
    top: 0,
    color: "#1F5C8F",
    fontWeight: "700",
    fontSize: 16,
    backgroundColor: "rgba(255,255,255,0.82)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  progressPill: {
    borderRadius: 28,
    padding: 20,
    marginBottom: 14,
    shadowColor: "#163B67",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  cardTitle: {
    fontSize: 15,
    color: "#537099",
    marginBottom: 4,
  },
  percentText: {
    fontSize: 34,
    fontWeight: "800",
    color: "#1C4E80",
  },
  bigText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#153A63",
    marginBottom: 10,
  },
  progressBar: {
    height: 14,
    backgroundColor: "#DCEAFE",
    borderRadius: 999,
    overflow: "hidden",
    marginBottom: 12,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#6DA9FF",
    borderRadius: 999,
  },
  remainingText: {
    fontSize: 15,
    color: "#4B6B92",
    fontWeight: "500",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#153A63",
    marginBottom: 12,
  },
  drinkRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  drinkButton: {
    flex: 1,
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: "#244B74",
    shadowOpacity: 0.14,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  drinkButtonGradient: {
    paddingVertical: 13,
    alignItems: "center",
  },
  drinkButtonTitle: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 16,
  },
  drinkButtonAmount: {
    marginTop: 4,
    color: "#E6EEFF",
    fontWeight: "700",
  },
  resetButton: {
    borderRadius: 18,
    overflow: "hidden",
    marginBottom: 18,
    shadowColor: "#244B74",
    shadowOpacity: 0.14,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  resetButtonGradient: {
    padding: 14,
  },
  resetButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center",
  },
  historyTitle: {
    fontSize: 21,
    fontWeight: "700",
    color: "#153A63",
    marginBottom: 12,
  },
  recordBubble: {
    padding: 14,
    borderRadius: 20,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#163B67",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  recordAmount: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1C4E80",
  },
  recordDate: {
    fontSize: 14,
    color: "#4A6FA5",
    marginTop: 2,
  },
  deleteButton: {
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: "rgba(234,241,255,0.96)",
  },
  deleteButtonText: {
    color: "#4A6FA5",
    fontWeight: "600",
  },
  emptyText: {
    textAlign: "center",
    color: "#4A6FA5",
    marginTop: 20,
  },
});