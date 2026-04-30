import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PreferredUnit, useProfile } from "@/context/ProfileContext";

type MeasurementSystem = "metric" | "imperial";

function feetInchesToCm(feet: number, inches: number): number {
  const totalInches = feet * 12 + inches;
  return totalInches * 2.54;
}

function lbsToKg(lbs: number): number {
  return lbs * 0.45359237;
}

export default function OnboardingScreen() {
  const { saveProfile } = useProfile();
  const [age, setAge] = useState("");
  const [measurementSystem, setMeasurementSystem] = useState<MeasurementSystem>("metric");
  const [heightCmInput, setHeightCmInput] = useState("");
  const [heightFtInput, setHeightFtInput] = useState("");
  const [heightInInput, setHeightInInput] = useState("");
  const [weightKgInput, setWeightKgInput] = useState("");
  const [weightLbInput, setWeightLbInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const preferredWaterUnit: PreferredUnit = measurementSystem === "imperial" ? "oz" : "ml";

  const canContinue = useMemo(() => {
    const ageValue = Number(age);
    if (!ageValue || isSaving) {
      return false;
    }

    if (measurementSystem === "metric") {
      return Boolean(Number(heightCmInput) && Number(weightKgInput));
    }

    return Boolean(Number(heightFtInput) && Number(weightLbInput));
  }, [
    age,
    heightCmInput,
    heightFtInput,
    isSaving,
    measurementSystem,
    weightKgInput,
    weightLbInput,
  ]);

  const onContinue = async () => {
    if (!canContinue) {
      alert("Please fill in age, height, and weight.");
      return;
    }

    const ageValue = Number(age);
    const heightCm =
      measurementSystem === "metric"
        ? Number(heightCmInput)
        : feetInchesToCm(Number(heightFtInput), Number(heightInInput || "0"));
    const weightKg =
      measurementSystem === "metric" ? Number(weightKgInput) : lbsToKg(Number(weightLbInput));

    if (!ageValue || !heightCm || !weightKg) {
      alert("Please enter valid numbers.");
      return;
    }

    setIsSaving(true);
    const isSuccess = await saveProfile({
      age: ageValue,
      heightCm: Number(heightCm.toFixed(2)),
      weightKg: Number(weightKg.toFixed(2)),
      preferredWaterUnit,
    });
    setIsSaving(false);

    if (!isSuccess) {
      alert("Could not save profile now. Please try again.");
      return;
    }

    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.title}>Start Your Pixel Water Quest</Text>
            <Text style={styles.subtitle}>Set up your hero stats to personalize hydration.</Text>

            <View style={styles.card}>
              <Text style={styles.label}>Measurement System</Text>
              <View style={styles.unitRow}>
                <TouchableOpacity
                  style={[
                    styles.unitButton,
                    measurementSystem === "metric" && styles.unitButtonActive,
                  ]}
                  onPress={() => setMeasurementSystem("metric")}
                >
                  <Text style={styles.unitText}>Metric</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.unitButton,
                    measurementSystem === "imperial" && styles.unitButtonActive,
                  ]}
                  onPress={() => setMeasurementSystem("imperial")}
                >
                  <Text style={styles.unitText}>Imperial</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.helperText}>
                {measurementSystem === "metric"
                  ? "Height in cm, weight in kg, water in ml"
                  : "Height in ft/in, weight in lb, water in oz"}
              </Text>

              <Text style={styles.label}>Age</Text>
              <TextInput
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
                placeholder="Example: 24"
                style={styles.input}
                returnKeyType="done"
              />

              {measurementSystem === "metric" ? (
                <>
                  <Text style={styles.label}>Height (cm)</Text>
                  <TextInput
                    value={heightCmInput}
                    onChangeText={setHeightCmInput}
                    keyboardType="numeric"
                    placeholder="Example: 170"
                    style={styles.input}
                    returnKeyType="done"
                  />

                  <Text style={styles.label}>Weight (kg)</Text>
                  <TextInput
                    value={weightKgInput}
                    onChangeText={setWeightKgInput}
                    keyboardType="numeric"
                    placeholder="Example: 62"
                    style={styles.input}
                    returnKeyType="done"
                  />
                </>
              ) : (
                <>
                  <Text style={styles.label}>Height</Text>
                  <View style={styles.imperialHeightRow}>
                    <TextInput
                      value={heightFtInput}
                      onChangeText={setHeightFtInput}
                      keyboardType="numeric"
                      placeholder="ft"
                      style={[styles.input, styles.halfInput]}
                      returnKeyType="done"
                    />
                    <TextInput
                      value={heightInInput}
                      onChangeText={setHeightInInput}
                      keyboardType="numeric"
                      placeholder="in"
                      style={[styles.input, styles.halfInput]}
                      returnKeyType="done"
                    />
                  </View>

                  <Text style={styles.label}>Weight (lb)</Text>
                  <TextInput
                    value={weightLbInput}
                    onChangeText={setWeightLbInput}
                    keyboardType="numeric"
                    placeholder="Example: 145"
                    style={styles.input}
                    returnKeyType="done"
                  />
                </>
              )}

              <Text style={styles.label}>Water Unit</Text>
              <View style={styles.lockedUnitBox}>
                <Text style={styles.lockedUnitText}>
                  {preferredWaterUnit.toUpperCase()} (based on {measurementSystem})
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.startButton, !canContinue && styles.startButtonDisabled]}
                onPress={onContinue}
              >
                <Text style={styles.startButtonText}>
                  {isSaving ? "Saving..." : "Start Quest"}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#EAF7FF",
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 22,
    paddingBottom: 40,
  },
  title: {
    fontSize: 30,
    fontWeight: "900",
    color: "#1C4E80",
    textAlign: "center",
    marginTop: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "#4A6FA5",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 20,
    shadowColor: "#1C4E80",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderWidth: 3,
    borderColor: "#1C4E80",
    borderRadius: 8,
    padding: 16,
    gap: 8,
  },
  label: {
    color: "#1C4E80",
    fontWeight: "700",
    marginTop: 8,
  },
  input: {
    backgroundColor: "#F2FBFF",
    borderWidth: 2,
    borderColor: "#8CD5FF",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  unitRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 6,
  },
  unitButton: {
    flex: 1,
    borderWidth: 2,
    borderColor: "#1C4E80",
    backgroundColor: "#FFFFFF",
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  unitButtonActive: {
    backgroundColor: "#8CD5FF",
  },
  unitText: {
    color: "#1C4E80",
    fontWeight: "900",
    textTransform: "uppercase",
  },
  helperText: {
    color: "#4A6FA5",
    marginTop: 8,
  },
  imperialHeightRow: {
    flexDirection: "row",
    gap: 10,
  },
  halfInput: {
    flex: 1,
  },
  lockedUnitBox: {
    marginTop: 6,
    borderWidth: 2,
    borderColor: "#8CD5FF",
    borderRadius: 8,
    backgroundColor: "#F2FBFF",
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  lockedUnitText: {
    color: "#1C4E80",
    fontWeight: "700",
  },
  startButton: {
    backgroundColor: "#1C4E80",
    borderRadius: 8,
    paddingVertical: 14,
    marginTop: 18,
  },
  startButtonDisabled: {
    opacity: 0.6,
  },
  startButtonText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "900",
    fontSize: 17,
  },
});

