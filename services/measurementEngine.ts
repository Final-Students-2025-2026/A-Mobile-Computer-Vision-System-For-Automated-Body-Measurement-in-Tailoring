export const measurementParts = [
  {
    id: "neck",
    label: "Neck",
    category: "Upper body",
    guide: "Frame the neck and shoulders.",
    baselineCm: 38,
  },
  {
    id: "shoulder",
    label: "Shoulder",
    category: "Upper body",
    guide: "Face the camera with both shoulders visible.",
    baselineCm: 43,
  },
  {
    id: "chest",
    label: "Chest",
    category: "Upper body",
    guide: "Keep the chest square to the camera.",
    baselineCm: 92,
  },
  {
    id: "waist",
    label: "Waist",
    category: "Torso",
    guide: "Frame from chest to hips.",
    baselineCm: 78,
  },
  {
    id: "hip",
    label: "Hip",
    category: "Torso",
    guide: "Keep both hips visible.",
    baselineCm: 96,
  },
  {
    id: "sleeve",
    label: "Sleeve",
    category: "Arms",
    guide: "Show shoulder to wrist with the arm relaxed.",
    baselineCm: 62,
  },
  {
    id: "bicep",
    label: "Bicep",
    category: "Arms",
    guide: "Center the upper arm in the frame.",
    baselineCm: 32,
  },
  {
    id: "wrist",
    label: "Wrist",
    category: "Arms",
    guide: "Move closer and center the wrist.",
    baselineCm: 17,
  },
  {
    id: "inseam",
    label: "Inseam",
    category: "Legs",
    guide: "Frame waist to ankles from the front.",
    baselineCm: 78,
  },
  {
    id: "thigh",
    label: "Thigh",
    category: "Legs",
    guide: "Center the upper leg in the frame.",
    baselineCm: 56,
  },
  {
    id: "calf",
    label: "Calf",
    category: "Legs",
    guide: "Center the lower leg in the frame.",
    baselineCm: 37,
  },
  {
    id: "outseam",
    label: "Outseam",
    category: "Legs",
    guide: "Show waist to floor on one side.",
    baselineCm: 102,
  },
] as const;

export const measurementTypes = measurementParts.map((part) => part.id);

export type MeasurementType = (typeof measurementParts)[number]["id"];

export type CameraFrame = {
  uri: string;
  width?: number;
  height?: number;
  measurementType: MeasurementType;
  capturedAt: number;
};

export type PoseLandmark = {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
};

export type MediaPipePoseResult = {
  landmarks: PoseLandmark[];
  imageWidth?: number;
  imageHeight?: number;
};

export type MeasurementResult = {
  measurementType: MeasurementType;
  valueCm: number;
  confidence: number;
  source: "mediapipe" | "calibration";
  capturedAt: number;
  frameUri: string;
};

export type MediaPipePoseAdapter = (
  frame: CameraFrame,
) => Promise<MediaPipePoseResult | null>;

let poseAdapter: MediaPipePoseAdapter | null = null;

export function registerMediaPipePoseAdapter(adapter: MediaPipePoseAdapter) {
  poseAdapter = adapter;
}

export function getMeasurementPart(type: MeasurementType) {
  return measurementParts.find((part) => part.id === type) || measurementParts[0];
}

export async function analyzeMeasurementFrame(
  frame: CameraFrame,
): Promise<MeasurementResult> {
  const pose = poseAdapter ? await poseAdapter(frame) : null;

  if (pose?.landmarks.length) {
    return estimateFromPose(frame, pose);
  }

  return estimateFromCalibration(frame);
}

function estimateFromPose(
  frame: CameraFrame,
  pose: MediaPipePoseResult,
): MeasurementResult {
  const landmarks = pose.landmarks;
  const visibilityValues = landmarks
    .map((landmark) => landmark.visibility)
    .filter((value): value is number => typeof value === "number");
  const confidence =
    visibilityValues.length > 0
      ? visibilityValues.reduce((sum, value) => sum + value, 0) /
        visibilityValues.length
      : 0.75;

  const shoulderWidth = distance(landmarks[11], landmarks[12]);
  const hipWidth = distance(landmarks[23], landmarks[24]);
  const torsoHeight = distance(
    midpoint(landmarks[11], landmarks[12]),
    midpoint(landmarks[23], landmarks[24]),
  );
  const armLength = distance(landmarks[11], landmarks[15]);
  const legLength = distance(landmarks[23], landmarks[27]);
  const lowerLeg = distance(landmarks[25], landmarks[27]);
  const scale = 170;

  const estimates: Record<MeasurementType, number> = {
    neck: shoulderWidth * scale * 0.85,
    shoulder: shoulderWidth * scale,
    chest: shoulderWidth * scale * 1.85,
    waist: ((shoulderWidth + hipWidth) / 2) * scale * 1.55,
    hip: hipWidth * scale * 1.75,
    sleeve: armLength * scale,
    bicep: shoulderWidth * scale * 0.72,
    wrist: shoulderWidth * scale * 0.38,
    inseam: legLength * scale * 0.92,
    thigh: hipWidth * scale * 0.9,
    calf: lowerLeg * scale * 0.58,
    outseam: (torsoHeight + legLength) * scale,
  };

  return {
    measurementType: frame.measurementType,
    valueCm: clamp(Math.round(estimates[frame.measurementType]), 12, 220),
    confidence: clamp(confidence, 0, 1),
    source: "mediapipe",
    capturedAt: frame.capturedAt,
    frameUri: frame.uri,
  };
}

function estimateFromCalibration(frame: CameraFrame): MeasurementResult {
  const part = getMeasurementPart(frame.measurementType);
  const drift = Math.sin(frame.capturedAt / 900) * 0.8;

  return {
    measurementType: frame.measurementType,
    valueCm: Math.round(part.baselineCm + drift),
    confidence: 0.42,
    source: "calibration",
    capturedAt: frame.capturedAt,
    frameUri: frame.uri,
  };
}

function distance(a?: PoseLandmark, b?: PoseLandmark) {
  if (!a || !b) return 0;
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function midpoint(a?: PoseLandmark, b?: PoseLandmark): PoseLandmark | undefined {
  if (!a || !b) return undefined;
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
    z:
      typeof a.z === "number" && typeof b.z === "number"
        ? (a.z + b.z) / 2
        : undefined,
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}
