import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Plus, Ruler, Send, Shirt } from "lucide-react-native";
import { useAuth } from "../../hooks/useAuth";
import { useClients } from "../../hooks/useClients";
import { useAppTheme } from "../context/ThemeContext";

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
  const { theme } = useAppTheme();
  const styles = createStyles(theme);
  const { user, loading: authLoading } = useAuth();
  const {
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
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Measure and Share</Text>
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
            <Text style={styles.statLabel}>Profiles</Text>
            <Text style={styles.statValue}>{totalClients}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Updated</Text>
            <Text style={styles.statValue}>{totalThisMonth}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Saved sizes</Text>
            <Text style={styles.statValue}>{totalMeasurements}</Text>
          </View>
        </View>

        <View style={styles.workflowRow}>
          <View style={styles.workflowCard}>
            <Ruler color={theme.primary} size={20} />
            <Text style={styles.workflowTitle}>Take measurements</Text>
            <Text style={styles.workflowText}>
              Capture body sizes in minutes with our guided measurement process.
              No tape
            </Text>
          </View>
          <View style={styles.workflowCard}>
            <Send color={theme.primary} size={20} />
            <Text style={styles.workflowTitle}>Send to tailor</Text>
            <Text style={styles.workflowText}>
              Share profiles with your tailor for custom clothing that fits
              perfectly.
            </Text>
          </View>
          <View style={styles.workflowCard}>
            <Shirt color={theme.primary} size={20} />
            <Text style={styles.workflowTitle}>Shop by fit</Text>
            <Text style={styles.workflowText}>
              Keep sizes ready when comparing online clothing charts.
            </Text>
          </View>
        </View>

        {/* Recent Clients */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent measurement profiles</Text>
            <TouchableOpacity onPress={() => router.push("/clients")}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>

          {recentClients.length === 0 ? (
            <Text style={styles.emptyText}>
              No profiles yet. Add yourself or your first client.
            </Text>
          ) : (
            recentClients.map((client) => (
              <TouchableOpacity
                key={client.id}
                style={styles.clientRow}
                onPress={() => router.push(`/client/${client.id}`)}
              >
                <View style={styles.clientLeft}>
                  <View style={styles.clientAvatar}>
                    {client.photoURL ? (
                      <Image
                        source={{ uri: client.photoURL }}
                        style={styles.clientPhoto}
                      />
                    ) : (
                      <Text style={styles.clientInitials}>
                        {client.initials}
                      </Text>
                    )}
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
            onPress={() => router.push("/newClient")}
          >
            <Plus color={theme.primaryText} size={18} />
            <Text style={styles.primaryBtnText}>New profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => router.push("/measurements/new")}
          >
            <Ruler color={theme.primary} size={18} />
            <Text style={styles.secondaryBtnText}>Start measuring</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>["theme"]) =>
  StyleSheet.create({
    loadingContainer: {
      flex: 1,
      backgroundColor: theme.background,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    },
    clientPhoto: { width: "100%", height: "100%" },
    container: { flex: 1, backgroundColor: theme.background },
    scroll: { padding: 20 },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 20,
    },
    greeting: { color: theme.subtle, fontSize: 13 },
    name: { color: theme.text, fontSize: 18, fontWeight: "500", marginTop: 4 },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarText: { color: theme.primaryText, fontWeight: "500", fontSize: 14 },
    statsRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
    statCard: {
      flex: 1,
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 14,
    },
    statLabel: { color: theme.subtle, fontSize: 11, marginBottom: 6 },
    statValue: { color: theme.primary, fontSize: 24, fontWeight: "500" },
    workflowRow: { gap: 10, marginBottom: 20 },
    workflowCard: {
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 14,
      gap: 6,
    },
    workflowTitle: { color: theme.text, fontSize: 14, fontWeight: "600" },
    workflowText: { color: theme.muted, fontSize: 12, lineHeight: 17 },
    section: {
      backgroundColor: theme.surface,
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
    sectionTitle: { color: theme.text, fontSize: 14, fontWeight: "500" },
    seeAll: { color: theme.primary, fontSize: 12 },
    emptyText: {
      color: theme.muted,
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
      backgroundColor: theme.surfaceAlt,
      alignItems: "center",
      justifyContent: "center",
    },
    clientInitials: { color: theme.primary, fontSize: 12, fontWeight: "500" },
    clientName: { color: theme.text, fontSize: 13, fontWeight: "500" },
    clientUpdated: { color: theme.subtle, fontSize: 11 },
    badge: {
      backgroundColor: theme.primary,
      borderRadius: 20,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    badgeText: { color: theme.primaryText, fontSize: 11, fontWeight: "500" },
    actionsRow: { flexDirection: "row", gap: 10 },
    primaryBtn: {
      flex: 1,
      backgroundColor: theme.primary,
      borderRadius: 12,
      padding: 14,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    primaryBtnText: {
      color: theme.primaryText,
      fontSize: 13,
      fontWeight: "500",
    },
    secondaryBtn: {
      flex: 1,
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 14,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    secondaryBtnText: { color: theme.text, fontSize: 13, fontWeight: "500" },
  });
