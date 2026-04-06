import { create } from 'zustand';
import { BilliardTable } from '../types';
import { tableService } from '../services/tableService';

interface TableState {
  tables: BilliardTable[];
  isLoading: boolean;
  fetchTables: () => Promise<void>;
  updateTableStatus: (tableId: number, status: string) => void;
}

export const useTableStore = create<TableState>((set) => ({
  tables: [],
  isLoading: false,
  fetchTables: async () => {
    set({ isLoading: true });
    const tables = await tableService.getTables();
    set({ tables, isLoading: false });
  },
  updateTableStatus: (tableId, status) => set((state) => ({
    tables: state.tables.map((t) => 
      t.id === tableId ? { ...t, status: status as any } : t
    )
  })),
}));
