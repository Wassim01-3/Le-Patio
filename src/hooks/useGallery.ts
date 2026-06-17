import { collection, getDocs, addDoc, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { GalleryItem } from "@/types";

export function useGallery() {
  const [photos, setPhotos] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadGallery() {
      try {
        // Try ordered query first (requires composite index after first run)
        let list: GalleryItem[] = [];
        try {
          const q = query(collection(db, "gallery"), orderBy("timestamp", "desc"));
          const snap = await getDocs(q);
          snap.forEach((d) => list.push({ id: d.id, ...d.data() } as GalleryItem));
        } catch {
          // Fallback: unordered fetch (works before Firestore index is created)
          const snap = await getDocs(collection(db, "gallery"));
          snap.forEach((d) => list.push({ id: d.id, ...d.data() } as GalleryItem));
        }
        setPhotos(list);
      } catch (err) {
        console.error("Error loading gallery:", err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }
    loadGallery();
  }, []);

  /**
   * Upload a file to Cloudinary, then save the URL + metadata to Firestore.
   * Cloudinary free tier: 25 GB storage, 25 GB bandwidth/month — plenty for a restaurant.
   */
  const uploadPhoto = async (file: File, key: string, span: string = "") => {
    try {
      // 1. Upload image to Cloudinary
      const result = await uploadToCloudinary(file, "gallery");

      // 2. Save metadata + Cloudinary URL to Firestore
      const newItem: Omit<GalleryItem, "id"> = {
        src: result.secure_url,        // Full HTTPS Cloudinary URL
        key,
        span,
        timestamp: new Date(),
      };

      const docRef = await addDoc(collection(db, "gallery"), newItem);
      const galleryItem = { id: docRef.id, ...newItem };
      setPhotos((prev) => [galleryItem, ...prev]);
      return galleryItem;
    } catch (err) {
      console.error("Upload error:", err);
      throw err;
    }
  };

  /**
   * Remove the Firestore document.
   * Note: Cloudinary deletion requires a server-side signed request.
   * On the free plan, the easiest approach is to simply unlist the image
   * (remove the Firestore doc). The Cloudinary image will remain in storage
   * but won't be displayed. Use the Cloudinary Media Library to delete
   * images manually when needed.
   */
  const deletePhoto = async (id: string) => {
    try {
      await deleteDoc(doc(db, "gallery", id));
      setPhotos((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  return { photos, loading, error, uploadPhoto, deletePhoto };
}
