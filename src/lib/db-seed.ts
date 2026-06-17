import { collection, getDocs, writeBatch, doc } from "firebase/firestore";
import { db } from "./firebase";

export async function seedDatabaseIfNeeded() {
  try {
    const categoriesCol = collection(db, "menu_categories");
    const snapshot = await getDocs(categoriesCol);
    if (!snapshot.empty) {
      console.log("Database already seeded");
      return;
    }

    console.log("Seeding database...");
    const batch = writeBatch(db);

    // 1. Categories
    const categories = [
      { id: "coffee", emoji: "☕", name: { fr: "Café", en: "Coffee", ar: "قهوة", de: "Kaffee", it: "Caffè" } },
      { id: "drinks", emoji: "🥤", name: { fr: "Boissons", en: "Drinks", ar: "مشروبات", de: "Getränke", it: "Bevande" } },
      { id: "desserts", emoji: "🍰", name: { fr: "Desserts", en: "Desserts", ar: "حلويات", de: "Desserts", it: "Dolci" } },
      { id: "pizza", emoji: "🍕", name: { fr: "Pizza", en: "Pizza", ar: "بيتزا", de: "Pizza", it: "Pizza" } },
      { id: "pasta", emoji: "🍝", name: { fr: "Pâtes", en: "Pasta", ar: "باستا", de: "Pasta", it: "Pasta" } },
      { id: "burgers", emoji: "🍔", name: { fr: "Burgers", en: "Burgers", ar: "برغر", de: "Burger", it: "Burger" } },
      { id: "main", emoji: "🥩", name: { fr: "Plats", en: "Main", ar: "أطباق رئيسية", de: "Hauptgerichte", it: "Secondi" } },
      { id: "salads", emoji: "🥗", name: { fr: "Salades", en: "Salads", ar: "سلطات", de: "Salate", it: "Insalate" } },
      { id: "icecream", emoji: "🍨", name: { fr: "Glaces", en: "Ice Cream", ar: "مثلجات", de: "Eis", it: "Gelati" } },
      { id: "cocktails", emoji: "🍹", name: { fr: "Cocktails", en: "Cocktails", ar: "كوكتيلات", de: "Cocktails", it: "Cocktail" } },
    ];

    categories.forEach((c) => {
      const ref = doc(db, "menu_categories", c.id);
      batch.set(ref, c);
    });

    // 2. Menu Items
    const items = [
      { name: "Patio Cappuccino", desc: "Double espresso, velvet milk foam, cocoa dust.", price: 8, img: "coffee", category: "coffee", popular: true, chef: false, available: true },
      { name: "Iced Vanilla Latte", desc: "Cold brew, Madagascar vanilla, ice cubes.", price: 12, img: "coffee", category: "coffee", popular: false, chef: false, available: true },
      { name: "Espresso Macchiato", desc: "A small pour, a generous touch of foam.", price: 6, img: "coffee", category: "coffee", popular: false, chef: false, available: true },
      { name: "Mediterranean Lemonade", desc: "Lemon, mint, orange-blossom water.", price: 10, img: "drinks", category: "drinks", popular: true, chef: false, available: true },
      { name: "Berry Smoothie", desc: "Strawberry, raspberry, blueberry, yogurt.", price: 14, img: "drinks", category: "drinks", popular: false, chef: false, available: true },
      { name: "Pistachio Baklava", desc: "Filo, pistachio, honey, gold dust.", price: 16, img: "dessert", category: "desserts", popular: false, chef: true, available: true },
      { name: "Tiramisu Maison", desc: "Mascarpone, savoiardi, espresso, cocoa.", price: 14, img: "dessert", category: "desserts", popular: false, chef: false, available: true },
      { name: "Pizza Margherita", desc: "San Marzano tomato, fior di latte, basil.", price: 22, img: "pizza", category: "pizza", popular: true, chef: false, available: true },
      { name: "Truffle Pasta", desc: "Tagliolini, black truffle, parmesan.", price: 32, img: "pasta", category: "pasta", popular: false, chef: true, available: true },
      { name: "Patio Signature Burger", desc: "Aged beef, cheddar, caramelised onion.", price: 28, img: "burger", category: "burgers", popular: true, chef: false, available: true },
      { name: "Grilled Lamb Chops", desc: "Rosemary, roasted vegetables, jus.", price: 48, img: "main", category: "main", popular: false, chef: true, available: true },
      { name: "Mediterranean Salad", desc: "Feta, olives, cucumber, herbs, lemon oil.", price: 18, img: "salad", category: "salads", popular: false, chef: false, available: true },
      { name: "Trio Gelato", desc: "Pistachio · vanilla · strawberry, mint.", price: 14, img: "icecream", category: "icecream", popular: false, chef: false, available: true },
      { name: "Garden Mojito", desc: "White rum, lime, mint, soda.", price: 22, img: "cocktail", category: "cocktails", popular: true, chef: false, available: true },
    ];

    items.forEach((item, index) => {
      const ref = doc(collection(db, "menu_items"));
      batch.set(ref, item);
    });

    // 3. Events
    const events = [
      { key: "music", title: "Live Music Night", desc: "Acoustic sets under the olive trees — 9pm onwards.", date: "Every Friday", icon: "Music", img: "terrace", timestamp: new Date() },
      { key: "match", title: "Football on the Big Screen", desc: "Comfortable seating, cold drinks, full crowd energy.", date: "Match Days", icon: "Trophy", img: "sunset", timestamp: new Date() },
      { key: "ramadan", title: "Iftar & Sahour Specials", desc: "A curated menu of Mediterranean and Tunisian classics.", date: "Ramadan", icon: "Moon", img: "decor", timestamp: new Date() },
      { key: "valentine", title: "Valentine's Evening", desc: "Candle-lit tables, set menu, sunset terrace.", date: "February 14", icon: "Heart", img: "couple", timestamp: new Date() },
      { key: "menu", title: "New Menu Launches", desc: "Each season, a new chapter from our chef.", date: "Seasonal", icon: "Sparkles", img: "dessert", timestamp: new Date() },
    ];

    events.forEach((ev) => {
      const ref = doc(db, "events", ev.key);
      batch.set(ref, ev);
    });

    // 4. Gallery
    const gallery = [
      { src: "terrace", key: "atm.terrace.t", span: "row-span-2", timestamp: new Date() },
      { src: "coffee", key: "cat.coffee", span: "", timestamp: new Date() },
      { src: "dessert", key: "cat.desserts", span: "", timestamp: new Date() },
      { src: "sunset", key: "ev.match.t", span: "row-span-2", timestamp: new Date() },
      { src: "lounge", key: "ex.lounge.t", span: "", timestamp: new Date() },
      { src: "cocktail", key: "cat.cocktails", span: "", timestamp: new Date() },
      { src: "decor", key: "ex.quiet.t", span: "", timestamp: new Date() },
      { src: "couple", key: "atm.couple.t", span: "row-span-2", timestamp: new Date() },
      { src: "family", key: "atm.family.t", span: "", timestamp: new Date() },
    ];

    gallery.forEach((g, index) => {
      const ref = doc(collection(db, "gallery"));
      batch.set(ref, g);
    });

    // 5. Reviews
    const reviews = [
      { name: "Sarah K.", roleKey: "rv.role.visit", quote: "La terrasse à l'heure dorée est irréelle. Le café était parfait et l'équipe nous a traités comme de la famille.", scores: { food: 5, service: 5, atmosphere: 5, decoration: 5, wifi: 4 }, approved: true, timestamp: new Date() },
      { name: "Mehdi B.", roleKey: "rv.role.local", quote: "Mon second bureau. WiFi rapide, coins calmes, vraie cuisine. La baklava à la pistache est dangereuse.", scores: { food: 5, service: 5, atmosphere: 5, decoration: 5, wifi: 5 }, approved: true, timestamp: new Date() },
      { name: "Léa & Karim", roleKey: "rv.role.couple", quote: "On est venus pour un café, on est restés pour le dîner. Bougies, musique douce, vue sur le jardin — magique.", scores: { food: 5, service: 5, atmosphere: 5, decoration: 4, wifi: 4 }, approved: true, timestamp: new Date() },
      { name: "Famille Trabelsi", roleKey: "rv.role.family", quote: "Grande table, enfants chaleureusement accueillis, tout le monde a trouvé quelque chose au menu. Hautement recommandé.", scores: { food: 5, service: 5, atmosphere: 4, decoration: 5, wifi: 5 }, approved: true, timestamp: new Date() },
    ];

    reviews.forEach((r, index) => {
      const ref = doc(collection(db, "reviews"));
      batch.set(ref, r);
    });

    // 6. Settings
    const settings = {
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
      instagram: "https://www.instagram.com/lepatio_djerba?igsh=MTNicnZ2ODZxeDg0aA==",
      facebook: "https://www.facebook.com/p/Le-Patio-61573872191824/",
      whatsapp: "https://wa.me/21698424600",
    };

    const settingsRef = doc(db, "settings", "contact");
    batch.set(settingsRef, settings);

    await batch.commit();
    console.log("Database successfully seeded!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}
