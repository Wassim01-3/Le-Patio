import { collection, addDoc, updateDoc, deleteDoc, doc, query, orderBy, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { ServiceRequest } from "@/types";

export function useServiceRequests(realtime = false) {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!realtime) {
      setLoading(false);
      return;
    }

    const q = query(collection(db, "service_requests"), orderBy("timestamp", "desc"));
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: ServiceRequest[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as ServiceRequest);
        });
        setRequests(list);
        setLoading(false);
      },
      (err) => {
        console.error("Realtime listener error:", err);
        setError(err as Error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [realtime]);

  const createRequest = async (tableId: string, requestType: string) => {
    try {
      const data = {
        tableId,
        requestType,
        status: "pending" as const,
        timestamp: new Date(),
      };
      const ref = await addDoc(collection(db, "service_requests"), data);
      return { id: ref.id, ...data };
    } catch (err) {
      console.error("Error creating service request:", err);
      throw err;
    }
  };

  const updateRequestStatus = async (id: string, status: ServiceRequest["status"]) => {
    try {
      const ref = doc(db, "service_requests", id);
      await updateDoc(ref, { status });
      setRequests((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status } : item))
      );
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const deleteRequest = async (id: string) => {
    try {
      const ref = doc(db, "service_requests", id);
      await deleteDoc(ref);
      setRequests((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  return { requests, loading, error, createRequest, updateRequestStatus, deleteRequest };
}
