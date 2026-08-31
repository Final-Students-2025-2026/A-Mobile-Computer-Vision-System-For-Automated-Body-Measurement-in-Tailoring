# Measure AI: Supervisor and Defence Brief

## Project title

**Measure AI — Mobile body-measurement support for tailoring**

## 1. Project overview

Measure AI is a React Native mobile application designed to help a tailor or fashion professional manage client profiles and generate an initial set of body measurements from guided full-body photographs. The application combines a client-management workflow with camera capture, pose detection, height-based calibration, measurement estimation, measurement history, fit recommendations, and measurement sharing.

The project addresses a practical problem: manually taking and recording measurements for many clients is time-consuming, can be inconsistent, and makes it harder to retrieve a client’s previous measurements. Measure AI makes the process more structured and creates a digital client record.

## 2. Problem statement

Traditional tailoring relies on a tape measure and manually recorded measurements. This creates three main difficulties:

1. Measurements and client records can be slow to capture and retrieve.
2. Manual recording can introduce transcription and consistency errors.
3. Clients and tailors need a convenient way to review, retain, and share measurement records.

The aim is **not** to claim that a phone camera completely replaces a professional tape measurement. The aim is to provide a practical, low-cost mobile assistant that produces a calibrated estimate and manages the tailoring workflow.

## 3. Objectives

- Create and manage individual client profiles.
- Store each client’s height, weight, age, and gender separately for calibration.
- Guide the user through front and side full-body photo capture.
- Detect pose landmarks locally using MediaPipe.
- Convert landmark distances from pixels to centimetres using the client’s known height.
- Estimate standard tailoring measurements such as chest, waist, hip, sleeve, inseam, thigh, calf, and outseam.
- Save measurement records and support downstream use such as fit suggestions and sharing with a tailor.

## 4. Technology stack

| Layer | Technology | Purpose |
| --- | --- | --- |
| Mobile application | React Native with Expo and Expo Router | Cross-platform user interface and navigation |
| Camera | Expo Camera | Guided front and side image capture |
| Pose detection | `react-native-mediapipe-posedetection` / MediaPipe Pose Landmarker Lite | Detects body landmarks in captured images |
| Backend data | Firebase Authentication and Cloud Firestore | User authentication, client records, and measurement history |
| Validation service | REST validation endpoint | Plausibility checks for non-torso measurements |
| Styling and icons | React Native styles and Lucide | User interface presentation |

### Current AI component

The application already integrates a **pretrained MediaPipe Pose Landmarker Lite model** (`pose_landmarker_lite.task`). It runs on the mobile device and detects body landmarks from captured images. The project does not train this foundation model; instead, it uses its landmark output in a custom height-calibration and anthropometric measurement-estimation algorithm.

## 5. How the measurement process works

1. The tailor creates or selects a client and enters the client’s height and weight.
2. The app guides the client to capture a front image and a side image, with the full body visible.
3. MediaPipe detects landmarks such as shoulders, hips, knees, ankles, and wrists.
4. The application calculates a pixel-per-centimetre scale from the detected head-to-ankle distance and the client’s recorded height.
5. Landmark distances are converted into centimetres.
6. For circumference-like measurements, the app estimates a body cross-section and calculates an elliptical circumference.
7. The app displays and saves the estimated measurements against that specific client.

## 6. Core measurement algorithm

### Height calibration

The scan is calibrated using the client’s known height:

`pixels per centimetre = detected body height in pixels / known height in centimetres`

This allows pixel landmark distances to be converted to physical distances.

### Waist and hip estimation

Pose landmarks are skeletal points, not the outer edge of the body. Therefore the application applies an anthropometric approximation:

- The distance between hip landmarks is expanded by a **1.40 contour-padding factor** before being used as hip width.
- MediaPipe has no waist landmark, so waist level is inferred **60% of the way from the shoulder midpoint to the hip midpoint**.
- Estimated depth is `0.70 × width` for the waist and `0.75 × width` for the hip.
- The cross-section is modelled as an ellipse.

The circumference is calculated with Ramanujan’s ellipse approximation:

`C ≈ π [3(a + b) − √((3a + b)(a + 3b))]`

where `a = width / 2` and `b = depth / 2`.

### Why an ellipse is used

A simple width multiplier assumes that all bodies have the same depth-to-width relationship. The ellipse approximation is more defensible because it explicitly models both the visible front width and an estimated depth. It remains an estimate, but is more suitable than a fixed linear multiplier for a 2D mobile scan.

## 7. Key design decisions

- **Client-specific body information:** height and weight belong to each client, not to a general app profile. This prevents one client’s calibration details from being used for another.
- **Full-body capture requirement:** the app rejects scans where essential landmarks or the full body are not visible.
- **No unreliable side-joint depth rule:** skeletal landmark separation in a side view is not treated as actual torso thickness, because it caused inconsistent chest results.
- **Read-only generated results:** the current scan screen presents generated measurements; manual tape measurement remains the reference where tailoring-grade precision is required.

## 8. Evaluation approach

For the final evaluation, compare app results with tape-measure ground truth for several volunteers. Use the same protocol for every person: fitted clothing, plain background, sufficient lighting, full body in frame, and a fixed camera position.

Record for each measurement:

| Participant | Body part | Tape measurement (cm) | App estimate (cm) | Absolute error (cm) | Percentage error |
| --- | --- | ---: | ---: | ---: | ---: |
| P1 | Chest |  |  |  |  |
| P1 | Waist |  |  |  |  |
| P1 | Hip |  |  |  |  |

Use the following measures in the report:

- **Absolute error:** `|app estimate − tape measurement|`
- **Mean absolute error (MAE):** average absolute error across participants
- **Percentage error:** `absolute error / tape measurement × 100`
- **Repeatability:** take three scans of the same person under the same conditions and report the range or standard deviation.

Do not invent accuracy values. Present the values obtained during testing.

## 9. Structural limitations and honest scope

This is the most important point to explain clearly during the defence:

- A standard 2D phone camera cannot directly observe the body’s rear depth, soft-tissue distribution, or the exact location of a tape measure around the body.
- MediaPipe pose landmarks represent joints, not the external clothing or skin contour.
- Lighting, loose clothing, camera angle, body rotation, and incomplete full-body framing affect results.
- Waist and hip circumference are consequently the most difficult measurements to estimate from 2D pose landmarks.

Therefore, Measure AI should be presented as a **calibrated measurement-estimation and client-management tool**, not as a medical device or a replacement for professional tape measurement. It is most useful for fast first estimates, repeatable client records, and tailoring workflow support.

## 10. Future improvements

- Use body-segmentation or silhouette extraction to measure the true outer contour rather than relying mainly on skeletal landmarks.
- Capture multiple frames per view and use a median measurement to reduce frame-to-frame variation.
- Add camera-distance and camera-angle quality checks.
- Use a calibrated reference object or phone depth sensor where available.
- Collect a labelled dataset with tape-measure ground truth, then evaluate or fine-tune a dedicated body-measurement model across varied body types and clothing conditions.
- Add a tailor-approved correction workflow with an audit trail.

## 11. Suggested defence presentation structure

1. Title and project motivation.
2. The tailoring/client-record problem.
3. Project objectives.
4. System architecture and technologies.
5. User workflow: client → guided photos → pose detection → calibrated measurements → saved record.
6. Waist/hip algorithm and ellipse formula.
7. Demonstration of the app.
8. Evaluation methodology and your real test results.
9. Limitations and future work.
10. Conclusion.

## 12. Short defence script

“Good [morning/afternoon]. My project is Measure AI, a mobile application that supports tailors by managing client records and generating calibrated body-measurement estimates from guided full-body images.

The problem I addressed is that manual measurement and record keeping can be slow and difficult to manage as the number of clients grows. My solution uses React Native for the mobile application, Firebase for client and measurement storage, Expo Camera for guided image capture, and a pretrained MediaPipe Pose Landmarker Lite model for body landmark detection. I built the calibration and measurement-estimation logic on top of those detected landmarks.

For each client, height and weight are stored separately. During a scan, the application captures front and side images, detects key landmarks, and uses the known height to convert image distances from pixels to centimetres. Linear body parts, such as sleeve and inseam, are derived from landmark distances.

For waist and hip, a standard pose model does not give the external body contour or a dedicated waist landmark. I therefore use an anthropometric approximation: I expand the hip-joint distance to estimate outer width, infer waist position between shoulders and hips, estimate depth as a ratio of width, and calculate circumference using Ramanujan’s ellipse approximation.

I am careful not to overstate the result. The application is a calibrated estimation and client-management tool. Waist and hip are structurally harder because a 2D camera cannot see the full body depth or exact tape-measure line. In my evaluation, I compare the app’s estimates with tape measurements using absolute error, percentage error, and repeatability across multiple scans.

The main contribution of Measure AI is a practical, low-cost workflow that combines client management, guided capture, calibration, pose-based estimation, stored measurement history, and sharing support. Future work would use silhouette segmentation, multi-frame averaging, and depth sensing to improve circumference accuracy. Thank you.”

## 13. Likely examiner questions and concise answers

### Why did you use height for calibration?

Height provides a known real-world dimension. By comparing detected body height in pixels with entered height in centimetres, the app can derive a pixel-to-centimetre scale for the image.

### Why are waist and hip less accurate than chest or limb lengths?

They are circumferences. A 2D pose detector sees joints and the front projection, but cannot directly see the complete body depth or outer contour around the torso.

### Why not claim 100% accuracy?

That would be technically incorrect. The project provides calibrated estimates under controlled capture conditions. Tape measurement remains the ground truth for tailoring-grade precision.

### What did the side photo add?

It improves the guided capture workflow and supports future depth/silhouette work. The current implementation does not incorrectly treat side-view skeletal joint separation as body thickness, because that produced unstable measurements.

### How would you improve the system with more time?

I would collect ground-truth data, introduce body segmentation and multi-frame median estimation, add quality checks, and use device depth information when available.
