import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type WidgetType = 'price-card' | 'chart' | 'table';

export interface WidgetData {
  title: string;
  apiEndpoint: string;
  refreshInterval: number;
  selectedFields?: string[];
  displayMode: WidgetType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cachedData?: any;
  lastUpdated?: number;
}

export interface Widget {
  id: string;
  data: WidgetData;
  layout: {
    w: number;
    h: number;
    x: number;
    y: number;
  };
}

interface DashboardState {
  widgets: Widget[];
  isEditMode: boolean;
  toggleEditMode: () => void;
  addWidget: (widget: Widget) => void;
  removeWidget: (id: string) => void;
  updateWidget: (id: string, updates: Partial<Widget>) => void;
  updateWidgetData: (id: string, data: Partial<WidgetData>) => void;
  reorderWidgets: (widgets: Widget[]) => void;
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      widgets: [],
      isEditMode: false,
      toggleEditMode: () => set((state) => ({ isEditMode: !state.isEditMode })),
      addWidget: (widget) =>
        set((state) => ({ widgets: [...state.widgets, widget] })),
      removeWidget: (id) =>
        set((state) => ({ widgets: state.widgets.filter((w) => w.id !== id) })),
      updateWidget: (id, updates) =>
        set((state) => ({
          widgets: state.widgets.map((w) =>
            w.id === id ? { ...w, ...updates } : w
          ),
        })),
      updateWidgetData: (id, data) =>
        set((state) => ({
          widgets: state.widgets.map((w) =>
            w.id === id ? { ...w, data: { ...w.data, ...data } } : w
          ),
        })),
      reorderWidgets: (newWidgets) => set({ widgets: newWidgets }),
    }),
    {
      name: 'finboard-storage',
    }
  )
);
