import { collection, doc, setDoc, onSnapshot, query, serverTimestamp } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";

export interface SessionDetail {
  createdAt: Date;
}

export function useActiveSessions(adminMode = false) {
  const [activeTables, setActiveTables] = useState<Set<string>>(new Set());
  // Map of tableId → earliest session createdAt (i.e. when the customer arrived)
  const [sessionDetails, setSessionDetails] = useState<Map<string, SessionDetail>>(new Map());
  const [loading, setLoading] = useState(adminMode);

  // Client-side heartbeat
  const registerHeartbeat = async (tableId: string) => {
    if (!tableId) return;
    try {
      // Store session ID in sessionStorage so it lasts for the tab duration
      let sessionId = sessionStorage.getItem("le_patio_session_id");
      if (!sessionId) {
        sessionId = `session_${Math.random().toString(36).substring(2, 11)}`;
        sessionStorage.setItem("le_patio_session_id", sessionId);
      }

      const docRef = doc(db, "active_sessions", sessionId);
      
      // Only set createdAt on the first registration of this session in this tab/session
      const sessionRegistered = sessionStorage.getItem("le_patio_session_registered");
      if (!sessionRegistered) {
        await setDoc(docRef, {
          tableId,
          lastActive: serverTimestamp(),
          createdAt: serverTimestamp(),
        }, { merge: true });
        sessionStorage.setItem("le_patio_session_registered", "true");
      } else {
        await setDoc(docRef, {
          tableId,
          lastActive: serverTimestamp(),
        }, { merge: true });
      }
    } catch (err) {
      console.error("Error registering heartbeat:", err);
    }
  };

  // Admin-side subscription
  useEffect(() => {
    if (!adminMode) return;

    const q = query(collection(db, "active_sessions"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const active = new Set<string>();
        const details = new Map<string, SessionDetail>();
        const now = Date.now();
        // A session is active if lastActive is within 45 seconds (45000ms)
        snapshot.forEach((doc) => {
          const data = doc.data();
          const lastActive = data.lastActive?.toDate ? data.lastActive.toDate().getTime() : now;
          if (now - lastActive < 45000) {
            const tableId = data.tableId as string;
            active.add(tableId);

            // Track the earliest createdAt for this table across all its sessions
            const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : new Date(lastActive);
            const existing = details.get(tableId);
            if (!existing || createdAt < existing.createdAt) {
              details.set(tableId, { createdAt });
            }
          }
        });
        setActiveTables(active);
        setSessionDetails(details);
        setLoading(false);
      },
      (err) => {
        console.error("Error listening to active sessions:", err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [adminMode]);

  return { activeTables, sessionDetails, registerHeartbeat, loading };
}
