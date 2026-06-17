import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { EventItem } from "@/types";

export function useEvents() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadEvents() {
      try {
        const q = query(collection(db, "events"), orderBy("timestamp", "desc"));
        const snap = await getDocs(q);
        const list: EventItem[] = [];
        snap.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as EventItem);
        });
        
        // If empty, fetch default ones (the seed might not have set timestamp ordering correctly or is pending)
        if (list.length === 0) {
          const snapRaw = await getDocs(collection(db, "events"));
          snapRaw.forEach((doc) => {
            list.push({ id: doc.id, ...doc.data() } as EventItem);
          });
        }
        
        setEvents(list);
      } catch (err) {
        console.error("Error loading events:", err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }
    loadEvents();
  }, []);

  const addEvent = async (event: Omit<EventItem, "id">) => {
    try {
      const data = { ...event, timestamp: new Date() };
      const ref = await addDoc(collection(db, "events"), data);
      const newEvent = { id: ref.id, ...data };
      setEvents((prev) => [newEvent, ...prev]);
      return newEvent;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const updateEvent = async (id: string, updates: Partial<EventItem>) => {
    try {
      const ref = doc(db, "events", id);
      await updateDoc(ref, updates);
      setEvents((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)));
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      const ref = doc(db, "events", id);
      await deleteDoc(ref);
      setEvents((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  return { events, loading, error, addEvent, updateEvent, deleteEvent };
}
