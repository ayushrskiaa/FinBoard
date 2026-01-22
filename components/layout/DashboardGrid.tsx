'use client';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { Widget, useDashboardStore } from '@/store/useDashboardStore';
import { SortableItem } from '@/components/ui/SortableItem';
import { WidgetCard } from '@/components/widgets/WidgetCard';
import { Plus, LayoutGrid } from 'lucide-react';

interface DashboardGridProps {
  onAddWidget: () => void;
  onEditWidget?: (widget: Widget) => void;
}

export function DashboardGrid({ onAddWidget, onEditWidget }: DashboardGridProps) {
  const { widgets, reorderWidgets } = useDashboardStore();

  // ... (sensors logic same)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = widgets.findIndex((w) => w.id === active.id);
      const newIndex = widgets.findIndex((w) => w.id === over.id);
      reorderWidgets(arrayMove(widgets, oldIndex, newIndex));
    }
  }

  if (widgets.length === 0) {
      return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 animate-in fade-in duration-500">
        <div className="bg-card p-6 rounded-full mb-6 border border-dashed border-border">
          <Plus className="h-12 w-12 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Build Your Finance Dashboard</h2>
        <p className="text-muted-foreground max-w-md mb-8">
          Create custom widgets by connecting to any finance API. Track stocks, crypto, forex, or economic indicators - all in real-time.
        </p>
        <div className="flex gap-4">
          <button
            onClick={onAddWidget}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all hover:scale-105 shadow-lg shadow-primary/20"
          >
            + Add First Widget
          </button>
          <button
            onClick={() => {
               const demoWidgets = [
                 {
                   id: 'demo-btc',
                   data: {
                     title: 'Bitcoin Price',
                     apiEndpoint: 'https://api.coinbase.com/v2/prices/BTC-USD/spot',
                     refreshInterval: 60,
                     selectedFields: ['data.amount', 'data.currency'],
                     displayMode: 'price-card',
                     lastUpdated: 0
                   },
                   layout: { w: 1, h: 1, x: 0, y: 0 }
                 },
                 {
                   id: 'demo-eth',
                   data: {
                     title: 'Ethereum Price',
                     apiEndpoint: 'https://api.coinbase.com/v2/prices/ETH-USD/spot',
                     refreshInterval: 60,
                     selectedFields: ['data.amount', 'data.currency'],
                     displayMode: 'price-card',
                     lastUpdated: 0
                   },
                   layout: { w: 1, h: 1, x: 0, y: 0 }
                 }
               ];
               // We need safe casting or ensure types match. 
               // eslint-disable-next-line @typescript-eslint/no-explicit-any
               demoWidgets.forEach(w => useDashboardStore.getState().addWidget(w as any));
            }}
            className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-all"
          >
            Load Demo Data
          </button>
        </div>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={widgets} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
          {widgets.map((widget) => (
            <SortableItem key={widget.id} id={widget.id} className="h-[300px]">
              <WidgetCard widget={widget} onEdit={() => onEditWidget?.(widget)} />
            </SortableItem>
          ))}
          
          <button
            onClick={onAddWidget}
            className="h-[300px] rounded-xl border border-dashed border-gray-700 hover:border-green-500/50 hover:bg-[#131b2e]/50 transition-all flex flex-col items-center justify-center gap-4 group"
          >
             <div className="h-16 w-16 rounded-full bg-green-500/10 group-hover:bg-green-500/20 flex items-center justify-center transition-all">
                <Plus className="h-8 w-8 text-green-500 transition-colors" />
             </div>
             <div className="flex flex-col items-center gap-1">
                 <span className="text-white font-medium text-lg">Add Widget</span>
                 <span className="text-gray-400 text-sm">Connect to a finance API and create a custom widget</span>
             </div>
          </button>
        </div>
      </SortableContext>
    </DndContext>
  );
}
