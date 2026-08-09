import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAppTheme } from "../contexts/ThemeContext";
import { Ruler, Send, Shirt } from "lucide-react-native";

const { width, height } = Dimensions.get("window");

const slides = [
  {
    id: "1",
    icon: Ruler,
    title: "Measure accurately",
    subtitle: "Take precise body measurements in minutes using just your phone camera. No tape measure needed.",
    color: "#b8f54a",
  },
  {
    id: "2",
    icon: Send,
    title: "Send to your tailor",
    subtitle: "Share your measurements instantly with any tailor — whether they're in Accra, Lagos or London.",
    color: "#b8f54a",
  },
  {
    id: "3",
    icon: Shirt,
    title: "Shop by your fit",
    subtitle: "Always know your size. Find clothing that fits perfectly across any brand or store.",
    color: "#b8f54a",
  },
];

export default function Onboarding() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const styles = createStyles(theme);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      router.replace("/(auth)/login");
    }
  };

  const handleSkip = () => {
    router.replace("/(auth)/login");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Skip button */}
      <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Slides */}
      <Animated.FlatList
        ref={flatListRef}
        data={slides}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        renderItem={({ item }) => {
          const Icon = item.icon;
          return (
            <View style={styles.slide}>
              {/* Icon circle */}
              <View style={styles.iconContainer}>
                <View style={styles.iconOuter}>
                  <View style={styles.iconInner}>
                    <Icon color={theme.background} size={48} strokeWidth={1.5} />
                  </View>
                </View>
              </View>

              {/* Text */}
              <View style={styles.textContainer}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.subtitle}>{item.subtitle}</Text>
              </View>
            </View>
          );
        }}
      />

      {/* Bottom section */}
      <View style={styles.bottom}>
        {/* Dots */}
        <View style={styles.dotsContainer}>
          {slides.map((_, index) => {
            const inputRange = [
              (index - 1) * width,
              index * width,
              (index + 1) * width,
            ];
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 24, 8],
              extrapolate: "clamp",
            });
            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: "clamp",
            });
            return (
              <Animated.View
                key={index}
                style={[styles.dot, { width: dotWidth, opacity }]}
              />
            );
          })}
        </View>

        {/* Next / Get Started button */}
        <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
          <Text style={styles.nextBtnText}>
            {currentIndex === slides.length - 1 ? "Get Started" : "Next"}
          </Text>
        </TouchableOpacity>

        {/* Already have account */}
        {currentIndex === slides.length - 1 && (
          <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
            <Text style={styles.loginText}>
              Already have an account?{" "}
              <Text style={styles.loginLink}>Sign in</Text>
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>["theme"]) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    skipBtn: {
      alignSelf: "flex-end",
      padding: 20,
    },
    skipText: { color: theme.muted, fontSize: 14 },
    slide: {
      width,
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 40,
    },
    iconContainer: {
      marginBottom: 48,
      alignItems: "center",
      justifyContent: "center",
    },
    iconOuter: {
      width: 160,
      height: 160,
      borderRadius: 80,
      backgroundColor: `${theme.primary}20`,
      alignItems: "center",
      justifyContent: "center",
    },
    iconInner: {
      width: 110,
      height: 110,
      borderRadius: 55,
      backgroundColor: theme.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    textContainer: { alignItems: "center", gap: 16 },
    title: {
      color: theme.text,
      fontSize: 28,
      fontWeight: "700",
      textAlign: "center",
      lineHeight: 34,
    },
    subtitle: {
      color: theme.muted,
      fontSize: 16,
      textAlign: "center",
      lineHeight: 24,
    },
    bottom: {
      padding: 32,
      gap: 20,
      alignItems: "center",
    },
    dotsContainer: {
      flexDirection: "row",
      gap: 8,
      alignItems: "center",
    },
    dot: {
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.primary,
    },
    nextBtn: {
      width: "100%",
      backgroundColor: theme.primary,
      borderRadius: 30,
      paddingVertical: 18,
      alignItems: "center",
    },
    nextBtnText: {
      color: theme.primaryText,
      fontSize: 16,
      fontWeight: "700",
    },
    loginText: {
      color: theme.muted,
      fontSize: 14,
    },
    loginLink: {
      color: theme.primary,
      fontWeight: "600",
    },
  });