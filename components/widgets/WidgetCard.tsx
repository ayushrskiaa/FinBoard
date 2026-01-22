'use client';

import { Widget, useDashboardStore } from '@/store/useDashboardStore';
import { useWidgetData } from '@/hooks/useWidgetData';
import { PriceCard } from './visualizations/PriceCard';
import { DataTable } from './visualizations/DataTable';
import { SimpleChart } from './visualizations/SimpleChart';
import { Trash2, RefreshCw, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function WidgetCard({ widget }: { widget: Widget }) {
  const { removeWidget, isEditMode } = useDashboardStore();
  const { data, loading, error } = useWidgetData(widget);

  const renderContent = () => {
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-destructive text-center p-4">
          <AlertCircle className="h-8 w-8 mb-2" />
          <p className="text-sm">{error}</p>
        </div>
      );
    }

    if (!data && loading) {
      return (
        <div className="flex items-center justify-center h-full">
           <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      );
    }

    if (!data) {
      return <div className="text-center text-muted-foreground p-4">No data</div>;
    }

    switch (widget.data.displayMode) {
      case 'price-card':
        return <PriceCard data={data} selectedFields={widget.data.selectedFields || []} />;
      case 'table':
        return <DataTable data={data} selectedFields={widget.data.selectedFields || []} />;
      case 'chart':
        return <SimpleChart data={data} selectedFields={widget.data.selectedFields || []} />;
      default:
        return <PriceCard data={data} selectedFields={widget.data.selectedFields || []} />;
    }
  };

  return (
    <div className={cn(
      "relative flex flex-col h-full bg-card rounded-xl border border-border shadow-sm overflow-hidden transition-all duration-200",
      isEditMode && "ring-2 ring-primary/20 cursor-move hover:ring-primary/50"
    )}>
      
      {/* Widget Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/20">
        <h3 className="font-semibold text-sm truncate pr-2" title={widget.data.title}>
          {widget.data.title}
        </h3>
        <div className="flex items-center gap-2">
           {loading && <RefreshCw className="h-3 w-3 animate-spin text-muted-foreground" />}
           
           {isEditMode && (
             <button 
               onClick={() => removeWidget(widget.id)}
               className="h-6 w-6 rounded hover:bg-destructive/10 hover:text-destructive flex items-center justify-center transition-colors"
             >
               <Trash2 className="h-3.5 w-3.5" />
             </button>
           )}
        </div>
      </div>

      {/* Widget Content */}
      <div className="flex-1 p-4 overflow-hidden relative">
        {renderContent()}
      </div>

      {/* Footer Info */}
      <div className="px-4 py-2 bg-muted/10 text-[10px] text-muted-foreground border-t border-border flex justify-between">
         <span>{widget.data.refreshInterval}s refresh</span>
         <span>Last updated: {widget.data.lastUpdated ? new Date(widget.data.lastUpdated).toLocaleTimeString() : 'Never'}</span>
      </div>
    </div>
  );
}
