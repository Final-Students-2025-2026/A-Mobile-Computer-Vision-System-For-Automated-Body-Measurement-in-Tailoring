import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles } from "./login.styles";
import { Eye, EyeOff } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { useGoogleSignIn } from "../../hooks/useGoogleSignIn";

export default function Signup() {
  const router = useRouter();
  const { signup } = useAuth();
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

  const handleSignup = async () => {
    try {
      setError("");
      await signup(email, password, name);
    } catch (e: any) {
      setError(e.message);
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
            placeholderTextColor="#888"
            value={name}
            onChangeText={setName}
          />

          <TextInput
            placeholder="email"
            style={styles.input}
            placeholderTextColor="#888"
            value={email}
            onChangeText={setEmail}
          />

          <View style={styles.passwordWrapper}>
            <TextInput
              placeholder="password"
              style={styles.passwordInput}
              placeholderTextColor="#888"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              {showPassword ? <Eye /> : <EyeOff />}
            </TouchableOpacity>
          </View>

          {error || googleError ? (
            <Text style={styles.error}>{error || googleError}</Text>
          ) : null}

          <TouchableOpacity style={styles.button} onPress={handleSignup}>
            <Text style={styles.buttonText}>Sign Up</Text>
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
