import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Plus, Ruler } from "lucide-react-native";
import { useAuth } from "../../hooks/useAuth";
import { useClients } from "../../hooks/useClients";

function getUserName(user: ReturnType<typeof useAuth>["user"]) {
  return user?.displayName || user?.email?.split("@")[0] || "there";
}

function getInitials(user: ReturnType<typeof useAuth>["user"]) {
  return getUserName(user)
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function Dashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const {
    clients,
    loading: clientsLoading,
    totalClients,
    totalThisMonth,
    totalMeasurements,
    recentClients,
  } = useClients();
  const name = getUserName(user);
  const firstName = name.split(/\s+/)[0];
  const initials = getInitials(user);

  if (authLoading || clientsLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#b8f54a" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning 👋</Text>
            <Text style={styles.name}>Welcome back, {firstName}</Text>
          </View>
          <TouchableOpacity
            style={styles.avatar}
            onPress={() => router.push("/profile")}
          >
            <Text style={styles.avatarText}>{initials}</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Clients</Text>
            <Text style={styles.statValue}>{totalClients}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>This Month</Text>
            <Text style={styles.statValue}>{totalThisMonth}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Measurements</Text>
            <Text style={styles.statValue}>{totalMeasurements}</Text>
          </View>
        </View>

        {/* Recent Clients */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent clients</Text>
            <TouchableOpacity onPress={() => router.push("/clients")}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>

          {recentClients.length === 0 ? (
            <Text style={styles.emptyText}>No clients at the moment</Text>
          ) : (
            recentClients.map((client) => (
              <TouchableOpacity
                key={client.id}
                style={styles.clientRow}
                onPress={() => router.push("/clients")}
              >
                <View style={styles.clientLeft}>
                  <View style={styles.clientAvatar}>
                    <Text style={styles.clientInitials}>{client.initials}</Text>
                  </View>
                  <View>
                    <Text style={styles.clientName}>{client.name}</Text>
                    <Text style={styles.clientUpdated}>
                      Last updated {client.updatedAt}
                    </Text>
                  </View>
                </View>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {client.measurements} measurements
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => router.push("/clients")}
          >
            <Plus color="#1a1a1a" size={18} />
            <Text style={styles.primaryBtnText}>New client</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => router.push("/measurements/new")}
          >
            <Ruler color="#b8f54a" size={18} />
            <Text style={styles.secondaryBtnText}>Take measurements</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: "#1a1a1a",
    alignItems: "center",
    justifyContent: "center",
  },
  container: { flex: 1, backgroundColor: "#1a1a1a" },
  scroll: { padding: 20 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  greeting: { color: "#aaa", fontSize: 13 },
  name: { color: "#fff", fontSize: 18, fontWeight: "500", marginTop: 4 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#b8f54a",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#1a1a1a", fontWeight: "500", fontSize: 14 },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  statCard: {
    flex: 1,
    backgroundColor: "#252525",
    borderRadius: 12,
    padding: 14,
  },
  statLabel: { color: "#aaa", fontSize: 11, marginBottom: 6 },
  statValue: { color: "#b8f54a", fontSize: 24, fontWeight: "500" },
  section: {
    backgroundColor: "#252525",
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: { color: "#fff", fontSize: 14, fontWeight: "500" },
  seeAll: { color: "#b8f54a", fontSize: 12 },
  emptyText: {
    color: "#888",
    fontSize: 13,
    textAlign: "center",
    paddingVertical: 20,
  },
  clientRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  clientLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  clientAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#3a3a3a",
    alignItems: "center",
    justifyContent: "center",
  },
  clientInitials: { color: "#b8f54a", fontSize: 12, fontWeight: "500" },
  clientName: { color: "#fff", fontSize: 13, fontWeight: "500" },
  clientUpdated: { color: "#aaa", fontSize: 11 },
  badge: {
    backgroundColor: "#b8f54a",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: { color: "#1a1a1a", fontSize: 11, fontWeight: "500" },
  actionsRow: { flexDirection: "row", gap: 10 },
  primaryBtn: {
    flex: 1,
    backgroundColor: "#b8f54a",
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  primaryBtnText: { color: "#1a1a1a", fontSize: 13, fontWeight: "500" },
  secondaryBtn: {
    flex: 1,
    backgroundColor: "#252525",
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  secondaryBtnText: { color: "#fff", fontSize: 13, fontWeight: "500" },
});
