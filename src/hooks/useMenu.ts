import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { MenuItem, Category } from "@/types";
import { seedDatabaseIfNeeded } from "@/lib/db-seed";

export function useMenu() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadMenuData() {
      try {
        // Run seed check first
        await seedDatabaseIfNeeded();

        // Load Categories
        const catSnap = await getDocs(collection(db, "menu_categories"));
        const catList: Category[] = [];
        catSnap.forEach((doc) => {
          catList.push({ id: doc.id, ...doc.data() } as Category);
        });
        setCategories(catList);

        // Load Menu Items
        const itemsSnap = await getDocs(collection(db, "menu_items"));
        const itemsList: MenuItem[] = [];
        itemsSnap.forEach((doc) => {
          itemsList.push({ id: doc.id, ...doc.data() } as MenuItem);
        });
        setItems(itemsList);
      } catch (err) {
        console.error("Error loading menu:", err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }
    loadMenuData();
  }, []);

  const addCategory = async (cat: Omit<Category, "id"> & { id: string }) => {
    try {
      const ref = doc(db, "menu_categories", cat.id);
      await updateDoc(ref, cat as any); // Set/update
      setCategories((prev) => [...prev, cat]);
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const addMenuItem = async (item: Omit<MenuItem, "id">) => {
    try {
      const ref = await addDoc(collection(db, "menu_items"), item);
      const newItem = { id: ref.id, ...item };
      setItems((prev) => [...prev, newItem]);
      return newItem;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const updateMenuItem = async (id: string, updates: Partial<MenuItem>) => {
    try {
      const ref = doc(db, "menu_items", id);
      await updateDoc(ref, updates);
      setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)));
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const deleteMenuItem = async (id: string) => {
    try {
      const ref = doc(db, "menu_items", id);
      await deleteDoc(ref);
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  return {
    categories,
    items,
    loading,
    error,
    addCategory,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
  };
}
