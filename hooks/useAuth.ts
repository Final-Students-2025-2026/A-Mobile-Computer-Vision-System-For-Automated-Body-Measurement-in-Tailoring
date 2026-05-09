import { useState, useEffect } from "react";

export interface User {
  uid: string;
  name: string;
  email: string;
  initials: string;
  photoURL?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with real Firebase auth listener when ready
    // const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => { ... })

    // Mock user for now
    setTimeout(() => {
      setUser({
        uid: "123",
        name: "Kofi Owusu",
        email: "kofi@example.com",
        initials: "KO",
      });
      setLoading(false);
    }, 500);
  }, []);

  return { user, loading };
}