import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { useAuth } from "../app/context/AuthContext";

export interface Client {
  id: string;
  name: string;
  initials: string;
  measurements: number;
  updatedAt: string;
  email?: string;
  phone?: string;
  photoURL?: string;
}

export function useClients() {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setClients([]);
      setLoading(false);
      return;
    }

    // Real Firestore query — gets only THIS user's clients
    const q = query(
      collection(db, "clients"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Client[] = snapshot.docs.map((doc) => {
        const d = doc.data();
        const name = d.name || "";
        const initials = name
          .split(/\s+/)
          .filter(Boolean)
          .map((part: string) => part[0])
          .join("")
          .slice(0, 2)
          .toUpperCase();

        // Format the updatedAt timestamp
        let updatedAt = "recently";
        if (d.updatedAt?.toDate) {
          const date: Date = d.updatedAt.toDate();
          const now = new Date();
          const diffMs = now.getTime() - date.getTime();
          const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
          if (diffDays === 0) updatedAt = "today";
          else if (diffDays === 1) updatedAt = "yesterday";
          else if (diffDays < 30) updatedAt = `${diffDays} days ago`;
          else updatedAt = `${Math.floor(diffDays / 30)} months ago`;
        }

        return {
          id: doc.id,
          name,
          initials,
          measurements: d.measurements || 0,
          updatedAt,
          email: d.email || "",
          phone: d.phone || "",
          photoURL: d.photoURL || "",
        };
      });

      setClients(data);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  // Clients added this calendar month
  const totalThisMonth = clients.filter((c) => {
    return c.updatedAt === "today" || c.updatedAt === "yesterday";
  }).length;

  const totalMeasurements = clients.reduce(
    (sum, c) => sum + c.measurements,
    0
  );

  return {
    clients,
    loading,
    totalClients: clients.length,
    totalThisMonth,
    totalMeasurements,
    recentClients: clients.slice(0, 3),
  };
}