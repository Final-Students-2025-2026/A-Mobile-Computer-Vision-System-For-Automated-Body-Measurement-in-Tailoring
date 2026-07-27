import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Dimensions,
  Animated,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ChevronLeft, Check, RotateCcw } from "lucide-react-native";
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
import { validateMeasurement } from "../../services/measurementAPI";
import {
  analyzeMeasurementFrame,
  registerMediaPipePoseAdapter,
} from "../../services/measurementEngine";
import BodySilhouette from "../../components/BodySilhoutte";

const { width, height } = Dimensions.get("window");

type Step = "intro" | "front" | "side" | "processing" | "results";

type Measurements = {
  neck?: number;
  shoulder?: number;
  chest?: number;
  waist?: number;
  hip?: number;
  sleeve?: number;
  bicep?: number;
  wrist?: number;
  inseam?: number;
  thigh?: number;
  calf?: number;
  height?: number;
};

export default function TakeMeasurements() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const styles = createStyles(theme);
  const { id } = useLocalSearchParams();
  const clientId = Array.isArray(id) ? id[0] : id;
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [step, setStep] = useState<Step>("intro");
  const [countdown, setCountdown] = useState(3);
  const [counting, setCounting] = useState(false);
  const [frontPhoto, setFrontPhoto] = useState<string | null>(null);
  const [sidePhoto, setSidePhoto] = useState<string | null>(null);
  const [measurements, setMeasurements] = useState<Measurements>({});
  const [saving, setSaving] = useState(false);
  const countdownAnim = useRef(new Animated.Value(1)).current;

  const startCountdown = () => {
    setCounting(true);
    setCountdown(3);
    let count = 3;

    const interval = setInterval(() => {
      count--;
      setCountdown(count);

      Animated.sequence([
        Animated.timing(countdownAnim, {
          toValue: 1.5,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(countdownAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      if (count === 0) {
        clearInterval(interval);
        setCounting(false);
        takePhoto();
      }
    }, 1000);
  };

  const takePhoto = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: false,
      });

      if (step === "front") {
        setFrontPhoto(photo.uri);
        setStep("side");
      } else if (step === "side") {
        setSidePhoto(photo.uri);
        setStep("processing");
        await processPhotos(frontPhoto!, photo.uri);
      }
    } catch (e) {
      Alert.alert("Error", "Could not take photo. Please try again.");
    }
  };

  const processPhotos = async (frontUri: string, sideUri: string) => {
    try {
      // Analyze front photo
      const frontResult = await analyzeMeasurementFrame({
        uri: frontUri,
        measurementType: "chest",
        capturedAt: Date.now(),
      });

      // Analyze side photo
      const sideResult = await analyzeMeasurementFrame({
        uri: sideUri,
        measurementType: "waist",
        capturedAt: Date.now(),
      });

      // Use user height if available otherwise estimate
      const estimatedHeight = profile?.height || frontResult.valueCm * 7.5;

      const newMeasurements: Measurements = {
        height: Math.round(estimatedHeight),
        chest: frontResult.valueCm,
        waist: sideResult.valueCm,
        hip: Math.round(frontResult.valueCm * 1.05),
        shoulder: Math.round(frontResult.valueCm * 0.47),
        neck: Math.round(frontResult.valueCm * 0.41),
        sleeve: Math.round(estimatedHeight * 0.36),
        bicep: Math.round(frontResult.valueCm * 0.35),
        wrist: Math.round(frontResult.valueCm * 0.18),
        inseam: Math.round(estimatedHeight * 0.46),
        thigh: Math.round(frontResult.valueCm * 0.61),
        calf: Math.round(frontResult.valueCm * 0.4),
      };

      setMeasurements(newMeasurements);
      setStep("results");
    } catch (e) {
      Alert.alert("Error", "Could not process photos. Please try again.");
      setStep("intro");
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
        takenBy: user.uid,
        takenAt: serverTimestamp(),
        method: "photo",
      });

      await updateDoc(doc(db, "clients", clientId), {
        measurements: Object.keys(measurements).length,
        updatedAt: serverTimestamp(),
      });

      Alert.alert("Saved! ✅", "Measurements saved successfully!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (e: any) {
      Alert.alert("Error", e.message || "Could not save measurements");
    } finally {
      setSaving(false);
    }
  };

  // INTRO SCREEN
  if (step === "intro") {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.introContainer}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <ChevronLeft color={theme.text} size={24} />
          </TouchableOpacity>

          <Text style={styles.introTitle}>Body Scan</Text>
          <Text style={styles.introSubtitle}>
            We'll take 2 photos to calculate your measurements accurately
          </Text>

          {/* Silhouette */}
          <View style={styles.silhouetteContainer}>
            <View style={styles.silhouetteFront}>
              <Text style={styles.silhouetteEmoji}>🧍</Text>
              <Text style={styles.silhouetteLabel}>Front</Text>
            </View>
            <View style={styles.silhouetteSide}>
              <Text style={styles.silhouetteEmoji}>🚶</Text>
              <Text style={styles.silhouetteLabel}>Side</Text>
            </View>
          </View>

          <View style={styles.tips}>
            <Text style={styles.tipsTitle}>For best results:</Text>
            <Text style={styles.tip}>• Wear fitted clothing</Text>
            <Text style={styles.tip}>
              • Stand straight with arms slightly out
            </Text>
            <Text style={styles.tip}>• Good lighting, plain background</Text>
            <Text style={styles.tip}>• Place phone 2-3 meters away</Text>
          </View>

          <TouchableOpacity
            style={styles.startBtn}
            onPress={async () => {
              if (!permission?.granted) {
                await requestPermission();
              }
              setStep("front");
            }}
          >
            <Text style={styles.startBtnText}>Start body scan</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // PROCESSING SCREEN
  if (step === "processing") {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.processingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={styles.processingTitle}>Analyzing photos...</Text>
          <Text style={styles.processingSubtitle}>
            Calculating your body measurements
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // RESULTS SCREEN
  if (step === "results") {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsTitle}>Your measurements</Text>
          <TouchableOpacity onPress={() => setStep("intro")}>
            <RotateCcw color={theme.muted} size={20} />
          </TouchableOpacity>
        </View>

        <View style={styles.resultsGrid}>
          {Object.entries(measurements).map(([key, value]) => (
            <View key={key} style={styles.resultCard}>
              <Text style={styles.resultLabel}>{key}</Text>
              <Text style={styles.resultValue}>{value} cm</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, saving && { opacity: 0.6 }]}
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
      </SafeAreaView>
    );
  }

  // CAMERA SCREEN (front or side)
  return (
    <SafeAreaView style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing="back">
        {/* Header */}
        <View style={styles.cameraHeader}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() =>
              step === "side" ? setStep("front") : setStep("intro")
            }
          >
            <ChevronLeft color="#fff" size={24} />
          </TouchableOpacity>
          <Text style={styles.cameraTitle}>
            {step === "front" ? "Front view" : "Side view"}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Silhouette guide overlay */}
        <View style={styles.silhouetteOverlay}>
          <BodySilhouette
            view={step === "front" ? "front" : "side"}
            color="#ffffff"
            opacity={0.35}
          />
        </View>

        {/* Countdown */}
        {counting && (
          <Animated.View
            style={[
              styles.countdownContainer,
              { transform: [{ scale: countdownAnim }] },
            ]}
          >
            <Text style={styles.countdownText}>{countdown}</Text>
          </Animated.View>
        )}

        {/* Bottom controls */}
        <View style={styles.cameraControls}>
          <Text style={styles.stepIndicator}>
            Step {step === "front" ? "1" : "2"} of 2
          </Text>
          <TouchableOpacity
            style={styles.captureBtn}
            onPress={startCountdown}
            disabled={counting}
          >
            <View style={styles.captureBtnInner} />
          </TouchableOpacity>
          <Text style={styles.captureHint}>
            {counting ? `${countdown}...` : "Tap to start timer"}
          </Text>
        </View>
      </CameraView>
    </SafeAreaView>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>["theme"]) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.surface,
      alignItems: "center",
      justifyContent: "center",
    },

    // Intro
    introContainer: { flex: 1, padding: 20 },
    introTitle: {
      color: theme.text,
      fontSize: 28,
      fontWeight: "700",
      marginTop: 20,
      marginBottom: 8,
    },
    introSubtitle: {
      color: theme.muted,
      fontSize: 14,
      marginBottom: 30,
      lineHeight: 20,
    },
    silhouetteContainer: {
      flexDirection: "row",
      justifyContent: "center",
      gap: 40,
      marginBottom: 30,
    },
    silhouetteFront: { alignItems: "center", gap: 8 },
    silhouetteSide: { alignItems: "center", gap: 8 },
    silhouetteEmoji: { fontSize: 80 },
    silhouetteLabel: { color: theme.muted, fontSize: 13, fontWeight: "600" },
    tips: {
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 30,
      gap: 8,
    },
    tipsTitle: {
      color: theme.text,
      fontSize: 14,
      fontWeight: "600",
      marginBottom: 4,
    },
    tip: { color: theme.muted, fontSize: 13, lineHeight: 20 },
    startBtn: {
      backgroundColor: theme.primary,
      borderRadius: 30,
      paddingVertical: 16,
      alignItems: "center",
    },
    startBtnText: { color: theme.primaryText, fontSize: 16, fontWeight: "700" },

    // Camera
    camera: { flex: 1 },
    cameraHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 20,
      paddingTop: 50,
    },
    cameraTitle: { color: "#fff", fontSize: 18, fontWeight: "700" },
    silhouetteOverlay: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 16,
    },
    silhouetteGuide: { fontSize: 120, opacity: 0.4 },
    guideText: {
      color: "#fff",
      fontSize: 14,
      textAlign: "center",
      backgroundColor: "rgba(0,0,0,0.5)",
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
    },
    countdownContainer: {
      position: "absolute",
      alignSelf: "center",
      top: "40%",
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: "rgba(0,0,0,0.7)",
      alignItems: "center",
      justifyContent: "center",
    },
    countdownText: { color: "#fff", fontSize: 48, fontWeight: "700" },
    cameraControls: {
      padding: 30,
      alignItems: "center",
      gap: 12,
      backgroundColor: "rgba(0,0,0,0.3)",
    },
    stepIndicator: { color: "#fff", fontSize: 13, opacity: 0.8 },
    captureBtn: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: "rgba(255,255,255,0.3)",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 3,
      borderColor: "#fff",
    },
    captureBtnInner: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: "#fff",
    },
    captureHint: { color: "#fff", fontSize: 12, opacity: 0.7 },

    // Processing
    processingContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 16,
    },
    processingTitle: { color: theme.text, fontSize: 20, fontWeight: "600" },
    processingSubtitle: { color: theme.muted, fontSize: 14 },

    // Results
    resultsHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 20,
    },
    resultsTitle: { color: theme.text, fontSize: 24, fontWeight: "700" },
    resultsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      paddingHorizontal: 16,
      gap: 10,
      flex: 1,
    },
    resultCard: {
      width: "31%",
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 12,
      alignItems: "center",
      gap: 4,
    },
    resultLabel: {
      color: theme.muted,
      fontSize: 11,
      textTransform: "capitalize",
    },
    resultValue: { color: theme.primary, fontSize: 18, fontWeight: "700" },
    saveBtn: {
      margin: 16,
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
