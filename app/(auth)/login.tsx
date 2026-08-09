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
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Eye, EyeOff } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../contexts/AuthContext";

const { height } = Dimensions.get("window");

export default function Login() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    const trimmedEmail = email.trim();
    setError("");
    if (!trimmedEmail) return setError("Email is required");
    if (!password) return setError("Password is required");

    try {
      setLoading(true);
      await login(trimmedEmail, password);
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
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top section */}
          <View style={styles.topSection}>
            <Image
              source={require("../../assets/images/measure-ai-icon.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Sign in to your account</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordWrapper}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Enter your password"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                {showPassword
                  ? <Eye color="#999" size={20} />
                  : <EyeOff color="#999" size={20} />
                }
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => router.push("/(auth)/forgotPassword")}
              style={styles.forgotBtn}
            >
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>
          </View>

          {/* Bottom section */}
          <View style={styles.bottomSection}>
            <TouchableOpacity
              style={[styles.signInBtn, loading && { opacity: 0.7 }]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#0d0d0d" />
                : <Text style={styles.signInBtnText}>Sign in</Text>
              }
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.divider} />
            </View>

            <TouchableOpacity style={styles.googleBtn}>
              <Image
                source={require("../../assets/icons/google.png")}
                style={styles.googleIcon}
              />
              <Text style={styles.googleText}>Continue with Google</Text>
            </TouchableOpacity>

            <View style={styles.signupRow}>
              <Text style={styles.signupText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/signup")}>
                <Text style={styles.signupLink}>Sign up</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.privacy}>
              By continuing, you agree to our Terms & Privacy Policy
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff" },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingBottom: 40,
  },
  topSection: {
    paddingTop: 40,
    paddingBottom: 40,
    gap: 8,
  },
  logo: {
    width: 56,
    height: 56,
    borderRadius: 14,
    marginBottom: 16,
  },
  title: {
    color: "#111",
    fontSize: 30,
    fontWeight: "800",
  },
  subtitle: {
    color: "#888",
    fontSize: 15,
  },
  form: { gap: 4 },
  label: {
    color: "#333",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
    marginTop: 16,
  },
  input: {
    backgroundColor: "#f5f5f5",
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 18,
    color: "#111",
    fontSize: 15,
  },
  passwordWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 14,
    paddingHorizontal: 18,
  },
  passwordInput: {
    flex: 1,
    color: "#111",
    paddingVertical: 16,
    fontSize: 15,
  },
  forgotBtn: { alignSelf: "flex-end", marginTop: 10 },
  forgotText: { color: "#b8f54a", fontSize: 13, fontWeight: "600" },
  error: {
    color: "#e53935",
    fontSize: 13,
    marginBottom: 8,
    textAlign: "center",
  },
  bottomSection: {
    marginTop: 32,
    gap: 16,
  },
  signInBtn: {
    backgroundColor: "#0d0d0d",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
  },
  signInBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  divider: { flex: 1, height: 1, backgroundColor: "#eee" },
  dividerText: { color: "#aaa", fontSize: 13 },
  googleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 16,
    paddingVertical: 16,
    gap: 10,
  },
  googleIcon: { width: 20, height: 20 },
  googleText: { color: "#111", fontSize: 15, fontWeight: "500" },
  signupRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signupText: { color: "#888", fontSize: 14 },
  signupLink: { color: "#0d0d0d", fontWeight: "700", fontSize: 14 },
  privacy: {
    color: "#bbb",
    fontSize: 11,
    textAlign: "center",
  },
});