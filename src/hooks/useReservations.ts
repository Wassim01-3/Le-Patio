import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { Reservation } from "@/types";

export function useReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadReservations() {
      try {
        const q = query(collection(db, "reservations"), orderBy("timestamp", "desc"));
        const snap = await getDocs(q);
        const list: Reservation[] = [];
        snap.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as Reservation);
        });
        setReservations(list);
      } catch (err) {
        console.error("Error loading reservations:", err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }
    loadReservations();
  }, []);

  const createReservation = async (res: Omit<Reservation, "id" | "status" | "timestamp">) => {
    try {
      const data = {
        ...res,
        status: "pending" as const,
        timestamp: new Date(),
      };
      const ref = await addDoc(collection(db, "reservations"), data);
      const newReservation = { id: ref.id, ...data };
      setReservations((prev) => [newReservation, ...prev]);
      return newReservation;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const updateReservationStatus = async (id: string, status: Reservation["status"]) => {
    try {
      const ref = doc(db, "reservations", id);
      await updateDoc(ref, { status });
      setReservations((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status } : item))
      );
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const deleteReservation = async (id: string) => {
    try {
      const ref = doc(db, "reservations", id);
      await deleteDoc(ref);
      setReservations((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  return { reservations, loading, error, createReservation, updateReservationStatus, deleteReservation };
}
