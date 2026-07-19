import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
} from "react-native";
import { CameraView } from "expo-camera";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  Camera,
  Check,
  ChevronLeft,
  Plus,
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
import { measurementParts, MeasurementType } from "../../services/measurementEngine";

export default function TakeMeasurements() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const styles = createStyles(theme);
  const { id } = useLocalSearchParams();
  const clientId = Array.isArray(id) ? id[0] : id;
  const hasSelectedClient =
    Boolean(clientId) && clientId !== "new" && clientId !== "[id]";
  const { user } = useAuth();
  const [showClientModal, setShowClientModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const sweep = useRef(new Animated.Value(0)).current;
  const {
    cameraRef,
    scanReadings,
    confidence,
    source,
    error,
    cameraFacing,
    setCameraFacing,
    currentFocus,
    setCurrentFocus,
    captureState,
    captureStep,
    scanProgress,
    startCapture,
    stopCapture,
    resetCapture,
    isScanning,
  } = useMeasurementCapture();

  const activePart =
    measurementParts.find((part) => part.id === currentFocus) ||
    measurementParts[0];
  const completedCount = measurementParts.filter(
    (part) => typeof scanReadings[part.id]?.valueCm === "number",
  ).length;
  const completionPct = Math.round(scanProgress * 100);
  const sourceLabel =
    source === "calibration"
      ? "Fallback estimate"
      : cameraFacing === "front"
        ? "Front camera live scan"
        : "Rear camera live scan";
  const stabilityLabel = `${Math.round(confidence * 100)}% stability`;
  const stateLabel = {
    idle: "Ready to scan",
    preparing: "Preparing...",
    capturing: "Capturing...",
    done: "Done",
    error: "Scan error",
  }[captureState];

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(sweep, {
          toValue: 1,
          duration: 2200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(sweep, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );

    loop.start();
    return () => loop.stop();
  }, [sweep]);

  useEffect(() => {
    return () => stopCapture();
  }, [stopCapture]);

  const toggleScan = async () => {
    if (isScanning) {
      stopCapture();
      return;
    }

    if (!hasSelectedClient) {
      setShowClientModal(true);
      return;
    }

    const started = await startCapture();

    if (!started) {
      Alert.alert(
        "Camera permission needed",
        "Allow camera access so Measure AI can keep the body scan live.",
      );
    }
  };

  const handleSelectPart = (type: MeasurementType) => {
    setCurrentFocus(type);
  };

  const handleSelectExisting = () => {
    setShowClientModal(false);
    router.push("/(tabs)/clients");
  };

  const handleAddNew = () => {
    setShowClientModal(false);
    router.push("/newClient");
  };

  const saveScan = async () => {
    if (!completedCount) {
      Alert.alert(
        "No scan yet",
        "Start the live scan and keep your whole body in frame until the measurements settle.",
      );
      return;
    }

    if (!hasSelectedClient || !user || !clientId) {
      setShowClientModal(true);
      return;
    }

    try {
      setSaving(true);
      const payload = Object.fromEntries(
        measurementParts.map((part) => [
          part.id,
          scanReadings[part.id]?.valueCm ?? part.baselineCm,
        ]),
      );

      stopCapture();

      await addDoc(collection(db, "clients", clientId, "measurements"), {
        ...payload,
        labels: Object.fromEntries(
          measurementParts.map((part) => [part.id, part.label]),
        ),
        engine: source || "calibration",
        confidence,
        cameraFacing,
        scanMode: "full-body-live",
        takenBy: user.uid,
        takenAt: serverTimestamp(),
      });

      await updateDoc(doc(db, "clients", clientId), {
        measurements: Object.keys(payload).length,
        updatedAt: serverTimestamp(),
      });

      Alert.alert("Saved", "Your live scan is ready to share.", [
        {
          text: "OK",
          onPress: () => {
            resetCapture();
            router.back();
          },
        },
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.stage}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing={cameraFacing}
          animateShutter={false}
        />

        <View style={styles.scrim} />

        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => router.back()}
          >
            <ChevronLeft color={theme.text} size={22} />
          </TouchableOpacity>

          <View style={styles.topStatus}>
            <Text style={styles.topStatusLabel}>{sourceLabel}</Text>
            <Text style={styles.topStatusValue}>{stateLabel}</Text>
          </View>

          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => router.push("/newClient")}
          >
            <Plus color={theme.text} size={18} />
          </TouchableOpacity>
        </View>

        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveBadgeText}>
            {cameraFacing === "front" ? "Front camera" : "Back camera"}
          </Text>
        </View>

        <View style={styles.centerGuide} pointerEvents="none">
          <View style={styles.guideFrame}>
            <View style={styles.scanCornerTopLeft} />
            <View style={styles.scanCornerTopRight} />
            <View style={styles.scanCornerBottomLeft} />
            <View style={styles.scanCornerBottomRight} />
          </View>

          <Animated.View
            style={[
              styles.scanLine,
              {
                transform: [
                  {
                    translateY: sweep.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-8, 280],
                    }),
                  },
                ],
              },
            ]}
          />
        </View>

        <View style={styles.bottomSheet}>
          <View style={styles.readoutRow}>
            <View style={styles.readoutLeft}>
              <Text style={styles.readoutLabel}>{activePart.category}</Text>
              <Text style={styles.readoutTitle}>{activePart.label}</Text>
              <Text style={styles.readoutCopy}>{captureStep.detail}</Text>
            </View>
            <View style={styles.readoutValueCard}>
              <Text style={styles.readoutValue}>
                {scanReadings[activePart.id]?.valueCm ?? "--"} cm
              </Text>
              <Text style={styles.readoutValueSub}>{stabilityLabel}</Text>
            </View>
          </View>

          <View style={styles.progressTrack}>
            <Animated.View
              style={[
                styles.progressFill,
                { width: `${completionPct}%` },
              ]}
            />
          </View>

          <View style={styles.metricsRow}>
            <View style={styles.metricPill}>
              <Text style={styles.metricLabel}>Coverage</Text>
              <Text style={styles.metricValue}>
                {completedCount}/{measurementParts.length}
              </Text>
            </View>
            <View style={styles.metricPill}>
              <Text style={styles.metricLabel}>Step</Text>
              <Text style={styles.metricValue}>{captureStep.title}</Text>
            </View>
            <View style={styles.metricPill}>
              <Text style={styles.metricLabel}>Status</Text>
              <Text style={styles.metricValue}>
                {captureState === "done" ? "Complete" : stateLabel}
              </Text>
            </View>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={toggleScan}
              disabled={saving}
            >
              {isScanning ? (
                <>
                  <Check color={theme.primaryText} size={18} />
                  <Text style={styles.primaryBtnText}>Pause scan</Text>
                </>
              ) : captureState === "done" ? (
                <>
                  <Camera color={theme.primaryText} size={18} />
                  <Text style={styles.primaryBtnText}>Scan again</Text>
                </>
              ) : (
                <>
                  <Camera color={theme.primaryText} size={18} />
                  <Text style={styles.primaryBtnText}>Start scan</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.secondaryBtn,
                (!completedCount || saving) && styles.disabled,
              ]}
              onPress={saveScan}
              disabled={!completedCount || saving}
            >
              {saving ? (
                <ActivityIndicator color={theme.primary} />
              ) : (
                <Text style={styles.secondaryBtnText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.modeRow}>
            <TouchableOpacity
              style={[
                styles.modeChip,
                cameraFacing === "front" && styles.modeChipActive,
              ]}
              onPress={() => setCameraFacing("front")}
            >
              <Text
                style={[
                  styles.modeChipText,
                  cameraFacing === "front" && styles.modeChipTextActive,
                ]}
              >
                Front
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modeChip,
                cameraFacing === "back" && styles.modeChipActive,
              ]}
              onPress={() => setCameraFacing("back")}
            >
              <Text
                style={[
                  styles.modeChipText,
                  cameraFacing === "back" && styles.modeChipTextActive,
                ]}
              >
                Back
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRail}
          >
            {measurementParts.map((part) => {
              const reading = scanReadings[part.id];
              const isActive = part.id === currentFocus;

              return (
                <TouchableOpacity
                  key={part.id}
                  style={[
                    styles.measureChip,
                    isActive && styles.measureChipActive,
                  ]}
                  onPress={() => handleSelectPart(part.id)}
                >
                  <Text
                    style={[
                      styles.measureChipLabel,
                      isActive && styles.measureChipLabelActive,
                    ]}
                  >
                    {part.label}
                  </Text>
                  <Text
                    style={[
                      styles.measureChipValue,
                      isActive && styles.measureChipValueActive,
                    ]}
                  >
                    {reading?.valueCm ? `${reading.valueCm} cm` : "--"}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>
      </View>

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
              Save the scan to a client or personal profile.
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
    scroll: { padding: 18, paddingBottom: 36, gap: 14 },
    stage: {
      flex: 1,
      backgroundColor: "#050505",
    },
    scrim: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(3, 6, 10, 0.56)",
    },
    topBar: {
      position: "absolute",
      left: 16,
      right: 16,
      top: 8,
      zIndex: 20,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
    },
    topStatus: {
      flex: 1,
      marginHorizontal: 12,
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderRadius: 18,
      backgroundColor: "rgba(18, 18, 18, 0.58)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.09)",
      alignItems: "center",
    },
    topStatusLabel: {
      color: theme.primary,
      fontSize: 11,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 0.8,
    },
    topStatusValue: {
      color: "#fff",
      fontSize: 14,
      fontWeight: "800",
      marginTop: 2,
    },
    liveBadge: {
      position: "absolute",
      top: 74,
      left: 16,
      zIndex: 20,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor: "rgba(18,18,18,0.55)",
      borderWidth: 1,
      borderColor: "rgba(184,245,74,0.18)",
    },
    liveDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.primary,
    },
    liveBadgeText: {
      color: "#fff",
      fontSize: 12,
      fontWeight: "700",
    },
    centerGuide: {
      ...StyleSheet.absoluteFillObject,
      zIndex: 10,
      alignItems: "center",
      justifyContent: "center",
    },
    guideFrame: {
      width: "72%",
      height: "50%",
      borderRadius: 28,
      borderWidth: 1,
      borderColor: "rgba(184,245,74,0.5)",
      backgroundColor: "rgba(0,0,0,0.02)",
    },
    camera: { ...StyleSheet.absoluteFillObject },
    scanCornerTopLeft: {
      position: "absolute",
      top: -1,
      left: -1,
      width: 36,
      height: 36,
      borderTopWidth: 3,
      borderLeftWidth: 3,
      borderColor: theme.primary,
      borderTopLeftRadius: 18,
    },
    scanCornerTopRight: {
      position: "absolute",
      top: -1,
      right: -1,
      width: 36,
      height: 36,
      borderTopWidth: 3,
      borderRightWidth: 3,
      borderColor: theme.primary,
      borderTopRightRadius: 18,
    },
    scanCornerBottomLeft: {
      position: "absolute",
      bottom: -1,
      left: -1,
      width: 36,
      height: 36,
      borderBottomWidth: 3,
      borderLeftWidth: 3,
      borderColor: theme.primary,
      borderBottomLeftRadius: 18,
    },
    scanCornerBottomRight: {
      position: "absolute",
      bottom: -1,
      right: -1,
      width: 36,
      height: 36,
      borderBottomWidth: 3,
      borderRightWidth: 3,
      borderColor: theme.primary,
      borderBottomRightRadius: 18,
    },
    scanLine: {
      position: "absolute",
      left: "13%",
      right: "13%",
      height: 2,
      backgroundColor: theme.primary,
      shadowColor: theme.primary,
      shadowOpacity: 0.65,
      shadowRadius: 8,
      elevation: 4,
    },
    primaryBtn: {
      flex: 1,
      backgroundColor: theme.primary,
      borderRadius: 18,
      paddingVertical: 15,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 8,
      minHeight: 54,
    },
    primaryBtnText: {
      color: theme.primaryText,
      fontSize: 15,
      fontWeight: "800",
    },
    secondaryBtn: {
      width: 118,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: theme.primary,
      backgroundColor: theme.surface,
      alignItems: "center",
      justifyContent: "center",
      minHeight: 54,
    },
    secondaryBtnText: {
      color: theme.primary,
      fontSize: 14,
      fontWeight: "800",
    },
    disabled: { opacity: 0.45 },
    bottomSheet: {
      position: "absolute",
      left: 12,
      right: 12,
      bottom: 12,
      zIndex: 30,
      borderRadius: 28,
      padding: 16,
      backgroundColor: "rgba(12, 14, 16, 0.88)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.08)",
      gap: 14,
    },
    readoutRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 12,
    },
    readoutLeft: { flex: 1 },
    readoutLabel: {
      color: theme.primary,
      fontSize: 11,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 0.8,
    },
    readoutTitle: {
      color: "#fff",
      fontSize: 26,
      fontWeight: "800",
      marginTop: 4,
    },
    readoutCopy: {
      color: "rgba(255,255,255,0.72)",
      fontSize: 13,
      lineHeight: 18,
      marginTop: 6,
      maxWidth: 260,
    },
    readoutValueCard: {
      minWidth: 102,
      paddingHorizontal: 12,
      paddingVertical: 12,
      borderRadius: 20,
      backgroundColor: "rgba(255,255,255,0.06)",
      alignItems: "center",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.08)",
    },
    readoutValue: {
      color: theme.primary,
      fontSize: 22,
      fontWeight: "800",
    },
    readoutValueSub: {
      color: "rgba(255,255,255,0.68)",
      fontSize: 11,
      marginTop: 4,
      textAlign: "center",
    },
    progressTrack: {
      height: 8,
      borderRadius: 999,
      backgroundColor: "rgba(255,255,255,0.09)",
      overflow: "hidden",
    },
    progressFill: {
      height: "100%",
      borderRadius: 999,
      backgroundColor: theme.primary,
    },
    metricsRow: {
      flexDirection: "row",
      gap: 8,
    },
    metricPill: {
      flex: 1,
      borderRadius: 16,
      backgroundColor: "rgba(255,255,255,0.05)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.08)",
      paddingVertical: 10,
      paddingHorizontal: 12,
      gap: 4,
    },
    metricLabel: {
      color: "rgba(255,255,255,0.58)",
      fontSize: 10,
      textTransform: "uppercase",
      letterSpacing: 0.7,
    },
    metricValue: {
      color: "#fff",
      fontSize: 13,
      fontWeight: "700",
    },
    actionRow: {
      flexDirection: "row",
      gap: 10,
    },
    modeRow: {
      flexDirection: "row",
      gap: 8,
    },
    modeChip: {
      flex: 1,
      borderRadius: 999,
      paddingVertical: 10,
      alignItems: "center",
      backgroundColor: "rgba(255,255,255,0.05)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.08)",
    },
    modeChipActive: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    modeChipText: {
      color: "rgba(255,255,255,0.72)",
      fontSize: 12,
      fontWeight: "700",
    },
    modeChipTextActive: {
      color: theme.primaryText,
    },
    chipRail: {
      gap: 10,
      paddingRight: 8,
    },
    measureChip: {
      width: 96,
      borderRadius: 18,
      padding: 12,
      backgroundColor: "rgba(255,255,255,0.05)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.08)",
    },
    measureChipActive: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    measureChipLabel: {
      color: "rgba(255,255,255,0.72)",
      fontSize: 12,
      fontWeight: "700",
    },
    measureChipLabelActive: {
      color: theme.primaryText,
    },
    measureChipValue: {
      color: theme.primary,
      fontSize: 15,
      fontWeight: "800",
      marginTop: 8,
    },
    measureChipValueActive: {
      color: theme.primaryText,
    },
    errorText: {
      color: "#fda4af",
      fontSize: 12,
      lineHeight: 17,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    },
    iconBtn: {
      width: 42,
      height: 42,
      borderRadius: 14,
      backgroundColor: theme.surface,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: theme.border,
    },
    headerCopy: { flex: 1, alignItems: "center" },
    headerTitle: { color: theme.text, fontSize: 18, fontWeight: "800" },
    headerSubtitle: { color: theme.muted, fontSize: 12, marginTop: 2 },
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
      fontWeight: "800",
      marginBottom: 6,
    },
    modalSubtitle: { color: theme.muted, fontSize: 14, marginBottom: 24 },
    modalBtn: {
      backgroundColor: theme.primary,
      borderRadius: 18,
      paddingVertical: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      marginBottom: 12,
    },
    modalBtnText: { color: theme.primaryText, fontSize: 15, fontWeight: "800" },
    modalBtnOutline: {
      borderWidth: 1,
      borderColor: theme.primary,
      borderRadius: 18,
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
      fontWeight: "800",
    },
    modalCancel: { alignItems: "center", paddingVertical: 12 },
    modalCancelText: { color: theme.muted, fontSize: 14 },
  });
