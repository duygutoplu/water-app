import { useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import PixelMascot from "../../components/PixelMascot";

type WaterItem = {
  id: number;
  amount: number;
  date: string;
};

const API_URL = "http://192.168.0.138:8080";

export default function HomeScreen() {
  const [waterList, setWaterList] = useState<WaterItem[]>([]);
  const [total, setTotal] = useState(0);
  const [progress, setProgress] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(2000);

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

  const addWater = async () => {
    try {
      await fetch(`${API_URL}/water`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: 250,
          date: "2026-04-29",
        }),
      });

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

  useEffect(() => {
    fetchData();
  }, []);

  const remaining = Math.max(dailyGoal - total, 0);
  const progressWidth = Math.min(progress, 100);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Pixel Water Quest</Text>
      <Text style={styles.subtitle}>Help Drippy stay hydrated 💧</Text>

      <PixelMascot progress={progress} />

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Today’s Progress</Text>

        <Text style={styles.bigText}>
          {total} ml / {dailyGoal} ml
        </Text>

        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progressWidth}%` }]} />
        </View>

        <Text style={styles.remainingText}>
          {remaining === 0 ? "Goal completed 👑" : `${remaining} ml left`}
        </Text>
      </View>

      <TouchableOpacity style={styles.addButton} onPress={addWater}>
        <Text style={styles.buttonText}>+ Add 250ml</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.resetButton} onPress={resetDay}>
        <Text style={styles.resetButtonText}>Reset Day</Text>
      </TouchableOpacity>

      <Text style={styles.historyTitle}>Today’s Records</Text>

      <FlatList
        data={waterList}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.recordItem}>
            <Text style={styles.recordAmount}>{item.amount} ml</Text>
            <Text style={styles.recordDate}>{item.date}</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No water added yet.</Text>
        }
      />
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
    fontSize: 30,
    fontWeight: "900",
    color: "#1C4E80",
    marginTop: 20,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "#4A6FA5",
    textAlign: "center",
    marginBottom: 18,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 20,
    marginBottom: 18,
    borderWidth: 3,
    borderColor: "#BDEBFF",
  },
  cardTitle: {
    fontSize: 16,
    color: "#4A6FA5",
    marginBottom: 8,
  },
  bigText: {
    fontSize: 28,
    fontWeight: "900",
    color: "#1C4E80",
    marginBottom: 14,
  },
  progressBar: {
    height: 18,
    backgroundColor: "#D6F2FF",
    borderRadius: 999,
    overflow: "hidden",
    marginBottom: 10,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#1C4E80",
    borderRadius: 999,
  },
  remainingText: {
    fontSize: 15,
    color: "#355C7D",
    fontWeight: "600",
  },
  addButton: {
    backgroundColor: "#1C4E80",
    padding: 16,
    borderRadius: 18,
    marginBottom: 10,
  },
  resetButton: {
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#1C4E80",
    marginBottom: 18,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
  },
  resetButtonText: {
    color: "#1C4E80",
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center",
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1C4E80",
    marginBottom: 10,
  },
  recordItem: {
    backgroundColor: "white",
    padding: 14,
    borderRadius: 14,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  recordAmount: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1C4E80",
  },
  recordDate: {
    fontSize: 14,
    color: "#4A6FA5",
  },
  emptyText: {
    textAlign: "center",
    color: "#4A6FA5",
    marginTop: 20,
  },
});