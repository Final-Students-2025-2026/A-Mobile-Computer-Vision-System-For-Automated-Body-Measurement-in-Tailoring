import React, { useEffect, useRef } from "react";
import {
  View,
  Animated,
  StyleSheet,
  Image,
  TouchableOpacity,
  Text,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../contexts/AuthContext";

export default function SplashScreen() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const taglineFade = useRef(new Animated.Value(0)).current;
  const buttonFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (loading) return;

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Tagline fades in after logo
      Animated.timing(taglineFade, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start(() => {
        if (user) {
          setTimeout(() => router.replace("/(tabs)"), 2000);
        } else {
          Animated.timing(buttonFade, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }).start();
        }
      });
    });
  }, [loading, user]);

  return (
    <View style={styles.container}>
      {/* Background glow */}
      <View style={styles.glow} />

      {/* Logo */}
      <Animated.View
        style={[
          styles.logoWrapper,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Image
          source={require("../assets/images/measure-ai-icon.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>

      {/* App name + tagline */}
      <Animated.View style={[styles.textWrapper, { opacity: taglineFade }]}>
        <Text style={styles.appName}>Measure AI</Text>
        <Text style={styles.tagline}>your body. your fit. your style.</Text>
      </Animated.View>

      {/* Get Started Button */}
      {!user && (
        <Animated.View style={[styles.buttonWrapper, { opacity: buttonFade }]}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.replace("/onboarding")}
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.signinBtn}
            onPress={() => router.replace("/(auth)/login")}
          >
            <Text style={styles.signinText}>
              Already have an account?{" "}
              <Text style={styles.signinLink}>Sign in</Text>
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d0d0d",
    alignItems: "center",
    justifyContent: "center",
  },
  glow: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "#b8f54a",
    opacity: 0.06,
    top: "30%",
    alignSelf: "center",
  },
  logoWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 28,
  },
  textWrapper: {
    alignItems: "center",
    gap: 8,
    marginBottom: 60,
  },
  appName: {
    color: "#ffffff",
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  tagline: {
    color: "#b8f54a",
    fontSize: 14,
    letterSpacing: 1,
    opacity: 0.8,
  },
  buttonWrapper: {
    position: "absolute",
    bottom: 60,
    width: "85%",
    alignItems: "center",
    gap: 16,
  },
  button: {
    backgroundColor: "#b8f54a",
    borderRadius: 30,
    paddingVertical: 18,
    alignItems: "center",
    width: "100%",
  },
  buttonText: {
    color: "#0d0d0d",
    fontSize: 16,
    fontWeight: "700",
  },
  signinBtn: { padding: 8 },
  signinText: { color: "#888", fontSize: 14 },
  signinLink: { color: "#b8f54a", fontWeight: "600" },
});