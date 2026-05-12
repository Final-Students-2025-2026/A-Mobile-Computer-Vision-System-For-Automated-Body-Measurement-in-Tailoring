import { Redirect, Stack } from "expo-router";
import { useAuth } from "../context/AuthContext";

export default function PublicLayout() {
  const { user, loading } = useAuth();

  if (!loading && user) {
    return <Redirect href="/(tabs)/clients" />;
  }

  return <Stack />;
}
