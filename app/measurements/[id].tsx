import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  Modal,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ChevronLeft, Plus, Users } from "lucide-react-native";
import {
  doc,
  addDoc,
  updateDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import { useAuth } from "../context/AuthContext";
import { useAppTheme } from "../context/ThemeContext";

const measurementTypes = ["chest", "waist", "shoulder", "hip"];

export default function TakeMeasurements() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const styles = createStyles(theme);
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [readings, setReadings] = useState<{ [key: string]: number }>({});
  const [currentReading, setCurrentReading] = useState(0);
  const [isLive, setIsLive] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulse2Anim = useRef(new Animated.Value(1)).current;
  const intervalRef = useRef<any>(null);

  const startMeasuring = () => {
    if (!id) {
      setShowClientModal(true);
    } else {
      beginMeasuring();
    }
  };

  const handleSelectExisting = () => {
    setShowClientModal(false);
    router.push("/clients");
  };

  const handleAddNew = () => {
    setShowClientModal(false);
    router.push("/newClient");
  };

  const beginMeasuring = () => {
    setIsLive(true);

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse2Anim, {
          toValue: 1.6,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulse2Anim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    intervalRef.current = setInterval(() => {
      const value = Math.floor(Math.random() * 50) + 20;
      setCurrentReading(value);
    }, 500);

    setTimeout(() => {
      clearInterval(intervalRef.current);
    }, 5000);
  };

  const saveMeasurement = async () => {
    const type = measurementTypes[currentIndex];
    const newReadings = { ...readings, [type]: currentReading };
    setReadings(newReadings);

    if (currentIndex < measurementTypes.length - 1) {
      // Move to next measurement
      setCurrentIndex(currentIndex + 1);
      setCurrentReading(0);
      setIsLive(false);
      pulseAnim.setValue(1);
      pulse2Anim.setValue(1);
    } else {
      // All measurements done; save to Firestore.
      if (!id || !user) {
        router.back();
        return;
      }

      try {
        setSaving(true);

        // Save measurements as a subcollection
        await addDoc(collection(db, "clients", id as string, "measurements"), {
          ...newReadings,
          takenBy: user.uid,
          takenAt: serverTimestamp(),
        });

        // Update client's measurement count and updatedAt
        await updateDoc(doc(db, "clients", id as string), {
          measurements: Object.keys(newReadings).length,
          updatedAt: serverTimestamp(),
        });

        Alert.alert("Saved", "Measurements are ready to share with a tailor.", [
          { text: "OK", onPress: () => router.back() },
        ]);
      } catch (e: any) {
        Alert.alert("Error", e.message || "Could not save measurements.");
      } finally {
        setSaving(false);
      }
    }
  };

  const currentType = measurementTypes[currentIndex];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <ChevronLeft color={theme.text} size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isLive ? "Taking measurements" : "Take measurements"}
          </Text>
          <TouchableOpacity
            style={styles.addClientBtn}
            onPress={() => router.push("/newClient")}
          >
            <Plus color={theme.primaryText} size={14} />
            <Text style={styles.addClientText}>Add profile</Text>
          </TouchableOpacity>
        </View>

        {/* Measuring label */}
        {isLive && (
          <Text style={styles.measuringLabel}>measuring {currentType}</Text>
        )}

        {/* Progress dots */}
        <View style={styles.progressRow}>
          {measurementTypes.map((type, index) => (
            <View
              key={type}
              style={[
                styles.progressDot,
                index === currentIndex && styles.progressDotActive,
                index < currentIndex && styles.progressDotDone,
              ]}
            />
          ))}
        </View>

        {/* Scanner */}
        <View style={styles.scannerCard}>
          <View style={styles.scannerWrapper}>
            <Animated.View
              style={[
                styles.ring,
                styles.ringOuter,
                { transform: [{ scale: pulse2Anim }] },
              ]}
            />
            <Animated.View
              style={[
                styles.ring,
                styles.ringInner,
                { transform: [{ scale: pulseAnim }] },
              ]}
            />
            <View style={styles.centerIcon}>
              <Text style={styles.centerIconText}>⏱</Text>
            </View>
          </View>
          <Text style={styles.hoverText}>prototype reading</Text>
        </View>

        {/* Current Reading */}
        <View style={styles.readingRow}>
          <Text style={styles.readingLabel}>current reading</Text>
          <Text style={styles.readingValue}>{currentReading} cm</Text>
        </View>

        {/* Button */}
        {!isLive ? (
          <TouchableOpacity style={styles.btn} onPress={startMeasuring}>
            <Text style={styles.btnText}>start measurement capture</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.btn, saving && { opacity: 0.6 }]}
            onPress={saveMeasurement}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color={theme.primaryText} />
            ) : (
              <Text style={styles.btnText}>
                {currentIndex < measurementTypes.length - 1
                  ? "save & next"
                  : "save measurements"}
              </Text>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Client Selection Modal */}
      <Modal
        visible={showClientModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowClientModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Choose a measurement profile</Text>
            <Text style={styles.modalSubtitle}>
              Who are these measurements for?
            </Text>

            <TouchableOpacity
              style={styles.modalBtn}
              onPress={handleSelectExisting}
            >
              <Users color={theme.primaryText} size={18} />
              <Text style={styles.modalBtnText}>Select existing profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalBtnOutline}
              onPress={handleAddNew}
            >
              <Plus color={theme.primary} size={18} />
              <Text style={styles.modalBtnOutlineText}>Add new profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => setShowClientModal(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>["theme"]) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    scroll: { padding: 20 },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 20,
    },
    backBtn: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: theme.surface,
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: { color: theme.text, fontSize: 18, fontWeight: "500" },
    addClientBtn: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.primary,
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 6,
      gap: 4,
    },
    addClientText: {
      color: theme.primaryText,
      fontSize: 12,
      fontWeight: "600",
    },
    measuringLabel: {
      color: theme.text,
      fontSize: 22,
      fontWeight: "500",
      marginBottom: 16,
    },
    progressRow: { flexDirection: "row", gap: 8, marginBottom: 20 },
    progressDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.border,
    },
    progressDotActive: { backgroundColor: theme.primary },
    progressDotDone: { backgroundColor: theme.primary },
    scannerCard: {
      backgroundColor: theme.surface,
      borderRadius: 16,
      padding: 30,
      alignItems: "center",
      marginBottom: 24,
    },
    scannerWrapper: {
      width: 180,
      height: 180,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
    },
    ring: {
      position: "absolute",
      borderRadius: 999,
      borderWidth: 1.5,
      borderColor: theme.primary,
    },
    ringOuter: { width: 160, height: 160, opacity: 0.3 },
    ringInner: { width: 100, height: 100, opacity: 0.6 },
    centerIcon: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: theme.background,
      alignItems: "center",
      justifyContent: "center",
    },
    centerIconText: { fontSize: 24 },
    hoverText: { color: theme.muted, fontSize: 13 },
    readingRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 30,
    },
    readingLabel: { color: theme.muted, fontSize: 14 },
    readingValue: { color: theme.primary, fontSize: 22, fontWeight: "600" },
    btn: {
      backgroundColor: theme.primary,
      borderRadius: 30,
      paddingVertical: 16,
      alignItems: "center",
    },
    btnText: { color: theme.primaryText, fontSize: 15, fontWeight: "600" },
    modalOverlay: {
      flex: 1,
      backgroundColor: theme.overlay,
      justifyContent: "flex-end",
    },
    modalCard: {
      backgroundColor: theme.surface,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 24,
      paddingBottom: 40,
    },
    modalTitle: {
      color: theme.text,
      fontSize: 20,
      fontWeight: "600",
      marginBottom: 6,
    },
    modalSubtitle: { color: theme.muted, fontSize: 14, marginBottom: 24 },
    modalBtn: {
      backgroundColor: theme.primary,
      borderRadius: 30,
      paddingVertical: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      marginBottom: 12,
    },
    modalBtnText: { color: theme.primaryText, fontSize: 15, fontWeight: "600" },
    modalBtnOutline: {
      borderWidth: 1,
      borderColor: theme.primary,
      borderRadius: 30,
      paddingVertical: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      marginBottom: 12,
    },
    modalBtnOutlineText: {
      color: theme.primary,
      fontSize: 15,
      fontWeight: "500",
    },
    modalCancel: { alignItems: "center", paddingVertical: 12 },
    modalCancelText: { color: theme.muted, fontSize: 14 },
  });
