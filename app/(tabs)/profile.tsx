import { useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import {
    Keyboard,
  ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import Drippy from "@/components/Drippy";
import { PreferredUnit, useProfile } from "@/context/ProfileContext";
import {
  APP_GRADIENT,
  BUTTON_GRADIENT,
  CARD_GRADIENT,
  DRIPPY_COLOR_MAP,
  DRIPPY_COLOR_OPTIONS,
} from "@/constants/drippy-theme";

const API_URL = "http://192.168.0.138:8080";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { profile, saveProfile, drippyColor, setDrippyColor } = useProfile();
  const [age, setAge] = useState(profile ? String(profile.age) : "");
  const [weight, setWeight] = useState(profile ? String(profile.weightKg) : "");
  const [height, setHeight] = useState(profile ? String(profile.heightCm) : "");
  const [preferredUnit, setPreferredUnit] = useState<PreferredUnit>(
    profile?.preferredWaterUnit ?? "ml"
  );
  const [activityLevel, setActivityLevel] = useState("medium");
  const [dailyGoal, setDailyGoal] = useState<number | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const getAgeFactor = (ageValue: number) => {
    if (ageValue < 30) {
      return 1.0;
    }
    if (ageValue <= 55) {
      return 0.95;
    }
    return 0.9;
  };

  const getActivityFactor = (activity: string) => {
    if (activity === "low") {
      return 0.9;
    }
    if (activity === "high") {
      return 1.2;
    }
    return 1.0;
  };

  const validateProfileInputs = () => {
    const ageNumber = Number(age);
    const heightNumber = Number(height);
    const weightNumber = Number(weight);

    if (!ageNumber || !heightNumber || !weightNumber) {
      return "Please enter age, weight, and height.";
    }

    if (ageNumber < 10 || ageNumber > 100) {
      return "Age should be between 10 and 100.";
    }

    if (weightNumber < 30 || weightNumber > 200) {
      return "Weight should be between 30 and 200 kg.";
    }

    if (heightNumber < 120 || heightNumber > 220) {
      return "Height should be between 120 and 220 cm.";
    }

    return null;
  };

  const saveProfileDetails = async () => {
    Keyboard.dismiss();

    const ageNumber = Number(age);
    const heightNumber = Number(height);
    const weightNumber = Number(weight);
    const validationError = validateProfileInputs();

    if (validationError) {
      alert(validationError);
      return;
    }

    setIsSavingProfile(true);
    const isSuccess = await saveProfile({
      age: ageNumber,
      heightCm: heightNumber,
      weightKg: weightNumber,
      preferredWaterUnit: preferredUnit,
    });
    setIsSavingProfile(false);

    if (!isSuccess) {
      alert("Could not update profile");
      return;
    }

    alert("Profile updated");
  };

  const calculateGoal = async () => {
    Keyboard.dismiss();

    // Always read from the current input values when user taps calculate.
    const ageNumber = Number(age.trim());
    const weightNumber = Number(weight.trim());
    const validationError = validateProfileInputs();

    if (validationError) {
      alert(validationError);
      return;
    }

    const ageFactor = getAgeFactor(ageNumber);
    const activityFactor = getActivityFactor(activityLevel);

    const calculatedGoal = Math.round(weightNumber * 35 * ageFactor * activityFactor);

    setDailyGoal(calculatedGoal);

    try {
      await fetch(`${API_URL}/goal?goal=${calculatedGoal}`, {
        method: "POST",
      });

      alert("Daily goal updated 💧");
    } catch (error) {
      console.log(error);
      alert("Could not update goal");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={APP_GRADIENT} style={styles.container}>
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 90 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.header}>Your Hydration Setup</Text>
          <Text style={styles.subtitle}>
            Save your profile and calculate a smarter daily water goal.
          </Text>

          <LinearGradient colors={CARD_GRADIENT} style={styles.drippyCard}>
            <Text style={styles.drippyTitle}>Your Drippy Companion</Text>
            <Drippy progress={50} color={DRIPPY_COLOR_MAP[drippyColor]} size="small" />
            <View style={styles.colorRow}>
              {DRIPPY_COLOR_OPTIONS.map((option) => (
                <View key={option.key} style={styles.colorOption}>
                  <TouchableOpacity
                    onPress={() => setDrippyColor(option.key)}
                    style={[
                      styles.colorChip,
                      { backgroundColor: option.hex },
                      drippyColor === option.key && styles.activeColorChip,
                    ]}
                  />
                  <Text style={styles.colorOptionText}>{option.label}</Text>
                </View>
              ))}
            </View>
          </LinearGradient>

          <LinearGradient colors={CARD_GRADIENT} style={styles.card}>
          <Text style={styles.label}>Age</Text>
          <TextInput
            style={styles.input}
            placeholder="Example: 24"
            keyboardType="numeric"
            value={age}
            onChangeText={setAge}
            returnKeyType="done"
          />

          <Text style={styles.label}>Weight (kg)</Text>
          <TextInput
            style={styles.input}
            placeholder="Example: 60"
            keyboardType="numeric"
            value={weight}
            onChangeText={setWeight}
            returnKeyType="done"
          />

          <Text style={styles.label}>Height (cm)</Text>
          <TextInput
            style={styles.input}
            placeholder="Example: 165"
            keyboardType="numeric"
            value={height}
            onChangeText={setHeight}
            returnKeyType="done"
          />

          <Text style={styles.label}>Preferred Unit</Text>
          <View style={styles.activityRow}>
            <TouchableOpacity
              style={[
                styles.activityButton,
                preferredUnit === "ml" && styles.activeButton,
              ]}
              onPress={() => setPreferredUnit("ml")}
            >
              <Text style={styles.activityText}>ml</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.activityButton,
                preferredUnit === "oz" && styles.activeButton,
              ]}
              onPress={() => setPreferredUnit("oz")}
            >
              <Text style={styles.activityText}>oz</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={saveProfileDetails}>
            <LinearGradient colors={BUTTON_GRADIENT} style={styles.actionButtonGradient}>
              <Text style={styles.calculateText}>{isSavingProfile ? "Saving..." : "Save Profile"}</Text>
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.label}>Activity Level</Text>

          <View style={styles.activityRow}>
            <TouchableOpacity
              style={[
                styles.activityButton,
                activityLevel === "low" && styles.activeButton,
              ]}
              onPress={() => setActivityLevel("low")}
            >
              <Text style={styles.activityText}>Low</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.activityButton,
                activityLevel === "medium" && styles.activeButton,
              ]}
              onPress={() => setActivityLevel("medium")}
            >
              <Text style={styles.activityText}>Medium</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.activityButton,
                activityLevel === "high" && styles.activeButton,
              ]}
              onPress={() => setActivityLevel("high")}
            >
              <Text style={styles.activityText}>High</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.calculateButton} onPress={calculateGoal}>
            <LinearGradient colors={BUTTON_GRADIENT} style={styles.actionButtonGradient}>
              <Text style={styles.calculateText}>Calculate My Goal</Text>
            </LinearGradient>
          </TouchableOpacity>

          {dailyGoal !== null && (
            <View style={styles.resultBox}>
              <Text style={styles.resultTitle}>Your daily goal</Text>
              <Text style={styles.resultValue}>{dailyGoal} ml</Text>
            </View>
          )}
          </LinearGradient>
        </ScrollView>
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
  scrollContent: {
    padding: 22,
  },
  drippyCard: {
    borderRadius: 22,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#163B67",
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  drippyTitle: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "800",
    color: "#1C4E80",
    marginBottom: 8,
  },
  colorRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginTop: 10,
    flexWrap: "wrap",
  },
  colorOption: {
    alignItems: "center",
  },
  colorChip: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  activeColorChip: {
    borderColor: "#1C4E80",
    borderWidth: 3,
  },
  colorOptionText: {
    marginTop: 4,
    fontSize: 11,
    color: "#4A6FA5",
    fontWeight: "600",
  },
  header: {
    fontSize: 31,
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
    marginBottom: 22,
    lineHeight: 22,
  },
  card: {
    borderRadius: 22,
    padding: 20,
    shadowColor: "#163B67",
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#33557E",
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: "#F2F7FF",
    borderRadius: 16,
    padding: 14,
    fontSize: 16,
    color: "#153A63",
  },
  activityRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  activityButton: {
    flex: 1,
    backgroundColor: "#F2F7FF",
    padding: 12,
    borderRadius: 16,
    alignItems: "center",
  },
  activeButton: {
    backgroundColor: "#D9E9FF",
  },
  activityText: {
    fontWeight: "800",
    color: "#1C4E80",
  },
  calculateButton: {
    borderRadius: 20,
    marginTop: 22,
    overflow: "hidden",
    shadowColor: "#244B74",
    shadowOpacity: 0.14,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  saveButton: {
    borderRadius: 20,
    marginTop: 16,
    overflow: "hidden",
    shadowColor: "#244B74",
    shadowOpacity: 0.14,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  actionButtonGradient: {
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  calculateText: {
    color: "white",
    fontSize: 17,
    fontWeight: "800",
    textAlign: "center",
  },
  resultBox: {
    backgroundColor: "#EAF1FF",
    borderRadius: 16,
    padding: 16,
    marginTop: 18,
    alignItems: "center",
  },
  resultTitle: {
    color: "#4A6FA5",
    fontWeight: "700",
  },
  resultValue: {
    color: "#1C4E80",
    fontSize: 28,
    fontWeight: "900",
    marginTop: 4,
  },
});