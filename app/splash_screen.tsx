import React, { useEffect, useRef } from "react";
import {
  View,
  Animated,
  StyleSheet,
  Image,
  TouchableOpacity,
  Text,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../contexts/AuthContext";

const { height } = Dimensions.get("window");

export default function SplashScreen() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const logoScale = useRef(new Animated.Value(0.7)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const buttonY = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    if (loading) return;

    // Logo animates in
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Text fades in
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        if (user) {
          setTimeout(() => router.replace("/(tabs)"), 1500);
        } else {
          // Button slides up and fades in
          Animated.parallel([
            Animated.timing(buttonOpacity, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.spring(buttonY, {
              toValue: 0,
              friction: 6,
              useNativeDriver: true,
            }),
          ]).start();
        }
      });
    });
  }, [loading, user]);

  return (
    <View style={styles.container}>
      {/* Center content */}
      <View style={styles.centerContent}>
        {/* Logo */}
        <Animated.View
          style={{
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
          }}
        >
          <Image
            source={require("../assets/images/measure-ai-icon.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>

        {/* App name + tagline */}
        <Animated.View style={[styles.textBlock, { opacity: textOpacity }]}>
          <Text style={styles.appName}>Measure AI</Text>
          <Text style={styles.tagline}>your body. your fit. your style.</Text>
        </Animated.View>
      </View>

      {/* Bottom buttons */}
      {!user && (
        <Animated.View
          style={[
            styles.bottomSection,
            {
              opacity: buttonOpacity,
              transform: [{ translateY: buttonY }],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.getStartedBtn}
            onPress={() => router.replace("/onboarding")}
          >
            <Text style={styles.getStartedText}>Get Started</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.signInBtn}
            onPress={() => router.replace("/(auth)/login")}
          >
            <Text style={styles.signInText}>
              Already have an account?{" "}
              <Text style={styles.signInLink}>Sign in</Text>
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
    justifyContent: "space-between",
    paddingBottom: 60,
  },
  centerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
  },
  logo: {
    width: 110,
    height: 110,
    borderRadius: 24,
  },
  textBlock: {
    alignItems: "center",
    gap: 8,
  },
  appName: {
    color: "#ffffff",
    fontSize: 36,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  tagline: {
    color: "#b8f54a",
    fontSize: 13,
    letterSpacing: 2,
    opacity: 0.8,
    textTransform: "lowercase",
  },
  bottomSection: {
    width: "100%",
    paddingHorizontal: 28,
    gap: 16,
    alignItems: "center",
  },
  getStartedBtn: {
    width: "100%",
    backgroundColor: "#b8f54a",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
  },
  getStartedText: {
    color: "#0d0d0d",
    fontSize: 16,
    fontWeight: "800",
  },
  signInBtn: {
    padding: 8,
  },
  signInText: {
    color: "#666",
    fontSize: 14,
  },
  signInLink: {
    color: "#b8f54a",
    fontWeight: "700",
  },
});
