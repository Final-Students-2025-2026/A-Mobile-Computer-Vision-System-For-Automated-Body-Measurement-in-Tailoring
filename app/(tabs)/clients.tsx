import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Plus, Search } from "lucide-react-native";
import { useClients } from "../../hooks/useClients";
import { useAppTheme } from "../context/ThemeContext";

export default function Clients() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const styles = createStyles(theme);
  const { clients, loading } = useClients();
  const [search, setSearch] = useState("");

  const filtered = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <Text style={styles.title}>Clients</Text>

        {/* Search */}
        <View style={styles.searchWrapper}>
          <Search color={theme.muted} size={16} />
          <TextInput
            placeholder="search clients..."
            placeholderTextColor={theme.muted}
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Loading */}
        {loading ? (
          <ActivityIndicator
            color={theme.primary}
            size="large"
            style={{ marginTop: 40 }}
          />
        ) : filtered.length === 0 ? (
          <Text style={styles.emptyText}>
            {search
              ? "No clients match your search"
              : "No clients yet. Add your first one!"}
          </Text>
        ) : (
          /* Client List */
          <View style={styles.list}>
            {filtered.map((client) => (
              <TouchableOpacity
                key={client.id}
                style={styles.clientCard}
                onPress={() => router.push(`/client/${client.id}`)}
              >
                <View style={styles.clientAvatar}>
                  {client.photoURL ? (
                    <Image
                      source={{ uri: client.photoURL }}
                      style={styles.clientPhoto}
                    />
                  ) : (
                    <Text style={styles.clientInitials}>{client.initials}</Text>
                  )}
                </View>
                <View>
                  <Text style={styles.clientName}>{client.name}</Text>
                  <Text style={styles.clientSub}>
                    {client.measurements} measurements · {client.updatedAt}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Floating + Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/newClient")}
      >
        <Plus color={theme.primaryText} size={24} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>["theme"]) =>
  StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  scroll: { padding: 20, paddingBottom: 100 },
  title: { color: theme.text, fontSize: 28, fontWeight: "600", marginBottom: 20 },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 24,
    gap: 10,
  },
  searchInput: { flex: 1, color: theme.text, fontSize: 14 },
  emptyText: {
    color: theme.muted,
    fontSize: 14,
    textAlign: "center",
    marginTop: 60,
  },
  list: { gap: 12 },
  clientCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 16,
    gap: 14,
  },
  clientAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  clientPhoto: { width: "100%", height: "100%" },
  clientInitials: { color: theme.primary, fontSize: 16, fontWeight: "500" },
  clientName: { color: theme.text, fontSize: 16, fontWeight: "500" },
  clientSub: { color: theme.muted, fontSize: 13, marginTop: 2 },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 20,
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: theme.primary,
    alignItems: "center",
    justifyContent: "center",
  },
});
