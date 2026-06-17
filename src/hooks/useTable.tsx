import React, { createContext, useContext, useEffect, useState } from "react";

interface TableContextType {
  tableId: string;
}

const TableContext = createContext<TableContextType | undefined>(undefined);

export function TableProvider({ children }: { children: React.ReactNode }) {
  const [tableId, setTableId] = useState<string>("5");

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    // 1. Check URL parameters
    const params = new URLSearchParams(window.location.search);
    const urlTable = params.get("table");
    
    if (urlTable) {
      setTableId(urlTable);
      localStorage.setItem("le_patio_table_id", urlTable);
    } else {
      // 2. Check localStorage
      const savedTable = localStorage.getItem("le_patio_table_id");
      if (savedTable) {
        setTableId(savedTable);
      }
    }
  }, []);

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
