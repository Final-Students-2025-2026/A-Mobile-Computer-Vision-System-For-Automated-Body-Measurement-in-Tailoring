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
    <Animated.View
      style={[
        styles.logoWrapper,
        {
          opacity: logoOpacity,
          transform: [{ scale: logoScale }],
        },
      ]}
    >
      <Image
        source={require("../assets/images/measure-ai-icon.png")}
        style={styles.logo}
        resizeMode="contain"
      />
    </Animated.View>

    {!user && (
      <Animated.View style={[styles.buttonWrapper, { opacity: buttonOpacity }]}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.replace("/onboarding")}
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
    backgroundColor: "#0d0d0d",
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
    borderRadius: 28,
  },
  buttonWrapper: {
    position: "absolute",
    bottom: 60,
    width: "85%",
  },
  button: {
    backgroundColor: "#b8f54a",
    borderRadius: 30,
    paddingVertical: 18,
    alignItems: "center",
  },
  buttonText: {
    color: "#0d0d0d",
    fontSize: 16,
    fontWeight: "700",
  },
});