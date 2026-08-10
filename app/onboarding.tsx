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
import { ChevronRight } from "lucide-react-native";

const { width } = Dimensions.get("window");

const slides = [
  {
    id: "1",
    tag: "MEASURE",
    title: "Take accurate\nmeasurements",
    subtitle:
      "Capture precise body measurements in minutes using just your phone. No tape measure needed.",
    bg: "#f0fce4",
    accent: "#3a7d00",
  },
  {
    id: "2",
    tag: "CONNECT",
    title: "Send to your\ntailor anywhere",
    subtitle:
      "Share measurements instantly with any tailor — whether they're in Accra, Lagos or London.",
    bg: "#f4f0fc",
    accent: "#5a3a9e",
  },
  {
    id: "3",
    tag: "SHOP",
    title: "Shop clothing\nthat fits perfectly",
    subtitle:
      "Always know your size. Find clothing that fits across any brand or store worldwide.",
    bg: "#fef9e4",
    accent: "#8a6500",
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

  const currentSlide = slides[currentIndex];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: currentSlide.bg }]}
    >
      {/* Skip */}
      <TouchableOpacity
        style={styles.skipBtn}
        onPress={() => router.replace("/(auth)/login")}
      >
        <Text style={[styles.skipText, { color: currentSlide.accent }]}>
          Skip
        </Text>
      </TouchableOpacity>

      {/* Slides */}
      <Animated.FlatList
        ref={flatListRef}
        data={slides}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false },
        )}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            {/* Visual area - clean geometric shape */}
            <View style={[styles.visualArea, { backgroundColor: item.bg }]}>
              <View
                style={[
                  styles.bigCircle,
                  { backgroundColor: `${item.accent}15` },
                ]}
              >
                <View
                  style={[
                    styles.medCircle,
                    { backgroundColor: `${item.accent}25` },
                  ]}
                >
                  <View
                    style={[
                      styles.smallCircle,
                      { backgroundColor: `${item.accent}40` },
                    ]}
                  />
                </View>
              </View>
              <Text style={[styles.tagText, { color: item.accent }]}>
                {item.tag}
              </Text>
            </View>
          </View>
        )}
      />

      {/* Bottom content */}
      <View style={styles.bottom}>
        <Text style={[styles.title, { color: "#111" }]}>
          {currentSlide.title}
        </Text>
        <Text style={styles.subtitle}>{currentSlide.subtitle}</Text>

        {/* Dots + button row */}
        <View style={styles.controlRow}>
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
                  style={[
                    styles.dot,
                    {
                      width: dotWidth,
                      opacity,
                      backgroundColor: currentSlide.accent,
                    },
                  ]}
                />
              );
            })}
          </View>

          {/* Arrow button */}
          <TouchableOpacity
            style={[styles.nextBtn, { backgroundColor: currentSlide.accent }]}
            onPress={handleNext}
          >
            {currentIndex === slides.length - 1 ? (
              <Text style={styles.nextBtnText}>Go</Text>
            ) : (
              <ChevronRight color="#fff" size={24} />
            )}
          </TouchableOpacity>
        </View>

        {/* Sign in link on last slide */}
        {currentIndex === slides.length - 1 && (
          <TouchableOpacity
            onPress={() => router.replace("/(auth)/login")}
            style={styles.signinRow}
          >
            <Text style={styles.signinText}>
              Already have an account?{" "}
              <Text style={[styles.signinLink, { color: currentSlide.accent }]}>
                Sign in
              </Text>
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  skipBtn: { alignSelf: "flex-end", padding: 20 },
  skipText: { fontSize: 14, fontWeight: "500" },
  slide: { width },
  visualArea: {
    height: 340,
    alignItems: "center",
    justifyContent: "center",
  },
  bigCircle: {
    width: 280,
    height: 280,
    borderRadius: 140,
    alignItems: "center",
    justifyContent: "center",
  },
  medCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  smallCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  tagText: {
    position: "absolute",
    bottom: 30,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 4,
  },
  bottom: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 32,
    gap: 12,
    paddingBottom: 40,
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    lineHeight: 42,
  },
  subtitle: {
    color: "#666",
    fontSize: 15,
    lineHeight: 22,
  },
  controlRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 24,
    marginBottom: 20,
  },
  dotsContainer: { flexDirection: "row", gap: 8, alignItems: "center" },
  dot: { height: 8, borderRadius: 4 },
  nextBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  nextBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  signinRow: { alignItems: "center", marginTop: 8 },
  signinText: { color: "#888", fontSize: 14 },
  signinLink: { fontWeight: "600" },
});
