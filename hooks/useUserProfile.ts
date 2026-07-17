import { useState, useEffect } from "react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../config/firebase";
import { useAuth } from "../app/context/AuthContext";

export interface UserProfile {
  height: number;
  weight: number;
  age: number;
  gender: number; // 1 = Male, 2 = Female
  bmi: number;
  unit: string;
}

export function useUserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    try {
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProfile(docSnap.data() as UserProfile);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async (data: UserProfile) => {
    if (!user) return;
    try {
      // Auto calculate BMI
      const heightInMeters = data.height / 100;
      const bmi = parseFloat(
        (data.weight / (heightInMeters * heightInMeters)).toFixed(1)
      );

      const profileData = { ...data, bmi, updatedAt: serverTimestamp() };
      await setDoc(doc(db, "users", user.uid), profileData, { merge: true });
      setProfile({ ...data, bmi });
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  return { profile, loading, saveProfile, fetchProfile };
}