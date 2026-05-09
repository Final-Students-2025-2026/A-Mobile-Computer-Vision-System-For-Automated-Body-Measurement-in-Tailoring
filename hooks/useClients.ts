import { useState, useEffect } from "react";

export interface Client {
  id: string;
  name: string;
  initials: string;
  measurements: number;
  updatedAt: string;
  photoURL?: string;
}

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with real Firestore call when Firebase is ready
    // const q = query(collection(db, "clients"), where("userId", "==", auth.currentUser.uid));
    // onSnapshot(q, (snapshot) => { ... })

    // Mock data for now
    setTimeout(() => {
      setClients([]);  // empty so dashboard shows "no clients yet"
      setLoading(false);
    }, 1000);
  }, []);

  const totalThisMonth = clients.filter((c) => {
    // TODO: filter by current month when real data is available
    return false;
  }).length;

  const totalMeasurements = clients.reduce(
    (sum, c) => sum + c.measurements, 0
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