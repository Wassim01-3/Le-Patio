export interface MultilingualString {
  fr: string;
  en: string;
  ar: string;
  de: string;
  it: string;
}

export interface Category {
  id: string; // e.g. "coffee", "drinks"
  emoji: string;
  name: MultilingualString;
}

export interface MenuItem {
  id?: string;
  name: string;
  desc: string;
  price: number;
  img: string;
  category: string; // Category ID
  popular?: boolean;
  chef?: boolean;
  available: boolean;
}

export interface EventItem {
  id?: string;
  key: string;
  title: string;
  desc: string;
  date: string;
  icon?: string; // Lucide icon name
  img?: string;
  timestamp?: any;
}

export interface GalleryItem {
  id?: string;
  src: string;
  key: string; // Translation key or fallback title
  span?: string; // e.g. "row-span-2"
  timestamp?: any;
}

export interface Review {
  id?: string;
  name: string;
  roleKey: string; // e.g. "rv.role.visit" or custom string
  quote: string;
  scores: {
    food: number;
    service: number;
    atmosphere: number;
    decoration: number;
    wifi: number;
  };
  approved: boolean;
  timestamp: any;
}

export interface ServiceRequest {
  id?: string;
  tableId: string;
  requestType: string; // "callWaiter" | "water" | "bill" | "ashtray" | "chairs"
  status: "pending" | "completed";
  timestamp: any;
}

export interface Reservation {
  id?: string;
  name: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  notes?: string;
  status: "pending" | "confirmed" | "cancelled";
  timestamp: any;
}

export interface ContactInfo {
  phone: string;
  addressValue: string;
  addressValueEn?: string;
  addressValueAr?: string;
  addressValueDe?: string;
  addressValueIt?: string;
  openValue: string;
  openValueEn?: string;
  openValueAr?: string;
  openValueDe?: string;
  openValueIt?: string;
  instagram: string;
  facebook: string;
  whatsapp: string;
}
