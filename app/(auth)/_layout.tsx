import { Redirect, Stack } from "expo-router";
import { useAuth } from "../../contexts/AuthContext";
import { ActivityIndicator, View } from "react-native";
import { useAppTheme } from "../../contexts/ThemeContext";

export default function AuthLayout() {
  const { user, loading } = useAuth();
  const { theme } = useAppTheme();

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.background,
        }}
      >
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (user) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="forgotPassword" />
    </Stack>
  );
}

