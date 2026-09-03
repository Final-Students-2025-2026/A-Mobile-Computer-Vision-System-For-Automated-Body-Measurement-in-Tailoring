# Measure AI

A cross-platform mobile application that captures a complete set of garment measurements from two smartphone photographs, using on-device computer vision. Built for tailors and seamstresses, and for clients who cannot attend a fitting in person.

**Final year project — Department of Computer Science, Kwame Nkrumah University of Science and Technology, 2025/2026.**

---

## The problem

Tailoring across Ghana and much of West Africa depends on manual measurement: a flexible tape, a practised hand, and a paper notebook. This carries three costs.

Measurements vary between practitioners and between sessions, because tape tension, the anatomical point chosen for the waist, and the client's posture all differ. Paper records are fragile, and a lost notebook takes a tailor's entire client history with it. And clients living abroad who want garments from a tailor at home have no reliable way to supply accurate measurements.

Measure AI addresses all three.

---

## How it works

```
Client's height and weight recorded once
                 ↓
Two photographs captured — front view, then side view
                 ↓
MediaPipe Pose Landmarker detects 33 anatomical
landmarks on the device (no network required)
                 ↓
Known stature converts pixel distances into centimetres
                 ↓
Body cross-sections modelled as ellipses; girths computed
via Ramanujan's second approximation
                 ↓
Random Forest model validates each value against the
client's height, weight, BMI, age and sex
                 ↓
Twelve measurements saved to the client's history
```

Twelve measurements are produced: **neck, shoulder, chest, waist, hip, sleeve, bicep, wrist, inseam, thigh, calf and outseam.**

---

## Technical approach

**Scale calibration from stature.** A single photograph cannot distinguish a large distant object from a small nearby one. Most monocular measurement systems solve this by requiring a reference object of known size in the frame — a bank card or a sheet of A4. Measure AI instead uses the client's height, which a tailor records as a matter of routine, removing a step the user can get wrong.

The calibration measures the pixel span between the eye landmarks and the ankle landmarks. Because that span covers roughly 90% of stature rather than all of it, the known height is scaled by an anthropometric fraction before division. Omitting this correction inflates every derived measurement by approximately 11%.

**Depth is derived, not observed.** MediaPipe's own depth output degrades in reliability, so the two-dimensional landmarks are treated as the trusted signal and depth is estimated from per-part anthropometric ratios, refined by the side-view capture.

**Circumference from an ellipse.** Each body cross-section is modelled as an ellipse with semi-axes of half the width and half the depth, and the perimeter computed using Ramanujan's second approximation:

```
C ≈ π(a + b)[1 + 3h / (10 + √(4 − 3h))]

where  h = (a − b)² / (a + b)²
       a = width / 2
       b = depth / 2
```

**Statistical validation.** Each derived value is submitted to a Random Forest regression model trained on merged anthropometric data (ANSUR II, 6,068 records, plus a supplementary set of 690). The model returns a plausibility judgement and a corrected value where a reading falls outside a reasonable range for a person of that profile. The twelve requests are issued concurrently, and the module fails open — if the service is unreachable, the geometric values are retained rather than blocking the scan.

**Graceful degradation.** Where pose detection fails entirely, the system produces an estimate from height and weight alone, flagged with a markedly lower confidence score so the user can see the scan was inferred rather than measured.

---

## Tech stack

| Layer | Technology |
|---|---|
| Mobile framework | React Native 0.81 with Expo SDK 54 |
| Language | TypeScript |
| Navigation | Expo Router (file-based) |
| Pose estimation | MediaPipe Pose Landmarker (`pose_landmarker_lite.task`), on-device |
| Authentication | Firebase Authentication (email, Google) |
| Database | Cloud Firestore |
| File storage | Firebase Storage |
| Validation API | Random Forest model served over REST (Render) |
| Build | EAS Build |

---

## Getting started

### Prerequisites

- Node.js 18 or later
- An Android device or emulator, or an iOS device
- A Firebase project with Authentication and Firestore enabled

> **Note:** Expo Go will not run this project. The app depends on a native pose-estimation module, so a development build is required.

### Installation

```bash
git clone https://github.com/Ruwy123/Measure-AI.git
cd Measure-AI
npm install
```

### Environment variables

Create a `.env` file in the project root:

```dotenv
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=

EXPO_PUBLIC_GOOGLE_CLIENT_ID=
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=

EXPO_PUBLIC_MEASUREMENT_API_URL=
EXPO_PUBLIC_VALIDATION_API_URL=
```

`EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` must be the OAuth client of type **Web application**, not the Android one — Google Sign-In will fail otherwise.

### Running

```bash
# Build and install a development build on a connected device or emulator
npx expo run:android

# After the first build, just start the dev server
npx expo start
```

Scanning cannot be tested on an emulator, since the emulator camera renders a synthetic scene with no body in it. Use a physical device.

---

## Project structure

```
Measure-AI/
├── app/                      # Expo Router screens
│   ├── (auth)/               # Sign in, sign up, phone login
│   ├── (tabs)/               # Dashboard, clients, shop by fit, send to tailor
│   ├── client/[id].tsx       # Client profile and history
│   └── measurements/[id].tsx # Guided capture flow
├── services/
│   ├── measurementEngine.ts  # Calibration, geometry, circumference, validation
│   ├── mediaPipeAdapter.ts   # On-device pose detection wrapper
│   └── measurementAPI.ts     # Validation service client
├── hooks/                    # Auth, clients, user profile, Google sign-in
├── contexts/                 # Auth and theme providers
├── config/firebase.ts        # Firebase initialisation
└── assets/models/            # Bundled pose landmarker model
```

The measurement engine is written as pure functions with no camera, network or storage dependencies, so the whole algorithm can be tested without a device.

---

## Accuracy

Validated against manual tape measurement. The results divide into two groups by construction.

Measurements derived directly from landmark geometry — **chest, thigh and wrist** — agreed with tape measurement to within 2%. Measurements depending on inferred depth carry larger errors, with **hip** showing the greatest disagreement.

This is explained by what the landmarks represent. MediaPipe locates **joint centres**, not the body's outline. The widest point of the hips, and the outer shoulder tips where a tailor's tape terminates, are not detected landmarks, so measurements at those locations must be derived by correction rather than observed.

Repeatability was assessed by repeated scanning without repositioning. Most measurements varied by approximately one inch or less between successive scans; hip and waist varied by up to two inches. This sets a floor on achievable accuracy, since a correction factor removes consistent error but not variance.

---

## Known limitations

- **Depth is inferred, not measured.** A single photograph contains no depth information, so every girth rests on an anthropometric ratio that holds on average but not for any individual. Only genuine depth capture would remove this.
- **Landmarks are joint centres.** The system distinguishes poorly between individuals of similar frame but different build, because the joints sit in nearly the same positions.
- **Calibration depends on a self-reported height.** An error in that figure scales every measurement proportionally.
- **Sensitivity to clothing and posture.** Loose garments displace the apparent outline; rotation away from square-on foreshortens frontal widths.


---

## Future work

- Body segmentation, to obtain the silhouette outline rather than joint centres — this directly addresses the principal limitation above
- Using the trained model as a predictor of girths rather than only as a validator
- Collecting West African anthropometric data and retraining
- Exploiting depth hardware where present, retaining the current path as a fallback
- Monetization linking to an ecommerce site where clients can buy clothes based on their actual measurements and sizes.

---

## Authors

- **Lois Korklu Narh** 
- **Ruweida Abdul Rasheed**

Supervised by **Dr. Kate Takyi**, Department of Computer Science, KNUST.

---

## Acknowledgements

Built on [MediaPipe](https://google.github.io/mediapipe) by Google. The elliptical cross-section approach follows Pundir, Ojha and Maragatham, *Image-Based Anthropometric Measurement System Using Pose Estimation*. Anthropometric training data drawn from the ANSUR II survey.