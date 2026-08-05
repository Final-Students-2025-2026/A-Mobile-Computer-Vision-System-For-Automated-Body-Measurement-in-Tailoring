import { Redirect, Tabs } from "expo-router";
import React from "react";
import { ActivityIndicator, View } from "react-native";
import { Home, Users, Send, Shirt } from "lucide-react-native";
import { useAuth } from "../../contexts/AuthContext";
import { useAppTheme } from "../../contexts/ThemeContext";

export default function TabsLayout() {
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

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.background,
          borderTopColor: theme.border,
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.muted,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <Home color={color} size={22} />,
        }}
      />
      <Tabs.Screen
        name="clients"
        options={{
          title: "Profiles",
          tabBarIcon: ({ color }) => <Users color={color} size={22} />,
        }}
      />
      <Tabs.Screen
        name="sendToTailor"
        options={{
          title: "Send",
          tabBarIcon: ({ color }) => <Send color={color} size={22} />,
        }}
      />
      <Tabs.Screen
        name="shopByFit"
        options={{
          title: "Shop",
          tabBarIcon: ({ color }) => <Shirt color={color} size={22} />,
        }}
      />
    </Tabs>
  );
}

