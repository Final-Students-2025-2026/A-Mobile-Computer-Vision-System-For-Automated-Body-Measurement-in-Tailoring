import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Share,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  Send,
  Copy,
  MessageCircle,
  Mail,
  ChevronRight,
} from "lucide-react-native";
import { useAppTheme } from "../../contexts/ThemeContext";
import { useClients } from "../../hooks/useClients";
import { useAuth } from "../../contexts/AuthContext";

export default function SendToTailor() {
  const { theme } = useAppTheme();
  const styles = createStyles(theme);
  const router = useRouter();
  const { clients, loading } = useClients();
  const { user } = useAuth();
  const [sharing, setSharing] = useState<string | null>(null);

  const generateMeasurementText = (client: any) => {
    return `📏 *Measurements for ${client.name}*\n\nShared via Measure AI\n\nProfile: ${client.name}\nMeasurements: ${client.measurements} saved\nLast updated: ${client.updatedAt}\n\n_Powered by Measure AI_`;
  };

  const handleShareWhatsApp = async (client: any) => {
    const text = generateMeasurementText(client);
    try {
      setSharing(client.id);
      await Share.share({ message: text });
    } catch (e) {
      Alert.alert("Error", "Could not share measurements");
    } finally {
      setSharing(null);
    }
  };

  const handleShareEmail = async (client: any) => {
    const text = generateMeasurementText(client);
    try {
      setSharing(client.id);
      await Share.share({
        message: text,
        title: `Measurements for ${client.name}`,
      });
    } catch (e) {
      Alert.alert("Error", "Could not share measurements");
    } finally {
      setSharing(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Send to Tailor</Text>
          <Text style={styles.subtitle}>
            Share your measurements with your tailor
          </Text>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Send color={theme.primary} size={20} />
          <Text style={styles.infoText}>
            Select a profile below to share their measurements with a tailor via
            WhatsApp, email or any other app.
          </Text>
        </View>

        {/* Profiles List */}
        {loading ? (
          <ActivityIndicator color={theme.primary} style={{ marginTop: 40 }} />
        ) : clients.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No profiles yet</Text>
            <Text style={styles.emptySubtitle}>
              Add a client or yourself to get started
            </Text>
            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={() => router.push("/newClient")}
            >
              <Text style={styles.emptyBtnText}>Add profile</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Choose a profile to share</Text>
            {clients.map((client) => (
              <View key={client.id} style={styles.clientCard}>
                <View style={styles.clientInfo}>
                  <View style={styles.clientAvatar}>
                    <Text style={styles.clientInitials}>{client.initials}</Text>
                  </View>
                  <View>
                    <Text style={styles.clientName}>{client.name}</Text>
                    <Text style={styles.clientMeta}>
                      {client.measurements} measurements · {client.updatedAt}
                    </Text>
                  </View>
                </View>

                {client.measurements === 0 ? (
                  <TouchableOpacity
                    style={styles.noMeasurementsBtn}
                    onPress={() => router.push(`/measurements/${client.id}`)}
                  >
                    <Text style={styles.noMeasurementsBtnText}>
                      Take measurements first
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.shareButtons}>
                    <TouchableOpacity
                      style={styles.shareBtn}
                      onPress={() => handleShareWhatsApp(client)}
                      disabled={sharing === client.id}
                    >
                      {sharing === client.id ? (
                        <ActivityIndicator
                          color={theme.primaryText}
                          size="small"
                        />
                      ) : (
                        <>
                          <MessageCircle color={theme.primaryText} size={16} />
                          <Text style={styles.shareBtnText}>Share</Text>
                        </>
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.shareBtnOutline}
                      onPress={() => router.push(`/client/${client.id}`)}
                    >
                      <ChevronRight color={theme.primary} size={16} />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>["theme"]) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    scroll: { padding: 20, paddingBottom: 40 },
    header: { marginBottom: 20 },
    title: { color: theme.text, fontSize: 28, fontWeight: "700" },
    subtitle: { color: theme.muted, fontSize: 14, marginTop: 4 },
    infoCard: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 12,
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 14,
      marginBottom: 24,
      borderLeftWidth: 3,
      borderLeftColor: theme.primary,
    },
    infoText: { color: theme.muted, fontSize: 13, flex: 1, lineHeight: 18 },
    section: { gap: 12 },
    sectionTitle: {
      color: theme.subtle,
      fontSize: 13,
      fontWeight: "700",
      marginBottom: 4,
    },
    clientCard: {
      backgroundColor: theme.surface,
      borderRadius: 14,
      padding: 14,
      gap: 12,
    },
    clientInfo: { flexDirection: "row", alignItems: "center", gap: 12 },
    clientAvatar: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: theme.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    clientInitials: {
      color: theme.primaryText,
      fontSize: 15,
      fontWeight: "700",
    },
    clientName: { color: theme.text, fontSize: 15, fontWeight: "600" },
    clientMeta: { color: theme.muted, fontSize: 12, marginTop: 2 },
    shareButtons: { flexDirection: "row", gap: 8 },
    shareBtn: {
      flex: 1,
      backgroundColor: theme.primary,
      borderRadius: 10,
      paddingVertical: 10,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
    },
    shareBtnText: { color: theme.primaryText, fontSize: 13, fontWeight: "600" },
    shareBtnOutline: {
      width: 40,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.border,
      alignItems: "center",
      justifyContent: "center",
    },
    noMeasurementsBtn: {
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.border,
      paddingVertical: 10,
      alignItems: "center",
    },
    noMeasurementsBtnText: { color: theme.muted, fontSize: 13 },
    emptyState: { alignItems: "center", paddingTop: 60 },
    emptyTitle: { color: theme.text, fontSize: 18, fontWeight: "600" },
    emptySubtitle: {
      color: theme.muted,
      fontSize: 14,
      marginTop: 8,
      textAlign: "center",
    },
    emptyBtn: {
      backgroundColor: theme.primary,
      borderRadius: 12,
      paddingHorizontal: 24,
      paddingVertical: 12,
      marginTop: 20,
    },
    emptyBtnText: { color: theme.primaryText, fontSize: 14, fontWeight: "600" },
  });

