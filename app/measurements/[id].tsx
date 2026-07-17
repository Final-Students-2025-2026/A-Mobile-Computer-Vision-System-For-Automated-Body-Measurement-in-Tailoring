import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Alert,
} from "react-native";
import { CameraView } from "expo-camera";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  Camera,
  Check,
  ChevronLeft,
  Plus,
  Ruler,
  Users,
} from "lucide-react-native";
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
import { useMeasurementCapture } from "../../hooks/useMeasurementCapture";
import { measurementParts } from "../../services/measurementEngine";
import { validateMeasurement } from "../../services/measurementAPI";

export default function TakeMeasurements() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const styles = createStyles(theme);
  const { id } = useLocalSearchParams();
  const clientId = Array.isArray(id) ? id[0] : id;
  const hasSelectedClient =
    Boolean(clientId) && clientId !== "new" && clientId !== "[id]";
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [readings, setReadings] = useState<Record<string, number>>({});
  const [isLive, setIsLive] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const {
    cameraRef,
    status,
    currentReading,
    confidence,
    source,
    error,
    startCapture,
    stopCapture,
    resetCapture,
  } = useMeasurementCapture();

  const currentPart = measurementParts[currentIndex];
  const completedCount = Object.keys(readings).length;
  const categories = useMemo(
    () => Array.from(new Set(measurementParts.map((part) => part.category))),
    [],
  );
  const engineLabel =
    source === "mediapipe"
      ? `MediaPipe confidence ${Math.round(confidence * 100)}%`
      : "Live camera analysis";

  useEffect(() => {
    return () => stopCapture();
  }, [stopCapture]);

  const beginMeasuring = async () => {
    if (!hasSelectedClient) {
      setShowClientModal(true);
      return;
    }

    const started = await startCapture(currentPart.id);

    if (!started) {
      Alert.alert(
        "Camera permission needed",
        "Allow camera access to capture body measurement frames.",
      );
      return;
    }

    setIsLive(true);
  };

  const handleSelectPart = async (index: number) => {
    setCurrentIndex(index);
    stopCapture();
    resetCapture();
    setIsLive(false);
  };

  const handleSelectExisting = () => {
    setShowClientModal(false);
    router.push("/(tabs)/clients");
  };

  const handleAddNew = () => {
    setShowClientModal(false);
    router.push("/newClient");
  };

  const saveMeasurement = async () => {
    if (!currentReading) {
      Alert.alert(
        "No reading yet",
        "Keep the body part in frame until a measurement reading appears.",
      );
      return;
    }

    // Validate measurement via API first
try {
  const validation = await validateMeasurement({
    height: 170, // TODO: get from user profile
    gender: 1,   // TODO: get from user profile
    age: 25,     // TODO: get from user profile
    weight: 70,  // TODO: get from user profile
    bmi: 22.5,   // TODO: get from user profile
    ar_measurement: currentReading,
    body_part: currentPart.id,
    unit: "cm",
  });

  if (!validation.is_valid) {
    Alert.alert(
      "Check measurement ⚠️",
      `${validation.message}\n\nSuggested: ${validation.suggested_value} cm\n\nDo you want to use the suggested value?`,
      [
        {
          text: "Use suggested",
          onPress: () => {
            const newReadings = {
              ...readings,
              [currentPart.id]: validation.suggested_value,
            };
            setReadings(newReadings);
            stopCapture();
            resetCapture();
            setIsLive(false);
          },
        },
        {
          text: "Keep my reading",
          onPress: () => {
            const newReadings = {
              ...readings,
              [currentPart.id]: currentReading,
            };
            setReadings(newReadings);
            stopCapture();
            resetCapture();
            setIsLive(false);
          },
        },
        {
          text: "Rescan",
          style: "cancel",
        },
      ]
    );
    return;
  }

  // Measurement is valid — proceed normally
  Alert.alert(
    "Measurement validated ✅",
    validation.message,
    [{ text: "OK" }]
  );

} catch (e) {
  // If API fails just continue without validation
  console.log("Validation API unavailable:", e);
}

const newReadings = {
  ...readings,
  [currentPart.id]: currentReading,
};
setReadings(newReadings);
stopCapture();
resetCapture();
setIsLive(false);

    const nextIndex = measurementParts.findIndex(
      (part, index) => index > currentIndex && !newReadings[part.id],
    );

    if (nextIndex !== -1) {
      setCurrentIndex(nextIndex);
      return;
    }

    if (!hasSelectedClient || !user || !clientId) {
      setShowClientModal(true);
      return;
    }

    try {
      setSaving(true);

      await addDoc(collection(db, "clients", clientId, "measurements"), {
        ...newReadings,
        labels: Object.fromEntries(
          measurementParts.map((part) => [part.id, part.label]),
        ),
        engine: source || "calibration",
        confidence,
        takenBy: user.uid,
        takenAt: serverTimestamp(),
      });

      await updateDoc(doc(db, "clients", clientId), {
        measurements: Object.keys(newReadings).length,
        updatedAt: serverTimestamp(),
      });

      Alert.alert("Saved", "Measurements are ready to share with a tailor.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (e: any) {
      Alert.alert(
        "Could not save",
        e.code
          ? `${e.code}: ${e.message || "Check that this profile belongs to your account."}`
          : e.message || "Check that this profile belongs to your account.",
      );
    } finally {
      setSaving(false);
    }
  };

  const saveLabel =
    completedCount + 1 >= measurementParts.length
      ? "save measurements"
      : "save & continue";

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => router.back()}
          >
            <ChevronLeft color={theme.text} size={24} />
          </TouchableOpacity>
          <View style={styles.headerCopy}>
            <Text style={styles.headerTitle}>Body measurements</Text>
            <Text style={styles.headerSubtitle}>
              {completedCount}/{measurementParts.length} captured
            </Text>
          </View>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => router.push("/newClient")}
          >
            <Plus color={theme.text} size={20} />
          </TouchableOpacity>
        </View>

        <View style={styles.capturePanel}>
          <View style={styles.partHeader}>
            <View>
              <Text style={styles.eyebrow}>{currentPart.category}</Text>
              <Text style={styles.partTitle}>{currentPart.label}</Text>
            </View>
            <View style={styles.readingPill}>
              <Text style={styles.readingPillValue}>
                {currentReading || "--"} cm
              </Text>
            </View>
          </View>
          <Text style={styles.guideText}>{currentPart.guide}</Text>

          <View style={styles.cameraWrapper}>
            <CameraView ref={cameraRef} style={styles.camera} facing="back" />
            <View style={styles.cameraOverlay}>
              <View style={styles.frameGuide}>
                <View style={styles.frameLineTop} />
                <View style={styles.frameLineBottom} />
              </View>
              <View style={styles.cameraBadge}>
                <Camera color={theme.primaryText} size={14} />
                <Text style={styles.cameraBadgeText}>
                  {isLive ? "capturing" : status}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.engineRow}>
            <Ruler color={theme.primary} size={16} />
            <Text style={styles.engineText}>
              {error ||
                (isLive
                  ? engineLabel
                  : "Align the body part, then start capture.")}
            </Text>
          </View>
        </View>

        <View style={styles.actionsRow}>
          {!isLive ? (
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={beginMeasuring}
            >
              <Camera color={theme.primaryText} size={18} />
              <Text style={styles.primaryBtnText}>start capture</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.primaryBtn, saving && styles.disabled]}
              onPress={saveMeasurement}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color={theme.primaryText} />
              ) : (
                <>
                  <Check color={theme.primaryText} size={18} />
                  <Text style={styles.primaryBtnText}>{saveLabel}</Text>
                </>
              )}
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => {
              stopCapture();
              setIsLive(false);
            }}
          >
            <Text style={styles.secondaryBtnText}>pause</Text>
          </TouchableOpacity>
        </View>

        {categories.map((category) => (
          <View key={category} style={styles.section}>
            <Text style={styles.sectionTitle}>{category}</Text>
            <View style={styles.partGrid}>
              {measurementParts
                .map((part, index) => ({ part, index }))
                .filter(({ part }) => part.category === category)
                .map(({ part, index }) => {
                  const isActive = index === currentIndex;
                  const isDone = Boolean(readings[part.id]);
                  return (
                    <TouchableOpacity
                      key={part.id}
                      style={[
                        styles.partChip,
                        isActive && styles.partChipActive,
                        isDone && styles.partChipDone,
                      ]}
                      onPress={() => handleSelectPart(index)}
                    >
                      <Text
                        style={[
                          styles.partChipText,
                          isActive && styles.partChipTextActive,
                        ]}
                      >
                        {part.label}
                      </Text>
                      {isDone && (
                        <Text style={styles.partChipValue}>
                          {readings[part.id]} cm
                        </Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
            </View>
          </View>
        ))}
      </ScrollView>

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
              Save measurements to a client or personal profile.
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
    scroll: { padding: 18, paddingBottom: 36 },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 16,
    },
    iconBtn: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: theme.surface,
      alignItems: "center",
      justifyContent: "center",
    },
    headerCopy: { alignItems: "center" },
    headerTitle: { color: theme.text, fontSize: 18, fontWeight: "700" },
    headerSubtitle: { color: theme.muted, fontSize: 12, marginTop: 2 },
    capturePanel: {
      backgroundColor: theme.surface,
      borderRadius: 14,
      padding: 14,
      marginBottom: 14,
    },
    partHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    eyebrow: {
      color: theme.primary,
      fontSize: 12,
      fontWeight: "700",
      textTransform: "uppercase",
    },
    partTitle: { color: theme.text, fontSize: 28, fontWeight: "700" },
    readingPill: {
      minWidth: 92,
      borderRadius: 14,
      backgroundColor: theme.background,
      paddingHorizontal: 12,
      paddingVertical: 10,
      alignItems: "center",
    },
    readingPillValue: {
      color: theme.primary,
      fontSize: 20,
      fontWeight: "700",
    },
    guideText: {
      color: theme.muted,
      fontSize: 13,
      lineHeight: 18,
      marginBottom: 12,
    },
    cameraWrapper: {
      width: "100%",
      aspectRatio: 3 / 4,
      borderRadius: 12,
      overflow: "hidden",
      backgroundColor: theme.background,
    },
    camera: { ...StyleSheet.absoluteFillObject },
    cameraOverlay: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: "center",
      alignItems: "center",
      padding: 18,
    },
    frameGuide: {
      width: "68%",
      height: "72%",
      borderLeftWidth: 2,
      borderRightWidth: 2,
      borderColor: theme.primary,
      justifyContent: "space-between",
      opacity: 0.9,
    },
    frameLineTop: {
      height: 2,
      backgroundColor: theme.primary,
      width: "100%",
    },
    frameLineBottom: {
      height: 2,
      backgroundColor: theme.primary,
      width: "100%",
    },
    cameraBadge: {
      position: "absolute",
      top: 14,
      left: 14,
      backgroundColor: theme.primary,
      borderRadius: 20,
      paddingHorizontal: 10,
      paddingVertical: 6,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    cameraBadgeText: {
      color: theme.primaryText,
      fontSize: 12,
      fontWeight: "700",
    },
    engineRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginTop: 12,
    },
    engineText: { color: theme.muted, fontSize: 12, flex: 1, lineHeight: 17 },
    actionsRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
    primaryBtn: {
      flex: 1,
      backgroundColor: theme.primary,
      borderRadius: 30,
      paddingVertical: 15,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 8,
    },
    primaryBtnText: {
      color: theme.primaryText,
      fontSize: 15,
      fontWeight: "700",
    },
    secondaryBtn: {
      width: 92,
      borderRadius: 30,
      borderWidth: 1,
      borderColor: theme.border,
      alignItems: "center",
      justifyContent: "center",
    },
    secondaryBtnText: { color: theme.text, fontSize: 14, fontWeight: "600" },
    disabled: { opacity: 0.55 },
    section: { marginBottom: 16 },
    sectionTitle: {
      color: theme.subtle,
      fontSize: 13,
      fontWeight: "700",
      marginBottom: 8,
    },
    partGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    partChip: {
      width: "31.5%",
      minHeight: 58,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.surface,
      padding: 10,
      justifyContent: "center",
    },
    partChipActive: {
      borderColor: theme.primary,
      backgroundColor: theme.primary,
    },
    partChipDone: { borderColor: theme.primary },
    partChipText: { color: theme.text, fontSize: 13, fontWeight: "600" },
    partChipTextActive: { color: theme.primaryText },
    partChipValue: { color: theme.primary, fontSize: 11, marginTop: 4 },
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
      fontWeight: "700",
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
    modalBtnText: { color: theme.primaryText, fontSize: 15, fontWeight: "700" },
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
      fontWeight: "600",
    },
    modalCancel: { alignItems: "center", paddingVertical: 12 },
    modalCancelText: { color: theme.muted, fontSize: 14 },
  });
