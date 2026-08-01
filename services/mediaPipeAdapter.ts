import {
  PoseDetectionOnImage,
  Delegate,
} from "react-native-mediapipe-posedetection";
import {
  registerMediaPipePoseAdapter,
  MediaPipePoseResult,
  CameraFrame,
} from "./measurementEngine";

const MODEL_FILE = "pose_landmarker_full.task";

async function mediaPipeAdapter(
  frame: CameraFrame,
): Promise<MediaPipePoseResult | null> {
  if (!frame.uri) return null;

  try {
    const result = await PoseDetectionOnImage(frame.uri, MODEL_FILE, {
      numPoses: 1,
      minPoseDetectionConfidence: 0.75,
      delegate: Delegate.GPU,
    });

    const raw = result?.results?.[0]?.landmarks?.[0];

    if (!raw?.length) return null;

    const landmarks =
      frame.cameraFacing === "front"
        ? raw.map((p: any) => ({
            ...p,
            x: 1 - p.x,
            visibility: p.visibility ?? 0,
          }))
        : raw.map((p: any) => ({
            ...p,
            visibility: p.visibility ?? 0,
          }));

    return {
      landmarks,
      imageWidth: result.inputImageWidth,
      imageHeight: result.inputImageHeight,
    };
  } catch (e) {
    console.warn(e);

    return null;
  }
}

export function setupMediaPipe() {
  registerMediaPipePoseAdapter(mediaPipeAdapter);
}