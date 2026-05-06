import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles } from "./login.styles";
import { Eye, EyeOff } from "lucide-react-native";
import { useRouter } from "expo-router";
export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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
            placeholderTextColor="#888"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
          />

          {/* Password with eye */}
          <View style={styles.passwordWrapper}>
            <TextInput
              placeholder="password"
              placeholderTextColor="#888"
              style={styles.passwordInput}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              {showPassword ? <Eye /> : <EyeOff />}
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Sign In</Text>
          </TouchableOpacity>

          {/* Forgot */}
          <TouchableOpacity onPress={() => router.push("/forgotPassword")}>
            <Text style={styles.forgot}>forgot password?</Text>
          </TouchableOpacity>

          {/* Google */}
          <TouchableOpacity style={styles.googleBtn}>
            <Text style={styles.googleText}>Continue with Google </Text>
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
