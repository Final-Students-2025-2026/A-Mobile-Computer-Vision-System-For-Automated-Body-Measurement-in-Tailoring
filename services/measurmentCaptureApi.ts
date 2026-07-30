// Client for the Live-Measurements-Api Flask server
// (https://github.com/JavTahir/Live-Measurements-Api).
//
// This replaces the old on-device MediaPipe attempt. @mediapipe/tasks-vision
// is a browser/WASM library — it needs DOM APIs (HTMLImageElement,
// OffscreenCanvas) that don't exist in the React Native/Hermes runtime, so it
// can never run on-device in this app. Real pose detection + measurement
// math now happens server-side (Python MediaPipe + OpenCV + a MiDaS depth
// model), and the app just uploads the two photos and gets numbers back.
//
// You need the Flask server running and reachable from your phone/simulator:
//   1. Clone https://github.com/JavTahir/Live-Measurements-Api
//   2. pip install -r requirements.txt
//   3. python app.py            (listens on port 8001)
//   4. Point EXPO_PUBLIC_MEASUREMENT_API_URL (see .env) at that server:
//        - iOS simulator:  http://127.0.0.1:8001
//        - Android emulator: http://10.0.2.2:8001
//        - physical device: http://<your-computer's-LAN-IP>:8001

// Base URL for the Flask server — set EXPO_PUBLIC_MEASUREMENT_API_URL in
// your .env. This fallback (Android emulator's alias for your computer's
// localhost) just stops the app crashing if it's missing.
const API_BASE_URL =
  process.env.EXPO_PUBLIC_MEASUREMENT_API_URL || "http://10.0.2.2:8001";

export type RawApiMeasurements = {
  shoulder_width?: number;
  chest_width?: number;
  chest_circumference?: number;
  waist?: number;
  waist_width?: number;
  hip?: number;
  hip_width?: number;
  neck?: number;
  neck_width?: number;
  thigh?: number;
  thigh_circumference?: number;
  arm_length?: number;
  shirt_length?: number;
  trouser_length?: number;
};

export type BodyMeasurements = {
  neck?: number;
  shoulder?: number;
  chest?: number;
  waist?: number;
  hip?: number;
  sleeve?: number;
  bicep?: number;
  wrist?: number;
  inseam?: number;
  thigh?: number;
  calf?: number;
  height?: number;
};

export class MeasurementApiError extends Error {}

// The API only returns shoulder/chest/waist/hip/neck/thigh/arm/leg lengths.
// Bicep, wrist and calf aren't part of its response, so we keep deriving
// those from the returned values, same way the old on-device code did.
function fillDerivedFields(
  m: RawApiMeasurements,
  heightCm: number,
): BodyMeasurements {
  const chest = m.chest_circumference ?? m.chest_width ?? 90;

  return {
    neck: round(m.neck ?? m.neck_width),
    shoulder: round(m.shoulder_width),
    chest: round(chest),
    waist: round(m.waist ?? m.waist_width),
    hip: round(m.hip ?? m.hip_width),
    sleeve: round(m.arm_length),
    inseam: round(m.trouser_length),
    thigh: round(m.thigh_circumference ?? m.thigh),
    bicep: round(chest * 0.35),
    wrist: round(chest * 0.18),
    calf: round((m.thigh_circumference ?? m.thigh ?? chest * 0.6) * 0.66),
    height: round(heightCm),
  };
}

function round(value?: number) {
  return typeof value === "number" ? Math.round(value) : undefined;
}

export async function fetchBodyMeasurements(params: {
  frontUri: string;
  sideUri?: string;
  heightCm: number;
}): Promise<BodyMeasurements> {
  const { frontUri, sideUri, heightCm } = params;

  const formData = new FormData();
  formData.append("front", {
    uri: frontUri,
    name: "front.jpg",
    type: "image/jpeg",
  } as any);

  if (sideUri) {
    formData.append("left_side", {
      uri: sideUri,
      name: "left_side.jpg",
      type: "image/jpeg",
    } as any);
  }

  formData.append("height_cm", String(heightCm));

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/upload_images`, {
      method: "POST",
      body: formData,
      // Do NOT set a Content-Type header — fetch needs to set the
      // multipart boundary itself when the body is a FormData.
    });
  } catch (e) {
    throw new MeasurementApiError(
      `Could not reach the measurement API at ${API_BASE_URL}. Is the Flask server running and is your device on the same network?`,
    );
  }

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    const message = body?.error || `Measurement API returned ${response.status}`;
    throw new MeasurementApiError(message);
  }

  const raw: RawApiMeasurements = body?.measurements || {};
  return fillDerivedFields(raw, heightCm);
}