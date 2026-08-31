import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  ChevronLeft,
  Mail,
  User,
  LogOut,
  Moon,
  Sun,
  Ruler,
} from "lucide-react-native";
import { useAuth } from "../contexts/AuthContext";
import { ThemeName, useAppTheme } from "../contexts/ThemeContext";

function getUserName(user: ReturnType<typeof useAuth>["user"]) {
  return user?.displayName || user?.email?.split("@")[0] || "User";
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

export default function Profile() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { theme, themeName, setThemeName } = useAppTheme();
  const styles = createStyles(theme);
  const name = getUserName(user);
  const initials = getInitials(user);
  const themeOptions: { label: string; value: ThemeName }[] = [
    { label: "Dark", value: "dark" },
    { label: "Light", value: "light" },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeft color={theme.text} size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        {/* Info Cards */}
        <View style={styles.section}>
          <View style={styles.infoRow}>
            <User color={theme.primary} size={18} />
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>Full name</Text>
              <Text style={styles.infoValue}>{name}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Mail color={theme.primary} size={18} />
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user?.email}</Text>
            </View>
          </View>
        </View>
        {/* General body information belongs to individual client records.
<TouchableOpacity
  style={styles.section}
  onPress={() => router.push("./bodyInfo")}
>
  <View style={styles.infoRow}>
    <Ruler color={theme.primary} size={18} />
    <View style={styles.infoText}>
      <Text style={styles.infoLabel}>Body info</Text>
      <Text style={styles.infoValue}>
        {profile?.height ? `${profile.height}cm · ${profile.weight}kg · BMI ${profile.bmi}` : "Not set yet"}
      </Text>
    </View>
    <ChevronLeft color={theme.muted} size={18} style={{ transform: [{ rotate: "180deg" }] }} />
  </View>
</TouchableOpacity> */}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Theme</Text>
          <View style={styles.themeRow}>
            {themeOptions.map((option) => {
              const isSelected = themeName === option.value;
              const Icon = option.value === "dark" ? Moon : Sun;

              return (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.themeOption,
                    isSelected && styles.themeOptionActive,
                  ]}
                  onPress={() => setThemeName(option.value)}
                >
                  <Icon
                    color={isSelected ? theme.primaryText : theme.text}
                    size={16}
                  />
                  <Text
                    style={[
                      styles.themeOptionText,
                      isSelected && styles.themeOptionTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={async () => {
            await logout();
            router.replace("/(auth)/login");
          }}
        >
          <LogOut color={theme.primaryText} size={18} />
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>["theme"]) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    scroll: { padding: 20 },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 30,
    },
    headerTitle: { color: theme.text, fontSize: 16, fontWeight: "500" },
    avatarSection: { alignItems: "center", marginBottom: 30 },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.primary,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 12,
    },
    avatarText: { color: theme.primaryText, fontSize: 28, fontWeight: "600" },
    name: {
      color: theme.text,
      fontSize: 20,
      fontWeight: "500",
      marginBottom: 4,
    },
    email: { color: theme.muted, fontSize: 14 },
    section: {
      backgroundColor: theme.surface,
      borderRadius: 16,
      padding: 16,
      marginBottom: 20,
    },
    sectionTitle: {
      color: theme.text,
      fontSize: 14,
      fontWeight: "600",
      marginBottom: 12,
    },
    infoRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      paddingVertical: 8,
    },
    infoText: { flex: 1 },
    infoLabel: { color: theme.muted, fontSize: 12, marginBottom: 2 },
    infoValue: { color: theme.text, fontSize: 14 },
    divider: { height: 0.5, backgroundColor: theme.border, marginVertical: 4 },
    themeRow: { flexDirection: "row", gap: 10 },
    themeOption: {
      flex: 1,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    themeOptionActive: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    themeOptionText: { color: theme.text, fontSize: 13, fontWeight: "500" },
    themeOptionTextActive: { color: theme.primaryText },
    logoutBtn: {
      backgroundColor: theme.primary,
      borderRadius: 12,
      padding: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    logoutText: { color: theme.primaryText, fontSize: 14, fontWeight: "500" },
    input: {
  color: theme.text,
  fontSize: 14,
  paddingVertical: 4,
  borderBottomWidth: 1,
  borderBottomColor: theme.border,
},
genderRow: { flexDirection: "row", gap: 10, marginTop: 8 },
genderBtn: {
  flex: 1,
  borderRadius: 10,
  borderWidth: 1,
  borderColor: theme.border,
  padding: 10,
  alignItems: "center",
},
genderBtnActive: { backgroundColor: theme.primary, borderColor: theme.primary },
genderBtnText: { color: theme.text, fontSize: 13, fontWeight: "500" },
genderBtnTextActive: { color: theme.primaryText },
bmiRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginTop: 12,
  padding: 12,
  backgroundColor: theme.background,
  borderRadius: 10,
},
bmiValue: { color: theme.primary, fontSize: 18, fontWeight: "700" },
saveBtn: {
  backgroundColor: theme.primary,
  borderRadius: 12,
  padding: 14,
  alignItems: "center",
  marginTop: 16,
},
saveBtnText: { color: theme.primaryText, fontSize: 14, fontWeight: "600" },
  });

