import { useState } from "react";
import { NativeModules } from "react-native";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { auth } from "../config/firebase";

let googleSignInConfigured = false;

function getGoogleSignInModule() {
  // Expo Go and APKs built before this dependency do not contain the native
  // RNGoogleSignin module. Avoid importing it until we know it is available
  // so email/password authentication can still work.
  if (!NativeModules.RNGoogleSignin) return null;

  const googleSignIn = require("@react-native-google-signin/google-signin");
  if (!googleSignInConfigured) {
    const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
    if (!webClientId) {
      throw new Error(
        "Google Sign-In is not configured. Add EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID to .env and rebuild the app.",
      );
    }

    googleSignIn.GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? "",
      iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? "",
      scopes: ["profile", "email"],
    });
    googleSignInConfigured = true;
  }

  return googleSignIn;
}

export function useGoogleSignIn() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const signInWithGoogle = async () => {
    setError("");
    setLoading(true);
    let statusCodes: Record<string, string> | undefined;
    try {
      const googleSignIn = getGoogleSignInModule();
      if (!googleSignIn) {
        throw new Error(
          "Google Sign-In requires the latest Measure AI Android build. Email sign-in is available now.",
        );
      }

      const { GoogleSignin, statusCodes: nativeStatusCodes } = googleSignIn;
      statusCodes = nativeStatusCodes;
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });
      const response = await GoogleSignin.signIn();

      // v16 returns a discriminated response instead of throwing for a user
      // cancellation. Do not try to retrieve a token in that case.
      if (response.type !== "success") {
        setError("Sign in cancelled");
        return;
      }

      const idToken = response.data.idToken;

      if (!idToken) throw new Error("No ID token received");

      const credential = GoogleAuthProvider.credential(idToken);
      await signInWithCredential(auth, credential);
    } catch (e: any) {
      if (e.code === statusCodes?.SIGN_IN_CANCELLED) {
        setError("Sign in cancelled");
      } else if (e.code === statusCodes?.IN_PROGRESS) {
        setError("Sign in already in progress");
      } else if (e.code === statusCodes?.PLAY_SERVICES_NOT_AVAILABLE) {
        setError("Play services not available");
      } else {
        setError(e.message || "Google sign in failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return { signInWithGoogle, loading, error };
}
