import { validateMeasurement } from "./measurementAPI";
export const measurementParts = [
  {
    id: "neck",
    label: "Neck",
    category: "Upper body",
    guide: "Keep your full body visible, facing the camera.",
    baselineCm: 38,
  },
  {
    id: "shoulder",
    label: "Shoulder",
    category: "Upper body",
    guide: "Keep your full body visible, facing the camera.",
    baselineCm: 43,
  },
  {
    id: "chest",
    label: "Chest",
    category: "Upper body",
    guide: "Keep your full body visible, facing the camera.",
    baselineCm: 92,
  },
  {
    id: "waist",
    label: "Waist",
    category: "Torso",
    guide: "Keep your full body visible, facing the camera.",
    baselineCm: 78,
  },
  {
    id: "hip",
    label: "Hip",
    category: "Torso",
    guide: "Keep your full body visible, facing the camera.",
    baselineCm: 96,
  },
  {
    id: "sleeve",
    label: "Sleeve",
    category: "Arms",
    guide: "Keep your full body visible, facing the camera.",
    baselineCm: 62,
  },
  {
    id: "bicep",
    label: "Bicep",
    category: "Arms",
    guide: "Keep your full body visible, facing the camera.",
    baselineCm: 32,
  },
  {
    id: "wrist",
    label: "Wrist",
    category: "Arms",
    guide: "Keep your full body visible, facing the camera.",
    baselineCm: 17,
  },
  {
    id: "inseam",
    label: "Inseam",
    category: "Legs",
    guide: "Keep your full body visible, facing the camera.",
    baselineCm: 78,
  },
  {
    id: "thigh",
    label: "Thigh",
    category: "Legs",
    guide: "Keep your full body visible, facing the camera.",
    baselineCm: 56,
  },
  {
    id: "calf",
    label: "Calf",
    category: "Legs",
    guide: "Keep your full body visible, facing the camera.",
    baselineCm: 37,
  },
  {
    id: "outseam",
    label: "Outseam",
    category: "Legs",
    guide: "Keep your full body visible, facing the camera.",
    baselineCm: 102,
  },
] as const;

export const measurementTypes = measurementParts.map((part) => part.id);
export type MeasurementType = (typeof measurementParts)[number]["id"];
export type CameraFacing = "front" | "back";
export type CaptureView = "front" | "left" | "right";
export type MeasurementSource =
  | "arcore"
  | "vision"
  | "mediapipe"
  | "calibration";
export type CapturePhase =
  | "idle"
  | "preparing"
  | "capturing"
  | "done"
  | "error";

export type CameraFrame = {
  uri: string;
  width?: number;
  height?: number;
  measurementType?: MeasurementType;
  cameraFacing?: CameraFacing;
  captureView?: CaptureView;
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

export type ScanCalibration = {
  knownHeightCm: number;
  pixelsPerCm: number;
  confidence: number;
  method: "user-height" | "reference-object";
};

export type BodyContourSample = {
  widthCm: number;
  depthCm: number;
  confidence: number;
  source: MeasurementSource;
  depthSource?: "ratio-fallback";
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
  calibration?: ScanCalibration;
};

export type BodyScanSessionInput = {
  knownHeightCm: number;
  knownWeightKg?: number;
  knownAge?: number | null;
  knownGender?: number | null;
  front: CameraFrame;
  left?: CameraFrame;
  right?: CameraFrame;
  requirePoseDetection?: boolean;
};

export type MediaPipePoseAdapter = (
  frame: CameraFrame,
) => Promise<MediaPipePoseResult | null>;
export type BodyScanAdapter = (
  frame: CameraFrame,
) => Promise<BodyScanResult | null>;

export class MeasurementDetectionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MeasurementDetectionError";
  }
}

export type CaptureGuideStep = {
  key: "prepare" | "left" | "front" | "right" | "done";
  title: string;
  detail: string;
};
export const captureGuideSteps: CaptureGuideStep[] = [
  {
    key: "prepare",
    title: "Preparing...",
    detail:
      "Use the front camera, step back, and keep your entire body in frame.",
  },
  {
    key: "left",
    title: "Capturing side...",
    detail: "Turn slowly to your left. Keep your head and ankles visible.",
  },
  {
    key: "front",
    title: "Calibrating...",
    detail:
      "Face forward and hold still. Your saved height calibrates this scan.",
  },
  {
    key: "right",
    title: "Capturing side...",
    detail: "Turn slowly to your right. Keep your head and ankles visible.",
  },
  {
    key: "done",
    title: "Done",
    detail: "The calibrated full-body scan is ready to review.",
  },
];

function calculateDepth(
  type: MeasurementType,
  frontWidth: number,
  leftPose: MediaPipePoseResult | null,
  rightPose: MediaPipePoseResult | null,
  calibration: ScanCalibration,
): number {
  // The side-view boost is applied by estimateDepthScale at the call site.
  // Applying it here as well compounded it to 1.12 x 1.12 = 1.25.
  return frontWidth * depthRatio(type);
}
function estimateBodyScanFromThreeViews(
  frame: CameraFrame,
  frontPose: MediaPipePoseResult,
  leftPose: MediaPipePoseResult | null,
  rightPose: MediaPipePoseResult | null,
  calibration: ScanCalibration,
  knownWeightKg?: number,
): BodyScanResult {
  const base = estimateBodyScanFromPose(
    frame,
    frontPose,
    leftPose,
    rightPose,
    calibration,
    knownWeightKg,
  );

  if (!leftPose && !rightPose) return base;

  Object.values(base.readings).forEach((reading) => {
    if (!reading.contour) return;

    const depthScale = estimateDepthScale(
      reading.measurementType,
      leftPose,
      rightPose,
    );

    reading.contour.depthCm *= depthScale;

    if (
      reading.measurementType !== "shoulder" &&
      reading.measurementType !== "sleeve" &&
      reading.measurementType !== "inseam" &&
      reading.measurementType !== "outseam"
    ) {
      const circumference = ellipseCircumference(
        reading.contour.widthCm,
        reading.contour.depthCm,
      );

      reading.valueCm = clamp(
        Math.round(circumference * 10) / 10,

        12,

        220,
      );
    }

    reading.confidence = Math.min(0.99, reading.confidence + 0.08);
  });

  return base;
}

function estimateDepthScale(
  type: MeasurementType,
  leftPose: MediaPipePoseResult | null,
  rightPose: MediaPipePoseResult | null,
) {
  let scale = 1;

  if (leftPose) scale += 0.06;

  if (rightPose) scale += 0.06;

  switch (type) {
    case "chest":
      scale *= 1.03;
      break;

    case "waist":
      scale *= 1.04;
      break;

    case "hip":
      scale *= 1.05;
      break;

    case "thigh":
      scale *= 1.02;
      break;
  }

  return scale;
}
let poseAdapter: MediaPipePoseAdapter | null = null;
let scanAdapter: BodyScanAdapter | null = null;
export function registerMediaPipePoseAdapter(adapter: MediaPipePoseAdapter) {
  poseAdapter = adapter;
}
export function registerBodyScanAdapter(adapter: BodyScanAdapter) {
  scanAdapter = adapter;
}
export function getMeasurementPart(type: MeasurementType) {
  return (
    measurementParts.find((part) => part.id === type) || measurementParts[0]
  );
}

export async function analyzeMeasurementFrame(
  frame: CameraFrame,
): Promise<MeasurementResult> {
  const scan = await analyzeBodyScanFrame(frame);
  return scan.readings[frame.measurementType ?? "chest"] ?? scan.readings.chest;
}

/** Compatibility API for native adapters. Calibrated pose scans must use analyzeBodyScanSession. */
export async function analyzeBodyScanFrame(
  frame: CameraFrame,
): Promise<BodyScanResult> {
  const nativeScan = scanAdapter ? await scanAdapter(frame) : null;
  if (nativeScan?.readings) return nativeScan;
  throw new MeasurementDetectionError(
    "A calibrated full-body session is required. Capture front, left, and right views.",
  );
}

export async function analyzeBodyScanSession(
  input: BodyScanSessionInput,
): Promise<BodyScanResult> {
  if (!isPlausibleHeight(input.knownHeightCm)) {
    throw new MeasurementDetectionError(
      "Enter a valid height in Body info before starting a measurement scan.",
    );
  }

  const nativeScan = scanAdapter ? await scanAdapter(input.front) : null;
  if (nativeScan?.readings) return nativeScan;

  const frontPose = poseAdapter ? await poseAdapter(input.front) : null;

  const leftPose =
    input.left && poseAdapter ? await poseAdapter(input.left) : null;

  const rightPose =
    input.right && poseAdapter ? await poseAdapter(input.right) : null;

  if (!hasUsablePose(frontPose)) {
    if (input.requirePoseDetection) {
      throw new MeasurementDetectionError(
        "No full body detected. Stand further back and keep your entire body visible.",
      );
    }

    return estimateBodyScanFromProfile(input);
  }

  const calibration = calibrateFromHeight(
    input.knownHeightCm,
    input.front,
    frontPose,
  );

  // Generate the measurements first
  const scan = estimateBodyScanFromThreeViews(
    input.front,
    frontPose,
    leftPose,
    rightPose,
    calibration,
    input.knownWeightKg,
  );

  // Validate and adjust the measurements using your API
  await validateBodyMeasurements(
    scan,
    input.knownHeightCm,
    input.knownWeightKg,
    input.knownAge,
    input.knownGender,
  );

  // Return the validated scan
  return scan;
}
function calibrateFromHeight(
  knownHeightCm: number,
  frame: CameraFrame,
  pose: MediaPipePoseResult,
): ScanCalibration {
  const dimensions = imageDimensions(frame, pose);
  if (!dimensions)
    throw new MeasurementDetectionError(
      "Image dimensions are unavailable; the scan cannot be calibrated safely.",
    );
  const head =
    midpoint(pose.landmarks[2], pose.landmarks[5]) ?? pose.landmarks[0];
  const ankles = midpoint(pose.landmarks[27], pose.landmarks[28]);
  const heightPx = pixelDistance(
    head,
    ankles,
    dimensions.width,
    dimensions.height,
  );
  const visibility = average(
    [
      head?.visibility,
      pose.landmarks[27]?.visibility,
      pose.landmarks[28]?.visibility,
    ].filter(isNumber),
  );
  const ratio = heightPx / dimensions.height;

  if (ratio < 0.5) {
    throw new MeasurementDetectionError(
      "Move farther back so your full body fits in the frame.",
    );
  }

  if (visibility < 0.6) {
    throw new MeasurementDetectionError(
      "Stand in better lighting and keep your ankles visible.",
    );
  }
  // The eye-to-ankle span is not full stature. Eyes sit at roughly 93.6%
  // of height and the ankle at roughly 3.9%, so the visible span covers
  // about 90% of the person. Dividing by full stature made pixelsPerCm
  // ~10% too small and inflated every derived measurement by ~11%.
  const EYE_TO_ANKLE_FRACTION = 0.897;

  return {
    knownHeightCm,
    pixelsPerCm: heightPx / (knownHeightCm * EYE_TO_ANKLE_FRACTION),
    confidence: clamp(visibility * 0.96, 0.45, 0.98),
    method: "user-height",
  };
}

function estimateBodyScanFromProfile(
  input: BodyScanSessionInput,
): BodyScanResult {
  const heightFactor = input.knownHeightCm / 170;
  const weightFactor = isPlausibleWeight(input.knownWeightKg)
    ? input.knownWeightKg / 70
    : heightFactor;
  const blendedBodyFactor = clamp(
    heightFactor * 0.45 + weightFactor * 0.55,
    0.72,
    1.42,
  );
  const linearFactor = clamp(heightFactor, 0.72, 1.32);
  const confidence = 0.58;

  const contours = measurementParts.reduce(
    (result, part) => {
      const baseWidth = widthFromBaseline(part.id, part.baselineCm);
      const widthCm =
        baseWidth *
        (isCircumference(part.id) ? blendedBodyFactor : linearFactor);
      result[part.id] = {
        widthCm,
        depthCm:
          widthCm *
          depthRatio(part.id) *
          bodyMassDepthFactor(
            input.knownHeightCm,
            input.knownWeightKg,
            part.id,
          ),
        confidence,
        source: "calibration",
        depthSource: "ratio-fallback",
      };
      return result;
    },
    {} as Partial<Record<MeasurementType, BodyContourSample>>,
  );

  const readings = measurementParts.reduce(
    (result, part) => {
      const contour = contours[part.id]!;
      const isBodyCircumference = isCircumference(part.id);
      const value = isBodyCircumference
        ? ellipseCircumference(contour.widthCm, contour.depthCm)
        : part.baselineCm * linearFactor;
      result[part.id] = {
        measurementType: part.id,
        valueCm: clamp(Math.round(value), 12, 220),
        confidence,
        source: "calibration",
        capturedAt: input.front.capturedAt,
        frameUri: input.front.uri,
        contour,
      };
      return result;
    },
    {} as Record<MeasurementType, MeasurementResult>,
  );

  return {
    readings,
    confidence,
    source: "calibration",
    capturedAt: input.front.capturedAt,
    frameUri: input.front.uri,
    contours,
    calibration: {
      knownHeightCm: input.knownHeightCm,
      pixelsPerCm: 1,
      confidence,
      method: "user-height",
    },
  };
}

function estimateBodyScanFromPose(
  frame: CameraFrame,
  pose: MediaPipePoseResult,
  leftPose: MediaPipePoseResult | null,
  rightPose: MediaPipePoseResult | null,
  calibration: ScanCalibration,
  knownWeightKg?: number,
): BodyScanResult {
  const dimensions = imageDimensions(frame, pose);
  if (!dimensions)
    throw new MeasurementDetectionError(
      "Image dimensions are unavailable; the scan cannot be calibrated safely.",
    );
  const landmarks = pose.landmarks;
  const required = [
    landmarks[11],
    landmarks[12],
    landmarks[23],
    landmarks[24],
    landmarks[27],
    landmarks[28],
  ];
  if (required.some((p) => (p?.visibility ?? 0) < 0.35)) {
    throw new MeasurementDetectionError("Body landmarks are not clear enough.");
  }
  const baseConfidence =
    average(
      landmarks.map((landmark) => landmark.visibility).filter(isNumber),
    ) || 0.5;
  const leftShoulder = landmarks[11],
    rightShoulder = landmarks[12],
    leftWrist = landmarks[15],
    rightWrist = landmarks[16];
  const leftHip = landmarks[23],
    rightHip = landmarks[24],
    leftKnee = landmarks[25],
    rightKnee = landmarks[26],
    leftAnkle = landmarks[27],
    rightAnkle = landmarks[28];
  const shoulderWidth = cmDistance(
    leftShoulder,
    rightShoulder,
    dimensions,
    calibration,
  );
  const hipWidth = cmDistance(leftHip, rightHip, dimensions, calibration);
  const torsoHeight = cmDistance(
    midpoint(leftShoulder, rightShoulder),
    midpoint(leftHip, rightHip),
    dimensions,
    calibration,
  );
  const armLength = average([
    cmDistance(leftShoulder, leftWrist, dimensions, calibration),
    cmDistance(rightShoulder, rightWrist, dimensions, calibration),
  ]);
  const legLength = average([
    cmDistance(leftHip, leftAnkle, dimensions, calibration),
    cmDistance(rightHip, rightAnkle, dimensions, calibration),
  ]);
  const lowerLeg = average([
    cmDistance(leftKnee, leftAnkle, dimensions, calibration),
    cmDistance(rightKnee, rightAnkle, dimensions, calibration),
  ]);
  if (
    [shoulderWidth, hipWidth, torsoHeight, armLength, legLength].some(
      (value) => value <= 0,
    )
  )
    throw new MeasurementDetectionError(
      "Key body landmarks were not visible. Keep your arms relaxed and your full body in frame.",
    );

  const widths = frontWidths({
    shoulderWidth,
    hipWidth,
    armLength,
    legLength,
    lowerLeg,
    torsoHeight,
  });
  const contours = measurementParts.reduce(
    (result, part) => {
      const widthCm = widths[part.id];
      const fallbackDepth =
        calculateDepth(part.id, widthCm, leftPose, rightPose, calibration) *
        bodyMassDepthFactor(calibration.knownHeightCm, knownWeightKg, part.id);
      //confidence
      const confidence = clamp(
        baseConfidence * calibration.confidence * 0.92,

        0.45,

        0.99,
      );
      result[part.id] = {
        widthCm,
        depthCm: fallbackDepth,
        confidence,
        source: "mediapipe",
        depthSource: "ratio-fallback",
      };
      return result;
    },
    {} as Partial<Record<MeasurementType, BodyContourSample>>,
  );

  const readings = measurementParts.reduce(
    (result, part) => {
      const contour = contours[part.id]!;
      const linear = linearEstimate(part.id, widths);
      result[part.id] = {
        measurementType: part.id,
        valueCm: clamp(
          Math.round(
            isCircumference(part.id)
              ? ellipseCircumference(contour.widthCm, contour.depthCm)
              : linear,
          ),
          12,
          220,
        ),
        confidence: contour.confidence,
        source: "mediapipe",
        capturedAt: frame.capturedAt,
        frameUri: frame.uri,
        contour,
      };
      return result;
    },
    {} as Record<MeasurementType, MeasurementResult>,
  );
  const confidence = average(
    Object.values(readings).map((reading) => reading.confidence),
  );
  return {
    readings,
    confidence: clamp(confidence, 0, 1),
    source: "mediapipe",
    capturedAt: frame.capturedAt,
    frameUri: frame.uri,
    contours,
    calibration,
  };
}

function frontWidths(values: {
  shoulderWidth: number;
  hipWidth: number;
  armLength: number;
  legLength: number;
  lowerLeg: number;
  torsoHeight: number;
}): Record<MeasurementType, number> {
  const chestWidth = values.shoulderWidth * 0.94 + values.torsoHeight * 0.08;

  const waistWidth = values.hipWidth * 0.72 + values.shoulderWidth * 0.18;

  const hipWidth = values.hipWidth * 1.04;

  const neckWidth = values.shoulderWidth * 0.38;

  const bicepWidth = values.armLength * 0.115;

  const wristWidth = values.armLength * 0.055;

  const thighWidth = values.hipWidth * 0.58;

  const calfWidth = values.lowerLeg * 0.3;

  return {
    neck: neckWidth,

    shoulder: values.shoulderWidth,

    chest: chestWidth,

    waist: waistWidth,

    hip: hipWidth,

    sleeve: values.armLength,

    bicep: bicepWidth,

    wrist: wristWidth,

    inseam: values.legLength * 0.91,

    thigh: thighWidth,

    calf: calfWidth,

    outseam: values.torsoHeight + values.legLength,
  };
}

function depthRatio(type: MeasurementType) {
  return (
    {
      neck: 0.44,
      shoulder: 0.36,
      chest: 0.74,
      waist: 0.67,
      hip: 0.8,
      sleeve: 0.31,
      bicep: 0.42,
      wrist: 0.28,
      inseam: 0.42,
      thigh: 0.58,
      calf: 0.46,
      outseam: 0.44,
    } as Record<MeasurementType, number>
  )[type];
}
function widthFromBaseline(type: MeasurementType, baselineCm: number) {
  return isCircumference(type) ? baselineCm / 2.65 : baselineCm;
}
function bodyMassDepthFactor(
  heightCm: number,
  weightKg: number | undefined,
  type: MeasurementType,
) {
  if (!isPlausibleWeight(weightKg) || !isPlausibleHeight(heightCm)) return 1;
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  const sensitivity = (
    {
      neck: 0.12,
      shoulder: 0.04,
      chest: 0.2,
      waist: 0.28,
      hip: 0.22,
      sleeve: 0.04,
      bicep: 0.16,
      wrist: 0.04,
      inseam: 0.02,
      thigh: 0.2,
      calf: 0.12,
      outseam: 0.02,
    } as Record<MeasurementType, number>
  )[type];
  return clamp(1 + ((bmi - 22) / 22) * sensitivity, 0.86, 1.22);
}
function isCircumference(type: MeasurementType) {
  return !["shoulder", "sleeve", "inseam", "outseam"].includes(type);
}
function linearEstimate(
  type: MeasurementType,
  widths: Record<MeasurementType, number>,
) {
  return widths[type];
}
function ellipseCircumference(widthCm: number, depthCm: number) {
  const a = Math.max(widthCm, 1) / 2;
  const b = Math.max(depthCm, 1) / 2;
  const h = (a - b) ** 2 / (a + b) ** 2;
  return Math.PI * (a + b) * (1 + (3 * h) / (10 + Math.sqrt(4 - 3 * h)));
}
function imageDimensions(frame: CameraFrame, pose: MediaPipePoseResult) {
  const width = pose.imageWidth ?? frame.width;
  const height = pose.imageHeight ?? frame.height;
  return width && height ? { width, height } : null;
}
function cmDistance(
  a: PoseLandmark | undefined,
  b: PoseLandmark | undefined,
  dimensions: { width: number; height: number },
  calibration: ScanCalibration,
) {
  return (
    pixelDistance(a, b, dimensions.width, dimensions.height) /
    calibration.pixelsPerCm
  );
}
function pixelDistance(
  a: PoseLandmark | undefined,
  b: PoseLandmark | undefined,
  width: number,
  height: number,
) {
  if (!a || !b) return 0;
  return Math.hypot((a.x - b.x) * width, (a.y - b.y) * height);
}
function midpoint(
  a?: PoseLandmark,
  b?: PoseLandmark,
): PoseLandmark | undefined {
  return a && b
    ? {
        x: (a.x + b.x) / 2,
        y: (a.y + b.y) / 2,
        z: isNumber(a.z) && isNumber(b.z) ? (a.z + b.z) / 2 : undefined,
        visibility: average([a.visibility, b.visibility].filter(isNumber)),
      }
    : undefined;
}
function hasUsablePose(
  pose: MediaPipePoseResult | null,
): pose is MediaPipePoseResult {
  if (!pose) return false;

  const head = pose.landmarks[0];
  const leftAnkle = pose.landmarks[27];
  const rightAnkle = pose.landmarks[28];

  return (
    head &&
    leftAnkle &&
    rightAnkle &&
    (head.visibility ?? 0) > 0.4 &&
    ((leftAnkle.visibility ?? 0) > 0.2 || (rightAnkle.visibility ?? 0) > 0.2)
  );
}
function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}
function isPlausibleHeight(value: number) {
  return Number.isFinite(value) && value >= 80 && value <= 260;
}

function isPlausibleWeight(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 25 &&
    value <= 260
  );
}
function average(values: number[]) {
  return values.length
    ? values.reduce((sum, value) => sum + value, 0) / values.length
    : 0;
}
function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

async function validateBodyMeasurements(
  scan: BodyScanResult,
  height: number,
  weight?: number,
  age?: number | null,
  gender?: number | null,
) {
  const bmi = weight ? weight / Math.pow(height / 100, 2) : 22;

  // Each part is independent, so issue all twelve at once rather than paying
  // the round trip (and Render's cold start) twelve times over.
  const results = await Promise.allSettled(
    measurementParts.map(async (part) => {
      const reading = scan.readings[part.id];

      const result = await validateMeasurement({
        height,
        weight: weight ?? 70,
        bmi,
        age: age ?? 25,
        gender: gender ?? 1,
        body_part: part.id,
        ar_measurement: reading.valueCm,
        unit: "cm",
      });

      if (!result.is_valid) {
        reading.valueCm = result.suggested_value;
        reading.confidence = Math.min(0.99, reading.confidence + 0.05);
      }
    }),
  );

  const failed = results.filter((r) => r.status === "rejected").length;
  if (failed > 0) {
    console.warn(
      `Validation unavailable for ${failed}/${measurementParts.length} parts; ` +
        "keeping the geometric values.",
    );
  }
}