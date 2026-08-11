import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Eye, EyeOff, ChevronLeft } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../contexts/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");
    if (!email.trim()) return setError("Email is required");
    if (!password) return setError("Password is required");
    try {
      setLoading(true);
      await login(email.trim(), password);
    } catch (e: any) {
      setError("Invalid email or password");
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
          {/* Back button */}
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <ChevronLeft color="#fff" size={24} />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Welcome back 👋</Text>
            <Text style={styles.subtitle}>Sign in to your account</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Your email"
              placeholderTextColor="#444"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordWrapper}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Your password"
                placeholderTextColor="#444"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <Eye color="#666" size={20} />
                ) : (
                  <EyeOff color="#666" size={20} />
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => router.push("/(auth)/forgotPassword")}
              style={styles.forgotBtn}
            >
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          {/* Bottom */}
          <View style={styles.bottom}>
            <TouchableOpacity
              style={[styles.loginBtn, loading && { opacity: 0.7 }]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#111" />
              ) : (
                <Text style={styles.loginBtnText}>Login</Text>
              )}
            </TouchableOpacity>

            <View style={styles.orRow}>
              <View style={styles.divider} />
              <Text style={styles.orText}>Or with</Text>
              <View style={styles.divider} />
            </View>

            <TouchableOpacity style={styles.googleBtn}>
              <Image
                source={require("../../assets/icons/google.png")}
                style={styles.googleIcon}
              />
              <Text style={styles.googleText}>Sign in with Google</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.phoneBtn}
              onPress={() => router.push("/(auth)/phoneLogin")}
            >
              <Text style={styles.phoneBtnText}>Sign in with Phone</Text>
            </TouchableOpacity>

            <View style={styles.signupRow}>
              <Text style={styles.signupText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/signup")}>
                <Text style={styles.signupLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111111" },
  scroll: { flexGrow: 1, paddingHorizontal: 28, paddingBottom: 40 },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1e1e1e",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    marginBottom: 32,
  },
  header: { marginBottom: 36, gap: 8 },
  title: {
    color: "#ffffff",
    fontSize: 30,
    fontFamily: "PlusJakartaSans_800ExtraBold",
  },
  subtitle: {
    color: "#666",
    fontSize: 15,
    fontFamily: "PlusJakartaSans_400Regular",
  },
  form: { gap: 4, marginBottom: 32 },
  label: {
    color: "#888",
    fontSize: 13,
    fontFamily: "PlusJakartaSans_600SemiBold",
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: "#1e1e1e",
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 18,
    color: "#fff",
    fontSize: 15,
    fontFamily: "PlusJakartaSans_400Regular",
  },
  passwordWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e1e1e",
    borderRadius: 14,
    paddingHorizontal: 18,
  },
  passwordInput: {
    flex: 1,
    color: "#fff",
    paddingVertical: 16,
    fontSize: 15,
    fontFamily: "PlusJakartaSans_400Regular",
  },
  forgotBtn: { alignSelf: "flex-end", marginTop: 12 },
  forgotText: {
    color: "#b8f54a",
    fontSize: 13,
    fontFamily: "PlusJakartaSans_600SemiBold",
  },
  error: {
    color: "#ff6b6b",
    fontSize: 13,
    textAlign: "center",
    fontFamily: "PlusJakartaSans_400Regular",
  },
  bottom: { gap: 14 },
  loginBtn: {
    backgroundColor: "#b8f54a",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
  },
  loginBtnText: {
    color: "#111",
    fontSize: 16,
    fontFamily: "PlusJakartaSans_700Bold",
  },
  orRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  divider: { flex: 1, height: 1, backgroundColor: "#222" },
  orText: {
    color: "#555",
    fontSize: 13,
    fontFamily: "PlusJakartaSans_400Regular",
  },
  googleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1e1e1e",
    borderRadius: 16,
    paddingVertical: 16,
    gap: 10,
  },
  googleIcon: { width: 20, height: 20 },
  googleText: {
    color: "#fff",
    fontSize: 15,
    fontFamily: "PlusJakartaSans_500Medium",
  },
  phoneBtn: {
    borderWidth: 1,
    borderColor: "#2a2a2a",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  phoneBtnText: {
    color: "#fff",
    fontSize: 15,
    fontFamily: "PlusJakartaSans_500Medium",
  },
  signupRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  signupText: {
    color: "#555",
    fontSize: 14,
    fontFamily: "PlusJakartaSans_400Regular",
  },
  signupLink: {
    color: "#b8f54a",
    fontFamily: "PlusJakartaSans_700Bold",
    fontSize: 14,
  },
});
