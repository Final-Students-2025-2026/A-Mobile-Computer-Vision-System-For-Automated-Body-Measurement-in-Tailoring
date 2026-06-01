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

export default function Signup() {
  const router = useRouter();
  const { signup } = useAuth();
  const { theme } = useAppTheme();
  const styles = createLoginStyles(theme);
  const {
    error: googleError,
    loading: googleLoading,
    signInWithGoogle,
  } = useGoogleSignIn();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const getPasswordError = (value: string) => {
    if (!value) {
      return "Password required.";
    }

    if (value.length < 8) {
      return "Password must be at least 8 characters.";
    }

    if (!/[A-Z]/.test(value)) {
      return "Password must include an uppercase letter.";
    }

    if (!/\d/.test(value)) {
      return "Password must include a number.";
    }

    return "";
  };

  const handleSignup = async () => {
    const trimmedEmail = email.trim();
    const trimmedName = name.trim();
    const passwordError = getPasswordError(password);

    setError("");

    if (!trimmedName) {
      setError("Name required.");
      return;
    }

    if (!trimmedEmail) {
      setError("Email required.");
      return;
    }

    if (passwordError) {
      setError(passwordError);
      return;
    }

    try {
      setLoading(true);
      await signup(trimmedEmail, password, trimmedName);
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
            placeholder="name"
            style={styles.input}
            placeholderTextColor={theme.muted}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />

          <TextInput
            placeholder="email"
            style={styles.input}
            placeholderTextColor={theme.muted}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
          />

          <View style={styles.passwordWrapper}>
            <TextInput
              placeholder="password"
              style={styles.passwordInput}
              placeholderTextColor={theme.muted}
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

          {error || googleError ? (
            <Text style={styles.error}>{error || googleError}</Text>
          ) : null}

          <TouchableOpacity
            style={styles.button}
            onPress={handleSignup}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Creating Account..." : "Sign Up"}
            </Text>
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

          <Text style={styles.privacy}>
            By signing up, you agree to our Terms & Privacy Policy
          </Text>

          <View style={styles.row}>
            <Text style={styles.muted}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/login")}>
              <Text style={styles.link}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
