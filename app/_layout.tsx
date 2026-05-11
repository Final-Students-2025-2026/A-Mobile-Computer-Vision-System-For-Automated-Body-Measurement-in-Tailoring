import { Stack } from "expo-router";
import React from "react";
import { AuthProvider } from "./context/AuthContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack
        screenOptions={{ headerShown: false }}
        initialRouteName="splash_screen"
      >
        <Stack.Screen name="splash_screen" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </AuthProvider>
  );
}
