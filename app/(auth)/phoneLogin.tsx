import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useAuth } from "../../contexts/AuthContext";

export default function PhoneLogin() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [verificationId, setVerificationId] = useState("");

  const handleSendOTP = async () => {
    if (!phone || phone.length < 10) {
      return setError("Enter a valid phone number");
    }
    setError("");
    setLoading(true);
    try {
      // TODO: Implement Firebase phone auth
      // const confirmation = await signInWithPhoneNumber(auth, `+233${phone}`);
      // setVerificationId(confirmation.verificationId);
      setStep("otp");
    } catch (e: any) {
      setError(e.message || "Could not send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      return setError("Enter the 6-digit code");
    }
    setError("");
    setLoading(true);
    try {
      // TODO: Implement Firebase OTP verification
      // const credential = PhoneAuthProvider.credential(verificationId, otp);
      // await signInWithCredential(auth, credential);
      router.replace("/(tabs)");
    } catch (e: any) {
      setError("Invalid code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={styles.content}>
          {/* Header */}
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => step === "otp" ? setStep("phone") : router.back()}
          >
            <ChevronLeft color="#111" size={24} />
          </TouchableOpacity>

          <View style={styles.topSection}>
            <Text style={styles.title}>
              {step === "phone" ? "Enter your\nphone number" : "Verify your\nnumber"}
            </Text>
            <Text style={styles.subtitle}>
              {step === "phone"
                ? "We'll send you a verification code"
                : `Code sent to +233 ${phone}`}
            </Text>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          {step === "phone" ? (
            <View style={styles.phoneRow}>
              <View style={styles.countryCode}>
                <Text style={styles.countryCodeText}>🇬🇭 +233</Text>
              </View>
              <TextInput
                style={styles.phoneInput}
                placeholder="XX XXX XXXX"
                placeholderTextColor="#999"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                maxLength={10}
              />
            </View>
          ) : (
            <View style={styles.otpContainer}>
              <TextInput
                style={styles.otpInput}
                placeholder="000000"
                placeholderTextColor="#ccc"
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                maxLength={6}
                textAlign="center"
              />
              <TouchableOpacity onPress={() => setStep("phone")}>
                <Text style={styles.resendText}>Resend code</Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            style={[styles.btn, loading && { opacity: 0.7 }]}
            onPress={step === "phone" ? handleSendOTP : handleVerifyOTP}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnText}>
                  {step === "phone" ? "Send code" : "Verify"}
                </Text>
            }
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.emailRow}
          >
            <Text style={styles.emailText}>
              Use email instead
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { flex: 1, padding: 28 },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },
  topSection: { marginBottom: 32, gap: 8 },
  title: { color: "#111", fontSize: 32, fontWeight: "800", lineHeight: 40 },
  subtitle: { color: "#888", fontSize: 15 },
  error: { color: "#e53935", fontSize: 13, marginBottom: 12 },
  phoneRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  countryCode: {
    backgroundColor: "#f5f5f5",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    justifyContent: "center",
  },
  countryCodeText: { color: "#111", fontSize: 15, fontWeight: "500" },
  phoneInput: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
    color: "#111",
    fontSize: 18,
    letterSpacing: 2,
  },
  otpContainer: { gap: 16, marginBottom: 24 },
  otpInput: {
    backgroundColor: "#f5f5f5",
    borderRadius: 14,
    paddingVertical: 20,
    color: "#111",
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: 12,
  },
  resendText: {
    color: "#b8f54a",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  btn: {
    backgroundColor: "#0d0d0d",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    marginBottom: 16,
  },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  emailRow: { alignItems: "center" },
  emailText: { color: "#888", fontSize: 14 },
});