import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { Review } from "@/types";

export function useReviews(onlyApproved = true) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadReviews() {
      try {
        let q;
        if (onlyApproved) {
          q = query(
            collection(db, "reviews"),
            where("approved", "==", true),
            orderBy("timestamp", "desc")
          );
        } else {
          q = query(collection(db, "reviews"), orderBy("timestamp", "desc"));
        }

        const snap = await getDocs(q);
        const list: Review[] = [];
        snap.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as Review);
        });

        // Fallback to un-ordered or raw list if ordering fails due to index missing
        if (list.length === 0 && onlyApproved) {
          const snapRaw = await getDocs(collection(db, "reviews"));
          snapRaw.forEach((doc) => {
            const data = doc.data() as Review;
            if (data.approved) {
              list.push({ id: doc.id, ...data } as Review);
            }
          });
        }

        setReviews(list);
      } catch (err) {
        console.error("Error loading reviews:", err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }
    loadReviews();
  }, [onlyApproved]);

  const addReview = async (review: Omit<Review, "id" | "approved" | "timestamp">) => {
    try {
      const data = {
        ...review,
        approved: false, // Wait for moderation by default
        timestamp: new Date(),
      };
      const ref = await addDoc(collection(db, "reviews"), data);
      const newReview = { id: ref.id, ...data };
      // If we are showing all reviews (dashboard), add it. Otherwise it won't show until approved
      if (!onlyApproved) {
        setReviews((prev) => [newReview, ...prev]);
      }
      return newReview;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const approveReview = async (id: string) => {
    try {
      const ref = doc(db, "reviews", id);
      await updateDoc(ref, { approved: true });
      setReviews((prev) =>
        prev.map((item) => (item.id === id ? { ...item, approved: true } : item))
      );
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const deleteReview = async (id: string) => {
    try {
      const ref = doc(db, "reviews", id);
      await deleteDoc(ref);
      setReviews((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  return { reviews, loading, error, addReview, approveReview, deleteReview };
}
