// import { useEffect, useMemo, useState } from "react";
// import { Platform } from "react-native";
// import * as WebBrowser from "expo-web-browser";
// import * as Google from "expo-auth-session/providers/google";
// import { makeRedirectUri, ResponseType } from "expo-auth-session";
// import { useAuth } from "../contexts/AuthContext";

// WebBrowser.maybeCompleteAuthSession();

// function getEnv() {
//   return (globalThis as any).process?.env as
//     | Record<string, string | undefined>
//     | undefined;
// }

// function getMissingClientIdMessage() {
//   if (Platform.OS === "ios") {
//     return "Add EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID from your iOS OAuth client.";
//   }

//   // if (Platform.OS === "android") {
//   //   return "Add EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID from your Android OAuth client.";
//   // }

//   return "Add EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID from your Web OAuth client.";
// }

// function getGoogleErrorMessage(error: unknown) {
//   if (error && typeof error === "object" && "message" in error) {
//     return String(
//       (error as { message?: unknown }).message || "Google sign-in failed.",
//     );
//   }

//   return "Google sign-in failed.";
// }

// export function useGoogleSignIn() {
//   const { loginWithGoogle, loginWithGooglePopup } = useAuth();
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const env = getEnv();
//   const [request, response, promptAsync] = Google.useAuthRequest({
//     expoClientId: env?.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
//     iosClientId: env?.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
//     androidClientId: env?.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
//     webClientId: env?.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
//     responseType: ResponseType.IdToken,
//     scopes: ["openid", "profile", "email"],
//     redirectUri: makeRedirectUri({
//       scheme: "measureai",
//       useProxy: false,
//     }),
//   });

//   useEffect(() => {
//     if (!response) {
//       return;
//     }

//     if (response.type === "success") {
//       const idToken = response.authentication?.idToken;
//       if (!idToken) {
//         setError(
//           "Google did not return an ID token. Check your Google OAuth configuration.",
//         );
//         setLoading(false);
//         return;
//       }

//       loginWithGoogle(idToken)
//         .catch((e) => {
//           const message = getGoogleErrorMessage(e);
//           if (message) {
//             setError(message);
//           }
//         })
//         .finally(() => {
//           setLoading(false);
//         });
//       return;
//     }

//     if (response.type === "error") {
//       setError(getGoogleErrorMessage(response.error));
//       setLoading(false);
//       return;
//     }

//     if (response.type === "dismiss") {
//       setLoading(false);
//     }
//   }, [response, loginWithGoogle]);

//   const signInWithGoogle = useMemo(
//     () => async () => {
//       setError("");

//       if (Platform.OS === "web") {
//         try {
//           setLoading(true);
//           await loginWithGooglePopup();
//         } catch (e) {
//           setError(getGoogleErrorMessage(e));
//         } finally {
//           setLoading(false);
//         }
//         return;
//       }

//       const clientId =
//         Platform.OS === "ios"
//           ? env?.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID
//           : Platform.OS === "android"
//             ? env?.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID
//             : env?.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

//       if (!clientId) {
//         setError(getMissingClientIdMessage());
//         return;
//       }

//       if (!request) {
//         setError("Google sign-in is not configured yet.");
//         return;
//       }

//       try {
//         setLoading(true);
//         await promptAsync({ useProxy: false });
//       } catch (e) {
//         const message = getGoogleErrorMessage(e);
//         if (message) {
//           setError(message);
//         }
//         setLoading(false);
//       }
//     },
//     [
//       loginWithGooglePopup,
//       promptAsync,
//       request,
//       env?.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
//       env?.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
//       env?.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
//     ],
//   );

//   return { error, loading, signInWithGoogle };
// }
