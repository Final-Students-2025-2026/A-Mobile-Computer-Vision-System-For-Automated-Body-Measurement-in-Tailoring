import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { createLoginStyles } from "./login.styles";
import { useRouter } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { useAppTheme } from "../context/ThemeContext";

export default function ForgotPassword() {
  const { resetPassword } = useAuth();
  const { theme } = useAppTheme();
  const styles = createLoginStyles(theme);
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    const trimmedEmail = email.trim();

    setError("");
    setSent(false);

    if (!trimmedEmail) {
      setError("Email required.");
      return;
    }

    try {
      setLoading(true);
      await resetPassword(trimmedEmail);
      setSent(true);
    } catch (e: any) {
      if (e.code === "auth/user-not-found") {
        setError("No account found with that email.");
      } else if (e.code === "auth/invalid-email") {
        setError("Enter a valid email address.");
      } else {
        setError(e.message || "Unable to send password reset email.");
      }
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
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.helperText}>
            Enter your account email and we will send you a reset link.
          </Text>

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

          <TouchableOpacity
            style={styles.button}
            onPress={handleResetPassword}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Sending..." : "Send Reset Link"}
            </Text>
          </TouchableOpacity>

          {sent ? (
            <Text style={styles.success}>
              If this email belongs to an account, a reset link will arrive in
              your inbox. Check spam or promotions too.
            </Text>
          ) : null}

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity onPress={() => router.push("/login")}>
            <Text style={styles.forgot}>Back to login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
