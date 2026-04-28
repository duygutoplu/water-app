import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function HomeScreen() {
  const addWater = async () => {
    try {
      await fetch("http://192.168.0.138:8080/water", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: 250,
          date: "2026-04-28",
        }),
      });

      alert("Water added 💧");
    } catch (error) {
      console.log(error);
      alert("Error connecting to backend");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>💧</Text>
      <Text style={styles.title}>Water Tracker</Text>
      <Text style={styles.subtitle}>
        Track your daily water intake and stay hydrated.
      </Text>

      <TouchableOpacity style={styles.button} onPress={addWater}>
        <Text style={styles.buttonText}>Add 250ml</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EAF7FF",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  emoji: {
    fontSize: 72,
    marginBottom: 16,
  },
  title: {
    fontSize: 34,
    fontWeight: "700",
    color: "#1C4E80",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: "#4A6FA5",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 28,
  },
  button: {
    backgroundColor: "#1C4E80",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 16,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
  },
});