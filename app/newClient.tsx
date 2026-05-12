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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../config/firebase";
import { useAuth } from "./context/AuthContext";

export default function NewClient() {
  const router = useRouter();
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim() || !user) return;

    try {
      setSaving(true);

      await addDoc(collection(db, "clients"), {
        userId: user.uid,           // ties client to this tailor
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        measurements: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      router.back();
    } catch (e: any) {
      Alert.alert("Error", e.message || "Could not save client.");
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
            <ChevronLeft color="#fff" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Client</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Avatar Placeholder */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>+</Text>
          </View>
          <Text style={styles.avatarHint}>add photo</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.label}>Full name</Text>
          <TextInput
            placeholder="e.g. Abena Kyei"
            placeholderTextColor="#888"
            style={styles.input}
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            placeholder="e.g. abena@email.com"
            placeholderTextColor="#888"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />

          <Text style={styles.label}>Phone</Text>
          <TextInput
            placeholder="e.g. 0244000000"
            placeholderTextColor="#888"
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
            <ActivityIndicator color="#1a1a1a" />
          ) : (
            <Text style={styles.saveBtnText}>Save client</Text>
          )}
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
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "500" },
  avatarSection: { alignItems: "center", marginBottom: 30 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#252525",
    borderWidth: 2,
    borderColor: "#b8f54a",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  avatarText: { color: "#b8f54a", fontSize: 28, fontWeight: "300" },
  avatarHint: { color: "#888", fontSize: 13 },
  form: { marginBottom: 30 },
  label: { color: "#aaa", fontSize: 13, marginBottom: 8, marginTop: 16 },
  input: {
    backgroundColor: "#252525",
    borderRadius: 12,
    padding: 14,
    color: "#fff",
    fontSize: 14,
  },
  saveBtn: {
    backgroundColor: "#b8f54a",
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: "center",
  },
  saveBtnDisabled: { opacity: 0.4 },
  saveBtnText: { color: "#1a1a1a", fontSize: 15, fontWeight: "600" },
});