import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function Clients() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Clients coming soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a1a",
    alignItems: "center",
    justifyContent: "center",
  },
  text: { color: "#fff", fontSize: 16 },
});
