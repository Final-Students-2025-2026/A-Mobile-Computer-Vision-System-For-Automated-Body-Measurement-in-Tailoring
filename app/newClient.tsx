import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../config/firebase";
import { useAuth } from "./context/AuthContext";
import { useAppTheme } from "./context/ThemeContext";

export default function NewClient() {
  const router = useRouter();
  const { user } = useAuth();
  const { theme } = useAppTheme();
  const styles = createStyles(theme);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [photoUri, setPhotoUri] = useState("");
  const [photoBase64, setPhotoBase64] = useState("");
  const [photoMimeType, setPhotoMimeType] = useState("image/jpeg");
  const [saving, setSaving] = useState(false);

  const pickPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Permission needed",
        "Allow photo access to add a reference photo.",
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
      setPhotoUri(asset.uri);
      setPhotoBase64(asset.base64 || "");
      setPhotoMimeType(asset.mimeType || "image/jpeg");
    }
  };

  const getPhotoDataUrl = () => {
    if (!photoUri) {
      return "";
    }

    if (!photoBase64) {
      throw new Error(
        "Could not read the selected photo. Please choose another image.",
      );
    }

    return `data:${photoMimeType};base64,${photoBase64}`;
  };

  const handleSave = async () => {
    if (!name.trim() || !user) return;

    try {
      setSaving(true);
      const photoURL = getPhotoDataUrl();

      await addDoc(collection(db, "clients"), {
        userId: user.uid, // ties client to this tailor
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        photoURL,
        measurements: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      router.back();
    } catch (e: any) {
      Alert.alert(
        "Error",
        e.code
          ? `${e.code}: ${e.message || "Could not save profile."}`
          : e.message || "Could not save profile.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeft color={theme.text} size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New measurement profile</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Avatar Placeholder */}
        <TouchableOpacity style={styles.avatarSection} onPress={pickPhoto}>
          <View style={styles.avatar}>
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>+</Text>
            )}
          </View>
          <Text style={styles.avatarHint}>add reference photo</Text>
        </TouchableOpacity>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.label}>Person or client name</Text>
          <TextInput
            placeholder="e.g. Abena Kyei"
            placeholderTextColor={theme.muted}
            style={styles.input}
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>Email for sharing</Text>
          <TextInput
            placeholder="e.g. abena@email.com"
            placeholderTextColor={theme.muted}
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />

          <Text style={styles.label}>Phone or WhatsApp</Text>
          <TextInput
            placeholder="e.g. 0244000000"
            placeholderTextColor={theme.muted}
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveBtn, (!name || saving) && styles.saveBtnDisabled]}
          disabled={!name || saving}
          onPress={handleSave}
        >
          {saving ? (
            <ActivityIndicator color={theme.primaryText} />
          ) : (
            <Text style={styles.saveBtnText}>Save profile</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
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
      marginBottom: 30,
    },
    headerTitle: { color: theme.text, fontSize: 18, fontWeight: "500" },
    avatarSection: { alignItems: "center", marginBottom: 30 },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.surface,
      borderWidth: 2,
      borderColor: theme.primary,
      borderStyle: "dashed",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 8,
      overflow: "hidden",
    },
    avatarImage: { width: "100%", height: "100%" },
    avatarText: { color: theme.primary, fontSize: 28, fontWeight: "300" },
    avatarHint: { color: theme.muted, fontSize: 13 },
    form: { marginBottom: 30 },
    label: {
      color: theme.subtle,
      fontSize: 13,
      marginBottom: 8,
      marginTop: 16,
    },
    input: {
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 14,
      color: theme.text,
      fontSize: 14,
    },
    saveBtn: {
      backgroundColor: theme.primary,
      borderRadius: 30,
      paddingVertical: 16,
      alignItems: "center",
    },
    saveBtnDisabled: { opacity: 0.4 },
    saveBtnText: { color: theme.primaryText, fontSize: 15, fontWeight: "600" },
  });
