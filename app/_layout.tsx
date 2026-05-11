import { Stack } from "expo-router";
import React from "react";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{ headerShown: false }}
      initialRouteName="splash_screen"
    >
      <Stack.Screen name="splash_screen" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="client" />
      <Stack.Screen name="measurements" />
      <Stack.Screen name="newClient" />
    </Stack>
  );
}
