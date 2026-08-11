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
    tag: "MEASURE",
    title: "Take accurate\nmeasurements",
    subtitle: "Capture precise body measurements in minutes using just your phone. No tape measure needed.",
    bg: "#0d0d0d",
    accent: "#b8f54a",
  },
  {
    id: "2",
    tag: "CONNECT",
    title: "Send to your\ntailor anywhere",
    subtitle: "Share measurements instantly with any tailor — whether they're in Accra, Lagos or London.",
    bg: "#0d0d0d",
    accent: "#b8f54a",
  },
  {
    id: "3",
    tag: "SHOP",
    title: "Shop clothing\nthat fits perfectly",
    subtitle: "Always know your size. Find clothing that fits across any brand or store worldwide.",
    bg: "#0d0d0d",
    accent: "#b8f54a",
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
      <StatusBar barStyle="light-content" backgroundColor="#0d0d0d" />

      {/* Skip */}
      <SafeAreaView style={styles.safeTop}>
        <TouchableOpacity
          style={styles.skipBtn}
          onPress={() => router.replace("/(auth)/login")}
        >
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </SafeAreaView>

      {/* Slides — swipeable */}
      <Animated.FlatList
        ref={flatListRef}
        data={slides}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            {/* Visual area */}
            <View style={styles.visualArea}>
              <Text style={[styles.tagText, { color: item.accent }]}>
                {item.tag}
              </Text>
              <View style={[styles.line, { backgroundColor: item.accent }]} />
            </View>

            {/* Text content */}
            <View style={styles.textContent}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.subtitle}>{item.subtitle}</Text>
            </View>
          </View>
        )}
      />

      {/* Bottom controls — above navigation bar */}
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
                  style={[
                    styles.dot,
                    { width: dotWidth, opacity },
                  ]}
                />
              );
            })}
          </View>

          {/* Next button */}
          <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
            {currentIndex === slides.length - 1 ? (
              <Text style={styles.nextBtnText}>Start</Text>
            ) : (
              <ChevronRight color="#0d0d0d" size={24} />
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
              <Text style={styles.signinLink}>Sign in</Text>
            </Text>
          </TouchableOpacity>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0d0d0d" },
  safeTop: { paddingHorizontal: 20 },
  skipBtn: { alignSelf: "flex-end", padding: 16 },
  skipText: { color: "#666", fontSize: 14, fontWeight: "500" },
  slide: {
    width,
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: "center",
  },
  visualArea: {
    height: height * 0.35,
    justifyContent: "flex-end",
    paddingBottom: 32,
    gap: 16,
  },
  tagText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 5,
  },
  line: {
    width: 40,
    height: 3,
    borderRadius: 2,
  },
  textContent: {
    gap: 16,
    paddingBottom: 20,
  },
  title: {
    color: "#ffffff",
    fontSize: 38,
    fontWeight: "800",
    lineHeight: 46,
  },
  subtitle: {
    color: "#666",
    fontSize: 16,
    lineHeight: 24,
  },
  safeBottom: {
    paddingHorizontal: 32,
    paddingBottom: 8,
  },
  bottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
  },
  dotsContainer: { flexDirection: "row", gap: 8, alignItems: "center" },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#b8f54a",
  },
  nextBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#b8f54a",
    alignItems: "center",
    justifyContent: "center",
  },
  nextBtnText: {
    color: "#0d0d0d",
    fontWeight: "800",
    fontSize: 14,
  },
  signinRow: { alignItems: "center", paddingBottom: 8 },
  signinText: { color: "#666", fontSize: 14 },
  signinLink: { color: "#b8f54a", fontWeight: "700" },
});