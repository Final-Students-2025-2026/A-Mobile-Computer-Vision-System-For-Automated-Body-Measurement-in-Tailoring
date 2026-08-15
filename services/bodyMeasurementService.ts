const FLASK_URL = process.env.EXPO_PUBLIC_MEASUREMENT_API_URL || "https://measure-ai-flask-2.onrender.com";
const VALIDATION_URL = process.env.EXPO_PUBLIC_VALIDATION_API_URL || "https://measure-ai-api.onrender.com";

export interface MeasurementResult {
  measurements: Record<string, number>;
  confidence: number;
  method: string;
  used_side_photo: boolean;
}

export interface ValidationResult {
  is_valid: boolean;
  suggested_value: number;
  confidence: string;
  message: string;
}

export async function sendPhotosForMeasurement(
  frontPhotoUri: string,
  sidePhotoUri: string | null,
  heightCm: number
): Promise<MeasurementResult> {
  const formData = new FormData();

  // Add front photo
  formData.append("front", {
    uri: frontPhotoUri,
    type: "image/jpeg",
    name: "front.jpg",
  } as any);

  // Add side photo if available
  if (sidePhotoUri) {
    formData.append("left_side", {
      uri: sidePhotoUri,
      type: "image/jpeg",
      name: "side.jpg",
    } as any);
  }

  formData.append("height_cm", heightCm.toString());

  const response = await fetch(`${FLASK_URL}/upload_images`, {
    method: "POST",
    body: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Could not process photos");
  }

  return response.json();
}

export async function validateMeasurement(
  bodyPart: string,
  value: number,
  height: number,
  gender: number,
  age: number,
  weight: number,
  bmi: number
): Promise<ValidationResult> {
  try {
    const response = await fetch(`${VALIDATION_URL}/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        body_part: bodyPart,
        ar_measurement: value,
        height,
        gender,
        age,
        weight,
        bmi,
        unit: "cm",
      }),
    });

    if (!response.ok) throw new Error("Validation failed");
    return response.json();
  } catch (e) {
    // If validation fails just return the measurement as valid
    return {
      is_valid: true,
      suggested_value: value,
      confidence: "medium",
      message: "Measurement recorded",
    };
  }
}