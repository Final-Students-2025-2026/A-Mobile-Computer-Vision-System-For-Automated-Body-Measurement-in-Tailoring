import { useState } from "react";
import { GoogleSignin, statusCodes } from "@react-native-google-signin/google-signin";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { auth } from "../config/firebase";

// Configure Google Sign In
GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? "",
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? "",
  scopes: ["profile", "email"],
});

export function useGoogleSignIn() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const signInWithGoogle = async () => {
    setError("");
    setLoading(true);
    try {
      await GoogleSignin.hasPlayServices();
      await GoogleSignin.signOut();
      await GoogleSignin.signIn();
      const { idToken } = await GoogleSignin.getTokens();

      if (!idToken) throw new Error("No ID token received");

      const credential = GoogleAuthProvider.credential(idToken);
      await signInWithCredential(auth, credential);
    } catch (e: any) {
      if (e.code === statusCodes.SIGN_IN_CANCELLED) {
        setError("Sign in cancelled");
      } else if (e.code === statusCodes.IN_PROGRESS) {
        setError("Sign in already in progress");
      } else if (e.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
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