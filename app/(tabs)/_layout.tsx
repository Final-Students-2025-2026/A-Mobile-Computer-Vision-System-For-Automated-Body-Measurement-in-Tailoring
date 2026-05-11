import { Tabs } from "expo-router";
import React from "react";
import { Home, Users } from "lucide-react-native";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: "#1a1a1a", borderTopColor: "#333" },
        tabBarActiveTintColor: "#b8f54a",
        tabBarInactiveTintColor: "#888",
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
          title: "Clients",
          tabBarIcon: ({ color }) => <Users color={color} size={22} />,
        }}
      />
    </Tabs>
  );
}