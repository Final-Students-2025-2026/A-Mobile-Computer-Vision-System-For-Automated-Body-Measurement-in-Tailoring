import { Stack } from "expo-router";
import React, { useEffect } from "react";
import { AuthProvider } from "../contexts/AuthContext";
import { ThemeProvider } from "../contexts/ThemeContext";
import { setupMediaPipe } from "../services/mediaPipeAdapter";

export default function RootLayout() {

  return (
    <ThemeProvider>
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
          <Stack.Screen name="bodyInfo" />
        </Stack>
      </AuthProvider>
    </ThemeProvider>
  );
}
