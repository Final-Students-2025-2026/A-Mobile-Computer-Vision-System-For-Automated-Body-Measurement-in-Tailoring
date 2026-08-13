import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Eye, EyeOff } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../contexts/AuthContext";

export default function Signup() {
  const { signup } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    setError("");
    if (!name.trim()) return setError("Name is required");
    if (!email.trim()) return setError("Email is required");
    if (!password) return setError("Password is required");
    if (password !== confirmPassword) return setError("Passwords do not match");
    if (password.length < 6) return setError("Password must be at least 6 characters");
    try {
      setLoading(true);
      await signup(email.trim(), password, name.trim());
    } catch (e: any) {
      setError(e.message || "Could not create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Register Now</Text>
            <Text style={styles.subtitle}>
              Become a part of our community
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {error ? <Text style={styles.error}>{error}</Text> : null}

            <TextInput
              style={styles.input}
              placeholder="Full name"
              placeholderTextColor="#555"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />

            <TextInput
              style={styles.input}
              placeholder="Email address"
              placeholderTextColor="#555"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <View style={styles.passwordWrapper}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Password"
                placeholderTextColor="#555"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                {showPassword
                  ? <Eye color="#555" size={20} />
                  : <EyeOff color="#555" size={20} />
                }
              </TouchableOpacity>
            </View>

            <View style={styles.passwordWrapper}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Confirm password"
                placeholderTextColor="#555"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirm}
              />
              <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
                {showConfirm
                  ? <Eye color="#555" size={20} />
                  : <EyeOff color="#555" size={20} />
                }
              </TouchableOpacity>
            </View>
          </View>

          {/* Sign Up Button */}
          <TouchableOpacity
            style={[styles.signUpBtn, loading && { opacity: 0.7 }]}
            onPress={handleSignup}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#111" />
              : <Text style={styles.signUpBtnText}>Sign Up</Text>
            }
          </TouchableOpacity>

          {/* Or continue with */}
          <View style={styles.orRow}>
            <View style={styles.divider} />
            <Text style={styles.orText}>Or continue with</Text>
            <View style={styles.divider} />
          </View>

          {/* Social */}
          <View style={styles.socialRow}>
            <TouchableOpacity style={styles.socialBtn}>
              <Text style={styles.socialEmoji}>G</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn}>
              <Text style={styles.socialEmoji}>📱</Text>
            </TouchableOpacity>
          </View>

          {/* Terms */}
          <Text style={styles.terms}>
            By clicking Register, you agree to our{" "}
            <Text style={styles.termsLink}>Terms and Conditions</Text>
          </Text>

          {/* Sign in */}
          <View style={styles.signinRow}>
            <Text style={styles.signinText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
              <Text style={styles.signinLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111111" },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingBottom: 40,
    justifyContent: "center",
  },
  header: { marginBottom: 36, marginTop: 20 },
  title: {
    color: "#ffffff",
    fontSize: 32,
    fontFamily: "PlusJakartaSans_800ExtraBold",
    marginBottom: 8,
  },
  subtitle: {
    color: "#666",
    fontSize: 15,
    fontFamily: "PlusJakartaSans_400Regular",
  },
  form: { gap: 14, marginBottom: 24 },
  error: {
    color: "#ff6b6b",
    fontSize: 13,
    textAlign: "center",
    fontFamily: "PlusJakartaSans_400Regular",
  },
  input: {
    backgroundColor: "#1e1e1e",
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 20,
    color: "#fff",
    fontSize: 15,
    fontFamily: "PlusJakartaSans_400Regular",
  },
  passwordWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e1e1e",
    borderRadius: 14,
    paddingHorizontal: 20,
  },
  passwordInput: {
    flex: 1,
    color: "#fff",
    paddingVertical: 18,
    fontSize: 15,
    fontFamily: "PlusJakartaSans_400Regular",
  },
  signUpBtn: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: "center",
    marginBottom: 28,
  },
  signUpBtnText: {
    color: "#111",
    fontSize: 16,
    fontFamily: "PlusJakartaSans_700Bold",
  },
  orRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
  },
  divider: { flex: 1, height: 1, backgroundColor: "#222" },
  orText: {
    color: "#555",
    fontSize: 13,
    fontFamily: "PlusJakartaSans_400Regular",
  },
  socialRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginBottom: 24,
  },
  socialBtn: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: "#1e1e1e",
    alignItems: "center",
    justifyContent: "center",
  },
  socialEmoji: {
    color: "#fff",
    fontSize: 20,
    fontFamily: "PlusJakartaSans_700Bold",
  },
  terms: {
    color: "#555",
    fontSize: 12,
    textAlign: "center",
    fontFamily: "PlusJakartaSans_400Regular",
    marginBottom: 20,
    lineHeight: 18,
  },
  termsLink: {
    color: "#b8f54a",
    fontFamily: "PlusJakartaSans_600SemiBold",
  },
  signinRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signinText: {
    color: "#555",
    fontSize: 14,
    fontFamily: "PlusJakartaSans_400Regular",
  },
  signinLink: {
    color: "#b8f54a",
    fontFamily: "PlusJakartaSans_700Bold",
    fontSize: 14,
  },
});