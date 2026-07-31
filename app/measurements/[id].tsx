import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { StatusBar } from "expo-status-bar";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Check, ChevronLeft, RotateCcw, SwitchCamera } from "lucide-react-native";
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
import { useUserProfile } from "../../hooks/useUserProfile";
import {
  analyzeBodyScanSession,
  CameraFacing,
  CameraFrame,
  measurementParts,
  MeasurementType,
} from "../../services/measurementEngine";

type Step = "instructions" | "camera" | "processing" | "results";
type ScanView = "front" | "side";

type Measurements = Partial<Record<MeasurementType, number>> & {
  height?: number;
};

export default function TakeMeasurements() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const styles = createStyles(theme);
  const { id } = useLocalSearchParams();
  const clientId = Array.isArray(id) ? id[0] : id;
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [step, setStep] = useState<Step>("instructions");
  const [scanView, setScanView] = useState<ScanView>("front");
  const [frontFrame, setFrontFrame] = useState<CameraFrame | null>(null);
  const [cameraFacing, setCameraFacing] = useState<CameraFacing>("front");
  const [measurements, setMeasurements] = useState<Measurements>({});
  const [confidence, setConfidence] = useState(0);
  const [saving, setSaving] = useState(false);
  const [capturing, setCapturing] = useState(false);

  const hasBodyInfo =
    Boolean(profile?.height && profile.height >= 80 && profile.height <= 260) &&
    Boolean(profile?.weight && profile.weight >= 25 && profile.weight <= 260);

  const ensurePermission = async () => {
    if (permission?.granted) return true;
    const response = await requestPermission();
    return Boolean(response.granted);
  };

  const startGuidedScan = async () => {
    if (capturing || profileLoading) return;

    if (!hasBodyInfo || !profile?.height || !profile?.weight) {
      Alert.alert(
        "Body info needed",
        "Please add your height and weight first. This helps calibrate the scan.",
        [{ text: "OK", onPress: () => router.push("/bodyInfo") }],
      );
      return;
    }

    setFrontFrame(null);
    setScanView("front");
    setStep("camera");
  };

  const captureFullBodyScan = async () => {
    if (capturing || profileLoading || !profile?.height || !profile?.weight) {
      return;
    }

    const canUseCamera = await ensurePermission();
    if (!canUseCamera) {
      Alert.alert(
        "Camera permission needed",
        "Please allow camera access so Measure AI can scan your full body.",
      );
      return;
    }

    if (!cameraRef.current) return;

    try {
      setCapturing(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.75,
        skipProcessing: false,
        shutterSound: false,
      });

      const frame: CameraFrame = {
        uri: photo.uri,
        width: photo.width,
        height: photo.height,
        cameraFacing,
        captureView: scanView === "front" ? "front" : "right",
        capturedAt: Date.now(),
      };

      if (scanView === "front") {
        setFrontFrame(frame);
        setScanView("side");
        return;
      }

      if (!frontFrame) {
        setScanView("front");
        Alert.alert("Front scan needed", "Please capture the front view first.");
        return;
      }

      setStep("processing");
      const scan = await analyzeBodyScanSession({
        knownHeightCm: profile.height,
        knownWeightKg: profile.weight,
        front: frontFrame,
        right: frame,
        requirePoseDetection: true,
      });

      const nextMeasurements = measurementParts.reduce((result, part) => {
        result[part.id] = scan.readings[part.id]?.valueCm;
        return result;
      }, {} as Measurements);

      nextMeasurements.height = Math.round(profile.height);
      setMeasurements(nextMeasurements);
      setConfidence(scan.confidence);
      setStep("results");
    } catch (e: any) {
      Alert.alert(
        "Try again",
        e.message ||
          "We could not read the full body clearly. Step back, keep head and feet visible, and try again.",
      );
      setStep("camera");
    } finally {
      setCapturing(false);
    }
  };

  const saveMeasurements = async () => {
    if (!user || !clientId || clientId === "new") {
      Alert.alert("Error", "Please select a client first");
      return;
    }

    try {
      setSaving(true);

      await addDoc(collection(db, "clients", clientId, "measurements"), {
        ...measurements,
        confidence: Math.round(confidence * 100),
        takenBy: user.uid,
        takenAt: serverTimestamp(),
        method: "full_body_mediapipe_scan",
      });

      await updateDoc(doc(db, "clients", clientId), {
        measurements: Object.keys(measurements).length,
        updatedAt: serverTimestamp(),
      });

      Alert.alert("Saved!", "Measurements saved successfully.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (e: any) {
      Alert.alert("Error", e.message || "Could not save measurements");
    } finally {
      setSaving(false);
    }
  };

  if (step === "instructions") {
    return (
      <View style={styles.instructionsContainer}>
        <StatusBar style={theme.background === "#000" ? "light" : "dark"} />
        <View style={styles.instructionsHeader}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
            <ChevronLeft color={theme.text} size={24} />
          </TouchableOpacity>
          <Text style={styles.instructionsTitle}>Before you scan</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.instructionCard}>
          <Text style={styles.instructionNumber}>1</Text>
          <View style={styles.instructionCopy}>
            <Text style={styles.instructionTitle}>Prepare your space</Text>
            <Text style={styles.instructionText}>
              Use bright light, a plain background, and place the phone far enough to see your whole body.
            </Text>
          </View>
        </View>

        <View style={styles.instructionCard}>
          <Text style={styles.instructionNumber}>2</Text>
          <View style={styles.instructionCopy}>
            <Text style={styles.instructionTitle}>Stand naturally</Text>
            <Text style={styles.instructionText}>
              Wear fitted clothes, stand straight, and keep your arms slightly away from your body.
            </Text>
          </View>
        </View>

        <View style={styles.instructionCard}>
          <Text style={styles.instructionNumber}>3</Text>
          <View style={styles.instructionCopy}>
            <Text style={styles.instructionTitle}>Take two scans</Text>
            <Text style={styles.instructionText}>
              First face the camera. Then turn to your side when the app asks you.
            </Text>
          </View>
        </View>

        {!hasBodyInfo ? (
          <TouchableOpacity
            style={styles.primaryAction}
            onPress={() => router.push("/bodyInfo")}
          >
            <Text style={styles.primaryActionText}>Add height and weight</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.primaryAction} onPress={startGuidedScan}>
            <Text style={styles.primaryActionText}>Open camera</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  if (step === "processing") {
    return (
      <View style={styles.processingContainer}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.processingTitle}>Reading full body scan</Text>
        <Text style={styles.processingSubtitle}>
          Using your height and weight to calculate body parts.
        </Text>
      </View>
    );
  }

  if (step === "results") {
    return (
      <View style={styles.resultsContainer}>
        <StatusBar style={theme.background === "#000" ? "light" : "dark"} />
        <View style={styles.resultsHeader}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
            <ChevronLeft color={theme.text} size={24} />
          </TouchableOpacity>
          <View>
            <Text style={styles.resultsTitle}>Body measurements</Text>
            <Text style={styles.confidenceText}>
              Scan confidence {Math.round(confidence * 100)}%
            </Text>
          </View>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => {
              setFrontFrame(null);
              setScanView("front");
              setStep("camera");
            }}
          >
            <RotateCcw color={theme.text} size={20} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.resultsGrid}>
          {measurementParts.map((part) => (
            <View key={part.id} style={styles.resultCard}>
              <Text style={styles.resultLabel}>{part.label}</Text>
              <Text style={styles.resultValue}>
                {measurements[part.id] ?? "--"} cm
              </Text>
            </View>
          ))}
        </ScrollView>

        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.disabled]}
          onPress={saveMeasurements}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color={theme.primaryText} />
          ) : (
            <>
              <Check color={theme.primaryText} size={18} />
              <Text style={styles.saveBtnText}>Save measurements</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.cameraScreen}>
      <StatusBar style="light" />
      <CameraView ref={cameraRef} style={styles.camera} facing={cameraFacing}>
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.cameraIconBtn}
            onPress={() => setStep("instructions")}
          >
            <ChevronLeft color="#fff" size={24} />
          </TouchableOpacity>
          <Text style={styles.cameraTitle}>
            {scanView === "front" ? "Front scan" : "Side scan"}
          </Text>
          <TouchableOpacity
            style={styles.cameraIconBtn}
            onPress={() =>
              setCameraFacing((current) =>
                current === "front" ? "back" : "front",
              )
            }
          >
            <SwitchCamera color="#fff" size={22} />
          </TouchableOpacity>
        </View>

        <View pointerEvents="none" style={styles.scanGuide}>
          <View style={styles.guideFrame} />
          <Text style={styles.guideText}>
            {scanView === "front"
              ? "Face the camera, head and feet inside"
              : "Turn to your side, head and feet inside"}
          </Text>
          <Text style={styles.guideSubText}>
            {scanView === "front"
              ? "Stand straight, arms slightly away from your body"
              : "Keep your posture straight and stay still"}
          </Text>
        </View>

        <View style={styles.bottomPanel}>
          {!hasBodyInfo ? (
            <TouchableOpacity
              style={styles.bodyInfoBtn}
              onPress={() => router.push("/bodyInfo")}
            >
              <Text style={styles.bodyInfoText}>Add height and weight first</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.profileText}>
              Height {profile?.height} cm  Weight {profile?.weight} kg
            </Text>
          )}

          <TouchableOpacity
            style={[styles.captureBtn, capturing && styles.disabled]}
            onPress={captureFullBodyScan}
            disabled={capturing}
          >
            <View style={styles.captureBtnInner}>
              {capturing ? <ActivityIndicator color="#111" /> : null}
            </View>
          </TouchableOpacity>

          <Text style={styles.captureHint}>
            {capturing
              ? "Scanning..."
              : scanView === "front"
                ? "Tap when your front view is clear"
                : "Turn sideways, then tap to finish"}
          </Text>
        </View>
      </CameraView>
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>["theme"]) =>
  StyleSheet.create({
    instructionsContainer: {
      flex: 1,
      backgroundColor: theme.background,
      paddingTop: 54,
      paddingHorizontal: 18,
    },
    instructionsHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 22,
    },
    instructionsTitle: {
      color: theme.text,
      fontSize: 20,
      fontWeight: "700",
      textAlign: "center",
    },
    headerSpacer: { width: 42, height: 42 },
    instructionCard: {
      flexDirection: "row",
      gap: 14,
      backgroundColor: theme.surface,
      borderRadius: 14,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.border,
    },
    instructionNumber: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: theme.primary,
      color: theme.primaryText,
      textAlign: "center",
      lineHeight: 30,
      fontSize: 14,
      fontWeight: "700",
    },
    instructionCopy: { flex: 1 },
    instructionTitle: {
      color: theme.text,
      fontSize: 15,
      fontWeight: "700",
      marginBottom: 5,
    },
    instructionText: {
      color: theme.muted,
      fontSize: 13,
      lineHeight: 19,
    },
    primaryAction: {
      marginTop: "auto",
      marginBottom: 24,
      backgroundColor: theme.primary,
      borderRadius: 30,
      paddingVertical: 16,
      alignItems: "center",
    },
    primaryActionText: {
      color: theme.primaryText,
      fontSize: 15,
      fontWeight: "700",
    },
    cameraScreen: { flex: 1, backgroundColor: "#000" },
    camera: { flex: 1 },
    topBar: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 2,
      paddingTop: 50,
      paddingHorizontal: 18,
      paddingBottom: 14,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: "rgba(0,0,0,0.25)",
    },
    cameraIconBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: "rgba(0,0,0,0.45)",
      alignItems: "center",
      justifyContent: "center",
    },
    cameraTitle: { color: "#fff", fontSize: 17, fontWeight: "700" },
    scanGuide: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 24,
    },
    guideFrame: {
      width: "74%",
      height: "68%",
      borderWidth: 2,
      borderColor: "rgba(255,255,255,0.85)",
      borderRadius: 140,
      backgroundColor: "rgba(255,255,255,0.02)",
    },
    guideText: {
      marginTop: 18,
      color: "#fff",
      fontSize: 15,
      fontWeight: "700",
      textAlign: "center",
      textShadowColor: "rgba(0,0,0,0.55)",
      textShadowRadius: 6,
    },
    guideSubText: {
      marginTop: 6,
      color: "rgba(255,255,255,0.82)",
      fontSize: 12,
      textAlign: "center",
      textShadowColor: "rgba(0,0,0,0.55)",
      textShadowRadius: 6,
    },
    bottomPanel: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 2,
      paddingHorizontal: 24,
      paddingTop: 18,
      paddingBottom: 34,
      alignItems: "center",
      backgroundColor: "rgba(0,0,0,0.42)",
    },
    profileText: { color: "#fff", fontSize: 13, marginBottom: 14 },
    bodyInfoBtn: {
      backgroundColor: "#fff",
      borderRadius: 22,
      paddingHorizontal: 18,
      paddingVertical: 10,
      marginBottom: 14,
    },
    bodyInfoText: { color: "#111", fontSize: 13, fontWeight: "700" },
    captureBtn: {
      width: 78,
      height: 78,
      borderRadius: 39,
      backgroundColor: "rgba(255,255,255,0.28)",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 3,
      borderColor: "#fff",
    },
    captureBtnInner: {
      width: 58,
      height: 58,
      borderRadius: 29,
      backgroundColor: "#fff",
      alignItems: "center",
      justifyContent: "center",
    },
    captureHint: {
      marginTop: 12,
      color: "rgba(255,255,255,0.82)",
      fontSize: 12,
      textAlign: "center",
    },
    disabled: { opacity: 0.6 },
    processingContainer: {
      flex: 1,
      backgroundColor: "#050505",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
    },
    processingTitle: {
      color: "#fff",
      fontSize: 20,
      fontWeight: "700",
      marginTop: 18,
      textAlign: "center",
    },
    processingSubtitle: {
      color: "rgba(255,255,255,0.72)",
      fontSize: 13,
      marginTop: 8,
      textAlign: "center",
      lineHeight: 19,
    },
    resultsContainer: { flex: 1, backgroundColor: theme.background },
    resultsHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingTop: 54,
      paddingHorizontal: 18,
      paddingBottom: 14,
    },
    iconBtn: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: theme.surface,
      alignItems: "center",
      justifyContent: "center",
    },
    resultsTitle: {
      color: theme.text,
      fontSize: 20,
      fontWeight: "700",
      textAlign: "center",
    },
    confidenceText: {
      color: theme.muted,
      fontSize: 12,
      marginTop: 4,
      textAlign: "center",
    },
    resultsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
      paddingHorizontal: 16,
      paddingBottom: 110,
    },
    resultCard: {
      width: "31%",
      minHeight: 86,
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 12,
      justifyContent: "center",
      alignItems: "center",
    },
    resultLabel: {
      color: theme.muted,
      fontSize: 11,
      textAlign: "center",
    },
    resultValue: {
      color: theme.primary,
      fontSize: 17,
      fontWeight: "700",
      marginTop: 6,
      textAlign: "center",
    },
    saveBtn: {
      position: "absolute",
      left: 16,
      right: 16,
      bottom: 18,
      backgroundColor: theme.primary,
      borderRadius: 30,
      paddingVertical: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    saveBtnText: { color: theme.primaryText, fontSize: 15, fontWeight: "700" },
  });
