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
import { Eye, EyeOff } from "lucide-react-native";
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
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Please sign in to your account</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {error ? <Text style={styles.error}>{error}</Text> : null}

            <TextInput
              style={styles.input}
              placeholder="Email or Username"
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
                {showPassword ? (
                  <Eye color="#555" size={20} />
                ) : (
                  <EyeOff color="#555" size={20} />
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => router.push("/(auth)/forgotPassword")}
              style={styles.forgotBtn}
            >
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>
          </View>

          {/* Sign In Button */}
          <TouchableOpacity
            style={[styles.signInBtn, loading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#111" />
            ) : (
              <Text style={styles.signInBtnText}>Sign In</Text>
            )}
          </TouchableOpacity>

          {/* Or continue with */}
          <View style={styles.orRow}>
            <View style={styles.divider} />
            <Text style={styles.orText}>Or continue with</Text>
            <View style={styles.divider} />
          </View>

          {/* Social buttons */}
          <View style={styles.socialRow}>
            <TouchableOpacity
              style={styles.socialBtn}
              onPress={() => router.push("../../hooks/useGoogleSignIn")}
            >
              <Image
                source={require("../../assets/icons/google.png")}
                style={styles.socialIcon}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.socialBtn}
              onPress={() => router.push("/(auth)/phoneLogin")}
            >
              <Text style={styles.phoneIcon}>📱</Text>
            </TouchableOpacity>
          </View>

          {/* Sign up */}
          <View style={styles.signupRow}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/signup")}>
              <Text style={styles.signupLink}>Sign Up</Text>
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
  header: {
    marginBottom: 40,
    marginTop: 20,
  },
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
  forgotBtn: { alignSelf: "flex-end" },
  forgotText: {
    color: "#b8f54a",
    fontSize: 13,
    fontFamily: "PlusJakartaSans_600SemiBold",
  },
  signInBtn: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: "center",
    marginBottom: 28,
  },
  signInBtnText: {
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
    marginBottom: 32,
  },
  socialBtn: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: "#1e1e1e",
    alignItems: "center",
    justifyContent: "center",
  },
  socialIcon: { width: 24, height: 24 },
  phoneIcon: { fontSize: 24 },
  signupRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
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
