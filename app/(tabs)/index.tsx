import { useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function HomeScreen() {
  const [waterList, setWaterList] = useState([]);

  const fetchWater = async () => {
    try {
      const response = await fetch("http://192.168.0.138:8080/water");
      const data = await response.json();
      setWaterList(data);
    } catch (error) {
      console.log(error);
    }
  };

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

      fetchWater();
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchWater();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>💧 Water Tracker</Text>

      <TouchableOpacity style={styles.button} onPress={addWater}>
        <Text style={styles.buttonText}>Add 250ml</Text>
      </TouchableOpacity>

      <FlatList
        data={waterList}
        keyExtractor={(item: any) => item.id.toString()}
        renderItem={({ item }: any) => (
          <Text style={styles.item}>
            {item.amount} ml - {item.date}
          </Text>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#EAF7FF",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#1C4E80",
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    textAlign: "center",
  },
  item: {
    fontSize: 16,
    padding: 10,
    backgroundColor: "white",
    marginBottom: 8,
    borderRadius: 8,
  },
});