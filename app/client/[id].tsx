import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import {
  doc,
  getDoc,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";
import { db } from "../../config/firebase";

export default function ClientProfile() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [client, setClient] = useState<any>(null);
  const [measurements, setMeasurements] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchClientData = async () => {
      try {
        // Get client info
        const clientDoc = await getDoc(doc(db, "clients", id as string));
        if (clientDoc.exists()) {
          setClient({ id: clientDoc.id, ...clientDoc.data() });
        }

        // Get latest measurements
        const measurementsQuery = query(
          collection(db, "clients", id as string, "measurements"),
          orderBy("takenAt", "desc"),
          limit(1),
        );
        const measurementsSnap = await getDocs(measurementsQuery);
        if (!measurementsSnap.empty) {
          setMeasurements(measurementsSnap.docs[0].data());
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchClientData();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#b8f54a" />
      </View>
    );
  }

  // Format updatedAt
  let lastUpdated = "never";
  if (client?.updatedAt?.toDate) {
    const date = client.updatedAt.toDate();
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diffDays === 0) lastUpdated = "today";
    else if (diffDays === 1) lastUpdated = "yesterday";
    else if (diffDays < 30) lastUpdated = `${diffDays} days ago`;
    else lastUpdated = `${Math.floor(diffDays / 30)} months ago`;
  }

  // Get measurement keys dynamically
  const measurementKeys = measurements
    ? Object.keys(measurements).filter(
        (k) => k !== "takenAt" && k !== "takenBy",
      )
    : [];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeft color="#fff" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{client?.name || "Client"}</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Measurements Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.lastUpdated}>last updated {lastUpdated}</Text>
            <TouchableOpacity
              style={styles.updateBtn}
              onPress={() => router.push(`/measurements/${id}` as any)}
            >
              <Text style={styles.updateBtnText}>update</Text>
            </TouchableOpacity>
          </View>

          {/* Measurements Grid */}
          {measurementKeys.length > 0 ? (
            <View style={styles.grid}>
              {measurementKeys.map((key) => (
                <View key={key} style={styles.measureBox}>
                  <Text style={styles.measureLabel}>{key}</Text>
                  <Text style={styles.measureValue}>
                    {measurements[key]} cm
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>No measurements yet</Text>
          )}
        </View>

        {/* New Measurements Button */}
        <TouchableOpacity
          style={styles.newMeasurementBtn}
          onPress={() => router.push(`/measurements/${id}` as any)}
        >
          <Text style={styles.newMeasurementText}>+ new measurements</Text>
        </TouchableOpacity>
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
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  measureBox: {
    width: "48%",
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 16,
  },
  measureLabel: { color: "#888", fontSize: 12, marginBottom: 6 },
  measureValue: { color: "#fff", fontSize: 20, fontWeight: "600" },
  emptyText: {
    color: "#888",
    fontSize: 13,
    textAlign: "center",
    paddingVertical: 20,
  },
  newMeasurementBtn: {
    backgroundColor: "#b8f54a",
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: "center",
  },
  newMeasurementText: { color: "#1a1a1a", fontSize: 15, fontWeight: "600" },
});
