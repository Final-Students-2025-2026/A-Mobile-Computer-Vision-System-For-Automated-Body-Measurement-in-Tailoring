import { Stack } from "expo-router";
import React from "react";
import { AuthProvider } from "./context/AuthContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="splash_screen" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="client" />
        <Stack.Screen name="measurements" />
        <Stack.Screen name="newClient" />
      </Stack>
    </AuthProvider>
  );
}
