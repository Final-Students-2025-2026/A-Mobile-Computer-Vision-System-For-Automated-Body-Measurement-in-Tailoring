# Measurement method and limitations

## Waist and hip approximation

The mobile scan uses MediaPipe pose landmarks calibrated from the client's recorded height. Pose landmarks represent skeletal joint locations rather than the outside boundary of clothing or soft tissue. For this reason, left/right hip landmark distance is expanded by a fixed 1.40 contour-padding factor before it is used as an estimated hip width.

MediaPipe does not provide a waist landmark. The implementation infers the waist level at 60% of the distance from the shoulder midpoint to the hip midpoint, and applies a normal torso-taper factor at that level.

Waist and hip circumference are estimated by modelling each cross-section as an ellipse. With estimated front width `w`, the assumed depth is `0.70w` for waist and `0.75w` for hip. The circumference uses Ramanujan's approximation: `C = pi[3(a+b) - sqrt((3a+b)(a+3b))]`, where `a = w/2` and `b = d/2`.

## Structural limitations

A two-dimensional phone image cannot directly observe back depth, soft tissue distribution, clothing looseness, camera-to-body angle, or the exact tape-measure level. Therefore the scan is an anthropometric estimate, not a replacement for a manual tape measurement. Tailoring-grade waist or hip accuracy requires a physical tape measurement.
