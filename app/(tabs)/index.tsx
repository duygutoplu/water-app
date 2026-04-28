import { StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>💧</Text>
      <Text style={styles.title}>Water Tracker</Text>
      <Text style={styles.subtitle}>
        Track your daily water intake and stay hydrated.
      </Text>
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
  },
});