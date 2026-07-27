import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Svg, { Path, Ellipse, G } from "react-native-svg";

const { width, height } = Dimensions.get("window");

interface BodySilhouetteProps {
  opacity?: number;
  color?: string;
  view?: "front" | "side";
}

export default function BodySilhouette({
  opacity = 0.35,
  color = "#b8f54a",
  view = "front",
}: BodySilhouetteProps) {
  const svgHeight = height * 0.7;
  const svgWidth = width * 0.6;
  const cx = svgWidth / 2;

  return (
    <View style={[styles.container, { width: svgWidth, height: svgHeight }]}>
      <Svg
        width={svgWidth}
        height={svgHeight}
        viewBox="0 0 200 500"
        opacity={opacity}
      >
        {view === "front" ? (
          <G fill={color}>
            {/* Head */}
            <Ellipse cx="100" cy="40" rx="28" ry="35" />
            {/* Neck */}
            <Path d="M88 72 Q100 80 112 72 L115 95 Q100 100 85 95 Z" />
            {/* Shoulders */}
            <Path d="M55 95 Q70 88 85 95 L85 140 Q70 145 55 135 Z" />
            <Path d="M115 95 Q130 88 145 95 L145 135 Q130 145 115 140 Z" />
            {/* Torso */}
            <Path d="M85 95 Q100 100 115 95 L120 200 Q100 210 80 200 Z" />
            {/* Left arm */}
            <Path d="M55 95 Q45 120 42 160 Q40 190 44 220 Q50 225 58 220 Q62 190 65 160 Q68 130 65 110 Z" />
            {/* Right arm */}
            <Path d="M145 95 Q155 120 158 160 Q160 190 156 220 Q150 225 142 220 Q138 190 135 160 Q132 130 135 110 Z" />
            {/* Left hand */}
            <Ellipse cx="51" cy="230" rx="10" ry="14" />
            {/* Right hand */}
            <Ellipse cx="149" cy="230" rx="10" ry="14" />
            {/* Hips */}
            <Path d="M80 200 Q100 210 120 200 L125 245 Q100 255 75 245 Z" />
            {/* Left leg */}
            <Path d="M75 245 Q68 280 66 330 Q64 370 66 410 Q72 415 80 412 Q84 370 86 330 Q88 285 88 250 Z" />
            {/* Right leg */}
            <Path d="M125 245 Q132 280 134 330 Q136 370 134 410 Q128 415 120 412 Q116 370 114 330 Q112 285 112 250 Z" />
            {/* Left foot */}
            <Ellipse cx="73" cy="420" rx="14" ry="8" />
            {/* Right foot */}
            <Ellipse cx="127" cy="420" rx="14" ry="8" />
          </G>
        ) : (
          <G fill={color}>
            {/* Head side */}
            <Ellipse cx="95" cy="40" rx="25" ry="35" />
            {/* Neck */}
            <Path d="M85 72 Q95 80 105 72 L108 95 Q95 100 82 95 Z" />
            {/* Torso side */}
            <Path d="M75 95 Q110 100 115 95 L118 200 Q105 215 72 205 Z" />
            {/* Arm side */}
            <Path d="M112 100 Q125 130 128 170 Q130 200 126 225 Q120 228 115 225 Q112 200 110 170 Q108 135 108 105 Z" />
            {/* Hand */}
            <Ellipse cx="121" cy="233" rx="9" ry="13" />
            {/* Hips side */}
            <Path d="M72 205 Q105 215 118 200 L120 248 Q100 260 70 250 Z" />
            {/* Legs side */}
            <Path d="M70 250 Q68 290 67 335 Q66 375 68 415 Q74 418 82 415 Q84 375 85 335 Q86 290 85 252 Z" />
            <Path d="M100 248 Q102 288 103 333 Q104 373 102 413 Q108 416 116 413 Q118 373 117 333 Q116 288 114 250 Z" />
            {/* Feet */}
            <Ellipse cx="75" cy="422" rx="16" ry="8" />
            <Ellipse cx="109" cy="421" rx="13" ry="7" />
          </G>
        )}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
});