const API_URL = "https://measure-ai-api.onrender.com";

export interface ValidationInput {
  height: number;
  gender: number;
  age: number;
  weight: number;
  bmi: number;
  ar_measurement: number;
  body_part: string;
  unit: string;
}

export interface ValidationResult {
  is_valid: boolean;
  ar_measurement: number;
  suggested_value: number;
  difference: number;
  confidence: string;
  message: string;
  unit: string;
}

export async function validateMeasurement(
  data: ValidationInput
): Promise<ValidationResult> {
  const response = await fetch(`${API_URL}/validate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Validation failed");
  }

  return response.json();
}