import React, { createContext, useContext, useEffect, useState } from "react";
import { useActiveSessions } from "./useActiveSessions";

interface TableContextType {
  tableId: string;
}

const TableContext = createContext<TableContextType | undefined>(undefined);

export function TableProvider({ children }: { children: React.ReactNode }) {
  const [tableId, setTableId] = useState<string>("0");
  const { registerHeartbeat } = useActiveSessions(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    // 1. Check URL parameters
    const params = new URLSearchParams(window.location.search);
    const urlTable = params.get("table");
    
    if (urlTable) {
      // URL param takes priority — save it and use it
      setTableId(urlTable);
      localStorage.setItem("le_patio_table_id", urlTable);
    } else {
      // 2. No URL param — check localStorage, otherwise default to "0"
      const savedTable = localStorage.getItem("le_patio_table_id");
      setTableId(savedTable ?? "0");
    }
  }, []);

  // Send periodic heartbeat every 15 seconds when a real tableId is available
  useEffect(() => {
    // "0" is the default/unknown table — don't register a session for it
    if (!tableId || tableId === "0") return;

    // Send immediately
    registerHeartbeat(tableId);

    const interval = setInterval(() => {
      registerHeartbeat(tableId);
    }, 15000);

    return () => clearInterval(interval);
  }, [tableId]);

  return (
    <TableContext.Provider value={{ tableId }}>
      {children}
    </TableContext.Provider>
  );
}

export function useTable() {
  const context = useContext(TableContext);
  if (context === undefined) {
    throw new Error("useTable must be used within a TableProvider");
  }
  return context;
}
