import { registerMediaPipePoseAdapter, MediaPipePoseResult, CameraFrame } from './measurementEngine';

let poseLandmarker: any = null;
let isInitialized = false;

async function initializeMediaPipe() {
  if (isInitialized) return true;
  
  try {
    const { PoseLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision');
    
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
    );

    poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
        delegate: 'GPU',
      },
      runningMode: 'IMAGE',
      numPoses: 1,
    });

    isInitialized = true;
    console.log('MediaPipe initialized successfully!');
    return true;
  } catch (e) {
    console.error('MediaPipe initialization failed:', e);
    return false;
  }
}

async function mediaPipeAdapter(frame: CameraFrame): Promise<MediaPipePoseResult | null> {
  try {
    const initialized = await initializeMediaPipe();
    if (!initialized || !poseLandmarker) return null;
    if (frame.uri === 'live-camera') return null;

    const result = poseLandmarker.detect({ uri: frame.uri });

    if (!result?.landmarks?.[0]) return null;

    return {
      landmarks: result.landmarks[0].map((lm: any) => ({
        x: lm.x,
        y: lm.y,
        z: lm.z,
        visibility: lm.visibility,
      })),
      imageWidth: frame.width,
      imageHeight: frame.height,
    };
  } catch (e) {
    console.error('MediaPipe detection failed:', e);
    return null;
  }
}

export function setupMediaPipe() {
  registerMediaPipePoseAdapter(mediaPipeAdapter);
  initializeMediaPipe();
  console.log('MediaPipe adapter registered!');
}
