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
        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={onAddWidget}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all hover:scale-105 shadow-lg shadow-primary/20 flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Create Scratch
          </button>
          
          <div className="h-10 w-px bg-border mx-2" />

          <button
            onClick={() => {
               const cryptoWidgets = [
                 {
                   id: 'btc-usd',
                   data: { title: 'Bitcoin', apiEndpoint: 'https://www.alphavantage.co/query?function=DIGITAL_CURRENCY_DAILY&symbol=BTC&market=USD', refreshInterval: 60, selectedFields: ['Time Series (Digital Currency Daily)/2024-01-24/4a. close (USD)', 'Time Series (Digital Currency Daily)/2024-01-24/4b. close (USD)'], displayMode: 'price-card', lastUpdated: Date.now() },
                   layout: { w: 1, h: 1, x: 0, y: 0 }
                 },
                 // Add more realistic crypto defaults? Real URLs might be needed. 
                 // Alpha Vantage requires parsing.
                 // Let's stick to safe "Coinbase" or similar for demo if possible?
                 // Or just use the verified Presets URLs?
                 // Let's use the Presets I added in AddWidgetModal as reference.
                 {
                   id: 'eth-chart',
                   data: { title: 'Ethereum Trend', apiEndpoint: 'https://www.alphavantage.co/query?function=DIGITAL_CURRENCY_DAILY&symbol=ETH&market=USD', refreshInterval: 300, selectedFields: ['Time Series (Digital Currency Daily)/[]/4a. close (USD)'], displayMode: 'chart', lastUpdated: Date.now() },
                   layout: { w: 2, h: 1, x: 1, y: 0 }
                 }
               ];
               // Note: Real usage requires key in URL for AlphaVantage usually, but some endpoints work? 
               // Actually the user needs to provide their key or use a free public one.
               // My presets in AddWidgetModal didn't include keys.
               // AlphaVantage enforces keys.
               // I should warn the user or provide a "Enter API Key" hint?
               // Or use a truly public API like 'https://api.coincap.io/v2/assets'.
               
               const coinCapWidgets = [
                  {
                     id: 'btc-price',
                     data: { 
                        title: 'Bitcoin Price', 
                        apiEndpoint: 'https://api.coincap.io/v2/assets/bitcoin', 
                        refreshInterval: 10, 
                        selectedFields: ['data/priceUsd', 'data/changePercent24Hr'], 
                        displayMode: 'price-card',
                        fieldFormatting: { 'data/priceUsd': 'currency', 'data/changePercent24Hr': 'percent' },
                        lastUpdated: Date.now() 
                     },
                     layout: { w: 1, h: 1, x: 0, y: 0 }
                  },
                  {
                     id: 'eth-price',
                     data: { 
                        title: 'Ethereum Price', 
                        apiEndpoint: 'https://api.coincap.io/v2/assets/ethereum', 
                        refreshInterval: 10, 
                        selectedFields: ['data/priceUsd', 'data/changePercent24Hr'], 
                        displayMode: 'price-card', 
                        fieldFormatting: { 'data/priceUsd': 'currency', 'data/changePercent24Hr': 'percent' },
                        lastUpdated: Date.now() 
                     },
                     layout: { w: 1, h: 1, x: 1, y: 0 }
                  },
                   {
                     id: 'market-table',
                     data: { 
                        title: 'Top Crypto Assets', 
                        apiEndpoint: 'https://api.coincap.io/v2/assets?limit=10', 
                        refreshInterval: 30, 
                        selectedFields: ['data[]/rank', 'data[]/symbol', 'data[]/priceUsd', 'data[]/changePercent24Hr'], 
                        displayMode: 'table', 
                        fieldFormatting: { 'data[]/priceUsd': 'currency', 'data[]/changePercent24Hr': 'percent' },
                        lastUpdated: Date.now() 
                     },
                     layout: { w: 2, h: 2, x: 0, y: 1 }
                  }
               ];
               
               coinCapWidgets.forEach(w => useDashboardStore.getState().addWidget(w as any));
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
