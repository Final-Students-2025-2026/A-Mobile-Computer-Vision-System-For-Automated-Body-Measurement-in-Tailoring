import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "../context/ThemeContext";
import { useClients } from "../../hooks/useClients";
import { useRouter } from "expo-router";
import { Shirt } from "lucide-react-native";

const SIZE_CHARTS = {
  chest: {
    XS: [76, 84],
    S: [84, 92],
    M: [92, 100],
    L: [100, 108],
    XL: [108, 116],
    XXL: [116, 124],
  },
  waist: {
    XS: [60, 68],
    S: [68, 76],
    M: [76, 84],
    L: [84, 92],
    XL: [92, 100],
    XXL: [100, 108],
  },
  hip: {
    XS: [80, 88],
    S: [88, 96],
    M: [96, 104],
    L: [104, 112],
    XL: [112, 120],
    XXL: [120, 128],
  },
};

function getSize(measurement: number, part: keyof typeof SIZE_CHARTS): string {
  const chart = SIZE_CHARTS[part];
  for (const [size, [min, max]] of Object.entries(chart)) {
    if (measurement >= min && measurement < max) return size;
  }
  return measurement < 76 ? "XS" : "XXL+";
}

export default function ShopByFit() {
  const { theme } = useAppTheme();
  const styles = createStyles(theme);
  const router = useRouter();
  const { clients, loading } = useClients();
  const [selectedClient, setSelectedClient] = useState<any>(null);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Shop by Fit</Text>
          <Text style={styles.subtitle}>
            Find your clothing size from your measurements
          </Text>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Shirt color={theme.primary} size={20} />
          <Text style={styles.infoText}>
            Select a profile to see their equivalent clothing sizes across
            international standards.
          </Text>
        </View>

        {/* Client Selection */}
        {loading ? (
          <ActivityIndicator color={theme.primary} style={{ marginTop: 40 }} />
        ) : clients.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No profiles yet</Text>
            <Text style={styles.emptySubtitle}>
              Add measurements to see clothing sizes
            </Text>
            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={() => router.push("/newClient")}
            >
              <Text style={styles.emptyBtnText}>Add profile</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Profile chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.chipsScroll}
              contentContainerStyle={styles.chipsContainer}
            >
              {clients.map((client) => (
                <TouchableOpacity
                  key={client.id}
                  style={[
                    styles.chip,
                    selectedClient?.id === client.id && styles.chipActive,
                  ]}
                  onPress={() => setSelectedClient(client)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      selectedClient?.id === client.id && styles.chipTextActive,
                    ]}
                  >
                    {client.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Size Results */}
            {selectedClient ? (
              selectedClient.measurements === 0 ? (
                <View style={styles.noMeasurements}>
                  <Text style={styles.noMeasurementsText}>
                    No measurements for {selectedClient.name} yet
                  </Text>
                  <TouchableOpacity
                    style={styles.emptyBtn}
                    onPress={() =>
                      router.push(`/measurements/${selectedClient.id}`)
                    }
                  >
                    <Text style={styles.emptyBtnText}>Take measurements</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.sizesSection}>
                  <Text style={styles.sectionTitle}>
                    Sizes for {selectedClient.name}
                  </Text>

                  {/* Size cards */}
                  <View style={styles.sizeGrid}>
                    {[
                      { label: "Top / Shirt", size: "M", based: "chest" },
                      { label: "Trousers", size: "L", based: "waist" },
                      { label: "Dress / Skirt", size: "M", based: "hip" },
                    ].map((item) => (
                      <View key={item.label} style={styles.sizeCard}>
                        <Text style={styles.sizeCardLabel}>{item.label}</Text>
                        <Text style={styles.sizeCardSize}>{item.size}</Text>
                        <Text style={styles.sizeCardBased}>
                          based on {item.based}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {/* Size guide */}
                  <View style={styles.guideSection}>
                    <Text style={styles.guideTitle}>
                      International Size Guide
                    </Text>
                    <View style={styles.guideTable}>
                      <View style={styles.guideRow}>
                        <Text style={styles.guideHeader}>Size</Text>
                        <Text style={styles.guideHeader}>Chest (cm)</Text>
                        <Text style={styles.guideHeader}>Waist (cm)</Text>
                        <Text style={styles.guideHeader}>Hip (cm)</Text>
                      </View>
                      {Object.entries(SIZE_CHARTS.chest).map(
                        ([size, [min, max]]) => (
                          <View key={size} style={styles.guideRow}>
                            <Text style={styles.guideCell}>{size}</Text>
                            <Text style={styles.guideCell}>
                              {min}-{max}
                            </Text>
                            <Text style={styles.guideCell}>
                              {
                                SIZE_CHARTS.waist[
                                  size as keyof typeof SIZE_CHARTS.waist
                                ][0]
                              }
                              -
                              {
                                SIZE_CHARTS.waist[
                                  size as keyof typeof SIZE_CHARTS.waist
                                ][1]
                              }
                            </Text>
                            <Text style={styles.guideCell}>
                              {
                                SIZE_CHARTS.hip[
                                  size as keyof typeof SIZE_CHARTS.hip
                                ][0]
                              }
                              -
                              {
                                SIZE_CHARTS.hip[
                                  size as keyof typeof SIZE_CHARTS.hip
                                ][1]
                              }
                            </Text>
                          </View>
                        ),
                      )}
                    </View>
                  </View>
                </View>
              )
            ) : (
              <View style={styles.selectPrompt}>
                <Text style={styles.selectPromptText}>
                  Select a profile above to see their sizes
                </Text>
              </View>
            )}
          </>
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
    chipsScroll: { marginBottom: 20 },
    chipsContainer: { gap: 8, paddingRight: 20 },
    chip: {
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
    },
    chipActive: { backgroundColor: theme.primary, borderColor: theme.primary },
    chipText: { color: theme.text, fontSize: 13, fontWeight: "500" },
    chipTextActive: { color: theme.primaryText },
    sizesSection: { gap: 20 },
    sectionTitle: { color: theme.text, fontSize: 16, fontWeight: "600" },
    sizeGrid: { flexDirection: "row", gap: 10 },
    sizeCard: {
      flex: 1,
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 14,
      alignItems: "center",
      gap: 4,
    },
    sizeCardLabel: { color: theme.muted, fontSize: 11, textAlign: "center" },
    sizeCardSize: {
      color: theme.primary,
      fontSize: 32,
      fontWeight: "700",
    },
    sizeCardBased: { color: theme.subtle, fontSize: 10 },
    guideSection: {
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 14,
    },
    guideTitle: {
      color: theme.text,
      fontSize: 14,
      fontWeight: "600",
      marginBottom: 12,
    },
    guideTable: { gap: 8 },
    guideRow: { flexDirection: "row" },
    guideHeader: {
      flex: 1,
      color: theme.primary,
      fontSize: 12,
      fontWeight: "700",
    },
    guideCell: { flex: 1, color: theme.text, fontSize: 12 },
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
    noMeasurements: { alignItems: "center", paddingTop: 40, gap: 16 },
    noMeasurementsText: {
      color: theme.muted,
      fontSize: 14,
      textAlign: "center",
    },
    selectPrompt: { alignItems: "center", paddingTop: 40 },
    selectPromptText: { color: theme.muted, fontSize: 14 },
  });
