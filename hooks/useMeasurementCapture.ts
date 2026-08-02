import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as Haptics from "expo-haptics";
import { CameraView, useCameraPermissions } from "expo-camera";
import {
  analyzeBodyScanSession,
  BodyScanResult,
  BodyContourSample,
  captureGuideSteps,
  measurementParts,
  MeasurementResult,
  MeasurementType,
  CameraFacing,
  CameraFrame,
  CaptureView,
  CapturePhase,
} from "../services/measurementEngine";

type CaptureStatus = "idle" | "permission-needed" | "ready" | "error";

const SCAN_INTERVAL_MS = 350;
const GUIDE_STEP_INTERVAL_MS = 2200;
const PREPARING_DELAY_MS = 1500;

export function useMeasurementCapture() {
  const cameraRef = useRef<CameraView | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const guideTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prepareTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const captureInFlightRef = useRef(false);
  const latestScanRef = useRef<BodyScanResult | null>(null);
  const capturedFramesRef = useRef<Record<CaptureView, CameraFrame[]>>({
    front: [],
    left: [],
    right: [],
  });
  const knownHeightCmRef = useRef<number | null>(null);
  const knownWeightKgRef = useRef<number | null>(null);
  const currentFocusRef = useRef<MeasurementType>("chest");
  const cameraFacingRef = useRef<CameraFacing>("front");
  const guideIndexRef = useRef(0);
  const hasCompletedFeedbackRef = useRef(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [status, setStatus] = useState<CaptureStatus>("idle");
  const [capturePhase, setCapturePhase] = useState<CapturePhase>("idle");
  const [guideIndex, setGuideIndex] = useState(0);
  const [scan, setScan] = useState<BodyScanResult | null>(null);
  const [currentFocus, setCurrentFocus] = useState<MeasurementType>("chest");
  const [cameraFacing, setCameraFacing] = useState<CameraFacing>("front");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    currentFocusRef.current = currentFocus;
  }, [currentFocus]);

  useEffect(() => {
    cameraFacingRef.current = cameraFacing;
  }, [cameraFacing]);

  const clearTimers = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (guideTimerRef.current) {
      clearInterval(guideTimerRef.current);
      guideTimerRef.current = null;
    }

    if (prepareTimerRef.current) {
      clearTimeout(prepareTimerRef.current);
      prepareTimerRef.current = null;
    }
  }, []);

  const applyScan = useCallback((next: BodyScanResult | null) => {
    if (!next) return null;

    const previous = latestScanRef.current;
    if (!previous) {
      latestScanRef.current = next;
      setScan(next);
      return next;
    }

    const blended = blendScans(previous, next);
    latestScanRef.current = blended;
    setScan(blended);
    return blended;
  }, []);

  const captureScanFrame = useCallback(async () => {
    if (captureInFlightRef.current || !cameraRef.current) {
      return latestScanRef.current;
    }

    captureInFlightRef.current = true;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: true,
        shutterSound: false,
      });

      if (!photo?.uri) {
        return latestScanRef.current;
      }

      const captureView = captureGuideSteps[guideIndexRef.current]?.key;
      if (
        captureView !== "left" &&
        captureView !== "front" &&
        captureView !== "right"
      ) {
        return latestScanRef.current;
      }

      capturedFramesRef.current[captureView].push({
        uri: photo.uri,
        width: photo.width,
        height: photo.height,
        measurementType: currentFocusRef.current,
        cameraFacing: cameraFacingRef.current,
        captureView,
        capturedAt: Date.now(),
      });
      return latestScanRef.current;
    } catch (e: any) {
      setCapturePhase("error");
      setStatus("error");
      setError(e.message || "Could not read a camera frame.");
      return latestScanRef.current;
    } finally {
      captureInFlightRef.current = false;
    }
  }, []);

  const finishScan = useCallback(async () => {
    clearTimers();
    const knownHeightCm = knownHeightCmRef.current;
    const front = capturedFramesRef.current.front;
    if (!knownHeightCm || !front) {
      setCapturePhase("error");
      setStatus("error");
      setError(
        "A clear front full-body frame is required to calibrate this scan. Please try again.",
      );
      return;
    }

    try {
      const front = bestFrame(capturedFramesRef.current.front);

      const left = bestFrame(capturedFramesRef.current.left);

      const right = bestFrame(capturedFramesRef.current.right);

      if (!knownHeightCm || !front) {
      }
      const next = await analyzeBodyScanSession({
        knownHeightCm,

        knownWeightKg: knownWeightKgRef.current ?? undefined,

        front,

        left,

        right,
      });
      applyScan(next);
      guideIndexRef.current = captureGuideSteps.length - 1;
      setGuideIndex(captureGuideSteps.length - 1);
      setCapturePhase("done");
      setError(null);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e: any) {
      setCapturePhase("error");
      setStatus("error");
      setError(e.message || "Could not produce a calibrated body scan.");
    }
  }, [applyScan, clearTimers]);

  const advanceGuide = useCallback(async () => {
    const nextIndex = Math.min(
      guideIndexRef.current + 1,
      captureGuideSteps.length - 1,
    );
    guideIndexRef.current = nextIndex;
    setGuideIndex(nextIndex);

    if (nextIndex >= captureGuideSteps.length - 1) {
      await finishScan();
      return;
    }

    await Haptics.selectionAsync();
    setCapturePhase("capturing");
  }, [finishScan]);

  const stopCapture = useCallback(() => {
    clearTimers();
    setCapturePhase("idle");
    guideIndexRef.current = 0;
    setGuideIndex(0);
    setStatus(permission?.granted ? "ready" : "permission-needed");
    hasCompletedFeedbackRef.current = false;
  }, [clearTimers, permission?.granted]);

  const resetCapture = useCallback(() => {
    latestScanRef.current = null;
    capturedFramesRef.current = {
      front: [],

      left: [],

      right: [],
    };
    knownHeightCmRef.current = null;
    knownWeightKgRef.current = null;
    setScan(null);
    setError(null);
    setCapturePhase("idle");
    guideIndexRef.current = 0;
    setGuideIndex(0);
    hasCompletedFeedbackRef.current = false;
  }, []);

  const ensureCameraPermission = useCallback(async () => {
    if (permission?.granted) {
      setStatus("ready");
      return true;
    }

    const response = await requestPermission();
    const granted = Boolean(response.granted);
    setStatus(granted ? "ready" : "permission-needed");
    return granted;
  }, [permission?.granted, requestPermission]);

  const startCapture = useCallback(
    async (knownHeightCm?: number, knownWeightKg?: number) => {
      if (!knownHeightCm || knownHeightCm < 80 || knownHeightCm > 260) {
        setError(
          "Add a valid height in Body info before starting a calibrated scan.",
        );
        setStatus("error");
        return false;
      }
      if (!knownWeightKg || knownWeightKg < 25 || knownWeightKg > 260) {
        setError("Add a valid weight before starting a calibrated scan.");
        setStatus("error");
        return false;
      }
      const canUseCamera = await ensureCameraPermission();
      if (!canUseCamera) return false;

      clearTimers();
      setError(null);
      setStatus("ready");
      setCapturePhase("preparing");
      latestScanRef.current = null;
      setScan(null);
      capturedFramesRef.current = {
        front: [],

        left: [],

        right: [],
      };
      knownHeightCmRef.current = knownHeightCm;
      knownWeightKgRef.current = knownWeightKg;
      guideIndexRef.current = 0;
      setGuideIndex(0);
      hasCompletedFeedbackRef.current = false;

      await Haptics.selectionAsync();

      prepareTimerRef.current = setTimeout(() => {
        setCapturePhase("capturing");
        void captureScanFrame();

        intervalRef.current = setInterval(() => {
          void captureScanFrame();
        }, SCAN_INTERVAL_MS);

        guideTimerRef.current = setInterval(() => {
          void advanceGuide();
        }, GUIDE_STEP_INTERVAL_MS);
      }, PREPARING_DELAY_MS);

      return true;
    },
    [advanceGuide, captureScanFrame, clearTimers, ensureCameraPermission],
  );

  useEffect(() => {
    if (!permission) return;
    setStatus(permission.granted ? "ready" : "permission-needed");
  }, [permission]);

  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  const scanReadings: Partial<Record<MeasurementType, MeasurementResult>> =
    scan?.readings ?? {};
  const measuredCount = measurementParts.filter(
    (part) => typeof scanReadings[part.id]?.valueCm === "number",
  ).length;
  const coverageProgress = measuredCount / measurementParts.length;
  const guideProgress =
    captureGuideSteps.length > 1
      ? guideIndex / (captureGuideSteps.length - 1)
      : 0;
  const scanProgress = clamp(Math.max(coverageProgress, guideProgress), 0, 1);
  const captureStep = captureGuideSteps[guideIndex] ?? captureGuideSteps[0];
  const captureState: CapturePhase = capturePhase;
  const isScanning =
    capturePhase === "preparing" || capturePhase === "capturing";

  useEffect(() => {
    if (capturePhase === "done" && !hasCompletedFeedbackRef.current) {
      hasCompletedFeedbackRef.current = true;
    }
  }, [capturePhase]);

  const currentReading = scanReadings[currentFocus]?.valueCm ?? 0;
  const currentResult = scanReadings[currentFocus] ?? null;
  const scanContours = useMemo(() => scan?.contours ?? {}, [scan]);

  return {
    cameraRef,
    status,
    permission,
    scan,
    scanReadings,
    scanContours,
    measuredCount,
    currentReading,
    currentResult,
    confidence: scan?.confidence ?? 0,
    source: scan?.source ?? null,
    error,
    cameraFacing,
    setCameraFacing,
    currentFocus,
    setCurrentFocus,
    captureState,
    captureStep,
    scanProgress,
    guideIndex,
    guideCount: captureGuideSteps.length,
    ensureCameraPermission,
    startCapture,
    stopCapture,
    resetCapture,
    captureFrame: captureScanFrame,
    isScanning,
  };
}

function blendScans(
  previous: BodyScanResult,
  next: BodyScanResult,
): BodyScanResult {
  const readings = measurementParts.reduce(
    (acc, part) => {
      const previousReading = previous.readings[part.id];
      const nextReading = next.readings[part.id];
      acc[part.id] = blendMeasurement(previousReading, nextReading);
      return acc;
    },
    {} as Record<MeasurementType, MeasurementResult>,
  );

  const contours = measurementParts.reduce(
    (acc, part) => {
      const previousContour = previous.contours[part.id];
      const nextContour = next.contours[part.id];

      if (!previousContour) {
        if (nextContour) acc[part.id] = nextContour;
        return acc;
      }

      if (!nextContour) {
        acc[part.id] = previousContour;
        return acc;
      }

      acc[part.id] = {
        widthCm: Math.round(
          previousContour.widthCm +
            (nextContour.widthCm - previousContour.widthCm) * 0.45,
        ),
        depthCm: Math.round(
          previousContour.depthCm +
            (nextContour.depthCm - previousContour.depthCm) * 0.45,
        ),
        confidence: clamp(
          previousContour.confidence * 0.35 + nextContour.confidence * 0.65,
          0,
          1,
        ),
        source: nextContour.source,
      };

      return acc;
    },
    {} as Partial<Record<MeasurementType, BodyContourSample>>,
  );

  const confidence =
    Object.values(readings).reduce(
      (sum, reading) => sum + reading.confidence,
      0,
    ) / measurementParts.length;

  return {
    ...next,
    readings,
    contours,
    confidence,
  };
}

function blendMeasurement(
  previous: MeasurementResult | undefined,
  next: MeasurementResult | undefined,
): MeasurementResult {
  if (!previous) {
    return next!;
  }

  if (!next) {
    return previous;
  }

  const weight = clamp(0.2 + next.confidence * 0.55, 0.2, 0.8);

  return {
    ...next,
    valueCm: Math.round(
      previous.valueCm + (next.valueCm - previous.valueCm) * weight,
    ),
    confidence: clamp(
      previous.confidence * 0.35 + next.confidence * 0.65,
      0,
      1,
    ),
  };
}
function bestFrame(frames: CameraFrame[]) {
  return frames.sort((a, b) => b.capturedAt - a.capturedAt)[0];
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}