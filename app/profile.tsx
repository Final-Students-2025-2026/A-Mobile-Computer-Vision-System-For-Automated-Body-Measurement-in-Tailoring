import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ChevronLeft, Mail, User, LogOut } from "lucide-react-native";
import { useAuth } from "../hooks/useAuth";

export default function Profile() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeft color="#fff" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.initials}</Text>
          </View>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        {/* Info Cards */}
        <View style={styles.section}>
          <View style={styles.infoRow}>
            <User color="#b8f54a" size={18} />
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>Full name</Text>
              <Text style={styles.infoValue}>{user?.name}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Mail color="#b8f54a" size={18} />
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user?.email}</Text>
            </View>
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => router.replace("/(auth)/login")}
        >
          <LogOut color="#1a1a1a" size={18} />
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1a1a1a" },
  scroll: { padding: 20 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 30 },
  headerTitle: { color: "#fff", fontSize: 16, fontWeight: "500" },
  avatarSection: { alignItems: "center", marginBottom: 30 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#b8f54a", alignItems: "center", justifyContent: "center", marginBottom: 12 },
  avatarText: { color: "#1a1a1a", fontSize: 28, fontWeight: "600" },
  name: { color: "#fff", fontSize: 20, fontWeight: "500", marginBottom: 4 },
  email: { color: "#888", fontSize: 14 },
  section: { backgroundColor: "#252525", borderRadius: 16, padding: 16, marginBottom: 20 },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 8 },
  infoText: { flex: 1 },
  infoLabel: { color: "#888", fontSize: 12, marginBottom: 2 },
  infoValue: { color: "#fff", fontSize: 14 },
  divider: { height: 0.5, backgroundColor: "#333", marginVertical: 4 },
  logoutBtn: { backgroundColor: "#b8f54a", borderRadius: 12, padding: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  logoutText: { color: "#1a1a1a", fontSize: 14, fontWeight: "500" },
});