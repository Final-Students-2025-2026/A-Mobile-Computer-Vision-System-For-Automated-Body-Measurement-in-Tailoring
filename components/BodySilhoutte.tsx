import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Svg, { Path, Circle, Ellipse, G } from "react-native-svg";

const { width, height } = Dimensions.get("window");

export type BodyGender = "male" | "female";

interface BodySilhouetteProps {
  opacity?: number;
  color?: string;
  view?: "front" | "side";
  gender?: BodyGender;
  size?: "full" | "small";
}

export default function BodySilhouette({
  opacity = 0.35,
  color = "#b8f54a",
  view = "front",
  gender = "male",
  size = "full",
}: BodySilhouetteProps) {
  const svgHeight = size === "small" ? 90 : height * 0.7;
  const svgWidth = size === "small" ? 40 : width * 0.6;

  return (
    <View style={[styles.container, { width: svgWidth, height: svgHeight }]}>
      <Svg
        width={svgWidth}
        height={svgHeight}
        viewBox="0 0 160 400"
        opacity={opacity}
      >
        {view === "front"
          ? gender === "female"
            ? <FemaleFront color={color} />
            : <MaleFront color={color} />
          : gender === "female"
            ? <FemaleSide color={color} />
            : <MaleSide color={color} />}
      </Svg>
    </View>
  );
}

function MaleFront({ color }: { color: string }) {
  return (
    <G fill={color}>
      <Circle cx="80" cy="34" r="22" />
      <Path d="M70,54 Q80,60 90,54 L92,72 Q80,76 68,72 Z" />
      <Path d="M42,76 C36,100 44,130 48,160 C46,180 46,190 46,196 L114,196 C114,190 114,180 112,160 C116,130 124,100 118,76 Q80,66 42,76 Z" />
      <Path d="M40,80 C26,110 22,150 26,190 C28,210 32,225 38,234 L48,234 C42,220 44,200 46,170 C48,140 44,110 48,82 Z" />
      <Path d="M120,80 C134,110 138,150 134,190 C132,210 128,225 122,234 L112,234 C118,220 116,200 114,170 C112,140 116,110 112,82 Z" />
      <Circle cx="44" cy="240" r="9" />
      <Circle cx="116" cy="240" r="9" />
      <Path d="M46,196 C42,230 40,280 42,330 C43,355 44,370 46,382 L70,382 C72,370 74,355 75,330 C76,280 74,230 76,198 Z" />
      <Path d="M114,196 C118,230 120,280 118,330 C117,355 116,370 114,382 L90,382 C88,370 86,355 85,330 C84,280 86,230 84,198 Z" />
      <Ellipse cx="50" cy="390" rx="17" ry="8" />
      <Ellipse cx="110" cy="390" rx="17" ry="8" />
    </G>
  );
}

function FemaleFront({ color }: { color: string }) {
  return (
    <G fill={color}>
      <Circle cx="80" cy="33" r="21" />
      <Path d="M52,48 C48,60 47,70 50,78 L44,80 C40,64 41,50 48,42 Z" />
      <Path d="M108,48 C112,60 113,70 110,78 L116,80 C120,64 119,50 112,42 Z" />
      <Path d="M71,52 Q80,58 89,52 L91,68 Q80,72 69,68 Z" />
      <Path d="M50,74 C44,92 50,110 58,126 C52,140 48,160 50,178 C48,188 48,193 48,196 L112,196 C112,193 112,188 110,178 C112,160 108,140 102,126 C110,110 116,92 110,74 Q80,64 50,74 Z" />
      <Path d="M48,78 C36,102 33,132 37,160 C39,176 43,188 48,196 L56,196 C52,184 50,170 49,150 C48,128 51,104 56,84 Z" />
      <Path d="M112,78 C124,102 127,132 123,160 C121,176 117,188 112,196 L104,196 C108,184 110,170 111,150 C112,128 109,104 104,84 Z" />
      <Circle cx="41" cy="200" r="8" />
      <Circle cx="119" cy="200" r="8" />
      <Path d="M44,196 C40,228 40,270 44,315 C46,340 47,360 48,378 L68,378 C70,360 72,340 73,315 C75,270 74,228 78,198 Z" />
      <Path d="M116,196 C120,228 120,270 116,315 C114,340 113,360 112,378 L92,378 C90,360 88,340 87,315 C85,270 86,228 82,198 Z" />
      <Ellipse cx="52" cy="386" rx="16" ry="7" />
      <Ellipse cx="108" cy="386" rx="16" ry="7" />
    </G>
  );
}

function MaleSide({ color }: { color: string }) {
  return (
    <G fill={color}>
      <Circle cx="88" cy="34" r="21" />
      <Path d="M108,28 Q118,32 109,40 Z" />
      <Path d="M78,52 Q88,58 98,52 L100,70 Q88,74 76,70 Z" />
      <Path d="M76,74 C68,100 66,130 70,158 C72,175 76,188 82,196 L100,196 C108,185 114,165 116,140 C118,115 114,90 108,74 Q88,64 76,74 Z" />
      <Path d="M96,80 C90,110 88,150 92,190 C93,205 95,218 98,228 L108,228 C104,215 103,200 104,175 C106,145 104,110 110,82 Z" />
      <Circle cx="102" cy="234" r="9" />
      <Path d="M72,196 C68,230 66,280 70,330 C72,355 74,372 78,384 L100,384 C102,372 103,355 104,330 C106,280 104,230 100,198 Z" />
      <Path d="M66,384 Q64,398 76,398 L120,396 Q132,394 128,386 L100,384 Z" />
    </G>
  );
}

function FemaleSide({ color }: { color: string }) {
  return (
    <G fill={color}>
      <Circle cx="88" cy="33" r="20" />
      <Path d="M68,20 C58,26 54,40 58,54 C60,62 64,68 70,72 L66,50 C64,40 66,28 74,20 Z" />
      <Path d="M106,27 Q115,31 107,38 Z" />
      <Path d="M78,50 Q88,56 98,50 L100,66 Q88,70 76,66 Z" />
      <Path d="M74,74 C68,92 68,108 70,124 C68,145 64,160 66,178 C65,188 68,194 74,196 L108,196 C114,188 116,175 114,158 C118,140 122,115 116,95 C112,80 108,72 104,74 Q88,64 74,74 Z" />
      <Path d="M92,80 C88,108 87,145 90,182 C91,196 93,208 96,218 L104,218 C101,206 100,193 101,170 C102,142 100,110 104,82 Z" />
      <Circle cx="98" cy="223" r="8" />
      <Path d="M72,196 C69,225 68,270 71,315 C73,340 75,358 78,372 L98,372 C100,358 101,340 102,315 C104,270 102,225 100,198 Z" />
      <Path d="M66,372 Q64,384 74,384 L114,382 Q124,380 120,373 L98,372 Z" />
    </G>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
});
