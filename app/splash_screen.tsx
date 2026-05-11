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
import { useAuth } from "./context/AuthContext";

export default function SplashScreen() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const buttonFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (loading) return;

    // Logo animates in
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
      if (user) {
        // Returning user — wait 3 seconds then go to dashboard
        setTimeout(() => {
          router.replace("/(tabs)");
        }, 3000);
      } else {
        // First time user — show Get Started button
        Animated.timing(buttonFade, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }).start();
      }
    });
  }, [loading, user]);

  return (
    <View style={styles.container}>
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
          source={require("../assets/images/measure-ai logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Get Started Button — only for new users */}
      {!user && (
        <Animated.View style={[styles.buttonWrapper, { opacity: buttonFade }]}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.replace("/(auth)/login")}
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a1a",
    alignItems: "center",
    justifyContent: "center",
  },
  logoWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 150,
    height: 150,
  },
  buttonWrapper: {
    position: "absolute",
    bottom: 100,
    width: "80%",
  },
  button: {
    backgroundColor: "#b8f54a",
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: "center",
  },
  buttonText: {
    color: "#1a1a1a",
    fontSize: 16,
    fontWeight: "600",
  },
});
