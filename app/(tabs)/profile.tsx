import { useState } from "react";
import {
    Keyboard,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const API_URL = "http://192.168.0.138:8080";

export default function ProfileScreen() {
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [activityLevel, setActivityLevel] = useState("medium");
  const [dailyGoal, setDailyGoal] = useState<number | null>(null);

  const calculateGoal = async () => {
    Keyboard.dismiss();

    const weightNumber = Number(weight);

    if (!weightNumber) {
      alert("Please enter your weight");
      return;
    }

    let calculatedGoal = weightNumber * 35;

    if (activityLevel === "medium") {
      calculatedGoal += 300;
    }

    if (activityLevel === "high") {
      calculatedGoal += 500;
    }

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
    <View style={styles.container}>
      <Text style={styles.header}>Your Hydration Setup</Text>
      <Text style={styles.subtitle}>
        Enter your info and Drippy will calculate your daily water goal.
      </Text>

      <View style={styles.card}>
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
          <Text style={styles.calculateText}>Calculate My Goal</Text>
        </TouchableOpacity>

        {dailyGoal !== null && (
          <View style={styles.resultBox}>
            <Text style={styles.resultTitle}>Your daily goal</Text>
            <Text style={styles.resultValue}>{dailyGoal} ml</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EAF7FF",
    padding: 22,
  },
  header: {
    fontSize: 28,
    fontWeight: "900",
    color: "#1C4E80",
    marginTop: 20,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "#4A6FA5",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 22,
    lineHeight: 22,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 20,
    borderWidth: 3,
    borderColor: "#BDEBFF",
  },
  label: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1C4E80",
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: "#F4FBFF",
    borderWidth: 2,
    borderColor: "#BDEBFF",
    borderRadius: 14,
    padding: 14,
    fontSize: 16,
  },
  activityRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  activityButton: {
    flex: 1,
    backgroundColor: "#F4FBFF",
    borderWidth: 2,
    borderColor: "#BDEBFF",
    padding: 12,
    borderRadius: 14,
    alignItems: "center",
  },
  activeButton: {
    backgroundColor: "#BDEBFF",
    borderColor: "#1C4E80",
  },
  activityText: {
    fontWeight: "800",
    color: "#1C4E80",
  },
  calculateButton: {
    backgroundColor: "#1C4E80",
    padding: 16,
    borderRadius: 18,
    marginTop: 22,
  },
  calculateText: {
    color: "white",
    fontSize: 17,
    fontWeight: "800",
    textAlign: "center",
  },
  resultBox: {
    backgroundColor: "#EAF7FF",
    borderRadius: 18,
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