import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Plus, Search } from "lucide-react-native";

const clientsData = [
  { id: "1", name: "Abena Kyei", initials: "AK", measurements: 6 },
  { id: "2", name: "Yaw Mensah", initials: "YM", measurements: 7 },
  { id: "3", name: "Kofi Manu", initials: "KM", measurements: 5 },
];

export default function Clients() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const filtered = clientsData.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <Text style={styles.title}>Clients</Text>

        {/* Search */}
        <View style={styles.searchWrapper}>
          <Search color="#888" size={16} />
          <TextInput
            placeholder="search clients..."
            placeholderTextColor="#888"
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Client List */}
        <View style={styles.list}>
          {filtered.map((client) => (
            <TouchableOpacity
              key={client.id}
              style={styles.clientCard}
              onPress={() => router.push(`/client/${client.id}`)}
            >
              <View style={styles.clientAvatar}>
                <Text style={styles.clientInitials}>{client.initials}</Text>
              </View>
              <View>
                <Text style={styles.clientName}>{client.name}</Text>
                <Text style={styles.clientSub}>
                  {client.measurements} measurements
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Floating + Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/newClient")}
      >
        <Plus color="#1a1a1a" size={24} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1a1a1a" },
  scroll: { padding: 20, paddingBottom: 100 },
  title: { color: "#fff", fontSize: 28, fontWeight: "600", marginBottom: 20 },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#252525",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 24,
    gap: 10,
  },
  searchInput: { flex: 1, color: "#fff", fontSize: 14 },
  list: { gap: 12 },
  clientCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#252525",
    borderRadius: 16,
    padding: 16,
    gap: 14,
  },
  clientAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#3a3a3a",
    alignItems: "center",
    justifyContent: "center",
  },
  clientInitials: { color: "#b8f54a", fontSize: 16, fontWeight: "500" },
  clientName: { color: "#fff", fontSize: 16, fontWeight: "500" },
  clientSub: { color: "#888", fontSize: 13, marginTop: 2 },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 20,
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#b8f54a",
    alignItems: "center",
    justifyContent: "center",
  },
});
