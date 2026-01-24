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
        <div className="glass p-8 rounded-3xl mb-6 border border-white/10 shadow-xl">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border border-primary/20">
            <Plus className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h2 className="text-3xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">Build Your Finance Dashboard</h2>
        <p className="text-muted-foreground max-w-md mb-8 text-lg">
          Create custom widgets by connecting to any finance API. Track stocks, crypto, forex, or economic indicators - all in real-time.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={onAddWidget}
            className="px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-semibold hover:scale-105 transition-all duration-300 shadow-lg shadow-primary/30 hover:shadow-primary/50 flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Create From Scratch
          </button>
          
          <div className="h-12 w-px bg-gradient-to-b from-transparent via-border to-transparent mx-2" />

          <button
            onClick={() => {
               // Use Coinbase as it is confirmed working (CoinCap is blocked for this user)
               const coinbaseWidgets = [
                 {
                   id: 'btc-price',
                   data: {
                     title: 'Bitcoin Price',
                     apiEndpoint: 'https://api.coinbase.com/v2/prices/BTC-USD/spot',
                     refreshInterval: 10,
                     selectedFields: ['data/amount'],
                     displayMode: 'price-card',
                     fieldFormatting: { 'data/amount': 'currency' },
                     lastUpdated: Date.now()
                   },
                   layout: { w: 1, h: 1, x: 0, y: 0 }
                 },
                 {
                   id: 'eth-price',
                   data: {
                     title: 'Ethereum Price',
                     apiEndpoint: 'https://api.coinbase.com/v2/prices/ETH-USD/spot',
                     refreshInterval: 10,
                     selectedFields: ['data/amount'],
                     displayMode: 'price-card',
                     fieldFormatting: { 'data/amount': 'currency' },
                     lastUpdated: Date.now()
                   },
                   layout: { w: 1, h: 1, x: 1, y: 0 }
                 },
                 {
                    id: 'coinbase-rates',
                    data: {
                        title: 'Exchange Rates (Top 10)',
                        apiEndpoint: 'https://api.coinbase.com/v2/exchange-rates?currency=USD',
                        refreshInterval: 60,
                        selectedFields: ['data/rates/EUR', 'data/rates/GBP', 'data/rates/JPY', 'data/rates/CNY', 'data/rates/INR', 'data/rates/CAD', 'data/rates/AUD'],
                        displayMode: 'price-card',
                        fieldFormatting: { 
                            'data/rates/EUR': 'number',
                            'data/rates/GBP': 'number', 
                            'data/rates/INR': 'number'
                        },
                        lastUpdated: Date.now()
                    },
                    layout: { w: 2, h: 1, x: 0, y: 1 }
                 }
               ];
               
               // eslint-disable-next-line @typescript-eslint/no-explicit-any
               coinbaseWidgets.forEach(w => useDashboardStore.getState().addWidget(w as any));
            }}
            className="px-5 py-3 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-all border border-border"
          >
            Load Crypto Template
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
