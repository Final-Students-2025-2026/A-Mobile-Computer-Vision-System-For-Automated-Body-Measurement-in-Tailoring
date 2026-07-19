import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ChevronLeft, Ruler, Scale, Calendar, Users } from "lucide-react-native";
import { useAppTheme } from "./context/ThemeContext";
import { useUserProfile } from "../hooks/useUserProfile";

export default function BodyInfo() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const styles = createStyles(theme);
  const { profile, loading, saveProfile } = useUserProfile();

  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState(1);
  const [saving, setSaving] = useState(false);

  // Populate fields when profile loads
  useEffect(() => {
    if (profile) {
      setHeight(profile.height?.toString() || "");
      setWeight(profile.weight?.toString() || "");
      setAge(profile.age?.toString() || "");
      setGender(profile.gender || 1);
    }
  }, [profile]);

  const handleSave = async () => {
    if (!height || !weight || !age) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    setSaving(true);
    const success = await saveProfile({
      height: parseFloat(height),
      weight: parseFloat(weight),
      age: parseInt(age),
      gender,
      bmi: 0,
      unit: "cm",
    });
    setSaving(false);
    if (success) {
      Alert.alert("Saved!", "Your body info has been saved.", [
        { text: "OK", onPress: () => router.back() }
      ]);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: theme.background }}>
        <ActivityIndicator color={theme.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => router.back()}
          >
            <ChevronLeft color={theme.text} size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Body info</Text>
          <View style={{ width: 40 }} />
        </View>

        <Text style={styles.subtitle}>
          This helps us validate your measurements accurately
        </Text>

        {/* Form */}
        <View style={styles.section}>
          <View style={styles.infoRow}>
            <Ruler color={theme.primary} size={18} />
            <View style={styles.infoText}>
              <Text style={styles.label}>Height (cm)</Text>
              <TextInput
                style={styles.input}
                value={height}
                onChangeText={setHeight}
                keyboardType="numeric"
                placeholder="e.g. 165"
                placeholderTextColor={theme.muted}
              />
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Scale color={theme.primary} size={18} />
            <View style={styles.infoText}>
              <Text style={styles.label}>Weight (kg)</Text>
              <TextInput
                style={styles.input}
                value={weight}
                onChangeText={setWeight}
                keyboardType="numeric"
                placeholder="e.g. 60"
                placeholderTextColor={theme.muted}
              />
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Calendar color={theme.primary} size={18} />
            <View style={styles.infoText}>
              <Text style={styles.label}>Age</Text>
              <TextInput
                style={styles.input}
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
                placeholder="e.g. 24"
                placeholderTextColor={theme.muted}
              />
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Users color={theme.primary} size={18} />
            <View style={styles.infoText}>
              <Text style={styles.label}>Gender</Text>
              <View style={styles.genderRow}>
                <TouchableOpacity
                  style={[styles.genderBtn, gender === 1 && styles.genderBtnActive]}
                  onPress={() => setGender(1)}
                >
                  <Text style={[styles.genderBtnText, gender === 1 && styles.genderBtnTextActive]}>
                    Male
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.genderBtn, gender === 2 && styles.genderBtnActive]}
                  onPress={() => setGender(2)}
                >
                  <Text style={[styles.genderBtnText, gender === 2 && styles.genderBtnTextActive]}>
                    Female
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {profile?.bmi ? (
            <View style={styles.bmiRow}>
              <Text style={styles.label}>BMI (calculated)</Text>
              <Text style={styles.bmiValue}>{profile.bmi}</Text>
            </View>
          ) : null}
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveBtn, saving && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color={theme.primaryText} />
          ) : (
            <Text style={styles.saveBtnText}>Save body info</Text>
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
      marginBottom: 8,
    },
    iconBtn: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: theme.surface,
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: { color: theme.text, fontSize: 18, fontWeight: "700" },
    subtitle: { color: theme.muted, fontSize: 13, marginBottom: 24 },
    section: {
      backgroundColor: theme.surface,
      borderRadius: 16,
      padding: 16,
      marginBottom: 20,
    },
    infoRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      paddingVertical: 8,
    },
    infoText: { flex: 1 },
    label: { color: theme.muted, fontSize: 12, marginBottom: 4 },
    input: {
      color: theme.text,
      fontSize: 14,
      paddingVertical: 4,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    divider: { height: 0.5, backgroundColor: theme.border, marginVertical: 4 },
    genderRow: { flexDirection: "row", gap: 10, marginTop: 8 },
    genderBtn: {
      flex: 1,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 10,
      alignItems: "center",
    },
    genderBtnActive: { backgroundColor: theme.primary, borderColor: theme.primary },
    genderBtnText: { color: theme.text, fontSize: 13, fontWeight: "500" },
    genderBtnTextActive: { color: theme.primaryText },
    bmiRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 12,
      padding: 12,
      backgroundColor: theme.background,
      borderRadius: 10,
    },
    bmiValue: { color: theme.primary, fontSize: 18, fontWeight: "700" },
    saveBtn: {
      backgroundColor: theme.primary,
      borderRadius: 30,
      paddingVertical: 16,
      alignItems: "center",
    },
    saveBtnText: { color: theme.primaryText, fontSize: 15, fontWeight: "600" },
  });