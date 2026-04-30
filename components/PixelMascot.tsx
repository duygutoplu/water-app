import { StyleSheet, Text, View } from "react-native";

type PixelMascotProps = {
  progress: number;
};

export default function PixelMascot({ progress }: PixelMascotProps) {
  let face = "😴";
  let message = "I need water...";

  if (progress >= 100) {
    face = "👑";
    message = "Hydration hero!";
  } else if (progress >= 75) {
    face = "😄";
    message = "Almost there!";
  } else if (progress >= 50) {
    face = "🙂";
    message = "Feeling better!";
  } else if (progress >= 25) {
    face = "🥺";
    message = "Keep going!";
  }

  return (
    <View style={styles.card}>
      <Text style={styles.zone}>Hydration Hero Zone</Text>
      <Text style={styles.drop}>💧</Text>
      <Text style={styles.face}>{face}</Text>
      <Text style={styles.name}>Drippy</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    backgroundColor: "#BDEBFF",
    borderWidth: 3,
    borderColor: "#1C4E80",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    paddingVertical: 12,
  },
  zone: {
    color: "#1C4E80",
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 4,
  },
  drop: {
    fontSize: 42,
  },
  face: {
    fontSize: 34,
    marginTop: -6,
  },
  name: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1C4E80",
    marginTop: 6,
  },
  message: {
    fontSize: 14,
    color: "#355C7D",
    marginTop: 4,
  },
});