import { useEffect, useMemo, useState } from "react";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { Platform } from "react-native";
import { useAuth } from "../app/context/AuthContext";

WebBrowser.maybeCompleteAuthSession();

const missingClientId = "missing-google-client-id";

function getGoogleClientId() {
  if (Platform.OS === "android") {
    return process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || missingClientId;
  }

  if (Platform.OS === "ios") {
    return process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || missingClientId;
  }

  return (
    process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
    process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ||
    missingClientId
  );
}

function getMissingClientIdMessage() {
  if (Platform.OS === "android") {
    return "Add EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID from a Google Android OAuth client.";
  }

  if (Platform.OS === "ios") {
    return "Add EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID from a Google iOS OAuth client.";
  }

  return "Add EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID from a Google Web OAuth client.";
}

export function useGoogleSignIn() {
  const { loginWithGoogle, loginWithGooglePopup } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const clientId = getGoogleClientId();

  const hasClientId = clientId !== missingClientId;

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest(
    {
      clientId,
      webClientId:
        process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
        process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
      iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
      androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
      selectAccount: true,
    },
  );

  useEffect(() => {
    let isActive = true;

    const completeFirebaseLogin = async () => {
      if (!response) {
        return;
      }

      if (response.type === "success") {
        const idToken = response.params.id_token;

        if (!idToken) {
          setError(
            "Google did not return an ID token. Check your OAuth client setup.",
          );
          setLoading(false);
          return;
        }

        try {
          await loginWithGoogle(idToken);
        } catch (e: any) {
          if (isActive) {
            setError(e.message || "Google sign-in failed.");
          }
        } finally {
          if (isActive) {
            setLoading(false);
          }
        }
        return;
      }

      if (response.type === "error") {
        setError(response.error?.message || "Google sign-in failed.");
      }

      setLoading(false);
    };

    completeFirebaseLogin();

    return () => {
      isActive = false;
    };
  }, [loginWithGoogle, response]);

  const signInWithGoogle = useMemo(
    () => async () => {
      setError("");

      if (Platform.OS === "web") {
        try {
          setLoading(true);
          await loginWithGooglePopup();
        } catch (e: any) {
          setError(e.message || "Google sign-in failed.");
        } finally {
          setLoading(false);
        }
        return;
      }

      if (!hasClientId) {
        setError(getMissingClientIdMessage());
        return;
      }

      if (!request) {
        setError("Google sign-in is still loading. Try again in a moment.");
        return;
      }

      setLoading(true);
      const result = await promptAsync();

      if (result.type === "cancel" || result.type === "dismiss") {
        setLoading(false);
      }
    },
    [hasClientId, loginWithGooglePopup, promptAsync, request],
  );

  return { error, loading, signInWithGoogle };
}
