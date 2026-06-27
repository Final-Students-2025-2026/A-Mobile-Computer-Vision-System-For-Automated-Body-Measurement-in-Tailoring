import { useCallback, useEffect, useRef, useState } from "react";
import { CameraView, useCameraPermissions } from "expo-camera";
import {
  analyzeMeasurementFrame,
  MeasurementResult,
  MeasurementType,
} from "../services/measurementEngine";

type CaptureStatus = "idle" | "permission-needed" | "ready" | "running" | "error";

export function useMeasurementCapture() {
  const cameraRef = useRef<CameraView | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [status, setStatus] = useState<CaptureStatus>("idle");
  const [currentResult, setCurrentResult] = useState<MeasurementResult | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  const stopCapture = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setStatus(permission?.granted ? "ready" : "permission-needed");
  }, [permission?.granted]);

  const resetCapture = useCallback(() => {
    setCurrentResult(null);
    setError(null);
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

  const analyzeLiveFrame = useCallback(
    async (measurementType: MeasurementType) => {
      const canUseCamera = await ensureCameraPermission();
      if (!canUseCamera) return null;

      try {
        const result = await analyzeMeasurementFrame({
          uri: "live-camera",
          measurementType,
          capturedAt: Date.now(),
        });

        setCurrentResult(result);
        setError(null);
        return result;
      } catch (e: any) {
        setStatus("error");
        setError(e.message || "Could not read a camera frame.");
        return null;
      }
    },
    [ensureCameraPermission],
  );

  const captureFrame = useCallback(
    async (measurementType: MeasurementType) => {
      const canUseCamera = await ensureCameraPermission();
      if (!canUseCamera || !cameraRef.current) return null;

      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.45,
          skipProcessing: true,
        });

        if (!photo?.uri) return currentResult;

        const result = await analyzeMeasurementFrame({
          uri: photo.uri,
          width: photo.width,
          height: photo.height,
          measurementType,
          capturedAt: Date.now(),
        });

        setCurrentResult(result);
        setError(null);
        return result;
      } catch (e: any) {
        setStatus("error");
        setError(e.message || "Could not save a camera frame.");
        return currentResult;
      }
    },
    [currentResult, ensureCameraPermission],
  );

  const startCapture = useCallback(
    async (measurementType: MeasurementType) => {
      const canUseCamera = await ensureCameraPermission();
      if (!canUseCamera) return false;

      setCurrentResult(null);
      setError(null);
      setStatus("running");
      await analyzeLiveFrame(measurementType);

      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        analyzeLiveFrame(measurementType);
      }, 1200);

      return true;
    },
    [analyzeLiveFrame, ensureCameraPermission],
  );

  useEffect(() => {
    if (!permission) return;
    setStatus(permission.granted ? "ready" : "permission-needed");
  }, [permission]);

  useEffect(() => stopCapture, [stopCapture]);

  return {
    cameraRef,
    status,
    permission,
    currentResult,
    currentReading: currentResult?.valueCm ?? 0,
    confidence: currentResult?.confidence ?? 0,
    source: currentResult?.source ?? null,
    error,
    ensureCameraPermission,
    startCapture,
    stopCapture,
    resetCapture,
    analyzeLiveFrame,
    captureFrame,
  };
}
