import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  FlatList,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ChevronRight } from "lucide-react-native";

const { width, height } = Dimensions.get("window");

const slides = [
  {
    id: "1",
    number: "01",
    title: "Take accurate\nmeasurements",
    subtitle:
      "Capture precise body measurements in minutes using just your phone.",
  },
  {
    id: "2",
    number: "02",
    title: "Send to your\ntailor anywhere",
    subtitle:
      "Share measurements instantly with any tailor in Accra, Lagos, or in any part of the world.",
  },
  {
    id: "3",
    number: "03",
    title: "Shop clothing\nthat fits perfectly",
    subtitle: "Always know your size and shop for clothes that fit perfectly across any brand or store worldwide.",
  },
];

export default function Onboarding() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      const nextIndex = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: nextIndex });
      setCurrentIndex(nextIndex);
    } else {
      router.replace("/(auth)/login");
    }
  };

  const handleScroll = (e: any) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#111111" />

      {/* Skip */}
      <SafeAreaView>
        <TouchableOpacity
          style={styles.skipBtn}
          onPress={() => router.replace("/(auth)/login")}
        >
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </SafeAreaView>

      {/* Slides */}
      <Animated.FlatList
        ref={flatListRef}
        data={slides}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false },
        )}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            {/* Big number */}
            <Text style={styles.bigNumber}>{item.number}</Text>
            {/* Title */}
            <Text style={styles.title}>{item.title}</Text>
            {/* Subtitle */}
            <Text style={styles.subtitle}>{item.subtitle}</Text>
          </View>
        )}
      />

      {/* Bottom */}
      <SafeAreaView style={styles.safeBottom}>
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
                outputRange: [8, 28, 8],
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

          {/* Next button */}
          <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
            {currentIndex === slides.length - 1 ? (
              <Text style={styles.nextBtnText}>Start</Text>
            ) : (
              <ChevronRight color="#111" size={24} strokeWidth={2.5} />
            )}
          </TouchableOpacity>
        </View>
        {currentIndex === slides.length - 1 && (
          <TouchableOpacity
            onPress={() => router.replace("/(auth)/login")}
            style={styles.signinRow}
          >
            <Text style={styles.signinText}>
              Already have an account?{" "}
              <Text style={styles.signinLink}>Sign in</Text>
            </Text>
          </TouchableOpacity>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111111" },
  skipBtn: {
    alignSelf: "flex-end",
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  skipText: {
    color: "#555",
    fontSize: 14,
    fontFamily: "PlusJakartaSans_500Medium",
  },
  slide: {
    width,
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: "center",
    gap: 20,
  },
  bigNumber: {
    color: "#b8f54a",
    fontSize: 80,
    fontFamily: "PlusJakartaSans_800ExtraBold",
    opacity: 0.15,
    lineHeight: 80,
  },
  title: {
    color: "#ffffff",
    fontSize: 36,
    fontFamily: "PlusJakartaSans_800ExtraBold",
    lineHeight: 44,
    marginTop: -16,
  },
  subtitle: {
    color: "#666",
    fontSize: 16,
    fontFamily: "PlusJakartaSans_400Regular",
    lineHeight: 24,
  },
  safeBottom: { paddingHorizontal: 32, paddingBottom: 8 },
  bottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
  },
  dotsContainer: { flexDirection: "row", gap: 8, alignItems: "center" },
  dot: { height: 8, borderRadius: 4, backgroundColor: "#b8f54a" },
  nextBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#b8f54a",
    alignItems: "center",
    justifyContent: "center",
  },
  nextBtnText: {
    color: "#111",
    fontFamily: "PlusJakartaSans_700Bold",
    fontSize: 14,
  },
  signinRow: { alignItems: "center", paddingBottom: 8 },
  signinText: {
    color: "#555",
    fontSize: 14,
    fontFamily: "PlusJakartaSans_400Regular",
  },
  signinLink: {
    color: "#b8f54a",
    fontFamily: "PlusJakartaSans_700Bold",
  },
});
