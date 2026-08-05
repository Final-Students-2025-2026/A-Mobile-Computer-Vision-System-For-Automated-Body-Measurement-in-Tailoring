import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Image,
  TextInput,
  Alert,
  Share,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  ChevronLeft,
  Pencil,
  Save,
  Send,
  Shirt,
  Trash2,
  X,
} from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import {
  doc,
  getDoc,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { useAppTheme } from "../../contexts/ThemeContext";

export default function ClientProfile() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const styles = createStyles(theme);
  const { id } = useLocalSearchParams();
  const [client, setClient] = useState<any>(null);
  const [measurements, setMeasurements] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [gender, setGender] = useState(1);
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");

  useEffect(() => {
    if (!id) return;

    const fetchClientData = async () => {
      try {
        // Get client info
        const clientDoc = await getDoc(doc(db, "clients", id as string));
        if (clientDoc.exists()) {
          const data = { id: clientDoc.id, ...clientDoc.data() };
          setClient(data);
          setName((data as any).name || "");
          setEmail((data as any).email || "");
          setPhone((data as any).phone || "");
          setPhotoURL((data as any).photoURL || "");
          setGender((data as any).gender || 1);
          setAge((data as any).age ? String((data as any).age) : "");
          setWeight((data as any).weight ? String((data as any).weight) : "");
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

  const pickPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Permission needed",
        "Allow photo access to update this client photo.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      base64: true,
      quality: 0.35,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      const mimeType = asset.mimeType || "image/jpeg";

      if (!asset.base64) {
        Alert.alert(
          "Photo error",
          "Could not read the selected photo. Please choose another image.",
        );
        return;
      }

      setPhotoURL(`data:${mimeType};base64,${asset.base64}`);
    }
  };

  const handleCancelEdit = () => {
    setName(client?.name || "");
    setEmail(client?.email || "");
    setPhone(client?.phone || "");
    setPhotoURL(client?.photoURL || "");
    setGender(client?.gender || 1);
    setAge((client as any)?.age ? String((client as any).age) : "");
    setWeight((client as any)?.weight ? String((client as any).weight) : "");
    setIsEditing(false);
  };

  const handleUpdateClient = async () => {
    if (!id || !name.trim()) return;

    try {
      setSaving(true);

      await updateDoc(doc(db, "clients", id as string), {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        photoURL,
        gender,
        age: age ? Number(age) : null,
        weight: weight ? Number(weight) : null,
        updatedAt: serverTimestamp(),
      });

      setClient((current: any) => ({
        ...current,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        photoURL,
        gender,
        age: age ? Number(age) : null,
        weight: weight ? Number(weight) : null,
      }));
      setIsEditing(false);
    } catch (e: any) {
      Alert.alert(
        "Error",
        e.code
          ? `${e.code}: ${e.message || "Could not update client."}`
          : e.message || "Could not update client.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClient = () => {
    if (!id) return;

    Alert.alert(
      "Delete client",
      "This will permanently delete this client. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setSaving(true);
              await deleteDoc(doc(db, "clients", id as string));
              router.replace("/(tabs)/clients");
            } catch (e: any) {
              Alert.alert(
                "Error",
                e.code
                  ? `${e.code}: ${e.message || "Could not delete client."}`
                  : e.message || "Could not delete client.",
              );
            } finally {
              setSaving(false);
            }
          },
        },
      ],
    );
  };

  const getMeasurementsMessage = () => {
    const nameLine = `${client?.name || "Measurement profile"} measurements`;
    const contactLines = [
      email ? `Email: ${email}` : "",
      phone ? `Phone: ${phone}` : "",
    ].filter(Boolean);
    const measurementLines = measurementKeys.flatMap((key) => {
      const value = measurements[key];
      return typeof value === "number" ? [`${key}: ${value} cm`] : [];
    });

    return [
      nameLine,
      "",
      ...contactLines,
      contactLines.length ? "" : "",
      ...measurementLines,
      "",
      "Shared from Measure AI.",
    ]
      .filter((line, index, lines) => line || lines[index - 1])
      .join("\n");
  };

  const handleShareMeasurements = async () => {
    if (!measurementKeys.length) {
      Alert.alert(
        "No measurements yet",
        "Add measurements before sharing this profile with a tailor.",
      );
      return;
    }

    await Share.share({
      title: `${client?.name || "Client"} measurements`,
      message: getMeasurementsMessage(),
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.primary} />
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
        (k) =>
          ![
            "takenAt",
            "takenBy",
            "labels",
            "engine",
            "confidence",
            "frameUri",
            "measurementType",
          ].includes(k),
      )
    : [];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeft color={theme.text} size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isEditing ? "Edit profile" : client?.name || "Profile"}
          </Text>
          <TouchableOpacity
            onPress={isEditing ? handleCancelEdit : () => setIsEditing(true)}
          >
            {isEditing ? (
              <X color={theme.text} size={22} />
            ) : (
              <Pencil color={theme.text} size={22} />
            )}
          </TouchableOpacity>
        </View>

        {isEditing ? (
          <View style={styles.editCard}>
            <TouchableOpacity
              style={styles.editPhotoWrapper}
              onPress={pickPhoto}
            >
              <View style={styles.editPhoto}>
                {photoURL ? (
                  <Image
                    source={{ uri: photoURL }}
                    style={styles.editPhotoImage}
                  />
                ) : (
                  <Text style={styles.editPhotoText}>+</Text>
                )}
              </View>
              <Text style={styles.editPhotoHint}>change photo</Text>
            </TouchableOpacity>

            <Text style={styles.label}>Full name</Text>
            <TextInput
              placeholder="Client name"
              placeholderTextColor={theme.muted}
              style={styles.input}
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.label}>Email</Text>
            <TextInput
              placeholder="client@email.com"
              placeholderTextColor={theme.muted}
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />

            <Text style={styles.label}>Phone</Text>
            <TextInput
              placeholder="0244000000"
              placeholderTextColor={theme.muted}
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />

            <Text style={styles.label}>Gender</Text>
            <View style={styles.genderRow}>
              <TouchableOpacity
                style={[
                  styles.genderBtn,
                  gender === 1 && styles.genderBtnActive,
                ]}
                onPress={() => setGender(1)}
              >
                <Text
                  style={[
                    styles.genderBtnText,
                    gender === 1 && styles.genderBtnTextActive,
                  ]}
                >
                  Male
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.genderBtn,
                  gender === 2 && styles.genderBtnActive,
                ]}
                onPress={() => setGender(2)}
              >
                <Text
                  style={[
                    styles.genderBtnText,
                    gender === 2 && styles.genderBtnTextActive,
                  ]}
                >
                  Female
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.rowSplit}>
              <View style={styles.rowSplitItem}>
                <Text style={styles.label}>Age</Text>
                <TextInput
                  placeholder="e.g. 32"
                  placeholderTextColor={theme.muted}
                  style={styles.input}
                  value={age}
                  onChangeText={setAge}
                  keyboardType="number-pad"
                />
              </View>
              <View style={styles.rowSplitItem}>
                <Text style={styles.label}>Weight (kg)</Text>
                <TextInput
                  placeholder="e.g. 70"
                  placeholderTextColor={theme.muted}
                  style={styles.input}
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="number-pad"
                />
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.saveBtn,
                (!name.trim() || saving) && styles.disabled,
              ]}
              disabled={!name.trim() || saving}
              onPress={handleUpdateClient}
            >
              {saving ? (
                <ActivityIndicator color={theme.primaryText} />
              ) : (
                <>
                  <Save color={theme.primaryText} size={16} />
                  <Text style={styles.saveBtnText}>Save changes</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.deleteBtn, saving && styles.disabled]}
              disabled={saving}
              onPress={handleDeleteClient}
            >
              <Trash2 color={theme.danger} size={16} />
              <Text style={styles.deleteBtnText}>Delete client</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Measurements Card */}
        {!isEditing ? (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.clientSummary}>
                {client?.photoURL ? (
                  <Image
                    source={{ uri: client.photoURL }}
                    style={styles.clientPhoto}
                  />
                ) : null}
                <Text style={styles.lastUpdated}>
                  last updated {lastUpdated}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.updateBtn}
                onPress={() => router.push(`/measurements/${id}` as any)}
              >
                <Text style={styles.updateBtnText}>update</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.shareActions}>
              <TouchableOpacity
                style={[
                  styles.shareBtn,
                  !measurementKeys.length && styles.disabled,
                ]}
                disabled={!measurementKeys.length}
                onPress={handleShareMeasurements}
              >
                <Send color={theme.primaryText} size={16} />
                <Text style={styles.shareBtnText}>Send to tailor</Text>
              </TouchableOpacity>
              <View style={styles.shopGuide}>
                <Shirt color={theme.primary} size={16} />
                <Text style={styles.shopGuideText}>
                  Use these sizes to compare online size charts.
                </Text>
              </View>
            </View>

            {/* Measurements Grid */}
            {measurementKeys.length > 0 ? (
              <View style={styles.grid}>
                {measurementKeys.map((key) => (
                  <View key={key} style={styles.measureBox}>
                    <Text style={styles.measureLabel}>{key}</Text>
                    <Text style={styles.measureValue}>
                      {typeof measurements[key] === "number"
                        ? `${measurements[key]} cm`
                        : "--"}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.emptyText}>
                No measurements yet. Capture sizes before sending to a tailor.
              </Text>
            )}
          </View>
        ) : null}

        {/* New Measurements Button */}
        {!isEditing ? (
          <TouchableOpacity
            style={styles.newMeasurementBtn}
            onPress={() => router.push(`/measurements/${id}` as any)}
          >
            <Text style={styles.newMeasurementText}>
              + capture measurements
            </Text>
          </TouchableOpacity>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>["theme"]) =>
  StyleSheet.create({
    loadingContainer: {
      flex: 1,
      backgroundColor: theme.background,
      alignItems: "center",
      justifyContent: "center",
    },
    container: { flex: 1, backgroundColor: theme.background },
    scroll: { padding: 20 },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 30,
    },
    headerTitle: { color: theme.text, fontSize: 22, fontWeight: "600" },
    card: {
      backgroundColor: theme.surface,
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
    clientSummary: { flexDirection: "row", alignItems: "center", gap: 10 },
    clientPhoto: { width: 34, height: 34, borderRadius: 17 },
    lastUpdated: { color: theme.muted, fontSize: 12 },
    updateBtn: {
      backgroundColor: theme.primary,
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 6,
    },
    updateBtnText: {
      color: theme.primaryText,
      fontSize: 13,
      fontWeight: "600",
    },
    grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
    shareActions: { gap: 10, marginBottom: 18 },
    shareBtn: {
      backgroundColor: theme.primary,
      borderRadius: 30,
      paddingVertical: 14,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 8,
    },
    shareBtnText: {
      color: theme.primaryText,
      fontSize: 14,
      fontWeight: "600",
    },
    genderRow: { flexDirection: "row", gap: 10, marginTop: 8, marginBottom: 4 },
    genderBtn: {
      flex: 1,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 14,
      alignItems: "center",
    },
    genderBtnActive: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    genderBtnText: { color: theme.text, fontSize: 13, fontWeight: "500" },
    genderBtnTextActive: { color: theme.primaryText },
    rowSplit: { flexDirection: "row", gap: 12, marginTop: 8, marginBottom: 4 },
    rowSplitItem: { flex: 1 },
    shopGuide: {
      borderColor: theme.border,
      borderWidth: 1,
      borderRadius: 12,
      padding: 12,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    shopGuideText: { color: theme.muted, fontSize: 12, flex: 1 },
    measureBox: {
      width: "48%",
      backgroundColor: theme.background,
      borderRadius: 12,
      padding: 16,
    },
    measureLabel: { color: theme.muted, fontSize: 12, marginBottom: 6 },
    measureValue: { color: theme.text, fontSize: 20, fontWeight: "600" },
    emptyText: {
      color: theme.muted,
      fontSize: 13,
      textAlign: "center",
      paddingVertical: 20,
    },
    newMeasurementBtn: {
      backgroundColor: theme.primary,
      borderRadius: 30,
      paddingVertical: 16,
      alignItems: "center",
    },
    newMeasurementText: {
      color: theme.primaryText,
      fontSize: 15,
      fontWeight: "600",
    },
    editCard: {
      backgroundColor: theme.surface,
      borderRadius: 16,
      padding: 16,
    },
    editPhotoWrapper: { alignItems: "center", marginBottom: 18 },
    editPhoto: {
      width: 86,
      height: 86,
      borderRadius: 43,
      backgroundColor: theme.background,
      borderWidth: 2,
      borderColor: theme.primary,
      borderStyle: "dashed",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      marginBottom: 8,
    },
    editPhotoImage: { width: "100%", height: "100%" },
    editPhotoText: { color: theme.primary, fontSize: 28, fontWeight: "300" },
    editPhotoHint: { color: theme.muted, fontSize: 13 },
    label: {
      color: theme.subtle,
      fontSize: 13,
      marginBottom: 8,
      marginTop: 14,
    },
    input: {
      backgroundColor: theme.background,
      borderRadius: 12,
      padding: 14,
      color: theme.text,
      fontSize: 14,
    },
    saveBtn: {
      backgroundColor: theme.primary,
      borderRadius: 30,
      paddingVertical: 15,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 8,
      marginTop: 24,
    },
    saveBtnText: { color: theme.primaryText, fontSize: 15, fontWeight: "600" },
    deleteBtn: {
      borderColor: theme.danger,
      borderWidth: 1,
      borderRadius: 30,
      paddingVertical: 15,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 8,
      marginTop: 12,
    },
    deleteBtnText: { color: theme.danger, fontSize: 15, fontWeight: "600" },
    disabled: { opacity: 0.45 },
  });
