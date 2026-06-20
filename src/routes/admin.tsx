import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Lock, LogOut, LayoutDashboard, UtensilsCrossed, Calendar, 
  Image as ImageIcon, Star, Settings, Bell, Check, Trash2, 
  Plus, Edit3, X, Eye, EyeOff, Save, ShieldAlert, Armchair
} from "lucide-react";
import { useMenu } from "@/hooks/useMenu";
import { useEvents } from "@/hooks/useEvents";
import { useGallery } from "@/hooks/useGallery";
import { useReviews } from "@/hooks/useReviews";
import { useServiceRequests } from "@/hooks/useServiceRequests";
import { useContactSettings } from "@/hooks/useContactSettings";
import { resolveImage } from "@/lib/image-mapping";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Logo } from "@/components/Logo";

import { LiveFloorPlan } from "@/components/LiveFloorPlan";
import { PortraitLandscapeGuard } from "@/components/PortraitLandscapeGuard";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — Le Patio" },
    ],
  }),
  component: AdminRoute,
});

function AdminRoute() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (usr) => {
      setUser(usr);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      {user ? <AdminDashboard /> : <AdminLogin />}
    </div>
  );
}

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Successfully logged in");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <Logo className="h-12 w-auto mb-8" />
      <Card className="w-full max-w-md p-6 glass rounded-[2rem] border border-border/80 shadow-elegant">
        <h2 className="font-display text-2xl font-semibold mb-6 flex items-center gap-2 justify-center">
          <Lock className="h-5 w-5 text-accent" /> Admin Login
        </h2>
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs uppercase tracking-wider text-muted-foreground">Email</label>
            <Input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="admin@lepatio.com" 
              required
              className="bg-background/50 rounded-2xl h-12"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs uppercase tracking-wider text-muted-foreground">Password</label>
            <Input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="••••••••" 
              required
              className="bg-background/50 rounded-2xl h-12"
            />
          </div>
          <Button 
            type="submit" 
            disabled={loading}
            className="mt-4 h-12 rounded-full bg-accent hover:bg-accent/80 text-wood font-semibold"
          >
            {loading ? "Logging in..." : "Enter Dashboard"}
          </Button>
        </form>
      </Card>
    </div>
  );
}

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"floorplan" | "requests" | "menu" | "events" | "gallery" | "reviews" | "settings">("floorplan");
  
  const handleLogout = async () => {
    await signOut(auth);
    toast.success("Logged out successfully");
  };

  const tabs = [
    { id: "floorplan", label: "Live Floor Plan", icon: Armchair },
    { id: "requests", label: "Requests", icon: Bell },
    { id: "menu", label: "Menu", icon: UtensilsCrossed },
    { id: "events", label: "Events", icon: Calendar },
    { id: "gallery", label: "Gallery", icon: ImageIcon },
    { id: "reviews", label: "Reviews", icon: Star },
    { id: "settings", label: "Settings", icon: Settings },
  ] as const;

  return (
    <div className="mx-auto max-w-4xl px-4 pt-6">
      {/* HEADER */}
      <div className="flex items-center justify-between glass rounded-full px-5 py-3 shadow-soft mb-8">
        <Logo className="h-8 w-auto" />
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium bg-olive/15 text-olive px-3 py-1 rounded-full border border-olive/20">
            Admin Console
          </span>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex gap-1 overflow-x-auto pb-2 mb-6 scrollbar-none border-b border-border">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                active 
                  ? "bg-accent text-wood shadow-gold" 
                  : "text-muted-foreground hover:bg-card/50"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENTS */}
      <div className="mt-4">
        {activeTab === "floorplan" && (
          <PortraitLandscapeGuard>
            <LiveFloorPlan />
          </PortraitLandscapeGuard>
        )}
        {activeTab === "requests" && <RequestsPanel />}
        {activeTab === "menu" && <MenuPanel />}
        {activeTab === "events" && <EventsPanel />}
        {activeTab === "gallery" && <GalleryPanel />}
        {activeTab === "reviews" && <ReviewsPanel />}
        {activeTab === "settings" && <SettingsPanel />}
      </div>
    </div>
  );
}

// 1. Service Requests Panel
function RequestsPanel() {
  const { requests, loading, updateRequestStatus, deleteRequest } = useServiceRequests(true);

  if (loading) return <PanelLoading />;

  const pending = requests.filter(r => r.status === "pending");
  const completed = requests.filter(r => r.status === "completed");

  const getRequestLabel = (type: string) => {
    const mapping: Record<string, string> = {
      callWaiter: "Call Waiter 📞",
      water: "Need Water 💧",
      bill: "Request Bill 🧾",
      ashtray: "Need Ashtray 🚬",
      chairs: "Extra Chairs 🪑",
    };
    return mapping[type] || type;
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h3 className="font-display text-xl font-semibold">Active Table Requests</h3>
        <span className="text-xs bg-accent/20 text-accent-foreground px-2.5 py-1 rounded-full font-semibold">
          {pending.length} Pending
        </span>
      </div>

      {pending.length === 0 && (
        <Card className="p-8 text-center text-muted-foreground bg-card/40 rounded-3xl border border-dashed border-border">
          🌿 All quiet! No pending table requests.
        </Card>
      )}

      {/* Pending requests */}
      <div className="grid gap-3">
        {pending.map((req) => (
          <motion.div 
            key={req.id} 
            layout
            className="flex items-center justify-between p-4 bg-card border border-accent/30 rounded-2xl shadow-elegant"
          >
            <div>
              <span className="text-xs uppercase tracking-wider text-accent font-semibold block mb-1">
                Table {req.tableId}
              </span>
              <span className="font-display text-base font-semibold">
                {getRequestLabel(req.requestType)}
              </span>
              <span className="text-[10px] text-muted-foreground block mt-1">
                {req.timestamp?.toDate ? new Date(req.timestamp.toDate()).toLocaleTimeString() : "Just now"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => req.id && updateRequestStatus(req.id, "completed")}
                className="p-2.5 rounded-full bg-olive/15 text-olive hover:bg-olive/25 transition-colors"
                title="Mark Completed"
              >
                <Check className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Completed requests */}
      {completed.length > 0 && (
        <div className="mt-4">
          <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">Completed Requests</h4>
          <div className="grid gap-2 opacity-60">
            {completed.slice(0, 10).map((req) => (
              <div key={req.id} className="flex items-center justify-between p-3 bg-card/40 border border-border rounded-xl">
                <span className="text-xs font-semibold">
                  Table {req.tableId} — {getRequestLabel(req.requestType)}
                </span>
                <button
                  onClick={() => req.id && deleteRequest(req.id)}
                  className="text-muted-foreground hover:text-destructive p-1"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// 2. Menu Management Panel
function MenuPanel() {
  const { categories, items, addMenuItem, updateMenuItem, deleteMenuItem } = useMenu();
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isAddMode, setIsAddMode] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState("");
  const [img, setImg] = useState("");
  const [category, setCategory] = useState("");
  const [popular, setPopular] = useState(false);
  const [chef, setChef] = useState(false);
  const [available, setAvailable] = useState(true);

  const startEdit = (item: any) => {
    setEditingItem(item);
    setName(item.name);
    setDesc(item.desc);
    setPrice(item.price.toString());
    setImg(item.img);
    setCategory(item.category);
    setPopular(!!item.popular);
    setChef(!!item.chef);
    setAvailable(item.available !== false);
    setIsAddMode(false);
  };

  const startAdd = () => {
    setIsAddMode(true);
    setEditingItem(null);
    setName("");
    setDesc("");
    setPrice("");
    setImg("");
    setCategory(categories[0]?.id || "coffee");
    setPopular(false);
    setChef(false);
    setAvailable(true);
  };

  const cancelForm = () => {
    setIsAddMode(false);
    setEditingItem(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const itemData = {
      name,
      desc,
      price: parseFloat(price) || 0,
      img: img || "coffee",
      category,
      popular,
      chef,
      available,
    };

    try {
      if (isAddMode) {
        await addMenuItem(itemData);
        toast.success("Menu item added");
      } else if (editingItem?.id) {
        await updateMenuItem(editingItem.id, itemData);
        toast.success("Menu item updated");
      }
      cancelForm();
    } catch (err) {
      toast.error("Operation failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this menu item?")) {
      try {
        await deleteMenuItem(id);
        toast.success("Item deleted");
      } catch (err) {
        toast.error("Failed to delete");
      }
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h3 className="font-display text-xl font-semibold">Menu Management</h3>
        {!isAddMode && !editingItem && (
          <Button onClick={startAdd} className="bg-accent text-wood rounded-full flex items-center gap-1.5 h-10 px-4">
            <Plus className="h-4 w-4" /> Add Item
          </Button>
        )}
      </div>

      {(isAddMode || editingItem) && (
        <Card className="p-5 bg-card border border-border rounded-3xl">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-semibold">{isAddMode ? "Add New Menu Item" : "Edit Menu Item"}</h4>
            <button onClick={cancelForm} className="p-1 text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
          </div>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Name</label>
                <Input value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Price (TND)</label>
                <Input type="number" step="0.5" value={price} onChange={e => setPrice(e.target.value)} required />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Description</label>
              <Textarea value={desc} onChange={e => setDesc(e.target.value)} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Category</label>
                <select 
                  value={category} 
                  onChange={e => setCategory(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.emoji} {c.name.en}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Image Key or URL</label>
                <Input value={img} onChange={e => setImg(e.target.value)} placeholder="e.g. coffee, burger or storage URL" />
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mt-2">
              <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                <input type="checkbox" checked={popular} onChange={e => setPopular(e.target.checked)} className="rounded text-accent" />
                Popular item (Badge)
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                <input type="checkbox" checked={chef} onChange={e => setChef(e.target.checked)} className="rounded text-accent" />
                Chef Special (Badge)
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                <input type="checkbox" checked={available} onChange={e => setAvailable(e.target.checked)} className="rounded text-accent" />
                Available in stock
              </label>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <Button type="button" onClick={cancelForm} variant="outline" className="rounded-full">Cancel</Button>
              <Button type="submit" className="bg-accent text-wood rounded-full">Save Changes</Button>
            </div>
          </form>
        </Card>
      )}

      {/* ITEMS LIST */}
      <div className="grid gap-3">
        {items.map((item) => (
          <div key={item.id} className="flex gap-4 p-3 bg-card border border-border rounded-2xl items-center">
            <img src={resolveImage(item.img)} alt={item.name} className="h-14 w-14 rounded-xl object-cover shrink-0" />
            <div className="flex-1 min-w-0">
              <h4 className="font-display font-semibold truncate flex items-center gap-1.5">
                {item.name}
                {!item.available && <span className="text-[9px] uppercase bg-destructive/15 text-destructive border border-destructive/20 px-1.5 py-0.5 rounded">Out</span>}
              </h4>
              <p className="text-xs text-muted-foreground truncate">{item.desc}</p>
              <span className="text-xs text-accent font-semibold">{item.price} TND</span>
            </div>
            <div className="flex gap-1">
              <button onClick={() => startEdit(item)} className="p-2 hover:bg-secondary rounded-full" title="Edit"><Edit3 className="h-4 w-4" /></button>
              <button onClick={() => item.id && handleDelete(item.id)} className="p-2 hover:bg-destructive/10 text-destructive rounded-full" title="Delete"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 3. Events Panel
function EventsPanel() {
  const { events, addEvent, updateEvent, deleteEvent } = useEvents();
  const [editMode, setEditMode] = useState<any>(null);
  const [isAdd, setIsAdd] = useState(false);

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [date, setDate] = useState("");
  const [icon, setIcon] = useState("Music");

  const startEdit = (ev: any) => {
    setEditMode(ev);
    setTitle(ev.title);
    setDesc(ev.desc);
    setDate(ev.date);
    setIcon(ev.icon || "Music");
    setIsAdd(false);
  };

  const startAdd = () => {
    setIsAdd(true);
    setEditMode(null);
    setTitle("");
    setDesc("");
    setDate("");
    setIcon("Music");
  };

  const cancel = () => {
    setIsAdd(false);
    setEditMode(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = { title, desc, date, icon, key: title.toLowerCase().replace(/\s+/g, "-") };
    try {
      if (isAdd) {
        await addEvent(data);
        toast.success("Event created");
      } else if (editMode?.id) {
        await updateEvent(editMode.id, data);
        toast.success("Event updated");
      }
      cancel();
    } catch {
      toast.error("Operation failed");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h3 className="font-display text-xl font-semibold">Events Schedule</h3>
        {!isAdd && !editMode && (
          <Button onClick={startAdd} className="bg-accent text-wood rounded-full flex items-center gap-1.5 h-10 px-4">
            <Plus className="h-4 w-4" /> Add Event
          </Button>
        )}
      </div>

      {(isAdd || editMode) && (
        <Card className="p-5 bg-card border border-border rounded-3xl">
          <h4 className="font-semibold mb-4">{isAdd ? "Add Event" : "Edit Event"}</h4>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Title</label>
              <Input value={title} onChange={e => setTitle(e.target.value)} required />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Description</label>
              <Textarea value={desc} onChange={e => setDesc(e.target.value)} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Date / Recurrence</label>
                <Input value={date} onChange={e => setDate(e.target.value)} placeholder="e.g. Every Friday, March 24" required />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Icon</label>
                <select value={icon} onChange={e => setIcon(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="Music">🎵 Music</option>
                  <option value="Trophy">🏆 Trophy/Match</option>
                  <option value="Moon">🌙 Moon/Ramadan</option>
                  <option value="Heart">❤️ Heart/Valentine</option>
                  <option value="Sparkles">✨ Sparkles/Chef</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <Button type="button" onClick={cancel} variant="outline" className="rounded-full">Cancel</Button>
              <Button type="submit" className="bg-accent text-wood rounded-full">Save</Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid gap-3">
        {events.map((ev) => (
          <div key={ev.id || ev.key} className="p-4 bg-card border border-border rounded-2xl flex justify-between items-center">
            <div>
              <span className="text-[10px] uppercase font-bold text-accent">{ev.date}</span>
              <h4 className="font-display font-semibold text-base mt-1">{ev.title}</h4>
              <p className="text-xs text-muted-foreground mt-1">{ev.desc}</p>
            </div>
            <div className="flex gap-1">
              <button onClick={() => startEdit(ev)} className="p-2 hover:bg-secondary rounded-full"><Edit3 className="h-4 w-4" /></button>
              <button onClick={() => ev.id && deleteEvent(ev.id)} className="p-2 hover:bg-destructive/10 text-destructive rounded-full"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 4. Gallery Panel
function GalleryPanel() {
  const { photos, uploadPhoto, deletePhoto } = useGallery();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [caption, setCaption] = useState("");
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const isCloudinaryConfigured = cloudName && cloudName !== "your_cloud_name";

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isCloudinaryConfigured) {
      toast.error("Cloudinary not configured", {
        description: "Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in your .env file.",
      });
      return;
    }

    setUploading(true);
    setUploadProgress("Uploading to Cloudinary…");
    try {
      const key = caption || file.name.replace(/\.[^.]+$/, "");
      await uploadPhoto(file, key);
      toast.success("Photo uploaded successfully 🌿");
      setCaption("");
      // Reset file input
      e.target.value = "";
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
      setUploadProgress("");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <h3 className="font-display text-xl font-semibold">Photo Gallery</h3>

      {/* Cloudinary Setup Banner */}
      {!isCloudinaryConfigured && (
        <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm">
          <p className="font-semibold text-amber-700 dark:text-amber-400 mb-2">⚙️ Cloudinary Setup Required</p>
          <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
            <li>Create a free account at <a href="https://cloudinary.com" target="_blank" rel="noreferrer" className="text-accent underline">cloudinary.com</a></li>
            <li>Go to <strong>Settings → Upload → Upload presets</strong></li>
            <li>Create an <strong>Unsigned</strong> preset named <code className="bg-muted px-1 rounded">le_patio_unsigned</code></li>
            <li>Copy your <strong>Cloud Name</strong> from the dashboard</li>
            <li>Add to <code className="bg-muted px-1 rounded">.env</code>:<br />
              <code className="bg-muted px-1 rounded text-[10px]">VITE_CLOUDINARY_CLOUD_NAME=your_name</code>
            </li>
          </ol>
        </div>
      )}

      <Card className="p-5 bg-card border border-border rounded-3xl">
        <h4 className="font-semibold mb-3">Upload New Photo</h4>
        <div className="flex flex-col gap-3">
          <Input
            value={caption}
            onChange={e => setCaption(e.target.value)}
            placeholder="Photo caption (e.g. Garden Terrace at sunset)"
          />
          <label className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8 cursor-pointer transition-colors ${
            uploading
              ? "border-accent/50 bg-accent/5 cursor-wait"
              : "border-border hover:border-accent/50 hover:bg-card/60"
          }`}>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={uploading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-wait"
            />
            {uploading ? (
              <>
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent mb-3" />
                <p className="text-sm text-muted-foreground">{uploadProgress}</p>
              </>
            ) : (
              <>
                <ImageIcon className="h-8 w-8 text-muted-foreground mb-3" />
                <p className="text-sm font-medium">Click to select a photo</p>
                <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WebP — max 10MB</p>
              </>
            )}
          </label>
        </div>
      </Card>

      {/* Photo grid */}
      {photos.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground py-8">No photos yet. Upload your first one above.</p>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {photos.map((p) => (
            <div key={p.id} className="relative aspect-square rounded-2xl overflow-hidden group border border-border bg-card">
              <img
                src={resolveImage(p.src)}
                alt={p.key}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-wood/40 opacity-0 group-hover:opacity-100 transition-opacity" />
              <button
                onClick={() => p.id && deletePhoto(p.id)}
                className="absolute top-2 right-2 p-1.5 bg-destructive text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow"
                title="Remove from gallery"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
              {p.key && (
                <span className="absolute bottom-2 left-2 right-2 text-[9px] text-white font-medium truncate opacity-0 group-hover:opacity-100 transition-opacity">
                  {p.key}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// 5. Reviews moderation
function ReviewsPanel() {
  const { reviews, approveReview, deleteReview } = useReviews(false);

  const pending = reviews.filter(r => !r.approved);
  const approved = reviews.filter(r => r.approved);

  return (
    <div className="flex flex-col gap-6">
      <h3 className="font-display text-xl font-semibold">Customer Reviews Moderation</h3>

      <div className="flex flex-col gap-4">
        <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Pending Approval ({pending.length})</h4>
        {pending.map((rev) => (
          <div key={rev.id} className="p-4 bg-card border border-accent/20 rounded-2xl">
            <div className="flex justify-between items-start">
              <div>
                <h5 className="font-semibold text-sm">{rev.name}</h5>
                <span className="text-[10px] text-muted-foreground">Rating: {rev.scores?.food || 5} Stars</span>
              </div>
              <div className="flex gap-1">
                <button onClick={() => rev.id && approveReview(rev.id)} className="p-2 bg-olive/15 text-olive rounded-full" title="Approve"><Check className="h-4 w-4" /></button>
                <button onClick={() => rev.id && deleteReview(rev.id)} className="p-2 bg-destructive/15 text-destructive rounded-full" title="Delete"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
            <p className="text-xs mt-2 italic text-foreground">“{rev.quote}”</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 mt-4">
        <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Approved Reviews</h4>
        {approved.map((rev) => (
          <div key={rev.id} className="p-3 bg-card/40 border border-border rounded-xl flex justify-between items-center">
            <div className="min-w-0 flex-1">
              <h5 className="font-semibold text-xs truncate">{rev.name}</h5>
              <p className="text-[11px] text-muted-foreground truncate italic">“{rev.quote}”</p>
            </div>
            <button onClick={() => rev.id && deleteReview(rev.id)} className="text-muted-foreground hover:text-destructive p-1.5"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

// 6. Settings Panel
function SettingsPanel() {
  const { settings, updateSettings } = useContactSettings();
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [open, setOpen] = useState("");
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [whatsapp, setWhatsapp] = useState("");

  useEffect(() => {
    if (settings) {
      setPhone(settings.phone);
      setAddress(settings.addressValue);
      setOpen(settings.openValue);
      setInstagram(settings.instagram);
      setFacebook(settings.facebook);
      setWhatsapp(settings.whatsapp);
    }
  }, [settings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSettings({
        phone,
        addressValue: address,
        openValue: open,
        instagram,
        facebook,
        whatsapp,
      });
      toast.success("Contact settings updated successfully");
    } catch {
      toast.error("Failed to update settings");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <h3 className="font-display text-xl font-semibold">Contact & Business Settings</h3>
      <Card className="p-5 bg-card border border-border rounded-3xl">
        <form onSubmit={handleSave} className="grid gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Phone Number</label>
            <Input value={phone} onChange={e => setPhone(e.target.value)} required />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Address</label>
            <Input value={address} onChange={e => setAddress(e.target.value)} required />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Opening Hours</label>
            <Input value={open} onChange={e => setOpen(e.target.value)} required />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Instagram Link</label>
              <Input value={instagram} onChange={e => setInstagram(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Facebook Link</label>
              <Input value={facebook} onChange={e => setFacebook(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground">WhatsApp API Link</label>
              <Input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} />
            </div>
          </div>
          <Button type="submit" className="bg-accent text-wood rounded-full mt-4 h-12 font-semibold">
            Save Settings
          </Button>
        </form>
      </Card>
    </div>
  );
}

function PanelLoading() {
  return (
    <div className="flex justify-center items-center py-12">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
    </div>
  );
}
