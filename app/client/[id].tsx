import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ChevronLeft } from "lucide-react-native";

const mockMeasurements = {
  chest: 96,
  waist: 36,
  shoulder: 30,
  hip: 46,
  lastUpdated: "2 months ago",
};

export default function ClientProfile() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeft color="#fff" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Abena Kyei</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Measurements Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.lastUpdated}>
              last updated {mockMeasurements.lastUpdated}
            </Text>
            <TouchableOpacity style={styles.updateBtn}>
              <Text style={styles.updateBtnText}>update</Text>
            </TouchableOpacity>
          </View>

          {/* Measurements Grid */}
          <View style={styles.grid}>
            <View style={styles.measureBox}>
              <Text style={styles.measureLabel}>chest</Text>
              <Text style={styles.measureValue}>
                {mockMeasurements.chest} cm
              </Text>
            </View>
            <View style={styles.measureBox}>
              <Text style={styles.measureLabel}>waist</Text>
              <Text style={styles.measureValue}>
                {mockMeasurements.waist} cm
              </Text>
            </View>
            <View style={styles.measureBox}>
              <Text style={styles.measureLabel}>shoulder</Text>
              <Text style={styles.measureValue}>
                {mockMeasurements.shoulder} cm
              </Text>
            </View>
            <View style={styles.measureBox}>
              <Text style={styles.measureLabel}>hip</Text>
              <Text style={styles.measureValue}>{mockMeasurements.hip} cm</Text>
            </View>
          </View>
        </View>

        {/* New Measurements Button */}
        <TouchableOpacity
          style={styles.newMeasurementBtn}
          onPress={() => router.push(`/measurements/${id}`)}
        >
          <Text style={styles.newMeasurementText}>+ new measurements</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1a1a1a" },
  scroll: { padding: 20 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  headerTitle: { color: "#fff", fontSize: 22, fontWeight: "600" },
  card: {
    backgroundColor: "#252525",
    borderRadius: 16,
    padding: 16,
    marginBottom: 40,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  lastUpdated: { color: "#888", fontSize: 12 },
  updateBtn: {
    backgroundColor: "#b8f54a",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  updateBtnText: { color: "#1a1a1a", fontSize: 13, fontWeight: "600" },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  measureBox: {
    width: "48%",
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 16,
  },
  measureLabel: { color: "#888", fontSize: 12, marginBottom: 6 },
  measureValue: { color: "#fff", fontSize: 20, fontWeight: "600" },
  newMeasurementBtn: {
    backgroundColor: "#b8f54a",
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: "center",
  },
  newMeasurementText: { color: "#1a1a1a", fontSize: 15, fontWeight: "600" },
});
