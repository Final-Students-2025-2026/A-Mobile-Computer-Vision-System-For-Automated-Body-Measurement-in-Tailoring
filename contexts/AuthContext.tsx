import React, {
  createContext,
  useCallback,
  useState,
  useEffect,
  useContext,
} from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithCredential,
  User,
} from "firebase/auth";
import { auth } from "../config/firebase";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name?: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  loginWithGooglePopup: () => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | null>(null);
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const loginWithGoogle = useCallback(async (idToken: string) => {
    const credential = GoogleAuthProvider.credential(idToken);
    await signInWithCredential(auth, credential);
  }, []);

  const loginWithGooglePopup = useCallback(async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    const { signInWithPopup } = (await import("firebase/auth")) as any;
    await signInWithPopup(auth, provider);
  }, []);

  const signup = async (email: string, password: string, name?: string) => {
    const credential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );

    if (name?.trim()) {
      await updateProfile(credential.user, { displayName: name.trim() });
      setUser(credential.user);
    }
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const logout = async () => {
    await signOut(auth);
  };
  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        resetPassword,
        loginWithGoogle,
        loginWithGooglePopup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
