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
export type CameraFacing = "front" | "back";
export type MeasurementSource = "arcore" | "vision" | "calibration";
export type CapturePhase = "idle" | "preparing" | "capturing" | "done" | "error";

export type CameraFrame = {
  uri: string;
  width?: number;
  height?: number;
  measurementType?: MeasurementType;
  cameraFacing?: CameraFacing;
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

export type BodyContourSample = {
  widthCm: number;
  depthCm: number;
  confidence: number;
  source: MeasurementSource;
};

export type MeasurementResult = {
  measurementType: MeasurementType;
  valueCm: number;
  confidence: number;
  source: MeasurementSource;
  capturedAt: number;
  frameUri: string;
  contour?: BodyContourSample;
};

export type BodyScanResult = {
  readings: Record<MeasurementType, MeasurementResult>;
  confidence: number;
  source: MeasurementSource;
  capturedAt: number;
  frameUri: string;
  contours: Partial<Record<MeasurementType, BodyContourSample>>;
};

export type MediaPipePoseAdapter = (
  frame: CameraFrame,
) => Promise<MediaPipePoseResult | null>;

export type BodyScanAdapter = (
  frame: CameraFrame,
) => Promise<BodyScanResult | null>;

export type CaptureGuideStep = {
  key: "prepare" | "left" | "front" | "right" | "done";
  title: string;
  detail: string;
};

export const captureGuideSteps: CaptureGuideStep[] = [
  {
    key: "prepare",
    title: "Preparing...",
    detail: "Stand still and center your body inside the frame.",
  },
  {
    key: "left",
    title: "Capturing...",
    detail: "Turn slowly to your left while keeping your shoulders level.",
  },
  {
    key: "front",
    title: "Capturing...",
    detail: "Face forward and hold still for a clean reading.",
  },
  {
    key: "right",
    title: "Capturing...",
    detail: "Turn slowly to your right so the full contour is sampled.",
  },
  {
    key: "done",
    title: "Done",
    detail: "The scan is complete. Review the measurements below.",
  },
];

let poseAdapter: MediaPipePoseAdapter | null = null;
let scanAdapter: BodyScanAdapter | null = null;

export function registerMediaPipePoseAdapter(adapter: MediaPipePoseAdapter) {
  poseAdapter = adapter;
}

export function registerBodyScanAdapter(adapter: BodyScanAdapter) {
  scanAdapter = adapter;
}

export function getMeasurementPart(type: MeasurementType) {
  return measurementParts.find((part) => part.id === type) || measurementParts[0];
}

export async function analyzeMeasurementFrame(
  frame: CameraFrame,
): Promise<MeasurementResult> {
  const scan = await analyzeBodyScanFrame(frame);
  const type = frame.measurementType ?? "chest";
  return scan.readings[type] ?? scan.readings.chest;
}

export async function analyzeBodyScanFrame(
  frame: CameraFrame,
): Promise<BodyScanResult> {
  const nativeScan = scanAdapter ? await scanAdapter(frame) : null;

  if (nativeScan?.readings) {
    return nativeScan;
  }

  const pose = poseAdapter ? await poseAdapter(frame) : null;

  if (pose?.landmarks.length) {
    return estimateBodyScanFromPose(frame, pose);
  }

  return estimateBodyScanFromCalibration(frame);
}

function estimateBodyScanFromPose(
  frame: CameraFrame,
  pose: MediaPipePoseResult,
): BodyScanResult {
  const landmarks = pose.landmarks;
  const source: MeasurementSource = "vision";
  const visibilityValues = landmarks
    .map((landmark) => landmark.visibility)
    .filter((value): value is number => typeof value === "number");
  const baseConfidence =
    visibilityValues.length > 0
      ? visibilityValues.reduce((sum, value) => sum + value, 0) /
        visibilityValues.length
      : 0.76;

  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];
  const leftElbow = landmarks[13];
  const rightElbow = landmarks[14];
  const leftWrist = landmarks[15];
  const rightWrist = landmarks[16];
  const leftHip = landmarks[23];
  const rightHip = landmarks[24];
  const leftKnee = landmarks[25];
  const rightKnee = landmarks[26];
  const leftAnkle = landmarks[27];
  const rightAnkle = landmarks[28];

  const shoulderWidth = distance(leftShoulder, rightShoulder);
  const hipWidth = distance(leftHip, rightHip);
  const torsoHeight = distance(
    midpoint(leftShoulder, rightShoulder),
    midpoint(leftHip, rightHip),
  );
  const leftArm = distance(leftShoulder, leftWrist);
  const rightArm = distance(rightShoulder, rightWrist);
  const armLength = average([leftArm, rightArm]);
  const leftLeg = distance(leftHip, leftAnkle);
  const rightLeg = distance(rightHip, rightAnkle);
  const legLength = average([leftLeg, rightLeg]);
  const lowerLeg = average([
    distance(leftKnee, leftAnkle),
    distance(rightKnee, rightAnkle),
  ]);

  const postureBalance = clamp(
    1 - Math.abs((leftShoulder?.y ?? 0) - (rightShoulder?.y ?? 0)) * 0.85,
    0.9,
    1.08,
  );
  const curveFactor = clamp(
    1 + ((hipWidth - shoulderWidth) / Math.max(shoulderWidth, 0.01)) * 0.14,
    0.92,
    1.16,
  );
  const limbBalance = clamp(1 - Math.abs(leftArm - rightArm) * 0.04, 0.94, 1.05);
  const bodyScale = 172 * postureBalance;
  const contourConfidence = clamp(baseConfidence * 0.92, 0.35, 0.98);

  const contours: Partial<Record<MeasurementType, BodyContourSample>> = {
    neck: createContour(shoulderWidth * bodyScale * 0.82, 0.44, source, contourConfidence),
    shoulder: createContour(shoulderWidth * bodyScale, 0.36, source, contourConfidence),
    chest: createContour(
      shoulderWidth * bodyScale * 1.18 * curveFactor,
      0.66 + curveFactor * 0.08,
      source,
      contourConfidence,
    ),
    waist: createContour(
      ((shoulderWidth + hipWidth) / 2) * bodyScale * 1.02 * curveFactor,
      0.58 + curveFactor * 0.09,
      source,
      contourConfidence,
    ),
    hip: createContour(
      hipWidth * bodyScale * 1.06,
      0.74 + curveFactor * 0.06,
      source,
      contourConfidence,
    ),
    sleeve: createContour(armLength * bodyScale * 0.98 * limbBalance, 0.31, source, contourConfidence),
    bicep: createContour(shoulderWidth * bodyScale * 0.72 * curveFactor, 0.42, source, contourConfidence),
    wrist: createContour(shoulderWidth * bodyScale * 0.36, 0.28, source, contourConfidence),
    inseam: createContour(legLength * bodyScale * 0.9, 0.42, source, contourConfidence),
    thigh: createContour(hipWidth * bodyScale * 0.88 * curveFactor, 0.58, source, contourConfidence),
    calf: createContour(lowerLeg * bodyScale * 0.57, 0.46, source, contourConfidence),
    outseam: createContour((torsoHeight + legLength) * bodyScale * 0.95, 0.44, source, contourConfidence),
  };

  const readings = measurementParts.reduce((acc, part) => {
    const contour = contours[part.id];
    const value = contour
      ? ellipseCircumference(contour.widthCm, contour.depthCm)
      : deriveLinearEstimate(part.id, bodyScale, shoulderWidth, hipWidth, armLength, legLength, lowerLeg, torsoHeight);

    acc[part.id] = {
      measurementType: part.id,
      valueCm: clamp(Math.round(value), 12, 220),
      confidence: contour?.confidence ?? clamp(baseConfidence, 0.35, 0.98),
      source,
      capturedAt: frame.capturedAt,
      frameUri: frame.uri,
      contour,
    };

    return acc;
  }, {} as Record<MeasurementType, MeasurementResult>);

  const confidence =
    Object.values(readings).reduce((sum, item) => sum + item.confidence, 0) /
    measurementParts.length;

  return {
    readings,
    confidence: clamp(confidence, 0, 1),
    source,
    capturedAt: frame.capturedAt,
    frameUri: frame.uri,
    contours,
  };
}

function estimateBodyScanFromCalibration(
  frame: CameraFrame,
): BodyScanResult {
  const drift = Math.sin(frame.capturedAt / 900) * 0.8;
  const source: MeasurementSource = "calibration";
  const contours: Partial<Record<MeasurementType, BodyContourSample>> = {};
  const readings = measurementParts.reduce((acc, part, index) => {
    const value = part.baselineCm + drift + index * 0.05;
    acc[part.id] = {
      measurementType: part.id,
      valueCm: Math.round(value),
      confidence: 0.42,
      source,
      capturedAt: frame.capturedAt,
      frameUri: frame.uri,
    };
    return acc;
  }, {} as Record<MeasurementType, MeasurementResult>);

  return {
    readings,
    confidence: 0.42,
    source,
    capturedAt: frame.capturedAt,
    frameUri: frame.uri,
    contours,
  };
}

function createContour(
  widthCm: number,
  depthRatio: number,
  source: MeasurementSource,
  confidence: number,
): BodyContourSample {
  const safeWidth = Math.max(widthCm, 1);
  const safeDepth = Math.max(safeWidth * depthRatio, 1);

  return {
    widthCm: safeWidth,
    depthCm: safeDepth,
    confidence: clamp(confidence, 0.35, 0.98),
    source,
  };
}

function deriveLinearEstimate(
  type: MeasurementType,
  bodyScale: number,
  shoulderWidth: number,
  hipWidth: number,
  armLength: number,
  legLength: number,
  lowerLeg: number,
  torsoHeight: number,
) {
  const estimates: Record<MeasurementType, number> = {
    neck: shoulderWidth * bodyScale * 0.82,
    shoulder: shoulderWidth * bodyScale,
    chest: ellipseCircumference(shoulderWidth * bodyScale * 1.18, shoulderWidth * bodyScale * 0.75),
    waist: ellipseCircumference(((shoulderWidth + hipWidth) / 2) * bodyScale * 1.02, shoulderWidth * bodyScale * 0.58),
    hip: ellipseCircumference(hipWidth * bodyScale * 1.06, hipWidth * bodyScale * 0.8),
    sleeve: armLength * bodyScale,
    bicep: shoulderWidth * bodyScale * 0.72,
    wrist: shoulderWidth * bodyScale * 0.36,
    inseam: legLength * bodyScale * 0.9,
    thigh: hipWidth * bodyScale * 0.88,
    calf: lowerLeg * bodyScale * 0.57,
    outseam: (torsoHeight + legLength) * bodyScale * 0.95,
  };

  return estimates[type];
}

function ellipseCircumference(widthCm: number, depthCm: number) {
  const a = Math.max(widthCm, 1) / 2;
  const b = Math.max(depthCm, 1) / 2;
  const h = ((a - b) ** 2) / ((a + b) ** 2);
  return Math.PI * (a + b) * (1 + (3 * h) / (10 + Math.sqrt(4 - 3 * h)));
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

function average(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}
