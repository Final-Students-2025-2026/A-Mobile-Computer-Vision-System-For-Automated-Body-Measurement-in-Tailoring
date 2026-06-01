import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { createLoginStyles } from "./login.styles";
import { Eye, EyeOff } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { useGoogleSignIn } from "../../hooks/useGoogleSignIn";
import { useAppTheme } from "../context/ThemeContext";
export default function Login() {
  const { login } = useAuth();
  const { theme } = useAppTheme();
  const styles = createLoginStyles(theme);
  const {
    error: googleError,
    loading: googleLoading,
    signInWithGoogle,
  } = useGoogleSignIn();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    const trimmedEmail = email.trim();

    setError("");

    if (!trimmedEmail) {
      setError("Email required.");
      return;
    }

    if (!password) {
      setError("Password required.");
      return;
    }

    try {
      setLoading(true);
      await login(trimmedEmail, password);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.wrappersmall}>
        <Image
          source={require("../../assets/images/measure-ai logo.png")}
          resizeMode="contain"
          style={styles.logoBox}
        />

        <View style={styles.card}>
          <TextInput
            placeholder="email"
            placeholderTextColor={theme.muted}
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
          />

          {/* Password with eye */}
          <View style={styles.passwordWrapper}>
            <TextInput
              placeholder="password"
              placeholderTextColor={theme.muted}
              style={styles.passwordInput}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              {showPassword ? (
                <Eye color={theme.muted} />
              ) : (
                <EyeOff color={theme.muted} />
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Signing In..." : "Sign In"}
            </Text>
          </TouchableOpacity>

          {error || googleError ? (
            <Text style={styles.error}>{error || googleError}</Text>
          ) : null}

          {/* Forgot */}
          <TouchableOpacity onPress={() => router.push("/forgotPassword")}>
            <Text style={styles.forgot}>forgot password?</Text>
          </TouchableOpacity>

          {/* Google */}
          <TouchableOpacity
            style={styles.googleBtn}
            onPress={signInWithGoogle}
            disabled={googleLoading}
          >
            <Text style={styles.googleText}>
              {googleLoading ? "Connecting to Google..." : "Continue with Google"}
            </Text>
            <Image
              source={require("../../assets/icons/google.png")}
              style={{ width: 16, height: 16, marginRight: 12 }}
            />
          </TouchableOpacity>

          {/* Privacy */}
          <Text style={styles.privacy}>
            By continuing, you agree to our Terms & Privacy Policy
          </Text>

          {/* Signup */}
          <View style={styles.row}>
            <Text style={styles.muted}>Don’t have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/signup")}>
              <Text style={styles.link}>Sign up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
