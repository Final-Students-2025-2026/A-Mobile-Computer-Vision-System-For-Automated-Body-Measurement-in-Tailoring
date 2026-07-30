import {
  PoseDetectionOnImage,
  Delegate,
} from "react-native-mediapipe-posedetection";
import {
  registerMediaPipePoseAdapter,
  MediaPipePoseResult,
  CameraFrame,
} from "./measurementEngine";

const MODEL_FILE = "pose_landmarker_lite.task";

async function mediaPipeAdapter(
  frame: CameraFrame,
): Promise<MediaPipePoseResult | null> {
  if (!frame.uri || frame.uri === "live-camera") return null;

  try {
    const result = await PoseDetectionOnImage(frame.uri, MODEL_FILE, {
      numPoses: 1,
      minPoseDetectionConfidence: 0.5,
      delegate: Delegate.GPU,
    });

    const landmarks = result?.results?.[0]?.landmarks?.[0];
    if (!landmarks?.length) return null;

    return {
      landmarks,
      imageWidth: result.inputImageWidth,
      imageHeight: result.inputImageHeight,
    };
  } catch (e) {
    console.warn("On-device MediaPipe detection failed:", e);
    return null;
  }
}

export function setupMediaPipe() {
  registerMediaPipePoseAdapter(mediaPipeAdapter);
}