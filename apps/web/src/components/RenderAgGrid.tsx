import React, { useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import type {
  ColDef,
  RowSelectedEvent,
  ValueFormatterParams,
  CellClassParams,
} from "ag-grid-community";
import type { Customer } from "../hooks/useCustomers";

// 🛠️ Core modular injection structure for AG Grid v36+ (Fixes TextFilter and CellStyle missing errors)
import {
  ModuleRegistry,
  ClientSideRowModelModule,
  RowSelectionModule,
  ValidationModule,
  PaginationModule,
  TextFilterModule, // 🛠️ Added for colDef.filter support
  CellStyleModule, // 🛠️ Added for colDef.cellStyle support
} from "ag-grid-community";
import { themeQuartz, colorSchemeDark } from "ag-grid-community";

// Registers all essential modular engines to handle cell filtering and runtime style paints
ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  RowSelectionModule,
  ValidationModule,
  PaginationModule,
  TextFilterModule, // 🛠️ Registered to clear Filter Module Error
  CellStyleModule, // 🛠️ Registered to clear CellStyle Module Error
]);

interface RenderAgGridProps {
  rowData: Customer[];
  onCustomerSelect: (customer: Customer) => void;
}

export const RenderAgGrid: React.FC<RenderAgGridProps> = ({
  rowData,
  onCustomerSelect,
}) => {
  const columnDefs = useMemo<ColDef<Customer>[]>(
    () => [
      {
        headerName: "Customer Name",
        field: "name",
        flex: 1,
        sortable: true,
        filter: true,
      },
      {
        headerName: "Mobile Number",
        field: "phone",
        flex: 1,
        filter: true,
      },
      {
        headerName: "Net Balance (INR)",
        field: "currentBalance",
        flex: 1,
        sortable: true,
        valueFormatter: (p: ValueFormatterParams<Customer, number>) => {
          const numericVal =
            p.value !== undefined && p.value !== null ? Number(p.value) : 0;
          return `₹ ${numericVal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        },
        cellStyle: (p: CellClassParams<Customer, number>) => {
          const val =
            p.value !== undefined && p.value !== null ? Number(p.value) : 0;
          if (val > 0) return { color: "#10B981", fontWeight: "bold" }; // Emerald Green for incoming cash flow (+)
          if (val < 0) return { color: "#EF4444", fontWeight: "bold" }; // Crimson Red for outgoing cash flow (-)
          return { color: "#94A3B8", fontWeight: "normal" };
        },
      },
    ],
    [],
  );

  const handleRowSelected = (e: RowSelectedEvent<Customer>) => {
    if (e.node.isSelected() && e.data) {
      onCustomerSelect(e.data);
    }
  };

  // Combines themeQuartz with native colorSchemeDark elements cleanly
  const dynamicDarkTheme = useMemo(() => {
    return themeQuartz.withPart(colorSchemeDark);
  }, []);

  return (
    <div
      style={{
        width: "100%",
        height: "450px",
        borderRadius: "12px",
        overflow: "hidden",
        border: "1px solid #1E293B",
      }}
    >
      <AgGridReact<Customer>
        theme={dynamicDarkTheme}
        rowData={rowData}
        columnDefs={columnDefs}
        rowSelection={{
          mode: "singleRow",
          checkboxes: false,
          enableClickSelection: true,
        }}
        onRowSelected={handleRowSelected}
        animateRows={true}
        pagination={true}
        paginationPageSize={10}
        paginationPageSizeSelector={false}
      />
    </div>
  );
};
