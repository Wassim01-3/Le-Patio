import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { ContactInfo } from "@/types";

const defaultSettings: ContactInfo = {
  phone: "+216 00 000 000",
  addressValue: "Le Patio, Djerba, Tunisie",
  addressValueEn: "Le Patio, Djerba, Tunisia",
  addressValueAr: "لو باتيو، جربة، تونس",
  addressValueDe: "Le Patio, Djerba, Tunesien",
  addressValueIt: "Le Patio, Djerba, Tunisia",
  openValue: "Tous les jours · 08h00 — 01h00",
  openValueEn: "Every day · 08:00 — 01:00",
  openValueAr: "كل يوم · 08:00 — 01:00",
  openValueDe: "Täglich · 08:00 — 01:00",
  openValueIt: "Ogni giorno · 08:00 — 01:00",
  instagram: "https://instagram.com",
  facebook: "https://facebook.com",
  whatsapp: "https://wa.me/21600000000",
};

export function useContactSettings() {
  const [settings, setSettings] = useState<ContactInfo>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const docRef = doc(db, "settings", "contact");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSettings(docSnap.data() as ContactInfo);
        }
      } catch (err) {
        console.error("Error loading settings:", err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const updateSettings = async (newSettings: Partial<ContactInfo>) => {
    try {
      const docRef = doc(db, "settings", "contact");
      await updateDoc(docRef, newSettings);
      setSettings((prev) => ({ ...prev, ...newSettings }));
    } catch (err) {
      console.error("Error updating settings:", err);
      throw err;
    }
  };

  return { settings, loading, error, updateSettings };
}
