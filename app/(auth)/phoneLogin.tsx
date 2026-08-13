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
  Image,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ChevronLeft, ChevronDown } from "lucide-react-native";

// Common country codes
const COUNTRIES = [
  { flag: "🇬🇭", code: "+233", name: "Ghana" },
  { flag: "🇳🇬", code: "+234", name: "Nigeria" },
  { flag: "🇿🇦", code: "+27", name: "South Africa" },
  { flag: "🇰🇪", code: "+254", name: "Kenya" },
  { flag: "🇬🇧", code: "+44", name: "United Kingdom" },
  { flag: "🇺🇸", code: "+1", name: "United States" },
  { flag: "🇨🇦", code: "+1", name: "Canada" },
  { flag: "🇩🇪", code: "+49", name: "Germany" },
  { flag: "🇫🇷", code: "+33", name: "France" },
  { flag: "🇮🇳", code: "+91", name: "India" },
  { flag: "🇦🇺", code: "+61", name: "Australia" },
  { flag: "🇧🇷", code: "+55", name: "Brazil" },
  { flag: "🇨🇳", code: "+86", name: "China" },
  { flag: "🇯🇵", code: "+81", name: "Japan" },
  { flag: "🇿🇼", code: "+263", name: "Zimbabwe" },
  { flag: "🇹🇿", code: "+255", name: "Tanzania" },
  { flag: "🇺🇬", code: "+256", name: "Uganda" },
  { flag: "🇸🇳", code: "+221", name: "Senegal" },
  { flag: "🇨🇮", code: "+225", name: "Ivory Coast" },
  { flag: "🇪🇹", code: "+251", name: "Ethiopia" },
];

type Step = "phone" | "otp" | "name";

export default function PhoneLogin() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("phone");
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendOTP = async () => {
    if (!phone || phone.length < 6)
      return setError("Enter a valid phone number");
    setError("");
    setLoading(true);
    try {
      // TODO: Firebase phone auth
      // const confirmation = await signInWithPhoneNumber(auth, `${selectedCountry.code}${phone}`);
      setStep("otp");
    } catch (e: any) {
      setError(e.message || "Could not send OTP");
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
    setError("");
    setLoading(true);
    try {
      // TODO: Firebase OTP verification
      setStep("name");
    } catch (e: any) {
      setError("Invalid code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveName = () => {
    if (!name.trim()) return setError("Please enter your name");
    // TODO: Save name to Firestore
    router.replace("/(tabs)");
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
                Enter your phone number.{"\n"}We will send you a verification
                code.
              </Text>

              {error ? <Text style={styles.error}>{error}</Text> : null}

              {/* Phone input row */}
              <View style={styles.phoneRow}>
                <TouchableOpacity
                  style={styles.countryBtn}
                  onPress={() => setShowCountryPicker(!showCountryPicker)}
                >
                  <Text style={styles.countryFlag}>{selectedCountry.flag}</Text>
                  <Text style={styles.countryCode}>{selectedCountry.code}</Text>
                  <ChevronDown color="#888" size={16} />
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

              {/* Country picker dropdown */}
              {showCountryPicker && (
                <View style={styles.countryList}>
                  <ScrollView style={{ maxHeight: 250 }} nestedScrollEnabled>
                    {COUNTRIES.map((country, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.countryItem}
                        onPress={() => {
                          setSelectedCountry(country);
                          setShowCountryPicker(false);
                        }}
                      >
                        <Text style={styles.countryItemFlag}>
                          {country.flag}
                        </Text>
                        <Text style={styles.countryItemName}>
                          {country.name}
                        </Text>
                        <Text style={styles.countryItemCode}>
                          {country.code}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              <View style={styles.orRow}>
                <View style={styles.divider} />
                <Text style={styles.orText}>Or</Text>
                <View style={styles.divider} />
              </View>

              {/* Google */}
              <TouchableOpacity style={styles.googleBtn}>
                <Image
                  source={require("../../assets/icons/google.png")}
                  style={styles.googleIcon}
                />
                <Text style={styles.googleText}>Sign in with Google</Text>
              </TouchableOpacity>

              <View style={styles.signupRow}>
                <Text style={styles.signupText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => router.push("/(auth)/signup")}>
                  <Text style={styles.signupLink}>Sign Up</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.sendBtn, loading && { opacity: 0.7 }]}
                onPress={handleSendOTP}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#111" />
                ) : (
                  <Text style={styles.sendBtnText}>Send code</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* OTP STEP */}
          {step === "otp" && (
            <View style={styles.stepContainer}>
              <Text style={styles.title}>Verification{"\n"}Email</Text>
              <Text style={styles.subtitle}>
                Please enter the code we just sent to{"\n"}
                <Text style={styles.phoneHighlight}>
                  {selectedCountry.code} {phone}
                </Text>
              </Text>

              {error ? <Text style={styles.error}>{error}</Text> : null}

              {/* PIN dots */}
              <View style={styles.otpRow}>
                {otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    style={[styles.otpBox, digit && styles.otpBoxFilled]}
                    value={digit}
                    onChangeText={(val) =>
                      handleOTPChange(val.slice(-1), index)
                    }
                    keyboardType="number-pad"
                    maxLength={1}
                    textAlign="center"
                    secureTextEntry
                  />
                ))}
              </View>

              <View style={styles.resendRow}>
                <Text style={styles.resendText}>
                  If you didn't receive a code?{" "}
                </Text>
                <TouchableOpacity onPress={() => setStep("phone")}>
                  <Text style={styles.resendLink}>Resend</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.sendBtn, loading && { opacity: 0.7 }]}
                onPress={handleVerifyOTP}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#111" />
                ) : (
                  <Text style={styles.sendBtnText}>Continue</Text>
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

              <TouchableOpacity style={styles.sendBtn} onPress={handleSaveName}>
                <Text style={styles.sendBtnText}>Continue</Text>
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
  countryFlag: { fontSize: 20 },
  countryCode: {
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
  countryList: {
    backgroundColor: "#1e1e1e",
    borderRadius: 14,
    overflow: "hidden",
  },
  countryItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#2a2a2a",
  },
  countryItemFlag: { fontSize: 20 },
  countryItemName: {
    flex: 1,
    color: "#fff",
    fontSize: 14,
    fontFamily: "PlusJakartaSans_400Regular",
  },
  countryItemCode: {
    color: "#666",
    fontSize: 13,
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
  sendBtn: {
    backgroundColor: "#b8f54a",
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 8,
  },
  sendBtnText: {
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
