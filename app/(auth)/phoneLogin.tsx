import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ChevronLeft, ChevronDown } from "lucide-react-native";
import CountryPicker, { Country, CountryCode } from "react-native-country-picker-modal";
import { useGoogleSignIn } from "../../hooks/useGoogleSignIn";
import { auth } from "../../config/firebase";
import {
  signInWithPhoneNumber,
  PhoneAuthProvider,
  signInWithCredential,
  ConfirmationResult,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../config/firebase";

type Step = "phone" | "otp" | "name";

export default function PhoneLogin() {
  const router = useRouter();
  const { signInWithGoogle, loading: googleLoading, error: googleError } = useGoogleSignIn();

  const [step, setStep] = useState<Step>("phone");
  const [countryCode, setCountryCode] = useState<CountryCode>("GH");
  const [callingCode, setCallingCode] = useState("233");
  const [showPicker, setShowPicker] = useState(false);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const confirmationRef = useRef<ConfirmationResult | null>(null);

  const onSelectCountry = (country: Country) => {
    setCountryCode(country.cca2);
    setCallingCode(country.callingCode[0]);
    setShowPicker(false);
  };

  const handleSendOTP = async () => {
    if (!phone || phone.length < 6) return setError("Enter a valid phone number");
    setError("");
    setLoading(true);
    try {
      const fullPhone = `+${callingCode}${phone}`;
      const confirmation = await signInWithPhoneNumber(auth, fullPhone);
      confirmationRef.current = confirmation;
      setStep("otp");
    } catch (e: any) {
      setError(e.message || "Could not send OTP. Check your number and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOTPChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
  };

  const handleVerifyOTP = async () => {
    const code = otp.join("");
    if (code.length !== 6) return setError("Enter the 6-digit code");
    if (!confirmationRef.current) return setError("Please request a new code");
    setError("");
    setLoading(true);
    try {
      await confirmationRef.current.confirm(code);
      setStep("name");
    } catch (e: any) {
      setError("Invalid code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveName = async () => {
    if (!name.trim()) return setError("Please enter your name");
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (user) {
        // Update display name
        await updateProfile(user, { displayName: name.trim() });
        // Save to Firestore
        await setDoc(doc(db, "users", user.uid), {
          name: name.trim(),
          phone: `+${callingCode}${phone}`,
          createdAt: serverTimestamp(),
        }, { merge: true });
      }
      router.replace("/(tabs)");
    } catch (e: any) {
      setError(e.message || "Could not save name");
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
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Back button */}
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => {
              if (step === "otp") setStep("phone");
              else if (step === "name") setStep("otp");
              else router.back();
            }}
          >
            <ChevronLeft color="#fff" size={24} />
          </TouchableOpacity>

          {/* PHONE STEP */}
          {step === "phone" && (
            <View style={styles.stepContainer}>
              <Text style={styles.title}>Sign In</Text>
              <Text style={styles.subtitle}>
                Enter your phone number.{"\n"}
                We will send you a verification code.
              </Text>

              {error || googleError ? (
                <Text style={styles.error}>{error || googleError}</Text>
              ) : null}

              <View style={styles.phoneRow}>
                <TouchableOpacity
                  style={styles.countryBtn}
                  onPress={() => setShowPicker(true)}
                >
                  <CountryPicker
                    countryCode={countryCode}
                    withFilter
                    withFlag
                    withCallingCode
                    withEmoji
                    onSelect={onSelectCountry}
                    visible={showPicker}
                    onClose={() => setShowPicker(false)}
                    theme={{
                      backgroundColor: "#1e1e1e",
                      onBackgroundTextColor: "#fff",
                      fontSize: 14,
                      filterPlaceholderTextColor: "#666",
                      activeOpacity: 0.7,
                      itemHeight: 48,
                    }}
                  />
                  <Text style={styles.callingCode}>+{callingCode}</Text>
                  <ChevronDown color="#888" size={14} />
                </TouchableOpacity>

                <TextInput
                  style={styles.phoneInput}
                  placeholder="Phone number"
                  placeholderTextColor="#555"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.orRow}>
                <View style={styles.divider} />
                <Text style={styles.orText}>Or</Text>
                <View style={styles.divider} />
              </View>

              <TouchableOpacity
                style={styles.googleBtn}
                onPress={signInWithGoogle}
                disabled={googleLoading}
              >
                {googleLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Image
                      source={require("../../assets/icons/google.png")}
                      style={styles.googleIcon}
                    />
                    <Text style={styles.googleText}>Sign in with Google</Text>
                  </>
                )}
              </TouchableOpacity>

              <View style={styles.signupRow}>
                <Text style={styles.signupText}>Don't have an account? </Text>
                <TouchableOpacity onPress={() => router.push("/(auth)/signup")}>
                  <Text style={styles.signupLink}>Sign Up</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.actionBtn, loading && { opacity: 0.7 }]}
                onPress={handleSendOTP}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#111" />
                ) : (
                  <Text style={styles.actionBtnText}>Send code</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* OTP STEP */}
          {step === "otp" && (
            <View style={styles.stepContainer}>
              <Text style={styles.title}>Verification{"\n"}Code</Text>
              <Text style={styles.subtitle}>
                Please enter the code we just sent to{"\n"}
                <Text style={styles.phoneHighlight}>
                  +{callingCode} {phone}
                </Text>
              </Text>

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <View style={styles.otpRow}>
                {otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    style={[styles.otpBox, digit ? styles.otpBoxFilled : null]}
                    value={digit}
                    onChangeText={(val) => handleOTPChange(val.slice(-1), index)}
                    keyboardType="number-pad"
                    maxLength={1}
                    textAlign="center"
                    secureTextEntry
                  />
                ))}
              </View>

              <View style={styles.resendRow}>
                <Text style={styles.resendText}>Didn't receive a code? </Text>
                <TouchableOpacity onPress={handleSendOTP}>
                  <Text style={styles.resendLink}>Resend</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.actionBtn, loading && { opacity: 0.7 }]}
                onPress={handleVerifyOTP}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#111" />
                ) : (
                  <Text style={styles.actionBtnText}>Continue</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* NAME STEP */}
          {step === "name" && (
            <View style={styles.stepContainer}>
              <Text style={styles.title}>What's your{"\n"}name?</Text>
              <Text style={styles.subtitle}>
                This is how you'll appear on the app
              </Text>

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <TextInput
                style={styles.nameInput}
                placeholder="Enter your full name"
                placeholderTextColor="#555"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                autoFocus
              />

              <TouchableOpacity
                style={[styles.actionBtn, loading && { opacity: 0.7 }]}
                onPress={handleSaveName}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#111" />
                ) : (
                  <Text style={styles.actionBtnText}>Continue</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111111" },
  scroll: { flexGrow: 1, padding: 28 },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1e1e1e",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
    marginTop: 8,
  },
  stepContainer: { flex: 1, gap: 20 },
  title: {
    color: "#fff",
    fontSize: 32,
    fontFamily: "PlusJakartaSans_800ExtraBold",
    lineHeight: 40,
  },
  subtitle: {
    color: "#666",
    fontSize: 15,
    fontFamily: "PlusJakartaSans_400Regular",
    lineHeight: 22,
  },
  phoneHighlight: {
    color: "#b8f54a",
    fontFamily: "PlusJakartaSans_600SemiBold",
  },
  error: {
    color: "#ff6b6b",
    fontSize: 13,
    fontFamily: "PlusJakartaSans_400Regular",
  },
  phoneRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  countryBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e1e1e",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 18,
    gap: 6,
  },
  callingCode: {
    color: "#fff",
    fontSize: 15,
    fontFamily: "PlusJakartaSans_500Medium",
  },
  phoneInput: {
    flex: 1,
    backgroundColor: "#1e1e1e",
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 18,
    color: "#fff",
    fontSize: 15,
    fontFamily: "PlusJakartaSans_400Regular",
  },
  orRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  divider: { flex: 1, height: 1, backgroundColor: "#222" },
  orText: {
    color: "#555",
    fontSize: 13,
    fontFamily: "PlusJakartaSans_400Regular",
  },
  googleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1e1e1e",
    borderRadius: 14,
    paddingVertical: 16,
    gap: 10,
  },
  googleIcon: { width: 20, height: 20 },
  googleText: {
    color: "#fff",
    fontSize: 15,
    fontFamily: "PlusJakartaSans_500Medium",
  },
  signupRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signupText: {
    color: "#555",
    fontSize: 14,
    fontFamily: "PlusJakartaSans_400Regular",
  },
  signupLink: {
    color: "#b8f54a",
    fontFamily: "PlusJakartaSans_700Bold",
    fontSize: 14,
  },
  actionBtn: {
    backgroundColor: "#b8f54a",
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 8,
  },
  actionBtnText: {
    color: "#111",
    fontSize: 16,
    fontFamily: "PlusJakartaSans_700Bold",
  },
  otpRow: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    marginVertical: 8,
  },
  otpBox: {
    width: 48,
    height: 56,
    borderRadius: 12,
    backgroundColor: "#1e1e1e",
    color: "#fff",
    fontSize: 20,
    fontFamily: "PlusJakartaSans_700Bold",
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  otpBoxFilled: {
    borderColor: "#b8f54a",
    backgroundColor: "#1a2a0a",
  },
  resendRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  resendText: {
    color: "#555",
    fontSize: 13,
    fontFamily: "PlusJakartaSans_400Regular",
  },
  resendLink: {
    color: "#b8f54a",
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontSize: 13,
  },
  nameInput: {
    backgroundColor: "#1e1e1e",
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 20,
    color: "#fff",
    fontSize: 18,
    fontFamily: "PlusJakartaSans_500Medium",
  },
});