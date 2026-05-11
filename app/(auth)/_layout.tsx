import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="client" />
      <Stack.Screen name="measurements" />
      <Stack.Screen name="newClient" />
    </Stack>
  );
}
