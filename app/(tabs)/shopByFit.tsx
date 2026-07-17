import React from "react";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "../context/ThemeContext";

export default function ShopByFit() {
  const { theme } = useAppTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: theme.text, fontSize: 16 }}>Shop by Fit</Text>
        <Text style={{ color: theme.muted, fontSize: 13, marginTop: 8 }}>Coming soon</Text>
      </View>
    </SafeAreaView>
  );
}