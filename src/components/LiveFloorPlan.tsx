import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, Bell, Edit2, Check, Trash2, RotateCcw, Plus, Activity, CheckCircle2, UserPlus, UserMinus, Calendar } from "lucide-react";
import planImage from "@/assets/plan.png";
import { useActiveSessions } from "@/hooks/useActiveSessions";
import { useServiceRequests } from "@/hooks/useServiceRequests";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { doc, setDoc, onSnapshot, collection, query, where, getDocs, writeBatch, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";

interface TableLayout {
  id: string;
  points: string;
  cx: number;
  cy: number;
}

// Fallback coordinate mappings for instant visibility
const DEFAULT_TABLES: TableLayout[] = [
  { id: "1", points: "94,32 128,32 168,33 186,35 196,38 198,39 200,41 200,42 199,46 196,49 186,52 174,53 124,53 109,52 102,48 94,38", cx: 147, cy: 43 },
  { id: "3", points: "310,32 330,32 334,46 334,47 329,49 319,48 310,47 296,35 298,34", cx: 318, cy: 39 },
  { id: "4", points: "530,55 534,55 536,56 536,72 533,75 532,75 518,74 516,70 516,66 518,63 522,59 525,57 527,56", cx: 527, cy: 65 },
  { id: "5", points: "539,56 545,56 555,61 560,66 561,70 561,72 545,78 540,75 538,72 538,66", cx: 548, cy: 66 },
  { id: "6", points: "641,51 644,51 645,52 646,56 646,68 645,71 644,72 638,72 634,70 632,68 630,65 629,63 631,57 632,55 635,53 637,52", cx: 639, cy: 62 },
  { id: "7", points: "651,50 655,50 658,51 660,52 662,54 663,56 663,63 662,67 659,69 656,70 649,72 648,71 648,52 649,51", cx: 655, cy: 60 },
  { id: "8", points: "761,51 768,51 768,72 766,72 759,69 754,64 753,59 756,53", cx: 762, cy: 61 },
  { id: "9", points: "771,50 783,50 785,51 788,54 789,56 789,62 788,67 786,69 782,71 771,71", cx: 779, cy: 60 },
  { id: "10", points: "889,50 900,50 900,72 890,72 885,70 882,67 881,63 881,60 882,56 883,54 886,51", cx: 892, cy: 61 },
  { id: "11", points: "903,50 915,50 918,52 920,54 920,63 918,67 916,70 912,72 904,72 903,71", cx: 911, cy: 61 },
  { id: "12", points: "1014,50 1018,50 1020,52 1020,72 1010,72 1007,69 1006,66 1006,56 1008,53 1009,52 1011,51", cx: 1014, cy: 61 },
  { id: "13", points: "1024,50 1036,50 1040,51 1043,54 1044,57 1044,58 1043,64 1040,69 1034,72 1023,72 1023,51", cx: 1032, cy: 61 },
  { id: "14", points: "1438,66 1439,66 1531,101 1534,103 1537,106 1536,111 1535,114 1527,127 1519,134 1451,134 1440,133 1439,131 1438,75", cx: 1499, cy: 120 },
  { id: "15", points: "1540,66 1549,69 1553,89 1553,90 1548,93 1506,100 1505,100 1500,94 1500,86 1502,84", cx: 1527, cy: 85 },
  { id: "16", points: "1557,90 1558,90 1595,98 1597,101 1599,105 1600,110 1601,120 1601,121 1597,133 1580,134 1528,134 1526,133 1538,92", cx: 1566, cy: 116 },
  { id: "17", points: "1585,77 1597,78 1596,84 1593,90 1592,91 1584,98 1577,101 1575,101 1572,98 1571,96 1571,90 1580,79 1581,78", cx: 1583, cy: 88 },
  { id: "18", points: "138,204 148,204 149,205 150,207 150,212 148,214 129,214 129,210 131,206 132,205", cx: 140, cy: 209 },
  { id: "19", points: "579,135 583,135 596,137 600,138 604,142 604,143 585,174 579,181 563,187 560,188 535,189 527,188 524,187 512,181 502,166 504,160", cx: 554, cy: 164 },
  { id: "20", points: "449,229 450,229 456,231 456,287 455,288 446,288 445,283 445,248 448,230", cx: 451, cy: 261 },
  { id: "22", points: "23,332 44,334 48,335 51,336 57,342 57,350 56,356 54,367 46,380 42,382 41,382 35,379 31,374 30,372 22,349 22,335", cx: 41, cy: 355 },
  { id: "23", points: "1411,315 1427,320 1437,324 1437,326 1417,344 1416,344 1412,342 1411,340 1410,337 1408,325 1408,316", cx: 1418, cy: 329 },
  { id: "24", points: "1446,360 1453,360 1455,363 1455,384 1451,385 1449,384 1435,376 1433,374 1433,368 1434,363 1436,362", cx: 1445, cy: 370 },
  { id: "25", points: "451,430 455,430 456,436 456,456 455,460 446,460 445,459 445,442 448,433", cx: 451, cy: 445 },
  { id: "26", points: "1490,381 1495,381 1500,385 1502,387 1502,423 1491,429 1490,429 1489,409 1489,405", cx: 1496, cy: 405 },
  { id: "28", points: "883,444 889,444 891,445 895,448 903,467 900,482 896,489 892,490 882,489 881,488 876,482 874,464 878,450 879,448 881,445", cx: 888, cy: 467 },
  { id: "33", points: "61,888 72,888 76,891 78,893 78,900 74,903 72,904 62,905 56,904 55,901 55,900 56,894 58,891", cx: 66, cy: 896 },
  { id: "34", points: "39,871 123,871 128,877 128,879 98,886 65,886 54,885 41,879 39,878", cx: 82, cy: 877 },
  { id: "35", points: "127,871 182,871 200,872 200,878 184,879 133,879 127,874", cx: 163, cy: 875 },
  { id: "36", points: "363,886 377,886 379,887 380,888 382,896 380,902 378,903 360,903 357,900 356,898 357,894 358,891 360,888 361,887", cx: 369, cy: 895 },
  { id: "37", points: "494,931 513,931 520,933 530,943 482,943 481,942 480,940 480,939", cx: 504, cy: 938 },
  { id: "38", points: "826,913 860,913 860,932 856,942 853,943 829,943 822,941 822,916", cx: 841, cy: 928 },
  { id: "39", points: "915,916 939,916 941,922 942,926 942,927 940,934 935,943 930,943 919,942 913,941 908,930 908,922 909,918", cx: 925, cy: 928 },
  { id: "40", points: "1619,906 1644,912 1647,935 1647,936 1645,940 1643,941 1638,943 1599,943 1587,930 1585,926 1585,924 1597,911 1599,909", cx: 1618, cy: 929 }
];

export function LiveFloorPlan() {
  const { activeTables, sessionDetails } = useActiveSessions(true);
  const { requests, updateRequestStatus } = useServiceRequests(true);
  
  // Initialize with fallback coordinates
  const [tables, setTables] = useState<TableLayout[]>(DEFAULT_TABLES);
  const [loadingLayout, setLoadingLayout] = useState(true);

  // Selected table for popup
  const [selectedTable, setSelectedTable] = useState<TableLayout | null>(null);

  const [isEditMode, setIsEditMode] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<{ x: number; y: number }[]>([]);
  const [newTableId, setNewTableId] = useState("");
  const [isFullscreenMobile, setIsFullscreenMobile] = useState(false);
  const [isNativeFullscreen, setIsNativeFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Enter/exit standard fullscreen helpers with fallback
  const enterFullscreen = async () => {
    try {
      const el = document.documentElement; // Request fullscreen on the document root
      if (el.requestFullscreen) {
        await el.requestFullscreen();
      } else if ((el as any).webkitRequestFullscreen) {
        await (el as any).webkitRequestFullscreen();
      } else if ((el as any).msRequestFullscreen) {
        await (el as any).msRequestFullscreen();
      } else {
        // Fallback for iOS Safari (iPhone) where Fullscreen API on elements is not supported
        setIsNativeFullscreen(true);
      }
    } catch (err) {
      console.error("Error requesting native fullscreen:", err);
      // Fallback on security block or other errors
      setIsNativeFullscreen(true);
    }
  };

  const exitFullscreen = async () => {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        await (document as any).webkitExitFullscreen();
      } else if ((document as any).msExitFullscreen) {
        await (document as any).msExitFullscreen();
      } else {
        setIsNativeFullscreen(false);
      }
    } catch (err) {
      console.error("Error exiting native fullscreen:", err);
      setIsNativeFullscreen(false);
    }
  };

  // Detect mobile landscape mode and listen to standard fullscreen change
  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkOrientation = () => {
      const isMobile = window.innerWidth < 1024;
      const isLandscape = window.innerWidth > window.innerHeight;
      setIsFullscreenMobile(isMobile && isLandscape);

      // Auto exit fullscreen if phone is rotated back to portrait
      const isPortrait = isMobile && window.innerHeight > window.innerWidth;
      if (isPortrait) {
        exitFullscreen();
      }
    };

    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = 
        !!document.fullscreenElement || 
        !!(document as any).webkitFullscreenElement || 
        !!(document as any).msFullscreenElement;
      
      // Only update state via listener if standard Fullscreen API is active
      if (
        document.fullscreenEnabled || 
        (document as any).webkitFullscreenEnabled || 
        (document as any).msFullscreenEnabled
      ) {
        setIsNativeFullscreen(isCurrentlyFullscreen);
      }
    };

    checkOrientation();
    window.addEventListener("resize", checkOrientation);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);

    return () => {
      window.removeEventListener("resize", checkOrientation);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Load layout from Firestore dynamically
  useEffect(() => {
    const docRef = doc(db, "settings", "table_map");
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists() && docSnap.data().tables?.length > 0) {
        setTables(docSnap.data().tables);
      } else {
        // Seeding fallback to Firestore if database is empty so it's persistent
        setTables(DEFAULT_TABLES);
      }
      setLoadingLayout(false);
    });
    return () => unsubscribe();
  }, []);

  // Handle click on image/SVG to draw points in Edit Mode
  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isEditMode) return;

    // Get click coordinates relative to SVG viewBox (1665 x 944)
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 1665);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 944);

    setCurrentPoints([...currentPoints, { x, y }]);
  };

  // Add the currently drawn table to local list
  const handleAddTable = () => {
    if (!newTableId.trim()) {
      toast.error("Please enter a Table ID");
      return;
    }
    if (currentPoints.length < 3) {
      toast.error("Please click at least 3 points to define the table surface");
      return;
    }

    // Calculate center of polygon for label placement
    let sumX = 0, sumY = 0;
    currentPoints.forEach((pt) => {
      sumX += pt.x;
      sumY += pt.y;
    });
    const cx = Math.round(sumX / currentPoints.length);
    const cy = Math.round(sumY / currentPoints.length);

    const pointsStr = currentPoints.map((pt) => `${pt.x},${pt.y}`).join(" ");

    const updatedTables = [
      ...tables.filter((t) => t.id !== newTableId), // Remove existing if ID matches
      { id: newTableId, points: pointsStr, cx, cy }
    ];

    setTables(updatedTables);
    setCurrentPoints([]);
    setNewTableId("");
    toast.success(`Table ${newTableId} outline added to list`);
  };

  // Delete a table layout
  const handleDeleteTable = (id: string) => {
    setTables(tables.filter((t) => t.id !== id));
    toast.success(`Removed Table ${id}`);
  };

  // Save the entire layout to Firestore
  const handleSaveLayoutToDb = async () => {
    try {
      await setDoc(doc(db, "settings", "table_map"), { tables });
      toast.success("Table map saved successfully to Firestore! 🌿");
      setIsEditMode(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save layout to database");
    }
  };

  // Manually mark a table as Occupied — uses serverTimestamp and keeps the session alive
  const manualSessionIntervals = useRef<Record<string, ReturnType<typeof setInterval>>>({});

  const handleManualOccupy = async (tableId: string) => {
    try {
      const sessionId = `manual_${tableId}`;
      const docRef = doc(db, "active_sessions", sessionId);

      // Write session with serverTimestamp so freshness check (45s) works
      await setDoc(docRef, {
        tableId,
        lastActive: serverTimestamp(),
        createdAt: serverTimestamp(),
        manual: true,
      });

      // Keep the manual session alive by refreshing every 20 seconds
      if (manualSessionIntervals.current[tableId]) {
        clearInterval(manualSessionIntervals.current[tableId]);
      }
      manualSessionIntervals.current[tableId] = setInterval(async () => {
        try {
          await setDoc(docRef, {
            tableId,
            lastActive: serverTimestamp(),
            manual: true,
          }, { merge: true });
        } catch (_) { /* silent */ }
      }, 20000);

      toast.success(`Table ${tableId} marked as Occupied ✅`);
      setSelectedTable(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update table status");
    }
  };

  // Manually release/free a table (deletes all sessions associated with it)
  const handleManualRelease = async (tableId: string) => {
    try {
      // Stop the keep-alive interval if running
      if (manualSessionIntervals.current[tableId]) {
        clearInterval(manualSessionIntervals.current[tableId]);
        delete manualSessionIntervals.current[tableId];
      }

      const q = query(collection(db, "active_sessions"), where("tableId", "==", tableId));
      const querySnapshot = await getDocs(q);
      const batch = writeBatch(db);
      querySnapshot.forEach((docSnap) => {
        batch.delete(docSnap.ref);
      });
      await batch.commit();
      toast.success(`Table ${tableId} is now Free 🍃`);
      setSelectedTable(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to release table");
    }
  };

  // Map service request type to human readable label
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

  // Get active/pending requests for a table
  const getActiveRequests = (tableId: string) => {
    return requests.filter((r) => r.tableId === tableId && r.status === "pending");
  };

  // Get completed requests for a table (historic)
  const getCompletedRequests = (tableId: string) => {
    return requests.filter((r) => r.tableId === tableId && r.status === "completed");
  };

  return (
    <div 
      ref={containerRef}
      className={`select-none ${
        isNativeFullscreen 
          ? "fixed inset-0 z-[100] bg-slate-950 w-screen h-screen p-0 m-0 overflow-hidden flex items-center justify-center" 
          : "flex flex-col gap-6"
      }`}
    >
      {/* Fullscreen request overlay on mobile landscape */}
      {isFullscreenMobile && !isNativeFullscreen && (
        <div className="fixed inset-0 z-[120] flex flex-col items-center justify-center bg-slate-950/95 p-6 text-center select-none backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-xs p-6 bg-card border border-border/80 rounded-[2rem] shadow-elegant flex flex-col items-center gap-4"
          >
            <div className="h-12 w-12 rounded-2xl bg-accent/20 flex items-center justify-center text-accent">
              <Activity className="h-6 w-6" />
            </div>
            <h3 className="font-display text-lg font-bold text-foreground">
              Fullscreen Mode
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Tap below to view the live floor plan in full screen, hiding your browser controls for the best experience.
            </p>
            <Button
              onClick={enterFullscreen}
              className="w-full bg-accent hover:bg-accent/80 text-wood font-semibold h-11 rounded-full text-xs shadow-gold"
            >
              Enter Fullscreen 📺
            </Button>
          </motion.div>
        </div>
      )}

      {/* Compact floating legend for mobile landscape fullscreen */}
      {isNativeFullscreen && (
        <div className="absolute top-3 left-3 z-[110] flex items-center gap-3 bg-slate-950/80 border border-border/40 px-3.5 py-1.5 rounded-full backdrop-blur-md select-none">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-[9px] font-bold text-white uppercase tracking-wider">Live Floor Plan</span>
          </div>
          <span className="text-[9px] text-slate-600">|</span>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full border border-border bg-transparent" />
            <span className="text-[9px] text-slate-300">Free</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/50 border border-emerald-500/90" />
            <span className="text-[9px] text-slate-300">Occupied</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500/60 border border-rose-500/90 animate-pulse" />
            <span className="text-[9px] text-slate-300">Request</span>
          </div>
          <span className="text-[9px] text-slate-600">|</span>
          <span className="text-[8px] text-slate-400">Rotate phone or tap exit to quit fullscreen</span>
          <button 
            onClick={exitFullscreen} 
            className="ml-2 text-[9px] font-bold text-rose-400 hover:text-rose-300 bg-rose-950/40 border border-rose-500/20 px-2.5 py-0.5 rounded-full"
          >
            Exit
          </button>
        </div>
      )}

      {/* Normal Header — hidden in mobile landscape fullscreen */}
      {!isNativeFullscreen && (
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-display text-2xl font-bold tracking-tight">Live Restaurant Floor Plan</h3>
            <p className="text-xs text-muted-foreground mt-1">Real-time status control center for Le Patio</p>
          </div>

          {/* Legend / Actions */}
          <div className="flex flex-wrap gap-3 items-center">
            <Button
              onClick={() => {
                setIsEditMode(!isEditMode);
                setCurrentPoints([]);
                setNewTableId("");
              }}
              variant="outline"
              className="rounded-full flex items-center gap-1.5 h-10 text-xs font-semibold"
            >
              <Edit2 className="h-3.5 w-3.5" />
              {isEditMode ? "Exit Editor" : "Edit Table Map"}
            </Button>

            {!isEditMode && (
              <div className="flex gap-4 items-center bg-card/40 border border-border/80 px-4 py-2.5 rounded-full backdrop-blur-md">
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full border border-border bg-transparent" />
                  <span className="text-[11px] font-medium text-muted-foreground">Free</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-3.5 w-3.5 rounded-full bg-emerald-500/50 border border-emerald-500/90" />
                  <span className="text-[11px] font-medium text-emerald-500">Occupied</span>
                </div>
                <div className="flex items-center gap-1.5 animate-pulse">
                  <span className="h-3.5 w-3.5 rounded-full bg-rose-500/60 border border-rose-500/90" />
                  <span className="text-[11px] font-medium text-rose-500">Active Request</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {!isFullscreenMobile && isEditMode && (
        <Card className="p-4 bg-slate-900 border border-accent/20 rounded-3xl grid gap-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span>🛠️ Layout Editor Active</span>
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Click on the plan image to place corners for a table. Minimum 3 points.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="text"
                placeholder="Table ID (e.g. 5)"
                value={newTableId}
                onChange={(e) => setNewTableId(e.target.value)}
                className="w-32 bg-slate-950 border-slate-800 text-xs h-9 rounded-xl"
              />
              <Button
                onClick={handleAddTable}
                disabled={currentPoints.length < 3 || !newTableId}
                className="bg-emerald-600 hover:bg-emerald-700 h-9 rounded-xl text-xs"
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Add Table
              </Button>
              <Button
                onClick={() => setCurrentPoints([])}
                disabled={currentPoints.length === 0}
                variant="outline"
                className="border-slate-800 text-slate-400 hover:text-white h-9 rounded-xl text-xs"
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1" /> Reset Points
              </Button>
            </div>
          </div>

          {tables.length > 0 && (
            <div className="pt-2 border-t border-slate-800">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Defined Tables ({tables.length})</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {tables.map((t) => (
                  <span
                    key={t.id}
                    className="inline-flex items-center gap-1.5 bg-slate-950 border border-slate-800 text-white rounded-full px-3 py-1 text-xs"
                  >
                    Table {t.id}
                    <button
                      onClick={() => handleDeleteTable(t.id)}
                      className="text-slate-400 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="mt-4 flex justify-end">
                <Button onClick={handleSaveLayoutToDb} className="bg-accent text-wood hover:bg-accent/80 font-bold h-10 px-6 rounded-full">
                  <Check className="h-4 w-4 mr-1.5" /> Save Map Layout
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {loadingLayout ? (
        <div className="flex justify-center items-center py-24 bg-slate-950/20 border border-border/40 rounded-[2.5rem]">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
        </div>
      ) : (
        <div className={isNativeFullscreen 
          ? "relative flex items-center justify-center w-full h-full p-2" 
          : "relative w-full overflow-hidden rounded-[2.5rem] border border-border/60 bg-slate-950 shadow-2xl"
        }>
          {(() => {
            const content = (
              <>
                {/* Floor Plan Background Image */}
                <img
                  src={planImage}
                  alt="Le Patio Floor Plan"
                  className={isNativeFullscreen 
                    ? "w-full h-full object-cover opacity-90" 
                    : "w-full h-auto block opacity-90 transition-opacity"
                  }
                />

                {/* Interactive SVG Layer */}
                <svg
                  className={`absolute inset-0 w-full h-full ${isEditMode ? "cursor-crosshair" : "cursor-pointer"}`}
                  viewBox="0 0 1665 944"
                  onClick={handleSvgClick}
                >
                  <defs>
                    <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
                      <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
                      <feColorMatrix in="blur" type="matrix" values="0 0 0 0 0.06  0 0 0 0 0.73  0 0 0 0 0.50  0 0 0 1 0" result="coloredBlur" />
                      <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                    <filter id="glow-request" x="-30%" y="-30%" width="160%" height="160%">
                      <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
                      <feColorMatrix in="blur" type="matrix" values="0 0 0 0 0.94  0 0 0 0 0.27  0 0 0 0 0.27  0 0 0 1 0" result="coloredBlur" />
                      <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                  </defs>

                  {/* Saved Polygons */}
                  {tables.map((table) => {
                    const hasRequest = getActiveRequests(table.id).length > 0;
                    const isOccupied = activeTables.has(table.id);

                    // Solid, fully opaque fills so they are always visible regardless of background
                    let fillColor = "rgba(0,0,0,0)"; // fully transparent for free
                    let strokeColor = isEditMode ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.2)";
                    let strokeWidth = "2";
                    let filter = "";
                    let textFill = isOccupied || hasRequest ? "#ffffff" : "rgba(255,255,255,0.6)";
                    let isAnimated = false;

                    if (hasRequest) {
                      fillColor = "rgba(220, 38, 38, 0.55)"; // vivid red, semi-transparent
                      strokeColor = "#ff0000";
                      strokeWidth = "3.5";
                      filter = "url(#glow-request)";
                      textFill = "#ffffff";
                      isAnimated = true;
                    } else if (isOccupied) {
                      fillColor = "rgba(5, 150, 105, 0.50)"; // vivid emerald, semi-transparent
                      strokeColor = "#00ff99";
                      strokeWidth = "3";
                      filter = "url(#glow)";
                      textFill = "#ffffff";
                    }

                    return (
                      <g
                        key={table.id}
                        onClick={() => !isEditMode && setSelectedTable(table)}
                        style={{ cursor: isEditMode ? "crosshair" : "pointer" }}
                      >
                        {/* Hover hit area (invisible, larger) */}
                        <polygon
                          points={table.points}
                          fill="transparent"
                          stroke="none"
                          strokeWidth="12"
                          className="hover:fill-white/10 transition-all duration-200"
                        />
                        {/* Actual colored polygon */}
                        <polygon
                          points={table.points}
                          fill={fillColor}
                          stroke={strokeColor}
                          strokeWidth={strokeWidth}
                          strokeLinejoin="round"
                          filter={filter}
                          className={isAnimated ? "animate-pulse" : ""}
                          style={{ pointerEvents: "none" }}
                        />
                        {/* Table ID Label */}
                        <text
                          x={table.cx}
                          y={table.cy + 5}
                          textAnchor="middle"
                          fill={textFill}
                          fontSize="14"
                          fontWeight="900"
                          stroke={hasRequest ? "#7f0000" : isOccupied ? "#003d26" : "none"}
                          strokeWidth="3"
                          paintOrder="stroke fill"
                          className="pointer-events-none select-none"
                        >
                          {table.id}
                        </text>
                      </g>
                    );
                  })}

                  {/* Drawing State: Current Polygon */}
                  {isEditMode && currentPoints.length > 0 && (
                    <g>
                      <polygon
                        points={currentPoints.map((pt) => `${pt.x},${pt.y}`).join(" ")}
                        fill="rgba(245, 158, 11, 0.3)"
                        stroke="#f59e0b"
                        strokeWidth="2"
                      />
                      {currentPoints.map((pt, idx) => (
                        <circle key={idx} cx={pt.x} cy={pt.y} r="5" fill="#f59e0b" />
                      ))}
                    </g>
                  )}
                </svg>
              </>
            );

            if (isNativeFullscreen) {
              return (
                <div 
                  className="relative shadow-2xl border border-border/20 rounded-2xl overflow-hidden"
                  style={{
                    width: "calc(min(100vw, 100vh * 1.763) - 16px)",
                    height: "calc(min(100vh, 100vw / 1.763) - 16px)",
                  }}
                >
                  {content}
                </div>
              );
            }

            return content;
          })()}
        </div>
      )}

      {/* Premium Glassmorphic Detail Popup */}
      <AnimatePresence>
        {selectedTable && (() => {
          const activeReqs = getActiveRequests(selectedTable.id);
          const completedReqs = getCompletedRequests(selectedTable.id);
          const isOccupied = activeTables.has(selectedTable.id);
          const status = activeReqs.length > 0 ? "request" : isOccupied ? "occupied" : "free";

          // Compute real arrival time and time spent from session data
          const detail = sessionDetails.get(selectedTable.id);
          let arrivalTime = "N/A";
          let timeSpent = "N/A";
          if (isOccupied && detail) {
            arrivalTime = detail.createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
            const diffMs = Date.now() - detail.createdAt.getTime();
            const diffMins = Math.floor(diffMs / 60000);
            if (diffMins < 60) {
              timeSpent = `${diffMins}m`;
            } else {
              const h = Math.floor(diffMins / 60);
              const m = diffMins % 60;
              timeSpent = m > 0 ? `${h}h ${m}m` : `${h}h`;
            }
          }

          return (
            <motion.div
              initial={isNativeFullscreen ? { opacity: 0, x: 50, y: 0 } : { opacity: 0, y: 30, x: 0 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={isNativeFullscreen ? { opacity: 0, x: 50, y: 0 } : { opacity: 0, y: 30, x: 0 }}
              className={isNativeFullscreen
                ? "fixed top-2 right-2 bottom-2 z-[110] w-[300px] sm:w-[340px] m-0"
                : "fixed inset-x-4 bottom-24 z-50 mx-auto max-w-md md:bottom-28"
              }
            >
              <Card className={`glass relative overflow-hidden rounded-[2rem] border border-border/80 p-5 shadow-elegant backdrop-blur-xl flex flex-col ${
                isNativeFullscreen ? "h-[calc(100vh-16px)] max-h-[calc(100vh-16px)] overflow-y-auto" : ""
              }`}>
                <button
                  onClick={() => setSelectedTable(null)}
                  className="absolute top-4 right-4 p-1.5 rounded-full bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>

                {/* Table ID and Status Tag */}
                <div className="flex items-center justify-between mb-5 pr-6">
                  <div className="flex items-center gap-3.5">
                    <div className={`grid h-12 w-12 place-items-center rounded-2xl font-bold text-base ${
                      status === "request"
                        ? "bg-rose-500/20 text-rose-500 border border-rose-500/30"
                        : status === "occupied"
                        ? "bg-emerald-500/20 text-emerald-500 border border-emerald-500/30"
                        : "bg-muted text-muted-foreground border border-border"
                    }`}>
                      T{selectedTable.id}
                    </div>
                    <div>
                      <h4 className="font-display text-lg font-bold">
                        Table {selectedTable.id}
                      </h4>
                      <span className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold mt-0.5 ${
                        status === "request"
                          ? "text-rose-500 animate-pulse"
                          : status === "occupied"
                          ? "text-emerald-500"
                          : "text-muted-foreground"
                      }`}>
                        ● {status === "request" ? "Active Request" : status === "occupied" ? "Occupied" : "Free"}
                      </span>
                    </div>
                  </div>

                  {/* Manual occupying/releasing action buttons */}
                  {status === "free" ? (
                    <Button
                      onClick={() => handleManualOccupy(selectedTable.id)}
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-semibold h-8"
                    >
                      <UserPlus className="h-3.5 w-3.5 mr-1" /> Mark Occupied
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleManualRelease(selectedTable.id)}
                      size="sm"
                      variant="outline"
                      className="border-rose-500/30 text-rose-500 hover:bg-rose-500/10 hover:text-rose-400 rounded-full text-xs font-semibold h-8"
                    >
                      <UserMinus className="h-3.5 w-3.5 mr-1" /> Checkout Table
                    </Button>
                  )}
                </div>

                {/* Arrival details for occupied table */}
                {isOccupied && (
                  <div className="grid grid-cols-2 gap-4 text-xs mb-4">
                    <div className="flex flex-col gap-1 p-3 bg-background/35 rounded-2xl border border-border/40">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Arrival Time</span>
                      <span className="font-semibold flex items-center gap-1.5 mt-0.5">
                        <Clock className="h-3.5 w-3.5 text-accent" /> {arrivalTime}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1 p-3 bg-background/35 rounded-2xl border border-border/40">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Time Spent</span>
                      <span className="font-semibold flex items-center gap-1.5 mt-0.5">
                        <Activity className="h-3.5 w-3.5 text-accent" /> {timeSpent}
                      </span>
                    </div>
                  </div>
                )}

                {/* Active demands and actions */}
                {activeReqs.length > 0 && (
                  <div className="mt-3 p-4 bg-rose-500/10 border border-rose-500/25 rounded-2xl flex flex-col gap-3">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-rose-500 font-bold block mb-1">
                        Active Requests ({activeReqs.length})
                      </span>
                      {activeReqs.map((req) => (
                        <div key={req.id} className="flex justify-between items-center mt-2 bg-rose-500/5 p-2 rounded-xl border border-rose-500/10">
                          <p className="font-medium text-xs text-foreground flex items-center gap-1.5">
                            <Bell className="h-3.5 w-3.5 text-rose-500 animate-bounce" />
                            {getRequestLabel(req.requestType)}
                          </p>
                          <Button
                            onClick={async () => {
                              if (req.id) {
                                await updateRequestStatus(req.id, "completed");
                                toast.success("Request marked as Completed");
                              }
                            }}
                            size="sm"
                            className="bg-rose-500 hover:bg-rose-600 text-white rounded-full text-[10px] h-7 px-3 font-semibold"
                          >
                            <CheckCircle2 className="h-3 w-3 mr-1" /> Mark Done
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Customer historic requests log (both active session and last client) */}
                <div className="mt-4 pt-4 border-t border-border/40">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {status === "free" ? "Last Client Request Log" : "Current Customer Request Log"}
                  </span>
                  
                  {completedReqs.length === 0 ? (
                    <p className="text-xs text-muted-foreground mt-2 italic">
                      No completed requests registered for this session.
                    </p>
                  ) : (
                    <div className="mt-2 flex flex-col gap-1.5 max-h-[100px] overflow-y-auto pr-1">
                      {completedReqs.slice(0, 5).map((req) => (
                        <div key={req.id} className="flex justify-between items-center text-[11px] bg-background/20 p-2 rounded-xl border border-border/30">
                          <span className="text-foreground/80 font-medium">
                            {getRequestLabel(req.requestType)}
                          </span>
                          <span className="text-[9px] text-muted-foreground">
                            {req.timestamp?.toDate ? new Date(req.timestamp.toDate()).toLocaleTimeString() : "Just now"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
