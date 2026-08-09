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

export default function Signup() {
  const { signup } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    setError("");
    if (!name.trim()) return setError("Name is required");
    if (!email.trim()) return setError("Email is required");
    if (!password) return setError("Password is required");
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
            <Text style={styles.title}>Create account</Text>
            <Text style={styles.subtitle}>Join Measure AI today</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Text style={styles.label}>Full name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              placeholderTextColor="#999"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />

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
                placeholder="Create a password"
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
          </View>

          {/* Bottom section */}
          <View style={styles.bottomSection}>
            <TouchableOpacity
              style={[styles.signUpBtn, loading && { opacity: 0.7 }]}
              onPress={handleSignup}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#0d0d0d" />
                : <Text style={styles.signUpBtnText}>Create account</Text>
              }
            </TouchableOpacity>

            <View style={styles.signinRow}>
              <Text style={styles.signinText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
                <Text style={styles.signinLink}>Sign in</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.privacy}>
              By signing up, you agree to our Terms & Privacy Policy
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
  signUpBtn: {
    backgroundColor: "#0d0d0d",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
  },
  signUpBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  signinRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signinText: { color: "#888", fontSize: 14 },
  signinLink: { color: "#0d0d0d", fontWeight: "700", fontSize: 14 },
  privacy: {
    color: "#bbb",
    fontSize: 11,
    textAlign: "center",
  },
});